import { config } from "@n-uf/eslint-config/react";
import { nodeFiles } from "@n-uf/eslint-config/node";
import { packageBoundaries } from "@n-uf/eslint-config/package-boundaries";

// papyrus is the documents engine: it must not depend on the UI kits.
export default [
  ...config,
  nodeFiles(["src/pdf/**/*.js", "src/vite/**/*.js", "scripts/**/*.js"]),
  ...packageBoundaries({ forbid: ["@n-uf/angiospermae", "@n-uf/harbuz", "@n-uf/kavun"] }),
  // core is framework-free: no React, no Node, nothing outside src/core.
  {
    files: ["src/core/**"],
    ignores: ["**/*.test.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react/*", "react-dom", "react-dom/*"], message: "core is framework-free: no React." },
            { group: ["node:*"], message: "core runs in the browser: no Node built-ins." },
            { group: ["../*"], message: "core imports only core (the React and Node layers build on it, not the reverse)." },
          ],
        },
      ],
    },
  },
];
