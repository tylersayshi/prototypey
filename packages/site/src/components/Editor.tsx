import MonacoEditor from "@monaco-editor/react";

interface EditorProps {
	value: string;
	onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
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
