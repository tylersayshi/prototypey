import MonacoEditor from "@monaco-editor/react";

interface OutputPanelProps {
	output: {
		json: string;
		typeInfo: string;
		error: string;
	};
}

export function OutputPanel({ output }: OutputPanelProps) {
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
				Output
			</div>
			<div style={{ flex: 1 }}>
				{output.error ? (
					<div
						style={{
							padding: "1rem",
							color: "#dc2626",
							backgroundColor: "#fef2f2",
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
						theme="vs-light"
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
