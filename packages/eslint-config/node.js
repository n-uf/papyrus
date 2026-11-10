import globals from "globals";

/**
 * Node globals (process, Buffer, ...) for plain Node scripts that live next to
 * React sources, e.g. a CLI or a Vite plugin.
 *
 * @param {string[]} files glob patterns of the Node-only files
 * @returns {import("eslint").Linter.Config}
 */
export function nodeFiles(files) {
  return {
    files,
    languageOptions: { globals: { ...globals.node } },
  };
}
