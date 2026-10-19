import { config } from "@n-uf/eslint-config/react";
import { nodeFiles } from "@n-uf/eslint-config/node";
import { packageBoundaries } from "@n-uf/eslint-config/package-boundaries";

// papyrus is the documents engine: it must not depend on the UI kits.
export default [
  ...config,
  nodeFiles(["src/pdf/**/*.js", "src/vite/**/*.js"]),
  ...packageBoundaries({ forbid: ["@n-uf/angiospermae", "@n-uf/harbuz", "@n-uf/kavun"] }),
];
