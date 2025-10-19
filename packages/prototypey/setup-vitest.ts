import { setup } from "@ark/attest";

// config options can be passed here
export default () =>
	setup({
		// Set to true during development to skip type checking (faster)
		skipTypes: false,

		// Fail if benchmarks deviate by more than 20%
		benchPercentThreshold: 20,
	});
