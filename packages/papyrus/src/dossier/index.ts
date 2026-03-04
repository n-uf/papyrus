/**
 * Doc Registry Module
 *
 * Document registration and lookup for web-based documentation.
 * UI components have moved to @pdfized-rix/kavun (BareDossier).
 *
 * @example
 * ```tsx
 * import { registerDoc } from "@pdfized-rix/doc-ui/dossier";
 * import { UserManualPage } from "@pdfized-rix/docs/user-manual";
 *
 * // Register documents at app startup
 * registerDoc({
 *   id: "user-manual",
 *   meta: {
 *     title: "AI Redaction User Manual",
 *     pageCount: 12,
 *     toc: [
 *       { id: "1", title: "1. Toolbar", page: 2, level: 0 },
 *     ],
 *   },
 *   component: UserManualPage,
 * });
 *
 * // Use with BareDossier from @pdfized-rix/kavun
 * import { BareDossier } from "@pdfized-rix/kavun";
 * <BareDossier docId="user-manual" />
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
  AnnotationExplorerFigureProps,
  ControlTrayFigureProps,
  DocCategory,
  DocMeta,
  DocPageProps,
  DocRegistry,
  DocTocEntry,
  DossierChromeFigureProps,
  DossierFullFigureProps,
  DossierTitlebarFigureProps,
  RegisteredDoc,
  TaxonExplorerFigureProps,
  UserManualFigures,
} from "./doc-dossier-types";

export { DOC_CATEGORY_LABELS } from "./doc-dossier-types";
