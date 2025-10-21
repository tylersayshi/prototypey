/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useState, useEffect, useRef } from "react";
import { Editor } from "./Editor";
import { OutputPanel } from "./OutputPanel";
import { lx } from "prototypey";
import { useMonaco } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useQueryState } from "nuqs";
import MonacoEditor from "@monaco-editor/react";
import { parseAsCompressed } from "../utils/parsers";

let tsWorkerInstance: Monaco.languages.typescript.TypeScriptWorker | null =
	null;

export function Playground() {
	const [code, setCode] = useQueryState(
		"code",
		parseAsCompressed.withDefault(DEFAULT_CODE),
	);
	const [output, setOutput] = useState({ json: "", typeInfo: "", error: "" });
	const [editorReady, setEditorReady] = useState(false);
	const [theme, setTheme] = useState<"vs-light" | "vs-dark">(
		window.matchMedia("(prefers-color-scheme: dark)").matches
			? "vs-dark"
			: "vs-light",
	);
	const monaco = useMonaco();
	const tsWorkerRef =
		useRef<Monaco.languages.typescript.TypeScriptWorker | null>(null);

	const handleCodeChange = (newCode: string) => {
		void setCode(newCode);
	};

	const handleEditorReady = () => {
		setEditorReady(true);
	};

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			setTheme(e.matches ? "vs-dark" : "vs-light");
		};
		mediaQuery.addEventListener("change", handleChange);
		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

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
			void initWorker();
		}
	}, [monaco, editorReady]);

	useEffect(() => {
		const timeoutId = setTimeout(async () => {
			try {
				const nsMatch = /const\s+lex\s*=\s*lx\.lexicon\([^]*?\}\s*\);/.exec(
					code,
				);
				if (!nsMatch) {
					throw new Error("No lexicon definition found");
				}

				const cleanedCode = nsMatch[0];
				const wrappedCode = `${cleanedCode}\nreturn lex;`;
				// eslint-disable-next-line @typescript-eslint/no-implied-eval
				const fn = new Function("lx", wrappedCode);

				const result = fn(lx);
				let typeInfo = "// Hover over .infer in the editor to see the type";

				if (monaco && tsWorkerRef.current) {
					try {
						const uri = monaco.Uri.parse("file:///main.ts");
						const existingModel = monaco.editor.getModel(uri);

						if (existingModel) {
							const inferPosition = code.indexOf(`ns.infer`);
							if (inferPosition !== -1) {
								const offset = inferPosition + `ns.infer`.length - 1;

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
						json: JSON.stringify(jsonOutput, null, 2) + "\n",
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

		return () => {
			clearTimeout(timeoutId);
		};
	}, [code, monaco]);

	return (
		<>
			{/* Desktop playground */}
			<div
				className="desktop-only"
				style={{
					flex: 1,
					overflow: "hidden",
				}}
			>
				<div
					style={{
						flex: 1,
						display: "flex",
						borderRight: "1px solid var(--color-border)",
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

			{/* Mobile static demo */}
			<div
				className="mobile-only"
				style={{
					flex: 1,
					flexDirection: "column",
					overflow: "auto",
					padding: "1rem",
				}}
			>
				<div
					style={{
						backgroundColor: "var(--color-bg-secondary)",
						padding: "1rem",
						borderRadius: "0.5rem",
						marginBottom: "1rem",
						textAlign: "center",
						color: "var(--color-text-secondary)",
						fontSize: "0.875rem",
					}}
				>
					Playground available on desktop
				</div>

				<MobileStaticDemo code={code} json={output.json} theme={theme} />
			</div>
		</>
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

function MobileStaticDemo({
	code,
	json,
	theme,
}: {
	code: string;
	json: string;
	theme: "vs-light" | "vs-dark";
}) {
	// Calculate line counts to size editors appropriately
	const estimateWrappedLines = (text: string, maxCharsPerLine: number) => {
		return text.split("\n").reduce((total, line) => {
			const wrappedLines = Math.ceil(
				Math.max(1, line.length) / maxCharsPerLine,
			);
			return total + wrappedLines;
		}, 0);
	};

	const codeWrappedLines = estimateWrappedLines(code, 50);
	const jsonWrappedLines = estimateWrappedLines(json, 50);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
			{/* You write section */}
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div
					style={{
						padding: "0.75rem 1rem",
						backgroundColor: "var(--color-bg-secondary)",
						borderBottom: "1px solid var(--color-border)",
						fontSize: "0.875rem",
						fontWeight: "600",
						color: "var(--color-text-secondary)",
						borderTopLeftRadius: "0.5rem",
						borderTopRightRadius: "0.5rem",
					}}
				>
					You write
				</div>
				<div
					style={{
						border: "1px solid var(--color-border)",
						borderTop: "none",
						borderBottomLeftRadius: "0.5rem",
						borderBottomRightRadius: "0.5rem",
						overflow: "hidden",
					}}
				>
					<MonacoEditor
						height={`${String(codeWrappedLines * 18 + 32)}px`}
						defaultLanguage="typescript"
						value={code}
						theme={theme}
						options={{
							readOnly: true,
							minimap: { enabled: false },
							fontSize: 12,
							lineNumbers: "on",
							renderLineHighlight: "none",
							scrollBeyondLastLine: false,
							padding: { top: 16, bottom: 16 },
							scrollbar: {
								vertical: "hidden",
								horizontal: "hidden",
								verticalScrollbarSize: 0,
								horizontalScrollbarSize: 0,
								handleMouseWheel: false,
							},
							wordWrap: "on",
							overviewRulerLanes: 0,
						}}
					/>
				</div>
			</div>

			{/* JSON generated section */}
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div
					style={{
						padding: "0.75rem 1rem",
						backgroundColor: "var(--color-bg-secondary)",
						borderBottom: "1px solid var(--color-border)",
						fontSize: "0.875rem",
						fontWeight: "600",
						color: "var(--color-text-secondary)",
						borderTopLeftRadius: "0.5rem",
						borderTopRightRadius: "0.5rem",
					}}
				>
					JSON generated
				</div>
				<div
					style={{
						border: "1px solid var(--color-border)",
						borderTop: "none",
						borderBottomLeftRadius: "0.5rem",
						borderBottomRightRadius: "0.5rem",
						overflow: "hidden",
					}}
				>
					<MonacoEditor
						height={`${String(jsonWrappedLines * 18 + 32)}px`}
						defaultLanguage="json"
						value={json}
						theme={theme}
						options={{
							readOnly: true,
							minimap: { enabled: false },
							fontSize: 12,
							lineNumbers: "on",
							renderLineHighlight: "none",
							scrollBeyondLastLine: false,
							padding: { top: 16, bottom: 16 },
							scrollbar: {
								vertical: "hidden",
								horizontal: "hidden",
								verticalScrollbarSize: 0,
								horizontalScrollbarSize: 0,
								handleMouseWheel: false,
							},
							wordWrap: "on",
							overviewRulerLanes: 0,
						}}
					/>
				</div>
			</div>
		</div>
	);
}

const DEFAULT_CODE = `import { lx, type Infer } from "prototypey";

const lex = lx.lexicon("app.bsky.actor.profile", {
  main: lx.record({
    key: "self",
    record: lx.object({
      displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
      description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
    }),
  }),
});

type Profile = Infer<typeof lex>;

const aProfile: Profile = {
  $type: "app.bsky.actor.profile",
  displayName: "Benny Harvey"
}
`;
