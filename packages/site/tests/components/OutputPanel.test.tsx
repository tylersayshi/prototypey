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

	it("renders Output header", () => {
		render(<OutputPanel output={mockOutput} />);
		expect(screen.getByText("Output")).toBeInTheDocument();
	});

	it("displays json content", () => {
		render(<OutputPanel output={mockOutput} />);
		expect(screen.getByText('{"test": "value"}')).toBeInTheDocument();
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
