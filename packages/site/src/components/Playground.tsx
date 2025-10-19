import { useState, useEffect } from "react";
import { Editor } from "./Editor";
import { OutputPanel } from "./OutputPanel";
import { lx } from "prototypekit";

export function Playground() {
	const [code, setCode] = useState(DEFAULT_CODE);
	const [output, setOutput] = useState({ json: "", typeInfo: "", error: "" });

	const handleCodeChange = (newCode: string) => {
		setCode(newCode);
	};

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			try {
				const AsyncFunction = async function () {}.constructor as new (
					...args: string[]
				) => (...args: unknown[]) => Promise<unknown>;

				const wrappedCode = `
					const { lx } = arguments[0];
					${code}
					const exports = {};
					for (const key in this) {
						if (this.hasOwnProperty(key) && key !== 'lx') {
							exports[key] = this[key];
						}
					}
					return Object.values(exports)[0];
				`;

				const fn = new AsyncFunction(wrappedCode);
				const result = fn.call({}, { lx });

				if (result && typeof result === "object" && "json" in result) {
					const jsonOutput = (result as { json: unknown }).json;
					setOutput({
						json: JSON.stringify(jsonOutput, null, 2),
						typeInfo: "// Type inference not yet implemented in playground",
						error: "",
					});
				} else {
					setOutput({
						json: JSON.stringify(result, null, 2),
						typeInfo: "// Type inference not yet implemented in playground",
						error: "",
					});
				}
			} catch (error) {
				setOutput({
					json: "",
					typeInfo: "",
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [code]);

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					flex: 1,
					display: "flex",
					borderRight: "1px solid #e5e7eb",
				}}
			>
				<Editor value={code} onChange={handleCodeChange} />
			</div>
			<div style={{ flex: 1, display: "flex" }}>
				<OutputPanel output={output} />
			</div>
		</div>
	);
}

const DEFAULT_CODE = `import { lx } from "prototypekit";

const profileNamespace = lx.namespace("app.bsky.actor.profile", {
  main: lx.record({
    key: "self",
    record: lx.object({
      displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
      description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
    }),
  }),
});`;
