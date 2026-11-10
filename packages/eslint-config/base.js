import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * Base ESLint flat config shared by every package.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  { ignores: ["dist/**", "storybook-static/**", "coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
