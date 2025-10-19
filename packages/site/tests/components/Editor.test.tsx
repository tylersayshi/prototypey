import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Editor } from "../../src/components/Editor";

vi.mock("@monaco-editor/react", () => ({
	default: ({ value, onChange }: any) => (
		<textarea
			data-testid="monaco-editor"
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	),
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
						ScriptTarget: { ES2020: 7 },
						ModuleResolutionKind: { NodeJs: 2 },
						ModuleKind: { ESNext: 99 },
					},
				},
			}),
		),
	},
}));

describe("Editor", () => {
	it("renders with input label", async () => {
		const mockOnChange = vi.fn();
		render(<Editor value="" onChange={mockOnChange} />);
		expect(screen.getByText("Input")).toBeInTheDocument();

		// Wait for loader to complete
		await screen.findByTestId("monaco-editor");
	});

	it("calls onChange when value changes", async () => {
		const mockOnChange = vi.fn();
		render(<Editor value="" onChange={mockOnChange} />);

		// Wait for loader to complete
		const editor = await screen.findByTestId("monaco-editor");
		await userEvent.type(editor, "test");

		expect(mockOnChange).toHaveBeenCalled();
	});

	it("displays the provided value", async () => {
		const mockOnChange = vi.fn();
		render(<Editor value="const x = 1" onChange={mockOnChange} />);

		// Wait for loader to complete
		const editor = await screen.findByTestId("monaco-editor");
		expect(editor).toHaveValue("const x = 1");
	});
});
