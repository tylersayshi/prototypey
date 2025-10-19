import { vi } from "vitest";

global.fetch = vi.fn(
	() =>
		Promise.resolve({
			text: () => Promise.resolve(""),
		}) as any,
);
