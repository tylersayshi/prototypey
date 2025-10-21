import baseConfig from "../../eslint.config.js";
import reactCompiler from "eslint-plugin-react-compiler";
import tseslint from "typescript-eslint";

export default tseslint.config(
	...baseConfig,
	{
		files: ["**/*.{jsx,tsx}"],
		extends: [
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		languageOptions: {
			parserOptions: {
				projectService: { allowDefaultProject: ["*.config.*s"] },
			},
		},
		plugins: {
			"react-compiler": reactCompiler,
		},
		rules: {
			"@typescript-eslint/consistent-type-definitions": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/restrict-plus-operands": "off",
			"@typescript-eslint/no-confusing-void-expression": "off",
			"@typescript-eslint/prefer-nullish-coalescing": "off",
			"@typescript-eslint/prefer-regexp-exec": "off",
			"@typescript-eslint/no-implied-eval": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-floating-promises": "off",
			"react-compiler/react-compiler": "error",
		},
	},
);
