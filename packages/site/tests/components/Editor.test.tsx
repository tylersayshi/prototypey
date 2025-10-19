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
}));

describe("Editor", () => {
	it("renders with input label", () => {
		const mockOnChange = vi.fn();
		render(<Editor value="" onChange={mockOnChange} />);
		expect(screen.getByText("Input")).toBeInTheDocument();
	});

	it("calls onChange when value changes", async () => {
		const mockOnChange = vi.fn();
		render(<Editor value="" onChange={mockOnChange} />);

		const editor = screen.getByTestId("monaco-editor");
		await userEvent.type(editor, "test");

		expect(mockOnChange).toHaveBeenCalled();
	});

	it("displays the provided value", () => {
		const mockOnChange = vi.fn();
		render(<Editor value="const x = 1" onChange={mockOnChange} />);

		const editor = screen.getByTestId("monaco-editor");
		expect(editor).toHaveValue("const x = 1");
	});
});
