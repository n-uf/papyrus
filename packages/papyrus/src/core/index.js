/**
 * @n-uf/papyrus: the framework-free documents engine (package root).
 *
 * No React, no Node, no Tailwind. Plain ESM JavaScript (typed by
 * ./index.d.ts) so a page without a bundler can use it, and so
 * @n-uf/papyrus-react and the Node exporter both build on it.
 */

export {
  AVOID_BREAK_CLASS,
  CONTAINER_CLASS,
  MAIN_CONTENT_CLASS,
  NO_PRINT_CLASS,
  PAGE_CLASS,
  PAGE_COUNT_ATTR,
} from "./contract.js";
export { SHEETS, getSheet, sheetCss } from "./sheet.js";
export {
  TOC_DEFAULT_SECTION_COLOR,
  createDocRegistry,
  docRegistry,
  getTocSectionColor,
  numberToc,
} from "./doc-model.js";
export {
  readDocParam,
  readDocSearch,
  setDocParam,
  subscribeDocParams,
  writeDocParam,
} from "./params.js";
