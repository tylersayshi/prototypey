import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock @monaco-editor/react BEFORE any imports
vi.mock("@monaco-editor/react", () => ({
	default: vi.fn(() => null),
	useMonaco: vi.fn(() => null),
	loader: {
		config: vi.fn(),
		init: vi.fn(() => Promise.resolve({})),
	},
}));

global.fetch = vi.fn(
	() =>
		Promise.resolve({
			text: () => Promise.resolve(""),
		}) as any,
);

// Mock MonacoEnvironment
(global as any).MonacoEnvironment = {
	getWorker: () => ({}) as any,
};
