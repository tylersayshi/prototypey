import MonacoEditor from "@monaco-editor/react";
import { useEffect, useState } from "react";

interface OutputPanelProps {
	output: {
		json: string;
		typeInfo: string;
		error: string;
	};
}

export function OutputPanel({ output }: OutputPanelProps) {
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
				Output
			</div>
			<div style={{ flex: 1 }}>
				{output.error ? (
					<div
						style={{
							padding: "1rem",
							color: "var(--color-error)",
							backgroundColor: "var(--color-error-bg)",
							height: "100%",
							overflow: "auto",
						}}
					>
						<strong>Error:</strong> {output.error}
					</div>
				) : (
					<MonacoEditor
						height="100%"
						defaultLanguage="json"
						value={output.json}
						theme={theme}
						options={{
							readOnly: true,
							minimap: { enabled: false },
							fontSize: 14,
							lineNumbers: "on",
							renderLineHighlight: "none",
							scrollBeyondLastLine: false,
							automaticLayout: true,
							padding: { top: 16, bottom: 16 },
						}}
					/>
				)}
			</div>
		</div>
	);
}
