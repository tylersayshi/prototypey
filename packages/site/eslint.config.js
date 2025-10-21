import baseConfig from "../../eslint.config.js";
import reactCompiler from "eslint-plugin-react-compiler";
import tseslint from "typescript-eslint";

export default tseslint.config(...baseConfig, {
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
		"react-compiler/react-compiler": "error",
	},
});
