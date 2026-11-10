import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import { config as baseConfig } from "./base.js";

/**
 * ESLint flat config for React libraries and apps.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    settings: { react: { version: "detect" } },
  },
  {
    plugins: { "react-hooks": pluginReactHooks },
    rules: {
      // Hooks rules as in the apps that consume these packages (includes the
      // React Compiler rules of eslint-plugin-react-hooks 7).
      ...pluginReactHooks.configs.recommended.rules,
      "react/prop-types": "off",
    },
  },
];
