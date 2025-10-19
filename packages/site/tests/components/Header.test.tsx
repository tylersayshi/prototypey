import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../../src/components/Header";

describe("Header", () => {
	it("renders the title", () => {
		render(<Header />);
		expect(screen.getByText("prototypekit")).toBeInTheDocument();
		expect(screen.getByText("at://")).toBeInTheDocument();
	});

	it("renders the description", () => {
		render(<Header />);
		expect(
			screen.getByText("Type-safe lexicon inference for ATProto schemas"),
		).toBeInTheDocument();
	});
});
