import { useState, useEffect, useRef } from "react";
import { Editor } from "./Editor";
import { OutputPanel } from "./OutputPanel";
import { lx } from "prototypekit";
import { useMonaco } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

let tsWorkerInstance: Monaco.languages.typescript.TypeScriptWorker | null =
	null;

export function Playground() {
	const [code, setCode] = useState(DEFAULT_CODE);
	const [output, setOutput] = useState({ json: "", typeInfo: "", error: "" });
	const [editorReady, setEditorReady] = useState(false);
	const monaco = useMonaco();
	const tsWorkerRef =
		useRef<Monaco.languages.typescript.TypeScriptWorker | null>(null);

	const handleCodeChange = (newCode: string) => {
		setCode(newCode);
	};

	const handleEditorReady = () => {
		setEditorReady(true);
	};

	useEffect(() => {
		if (monaco && editorReady && !tsWorkerRef.current && !tsWorkerInstance) {
			const initWorker = async () => {
				try {
					await new Promise((resolve) => setTimeout(resolve, 200));
					const worker =
						await monaco.languages.typescript.getTypeScriptWorker();
					const uri = monaco.Uri.parse("file:///main.ts");
					const client = await worker(uri);
					tsWorkerRef.current = client;
					tsWorkerInstance = client;
				} catch (err) {
					console.error("Failed to initialize TypeScript worker:", err);
				}
			};
			initWorker();
		}
	}, [monaco, editorReady]);

	useEffect(() => {
		const timeoutId = setTimeout(async () => {
			try {
				const cleanedCode = code
					.replace(/import\s+{[^}]*}\s+from\s+['"][^'"]+['"]\s*;?\s*/g, "")
					.replace(/^type\s+\w+\s*=\s*[^;]+;?\s*$/gm, "");

				const lastVarMatch = cleanedCode.match(/(?:const|let|var)\s+(\w+)\s*=/);
				const lastVarName = lastVarMatch ? lastVarMatch[1] : null;

				const wrappedCode = lastVarName
					? `${cleanedCode}\nreturn ${lastVarName};`
					: cleanedCode;

				const fn = new Function("lx", wrappedCode);
				const result = fn(lx);
				let typeInfo = "// Hover over .infer in the editor to see the type";

				if (lastVarName && monaco && tsWorkerRef.current) {
					try {
						const uri = monaco.Uri.parse("file:///main.ts");
						const existingModel = monaco.editor.getModel(uri);

						if (existingModel) {
							const inferPosition = code.indexOf(`${lastVarName}.infer`);
							if (inferPosition !== -1) {
								const offset =
									inferPosition + `${lastVarName}.infer`.length - 1;

								const quickInfo =
									await tsWorkerRef.current.getQuickInfoAtPosition(
										uri.toString(),
										offset,
									);

								if (quickInfo?.displayParts) {
									const typeText = quickInfo.displayParts
										.map((part: { text: string }) => part.text)
										.join("");

									const propertyMatch = typeText.match(
										/\(property\)\s+.*?\.infer:\s*([\s\S]+?)$/,
									);
									if (propertyMatch) {
										typeInfo = formatTypeString(propertyMatch[1]);
									}
								}
							}
						}
					} catch (err) {
						console.error("Type extraction error:", err);
					}
				}

				if (result && typeof result === "object" && "json" in result) {
					const jsonOutput = (result as { json: unknown }).json;
					setOutput({
						json: JSON.stringify(jsonOutput, null, 2),
						typeInfo,
						error: "",
					});
				} else {
					setOutput({
						json: JSON.stringify(result, null, 2),
						typeInfo,
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
	}, [code, monaco]);

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
				<Editor
					value={code}
					onChange={handleCodeChange}
					onReady={handleEditorReady}
				/>
			</div>
			<div style={{ flex: 1, display: "flex" }}>
				<OutputPanel output={output} />
			</div>
		</div>
	);
}

function formatTypeString(typeStr: string): string {
	let formatted = typeStr.trim();

	formatted = formatted.replace(/\s+/g, " ");
	formatted = formatted.replace(/;\s*/g, "\n");
	formatted = formatted.replace(/{\s*/g, "{\n");
	formatted = formatted.replace(/\s*}/g, "\n}");

	const lines = formatted.split("\n");
	let indentLevel = 0;
	const indentedLines: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		if (trimmed.startsWith("}")) {
			indentLevel = Math.max(0, indentLevel - 1);
		}

		indentedLines.push("  ".repeat(indentLevel) + trimmed);

		if (trimmed.endsWith("{") && !trimmed.includes("}")) {
			indentLevel++;
		}
	}

	return indentedLines.join("\n");
}

const DEFAULT_CODE = `import { lx, type Infer } from "prototypekit";

const profileNamespace = lx.namespace("app.bsky.actor.profile", {
  main: lx.record({
    key: "self",
    record: lx.object({
      displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
      description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
    }),
  }),
});

type ProfileInferred = Infer<typeof profileNamespace>;`;
