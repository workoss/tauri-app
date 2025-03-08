import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import onlyWarn from "eslint-plugin-only-warn";

/** @type {import('eslint').Linter.Config[]} */
export const config = [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    settings: { react: { version: "detect" } },
    languageOptions: { globals: globals.browser },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: { onlyWarn },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true },
      ],
    },
  },
  {
    ignores: ["dist/**", "src-tauri/**", "target/**"],
  },
];
