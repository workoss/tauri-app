import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tsEslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import pluginReact from "eslint-plugin-react";

import { config as baseConfig } from "./base.js";

/**
 * react eslint config
 *
 * @type {import('eslint').Linter.Config}
 */
export const config = [
  {
    files: ["src/**/*.{mjs,cjs,ts,jsx,tsx}"],
    settings: { react: { version: "detect" } },
    extends: [
      ...baseConfig,
      js.configs.recommended,
      eslintConfigPrettier,
      ...tsEslint.configs.recommended,
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat["jsx-runtime"],
    ],
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
    },
    rules: {
      // '@typescript-eslint/no-unsafe-argument': 'error',
      // '@typescript-eslint/no-unsafe-assignment': 'error',
      // '@typescript-eslint/no-unsafe-call': 'error',
      // '@typescript-eslint/no-unsafe-member-access': 'error',
      // '@typescript-eslint/no-unsafe-return': 'error',
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    ignores: ["dist/**", "src-tauri/**"],
  },
];
