import MonacoEditor from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import { useEffect, useState } from "react";

interface EditorProps {
	value: string;
	onChange: (value: string) => void;
	onReady?: () => void;
}

export function Editor({ value, onChange, onReady }: EditorProps) {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		loader.init().then((monaco) => {
			monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ES2020,
				allowNonTsExtensions: true,
				moduleResolution:
					monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				module: monaco.languages.typescript.ModuleKind.ESNext,
				noEmit: true,
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
				strict: false,
			});

			monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
				noSemanticValidation: false,
				noSyntaxValidation: false,
			});

			Promise.all([
				fetch("/types/type-utils.d.ts").then((r) => r.text()),
				fetch("/types/infer.d.ts").then((r) => r.text()),
				fetch("/types/lib.d.ts").then((r) => r.text()),
			]).then(([typeUtilsDts, inferDts, libDts]) => {
				const stripImportsExports = (content: string) =>
					content
						.replace(/import\s+{[^}]*}\s+from\s+['""][^'"]*['""];?\s*/g, "")
						.replace(/import\s+.*\s+from\s+['""][^'"]*['""];?\s*/g, "")
						.replace(/^export\s+{[^}]*};?\s*/gm, "")
						.replace(/^export\s+/gm, "")
						.replace(/\/\/# sourceMappingURL=.*/g, "")
						.replace(/\/\/#region.*\n?/g, "")
						.replace(/\/\/#endregion.*\n?/g, "");

				const combinedTypes = `
${stripImportsExports(typeUtilsDts)}
${stripImportsExports(inferDts)}
${stripImportsExports(libDts)}
`;

				const moduleDeclaration = `declare module "prototypekit" {
${combinedTypes}
}`;

				monaco.languages.typescript.typescriptDefaults.addExtraLib(
					moduleDeclaration,
					"prototypekit.d.ts",
				);

				setIsReady(true);
				onReady?.();
			});
		});
	}, [onReady]);

	if (!isReady) {
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
				<div
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					Loading...
				</div>
			</div>
		);
	}

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
					path="file:///main.ts"
					value={value}
					onChange={(value) => onChange(value || "")}
					theme="vs-light"
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
