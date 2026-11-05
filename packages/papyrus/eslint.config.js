import { config } from "@n-uf/eslint-config/react";
import { nodeFiles } from "@n-uf/eslint-config/node";
import { packageBoundaries } from "@n-uf/eslint-config/package-boundaries";

// papyrus is the framework-free documents engine: it must not depend on the UI
// kits or on papyrus-react (which builds on it). React is not a dependency, so
// packageBoundaries rejects any React import; the react preset is used only for
// its browser globals (src/core runs in the browser).
export default [
  ...config,
  nodeFiles(["src/pdf/**/*.js", "src/vite/**/*.js", "scripts/**/*.{js,mjs}"]),
  ...packageBoundaries({ forbid: ["@n-uf/angiospermae", "@n-uf/harbuz", "@n-uf/kavun", "@n-uf/papyrus-react"] }),
  // core runs anywhere: no React, no Node, nothing outside src/core.
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
            { group: ["../*"], message: "core imports only core (the exporter and papyrus-react build on it, not the reverse)." },
          ],
        },
      ],
    },
  },
];
