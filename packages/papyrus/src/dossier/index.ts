/**
 * Doc Registry Module
 *
 * Document registration and lookup for web-based documentation.
 *
 * @example
 * ```tsx
 * import { registerDoc } from "@n-uf/papyrus/dossier";
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
