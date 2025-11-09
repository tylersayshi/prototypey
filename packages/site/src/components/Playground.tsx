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
	const [output, setOutput] = useState({ json: "", error: "" });
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
		const timeoutId = setTimeout(() => {
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

				if (result && typeof result === "object" && "json" in result) {
					const jsonOutput = (result as { json: unknown }).json;
					setOutput({
						json: JSON.stringify(jsonOutput, null, 2) + "\n",
						error: "",
					});
				} else {
					setOutput({
						json: JSON.stringify(result, null, 2),
						error: "",
					});
				}
			} catch (error) {
				setOutput({
					json: "",
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
			<div className="hidden md:flex flex-1 overflow-hidden">
				<div className="flex-1 flex border-r border-gray-200 dark:border-gray-700">
					<Editor
						value={code}
						onChange={handleCodeChange}
						onReady={handleEditorReady}
					/>
				</div>
				<div className="flex-1 flex">
					<OutputPanel output={output} />
				</div>
			</div>

			{/* Mobile static demo */}
			<div className="flex md:hidden flex-1 flex-col overflow-auto p-4">
				<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 text-center text-gray-500 dark:text-gray-400 text-sm">
					Playground available on desktop
				</div>

				<MobileStaticDemo code={code} json={output.json} theme={theme} />
			</div>
		</>
	);
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
		<div className="flex flex-col gap-4">
			{/* You write section */}
			<div className="flex flex-col">
				<div className="py-3 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-t-lg">
					You write
				</div>
				<div className="border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg overflow-hidden">
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
			<div className="flex flex-col">
				<div className="py-3 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 rounded-t-lg">
					JSON generated
				</div>
				<div className="border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg overflow-hidden">
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
