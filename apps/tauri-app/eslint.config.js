import { config as reactConfig } from "eslint-config/react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...reactConfig,
  {
    ignores: ["dist/**", "src-tauri/**", "scripts/**"],
  },
];
