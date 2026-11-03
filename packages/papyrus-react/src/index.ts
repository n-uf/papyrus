// =============================================================================
// PAPYRUS REACT - React components for the papyrus documents engine
// =============================================================================
// Reusable components for PDF-ready documentation and printable pages, on top
// of the framework-free engine `@n-uf/papyrus`.
// Content-free: document content, branding and copy live in the documents
// package, never here.

// =============================================================================
// ENGINE
// =============================================================================
// Page contract, sheet sizes and TOC numbering from `@n-uf/papyrus`. The
// registry, TOC colours and document parameters are re-exported by their
// React-facing modules below; import `@n-uf/papyrus` for the untyped forms.

export {
  AVOID_BREAK_CLASS,
  CONTAINER_CLASS,
  getSheet,
  MAIN_CONTENT_CLASS,
  NO_PRINT_CLASS,
  numberToc,
  PAGE_CLASS,
  PAGE_COUNT_ATTR,
  SHEETS,
  sheetCss,
  type SheetCssOptions,
  type SheetSize,
} from "@n-uf/papyrus";

// =============================================================================
// INDICATOR
// =============================================================================
// LED-style status pip primitive

export * from "./indicator";

// =============================================================================
// LOGO
// =============================================================================
// Brand-agnostic logotype frame for page headers and footers

export * from "./logo";

// =============================================================================
// FILE LIST
// =============================================================================
// Static file browser illustration block

export * from "./file-list";

// =============================================================================
// CONTAINERS
// =============================================================================
// PDF-safe container components that consolidate visual styles

export * from "./containers";

// =============================================================================
// LAYOUT
// =============================================================================
// Page structure components for PDF-ready documents

export * from "./layout";

// =============================================================================
// TYPOGRAPHY
// =============================================================================
// Text and container styling components

export * from "./typography";

// =============================================================================
// TABLES
// =============================================================================
// Table primitives for documentation

export * from "./tables";

// =============================================================================
// LISTS
// =============================================================================
// List item components

export * from "./lists";

// =============================================================================
// CARDS
// =============================================================================
// Generic cards, badges, and descriptive components

export * from "./cards";

// =============================================================================
// STYLES
// =============================================================================
// CSS and print styling utilities

export * from "./styles";

// =============================================================================
// UTILS
// =============================================================================
// Utility functions

export * from "./utils";

// =============================================================================
// DOSSIER
// =============================================================================
// Simplified dossier shell for web-based documentation pages

export * from "./dossier";
