/**
 * Doc Registry Module
 *
 * Document registration and lookup for web-based documentation.
 *
 * @example
 * ```tsx
 * import { registerDoc } from "@n-uf/papyrus-react/dossier";
 * import { MyDocPage } from "./my-doc";
 *
 * // Register documents at app startup
 * registerDoc({
 *   id: "my-doc",
 *   meta: {
 *     title: "My Document",
 *     pageCount: 12,
 *     toc: [
 *       { id: "intro", title: "Introduction", page: 2, level: 0 },
 *     ],
 *   },
 *   component: MyDocPage,
 * });
 * ```
 */

// =============================================================================
// REGISTRY
// =============================================================================

export {
  createDocRegistry,
  docRegistry,
  getDocComponent,
  getDocMeta,
  getRegisteredDocIds,
  hasDoc,
  registerDoc,
} from "./doc-registry";

// =============================================================================
// VIEWER HELPERS
// =============================================================================
// What a document viewer needs around a registered document: one page of it,
// its exported PDF, and the markup the PDF export checks.

export { DOC_PAGE_SIZE, DocPageSlice, type DocPageSliceProps } from "./doc-page";
export { DocPrintView, type DocPrintViewProps } from "./print-view";
export { useDocPdf, type DocPdf, type DocPdfState, type UseDocPdfOptions } from "./use-doc-pdf";

// =============================================================================
// TYPES
// =============================================================================

export type {
  DocCategory,
  DocFigures,
  DocMeta,
  DocPageProps,
  DocRegistry,
  DocTocEntry,
  RegisteredDoc,
} from "./doc-dossier-types";
