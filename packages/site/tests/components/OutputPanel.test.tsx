import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { OutputPanel } from "../../src/components/OutputPanel";

vi.mock("@monaco-editor/react", () => ({
	default: ({ value }: any) => <div data-testid="monaco-editor">{value}</div>,
}));

describe("OutputPanel", () => {
	const mockOutput = {
		json: '{"test": "value"}',
		typeInfo: "type Test = { test: string }",
		error: "",
	};

	it("renders JSON Output tab by default", () => {
		render(<OutputPanel output={mockOutput} />);
		expect(screen.getByText("JSON Output")).toBeInTheDocument();
		expect(screen.getByText("Type Info")).toBeInTheDocument();
	});

	it("displays json content by default", () => {
		render(<OutputPanel output={mockOutput} />);
		expect(screen.getByText('{"test": "value"}')).toBeInTheDocument();
	});

	it("switches to Type Info tab when clicked", async () => {
		render(<OutputPanel output={mockOutput} />);

		const typeInfoTab = screen.getByText("Type Info");
		await userEvent.click(typeInfoTab);

		expect(
			screen.getByText("type Test = { test: string }"),
		).toBeInTheDocument();
	});

	it("displays error message when error exists", () => {
		const errorOutput = {
			json: "",
			typeInfo: "",
			error: "Something went wrong",
		};

		render(<OutputPanel output={errorOutput} />);
		expect(screen.getByText(/Error:/)).toBeInTheDocument();
		expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
	});

	it("does not display monaco editor when error exists", () => {
		const errorOutput = {
			json: "",
			typeInfo: "",
			error: "Something went wrong",
		};

		render(<OutputPanel output={errorOutput} />);
		expect(screen.queryByTestId("monaco-editor")).not.toBeInTheDocument();
	});
});
