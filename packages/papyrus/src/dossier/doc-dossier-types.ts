/**
 * Doc Registry Types
 *
 * Type definitions for document registration and lookup.
 * UI components have moved to @pdfized-rix/kavun (BareDossier).
 */

import type React from "react";

// =============================================================================
// DOCUMENT METADATA
// =============================================================================

/**
 * Table of Contents entry for document navigation
 */
export interface DocTocEntry {
  /** Unique identifier for the entry */
  id: string;
  /** Display title (without numbering - numbering is auto-generated) */
  title: string;
  /** Page number (1-based) */
  page: number;
  /** Nesting level (0 = top level) */
  level: number;
  /** Anchor ID for scrolling (optional) */
  anchor?: string;
  /** Mark as appendix entry - uses letter numbering (A, B, C) instead of numbers */
  isAppendix?: boolean;
  /** Skip auto-numbering for this entry (e.g., Cover page) */
  skipNumbering?: boolean;
}

/**
 * Document category for sidebar grouping
 */
export type DocCategory = "investor-pitch" | "user-docs" | "partners";

export const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
  "investor-pitch": "Investor Pitch",
  "user-docs": "User Docs",
  partners: "Partners",
};

/**
 * Document metadata for dossier display
 */
export interface DocMeta {
  /** Document title */
  title: string;
  /** Total page count */
  pageCount: number;
  /** Table of contents entries */
  toc: DocTocEntry[];
  /** Sidebar category grouping */
  category?: DocCategory;
  /** Document description (optional) */
  description?: string;
  /** Last updated date (optional) */
  lastUpdated?: string;
  /** Document version (optional) */
  version?: string;
}

// =============================================================================
// FIGURES — injected product illustrations
// =============================================================================

/**
 * Props for the full dossier anatomy figure (DossierFullShowcase).
 * Injected by the monorepo via registerDoc; renders a static placeholder
 * in the standalone viewer when not provided.
 *
 * Must be a subtype of DossierFullShowcaseProps from @pdfized-rix/harbuz.
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
 * Must be a subtype of DossierChromeShowcaseProps from @pdfized-rix/harbuz.
 */
export interface DossierChromeFigureProps {
  title?: string;
  width?: number;
  showLabels?: boolean;
  className?: string;
}

/**
 * Props for the dossier titlebar figure (DossierTitlebarShowcase).
 * Must be a subtype of DossierTitlebarShowcaseProps from @pdfized-rix/harbuz.
 */
export interface DossierTitlebarFigureProps {
  title?: string;
  width?: number;
  className?: string;
}

/**
 * Props for the control tray figure (ControlTrayLayoutShowcase).
 * Must be a subtype of ControlTrayLayoutShowcaseProps from @pdfized-rix/harbuz.
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
 * Must be a subtype of AnnotationExplorerShowcaseProps from @pdfized-rix/harbuz.
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
 * Must be a subtype of TaxonExplorerShowcaseProps from @pdfized-rix/harbuz.
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
 * Supplied by the monorepo host via registerDoc() to render live harbuz/kavun
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

// =============================================================================
// DOC PAGE PROPS
// =============================================================================

/**
 * Props passed to document page components by the rendering host.
 */
export interface DocPageProps {
  /** Whether the PDF download action is available. Defaults to true on direct routes, false in embedded surfaces. */
  downloadable?: boolean;
  /** Injected product figure components. Only UserManualPage consumes this. */
  figures?: UserManualFigures;
}

// =============================================================================
// REGISTRY TYPES
// =============================================================================

/**
 * Registered document definition
 */
export interface RegisteredDoc {
  /** Unique document identifier */
  id: string;
  /** Document metadata */
  meta: DocMeta;
  /** React component that renders the document */
  component: React.ComponentType<DocPageProps>;
  /** Injected figure components for pages that require them (e.g. UserManualPage) */
  figures?: UserManualFigures;
}

/**
 * Document registry for mapping IDs to components
 */
export interface DocRegistry {
  /** Get document by ID */
  get: (docId: string) => RegisteredDoc | undefined;
  /** Get all registered document IDs */
  getIds: () => string[];
  /** Check if document exists */
  has: (docId: string) => boolean;
  /** Register a new document */
  register: (doc: RegisteredDoc) => void;
}
