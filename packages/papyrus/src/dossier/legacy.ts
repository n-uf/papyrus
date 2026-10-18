/**
 * Legacy exports (deprecated)
 *
 * Product-specific type and constant exports that shipped in earlier
 * `@pdfized/doc-ui` versions. They are kept ONLY so existing consumers keep
 * compiling; the engine itself does not use them. The canonical definitions
 * now live in `@pdfized/docs` (`UserManualFigures` etc. in the user-manual
 * module, `PDFIZED_DOC_CATEGORY_LABELS` at the package root).
 *
 * It also holds the PDFized defaults that `Logo` and `DocumentFooter` fall
 * back to when a caller omits `name` / `variantTextLines` / `copyright`
 * (published `@pdfized/docs` <= 1.0.9 relies on this). New documents pass
 * these explicitly (see `PdfizedLogo` and `PDFIZED_COPYRIGHT` in
 * `@pdfized/docs`).
 *
 * This file is deleted when the engine moves to `@n-uf/papyrus`.
 */

import React from "react";

/**
 * Props for the full dossier anatomy figure (DossierFullShowcase).
 * Injected via registerDoc; hosts render a static placeholder
 * in the standalone viewer when not provided.
 */
export interface DossierFullFigureProps {
  title?: string;
  width?: number;
  height?: number;
  scale?: number;
  theme?: "terminal" | "paper";
  pageCount?: number;
  showZoneLabels?: boolean;
  className?: string;
}

/**
 * Props for the dossier chrome figure (DossierChromeShowcase).
 */
export interface DossierChromeFigureProps {
  title?: string;
  width?: number;
  showLabels?: boolean;
  className?: string;
}

/**
 * Props for the dossier titlebar figure (DossierTitlebarShowcase).
 */
export interface DossierTitlebarFigureProps {
  title?: string;
  width?: number;
  className?: string;
}

/**
 * Props for the control tray figure (ControlTrayLayoutShowcase).
 */
export interface ControlTrayFigureProps {
  variant?:
    | "ready"
    | "analyzing"
    | "upload-progress"
    | "redaction-preview"
    | "redaction-generating"
    | "redaction-stale"
    | "redaction-ready";
  showZoomControls?: boolean;
  className?: string;
}

/**
 * Props for the annotation explorer figure (AnnotationExplorerShowcase).
 */
export interface AnnotationExplorerFigureProps {
  variant?: "empty" | "with-data";
  width?: number;
  height?: number;
  showActions?: boolean;
  className?: string;
}

/**
 * Props for the taxon explorer figure (TaxonExplorerShowcase).
 */
export interface TaxonExplorerFigureProps {
  title?: string;
  annotationCount?: number;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Injected figure components for the User Manual page.
 *
 * Supplied by the rendering host via registerDoc() to render live
 * showcase components inside the document. When not provided, the page renders
 * static placeholder blocks from doc-ui primitives.
 */
export interface UserManualFigures {
  DossierFull?: React.ComponentType<DossierFullFigureProps>;
  DossierChrome?: React.ComponentType<DossierChromeFigureProps>;
  DossierTitlebar?: React.ComponentType<DossierTitlebarFigureProps>;
  ControlTray?: React.ComponentType<ControlTrayFigureProps>;
  AnnotationExplorer?: React.ComponentType<AnnotationExplorerFigureProps>;
  TaxonExplorer?: React.ComponentType<TaxonExplorerFigureProps>;
}


/**
 * @deprecated Product-specific sidebar labels. Define category labels in the
 * documents package instead (see `PDFIZED_DOC_CATEGORY_LABELS` in
 * `@pdfized/docs`).
 */
export const DOC_CATEGORY_LABELS: Record<string, string> = {
  "investor-pitch": "Investor Pitch",
  "user-docs": "User Docs",
  partners: "Partners",
};

// =============================================================================
// FALLBACK DEFAULTS (internal; used by Logo and DocumentFooter)
// =============================================================================

/** @deprecated Default footer legal line used when `copyright` is omitted. */
export const LEGACY_DEFAULT_COPYRIGHT = "© 2026 PDFized";

/** @deprecated Default tagline lines per Logo variant. */
export const LEGACY_VARIANT_TEXT_LINES: Record<string, string[]> = {
  home: ["AUTOMATICALLY", "WITH"],
  blog: ["BLOG:", "TIPS 'n TRICKS BY"],
  surface: ["REDACT WITH"],
};

/** @deprecated Default wordmark used when Logo's `name` is omitted. */
export function legacyDefaultWordmark(): React.ReactNode {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("span", { className: "pdf-text-p" }, "P"),
    React.createElement("span", { className: "pdf-text-d" }, "D"),
    React.createElement("span", { className: "pdf-text-f" }, "F"),
    React.createElement("span", { className: "logo-ized" }, "IZED.COM"),
  );
}
