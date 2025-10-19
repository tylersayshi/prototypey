import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";

interface OutputPanelProps {
	output: {
		json: string;
		typeInfo: string;
		error: string;
	};
}

export function OutputPanel({ output }: OutputPanelProps) {
	const [activeTab, setActiveTab] = useState<"json" | "types">("json");

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
			<div
				style={{
					display: "flex",
					backgroundColor: "#f9fafb",
					borderBottom: "1px solid #e5e7eb",
				}}
			>
				<button
					onClick={() => setActiveTab("json")}
					style={{
						padding: "0.75rem 1rem",
						fontSize: "0.875rem",
						fontWeight: "600",
						color: activeTab === "json" ? "#1f2937" : "#6b7280",
						backgroundColor: activeTab === "json" ? "#ffffff" : "transparent",
						border: "none",
						borderBottom:
							activeTab === "json"
								? "2px solid #3b82f6"
								: "2px solid transparent",
						cursor: "pointer",
					}}
				>
					JSON Output
				</button>
				<button
					onClick={() => setActiveTab("types")}
					style={{
						padding: "0.75rem 1rem",
						fontSize: "0.875rem",
						fontWeight: "600",
						color: activeTab === "types" ? "#1f2937" : "#6b7280",
						backgroundColor: activeTab === "types" ? "#ffffff" : "transparent",
						border: "none",
						borderBottom:
							activeTab === "types"
								? "2px solid #3b82f6"
								: "2px solid transparent",
						cursor: "pointer",
					}}
				>
					Type Info
				</button>
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
						defaultLanguage={activeTab === "json" ? "json" : "typescript"}
						value={activeTab === "json" ? output.json : output.typeInfo}
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
