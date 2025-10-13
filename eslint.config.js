import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["lib", "node_modules", "pnpm-lock.yaml", "setup-vitest.ts"] },
	{ linterOptions: { reportUnusedDisableDirectives: "error" } },
	eslint.configs.recommended,
	{
		extends: [
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		files: ["**/*.{js,ts}"],
		languageOptions: {
			parserOptions: {
				projectService: { allowDefaultProject: ["*.config.*s"] },
			},
		},
		rules: {
			"@typescript-eslint/consistent-type-definitions": "off",
		},
	},
	{
		files: ["**/*.{test,bench}.ts"],
		rules: {
			"@typescript-eslint/no-floating-promises": "off",
			"@typescript-eslint/no-unused-vars": "off",
		},
	},
);
