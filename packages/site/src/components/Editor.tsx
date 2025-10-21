import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";

interface EditorProps {
	value: string;
	onChange: (value: string) => void;
	onReady?: () => void;
}

export function Editor({ value, onChange, onReady }: EditorProps) {
	const [isReady, setIsReady] = useState(false);
	const monaco = useMonaco();
	const [theme, setTheme] = useState<"vs-light" | "vs-dark">(
		window.matchMedia("(prefers-color-scheme: dark)").matches
			? "vs-dark"
			: "vs-light",
	);

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
		if (!monaco) return;

		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ES2020,
			allowNonTsExtensions: true,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
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

		void Promise.all([
			import("prototypey/lib/type-utils.d.ts?raw"),
			import("prototypey/lib/infer.d.ts?raw"),
			import("prototypey/lib/lib.d.ts?raw"),
		]).then(([typeUtilsModule, inferModule, libModule]) => {
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
${stripImportsExports(typeUtilsModule.default)}
${stripImportsExports(inferModule.default)}
${stripImportsExports(libModule.default)}
`;

			const moduleDeclaration = `declare module "prototypey" {
${combinedTypes}
}`;

			monaco.languages.typescript.typescriptDefaults.addExtraLib(
				moduleDeclaration,
				"prototypey.d.ts",
			);

			setIsReady(true);
			onReady?.();
		});
	}, [monaco, onReady]);

	if (!isReady) {
		return (
			<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<div
					style={{
						padding: "0.75rem 1rem",
						backgroundColor: "var(--color-bg-secondary)",
						borderBottom: "1px solid var(--color-border)",
						fontSize: "0.875rem",
						fontWeight: "600",
						color: "var(--color-text-secondary)",
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
					backgroundColor: "var(--color-bg-secondary)",
					borderBottom: "1px solid var(--color-border)",
					fontSize: "0.875rem",
					fontWeight: "600",
					color: "var(--color-text-secondary)",
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
					onChange={(value) => {
						onChange(value ?? "");
					}}
					theme={theme}
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
