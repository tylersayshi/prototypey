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
}));

describe("Playground", () => {
	it("renders Editor and OutputPanel components", () => {
		render(<Playground />);

		expect(screen.getByText("Input")).toBeInTheDocument();
		expect(screen.getByText("JSON Output")).toBeInTheDocument();
		expect(screen.getByText("Type Info")).toBeInTheDocument();
	});

	it("starts with default code in editor", () => {
		render(<Playground />);

		const editors = screen.getAllByTestId("monaco-editor");
		const inputEditor = editors[0];

		expect(inputEditor).toHaveValue(
			expect.stringContaining('lx.namespace("app.bsky.actor.profile"'),
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
