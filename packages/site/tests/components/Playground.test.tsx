import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Playground } from "../../src/components/Playground";

vi.mock("@monaco-editor/react", () => ({
	default: ({ value, onChange }: any) => (
		<textarea
			data-testid="monaco-editor"
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	),
	useMonaco: () => null,
	loader: {
		init: vi.fn(() =>
			Promise.resolve({
				languages: {
					typescript: {
						typescriptDefaults: {
							setCompilerOptions: vi.fn(),
							setDiagnosticsOptions: vi.fn(),
							addExtraLib: vi.fn(),
						},
						ScriptTarget: { ES2020: 5 },
						ModuleResolutionKind: { NodeJs: 2 },
						ModuleKind: { ESNext: 99 },
						getTypeScriptWorker: vi.fn(() =>
							Promise.resolve(() =>
								Promise.resolve({
									getQuickInfoAtPosition: vi.fn(() => Promise.resolve(null)),
								}),
							),
						),
					},
				},
				editor: {
					defineTheme: vi.fn(),
					createModel: vi.fn(() => ({ dispose: vi.fn() })),
					getModel: vi.fn(() => null),
				},
				Uri: {
					parse: vi.fn((uri: string) => ({ toString: () => uri })),
				},
			}),
		),
	},
}));

describe("Playground", () => {
	it("renders Editor and OutputPanel components", () => {
		render(<Playground />);

		expect(screen.getByText("Input")).toBeInTheDocument();
		expect(screen.getByText("Output")).toBeInTheDocument();
	});

	it("starts with default code in editor", async () => {
		render(<Playground />);

		// Wait for editors to be ready
		await waitFor(() => {
			expect(screen.getAllByTestId("monaco-editor").length).toBeGreaterThan(0);
		});

		const editors = screen.getAllByTestId("monaco-editor");
		const inputEditor = editors[0] as HTMLTextAreaElement;

		expect(inputEditor.value).toContain(
			'lx.namespace("app.bsky.actor.profile"',
		);
	});

	it("evaluates code and displays output", async () => {
		render(<Playground />);

		await waitFor(
			() => {
				const editors = screen.getAllByTestId("monaco-editor");
				const outputEditor = editors.find(
					(e) => e.textContent && e.textContent.includes("{"),
				);
				expect(outputEditor).toBeDefined();
			},
			{ timeout: 1000 },
		);
	});
});
