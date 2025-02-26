import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["docs"] },
  {
    files: ["src/**/*.{mjs,cjs,ts,jsx,tsx}"],
    settings: { react: { version: "detect" } },
    languageOptions: { globals: globals.browser },
    extends: [pluginJs.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      // '@typescript-eslint/no-unsafe-argument': 'error',
      // '@typescript-eslint/no-unsafe-assignment': 'error',
      // '@typescript-eslint/no-unsafe-call': 'error',
      // '@typescript-eslint/no-unsafe-member-access': 'error',
      // '@typescript-eslint/no-unsafe-return': 'error',
    },
  },
  {
    plugins: {},
    rules: {},
  },
);
