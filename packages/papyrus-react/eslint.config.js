import { config } from "@n-uf/eslint-config/react";
import { packageBoundaries } from "@n-uf/eslint-config/package-boundaries";

// papyrus-react: React components on top of the papyrus engine. Like papyrus,
// it must not depend on the UI kits.
export default [
  ...config,
  ...packageBoundaries({ forbid: ["@n-uf/angiospermae", "@n-uf/harbuz", "@n-uf/kavun"] }),
];
