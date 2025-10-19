import MonacoEditor from "@monaco-editor/react";

interface EditorProps {
	value: string;
	onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
	const handleEditorWillMount = (monaco: typeof import("monaco-editor")) => {
		monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
			noSemanticValidation: false,
			noSyntaxValidation: false,
		});

		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ES2020,
			allowNonTsExtensions: true,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			module: monaco.languages.typescript.ModuleKind.ESNext,
			noEmit: true,
			esModuleInterop: true,
			allowSyntheticDefaultImports: true,
		});

		monaco.languages.typescript.typescriptDefaults.addExtraLib(
			`declare module "prototypekit" {
	type Prettify<T> = { [K in keyof T]: T[K] } & {};
	
	type UnionToTuple<T> = ((T extends unknown ? (x: () => T) => void : never) extends ((x: infer I) => void) ? I : never) extends (() => infer R) ? [...UnionToTuple<Exclude<T, R>>, R] : [];

	export const lx: {
		null(options?: { required?: boolean; nullable?: boolean }): { type: "null" } & { required?: boolean; nullable?: boolean };
		boolean<T extends { required?: boolean; nullable?: boolean; default?: boolean; const?: boolean }>(options?: T): T & { type: "boolean" };
		integer<T extends { required?: boolean; nullable?: boolean; minimum?: number; maximum?: number; enum?: number[]; default?: number; const?: number }>(options?: T): T & { type: "integer" };
		string<T extends { required?: boolean; nullable?: boolean; format?: "at-identifier" | "at-uri" | "cid" | "datetime" | "did" | "handle" | "nsid" | "tid" | "record-key" | "uri" | "language"; maxLength?: number; minLength?: number; maxGraphemes?: number; minGraphemes?: number; knownValues?: string[]; enum?: string[]; default?: string; const?: string }>(options?: T): T & { type: "string" };
		unknown(options?: { required?: boolean; nullable?: boolean }): { type: "unknown" } & { required?: boolean; nullable?: boolean };
		bytes<T extends { required?: boolean; nullable?: boolean; minLength?: number; maxLength?: number }>(options?: T): T & { type: "bytes" };
		cidLink<Link extends string>(link: Link): { type: "cid-link"; $link: Link };
		blob<T extends { required?: boolean; nullable?: boolean; accept?: string[]; maxSize?: number }>(options?: T): T & { type: "blob" };
		array<Items extends { type: any }, Options extends { required?: boolean; nullable?: boolean; minLength?: number; maxLength?: number }>(items: Items, options?: Options): Options & { type: "array"; items: Items };
		token<Description extends string>(description: Description): { type: "token"; description: Description };
		ref<Ref extends string>(ref: Ref, options?: { required?: boolean; nullable?: boolean }): { required?: boolean; nullable?: boolean } & { type: "ref"; ref: Ref };
		union<const Refs extends readonly string[], Options extends { required?: boolean; nullable?: boolean; closed?: boolean }>(refs: Refs, options?: Options): Options & { type: "union"; refs: Refs };
		record<T extends { key: "self" | "tid"; record: { type: "object" }; description?: string }>(options: T): T & { type: "record" };
		object<T extends Record<string, { type: any }>>(options: T): any;
		params<Properties extends Record<string, any>>(properties: Properties): any;
		query<T extends { description?: string; parameters?: any; output?: any; errors?: any[] }>(options?: T): T & { type: "query" };
		procedure<T extends { description?: string; parameters?: any; input?: any; output?: any; errors?: any[] }>(options?: T): T & { type: "procedure" };
		subscription<T extends { description?: string; parameters?: any; message?: any; errors?: any[] }>(options?: T): T & { type: "subscription" };
		namespace<ID extends string, D extends Record<string, { type: any }>>(id: ID, defs: D): { json: { lexicon: 1; id: ID; defs: D }; infer: any };
	};
}`,
			"file:///node_modules/prototypekit/index.d.ts",
		);
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
