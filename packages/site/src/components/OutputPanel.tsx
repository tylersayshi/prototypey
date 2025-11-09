import MonacoEditor from "@monaco-editor/react";
import { useEffect, useState } from "react";

interface OutputPanelProps {
	output: {
		json: string;
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
		<div className="flex-1 flex flex-col">
			<div className="py-3 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400">
				Output
			</div>
			<div className="flex-1">
				{output.error ? (
					<div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 h-full overflow-auto">
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
