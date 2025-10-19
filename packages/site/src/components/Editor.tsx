import MonacoEditor from "@monaco-editor/react";

interface EditorProps {
	value: string;
	onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
	const handleEditorWillMount = async (
		monaco: typeof import("monaco-editor"),
	) => {
		monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
			noSemanticValidation: false,
			noSyntaxValidation: false,
		});

		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ES2020,
			allowNonTsExtensions: true,
			moduleResolution:
				monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			module: monaco.languages.typescript.ModuleKind.ESNext,
			noEmit: true,
			esModuleInterop: true,
			allowSyntheticDefaultImports: true,
		});

		try {
			const [typeUtilsDts, inferDts, libDts, indexDts] = await Promise.all([
				fetch("/types/type-utils.d.ts").then((r) => r.text()),
				fetch("/types/infer.d.ts").then((r) => r.text()),
				fetch("/types/lib.d.ts").then((r) => r.text()),
				fetch("/types/index.d.ts").then((r) => r.text()),
			]);

			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				typeUtilsDts,
				"file:///node_modules/prototypekit/type-utils.d.ts",
			);

			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				inferDts,
				"file:///node_modules/prototypekit/infer.d.ts",
			);

			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				libDts,
				"file:///node_modules/prototypekit/lib.d.ts",
			);

			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				indexDts,
				"file:///node_modules/prototypekit/index.d.ts",
			);
		} catch (error) {
			console.error("Failed to load prototypekit types:", error);
		}
	};

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
			<div
				style={{
					padding: "0.75rem 1rem",
					backgroundColor: "#f9fafb",
					borderBottom: "1px solid #e5e7eb",
					fontSize: "0.875rem",
					fontWeight: "600",
					color: "#374151",
				}}
			>
				Input
			</div>
			<div style={{ flex: 1 }}>
				<MonacoEditor
					height="100%"
					defaultLanguage="typescript"
					value={value}
					onChange={(value) => onChange(value || "")}
					theme="vs-light"
					beforeMount={handleEditorWillMount}
					options={{
						minimap: { enabled: false },
						fontSize: 14,
						lineNumbers: "on",
						renderLineHighlight: "all",
						scrollBeyondLastLine: false,
						automaticLayout: true,
						tabSize: 2,
						padding: { top: 16, bottom: 16 },
					}}
				/>
			</div>
		</div>
	);
}
