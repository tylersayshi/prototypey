import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

global.fetch = vi.fn(
	() =>
		Promise.resolve({
			text: () => Promise.resolve(""),
		}) as any,
);
