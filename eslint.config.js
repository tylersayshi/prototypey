import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactCompiler from "eslint-plugin-react-compiler";

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
		files: ["**/*.{jsx,tsx}"],
		plugins: {
			"react-compiler": reactCompiler,
		},
		rules: {
			"react-compiler/react-compiler": "error",
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
