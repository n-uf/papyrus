// =============================================================================
// PAGE CONTRACT
// =============================================================================

/** One element with this class is one PDF page. */
export const PAGE_CLASS: "pdf-page";
/** Wraps the pages; grey canvas on screen, nothing in print. */
export const CONTAINER_CLASS: "pdf-container";
/** A page's content box; shrinks to the page and clips in print. */
export const MAIN_CONTENT_CLASS: "pdf-main-content";
/** Hidden in print and in the PDF. */
export const NO_PRINT_CLASS: "no-print";
/** Not split across pages. */
export const AVOID_BREAK_CLASS: "avoid-break";
/** Declared page count, checked against the exported PDF. */
export const PAGE_COUNT_ATTR: "data-papyrus-page-count";

// =============================================================================
// SHEETS
// =============================================================================

export interface SheetSize {
  /** Key in {@link SHEETS}. */
  name: string;
  /** `@page { size }` value. */
  pageSize: string;
  /** CSS width, e.g. "210mm". */
  width: string;
  /** CSS height, e.g. "297mm". */
  height: string;
  /** The sheet in CSS pixels at 96dpi. */
  viewport: { readonly width: number; readonly height: number };
}

export const SHEETS: { readonly A4: Readonly<SheetSize>; readonly LETTER: Readonly<SheetSize> };

/** Look a sheet up by name (case-insensitive); throws on an unknown name. */
export function getSheet(name: string): Readonly<SheetSize>;

export interface SheetCssOptions {
  /** Page element class. Default {@link PAGE_CLASS}. */
  pageClass?: string;
}

/** CSS for fixed sheets: `@page` size, one page element per printed page, sheets on a canvas on screen. Default A4. */
export function sheetCss(sheet?: Pick<SheetSize, "pageSize" | "width" | "height">, options?: SheetCssOptions): string;

// =============================================================================
// DOCUMENT MODEL
// =============================================================================

/** Table of Contents entry for document navigation */
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
 * Document category for sidebar grouping.
 *
 * Free-form: the documents package decides which categories exist and how
 * they are labelled and ordered.
 */
export type DocCategory = string;

/** Document metadata for dossier display */
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

/**
 * Host-injected figures, keyed by name.
 *
 * Documents that embed live illustrations declare which keys they read; the
 * rendering host supplies them at registration. The shape is deliberately
 * open so this engine knows nothing about any particular document's figures.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocFigures = Record<string, any>;

/** Registered document. `C` is whatever renders it (a React component in the React layer). */
export interface RegisteredDoc<C = unknown> {
  /** Unique document identifier */
  id: string;
  /** Document metadata */
  meta: DocMeta;
  /** What renders the document */
  component: C;
  /** Injected figures for pages that read them */
  figures?: DocFigures;
}

/** Document registry for mapping IDs to documents */
export interface DocRegistry<C = unknown> {
  /** Get document by ID */
  get(docId: string): RegisteredDoc<C> | undefined;
  /** Get all registered document IDs */
  getIds(): string[];
  /** Check if document exists */
  has(docId: string): boolean;
  /** Register a new document */
  register(doc: RegisteredDoc<C>): void;
}

/** Create an isolated document registry. */
export function createDocRegistry<C = unknown>(): DocRegistry<C>;

/** Global document registry, shared by every copy of papyrus in the realm. */
export const docRegistry: DocRegistry;

/** Number TOC entries: "1.", "2.", ... regular; "A.", "B.", ... appendix; `null` when `skipNumbering`. */
export function numberToc(toc: ReadonlyArray<Pick<DocTocEntry, "id" | "isAppendix" | "skipNumbering">>): Map<string, string | null>;

/** Neutral accent used for TOC numbers when a section has no configured color. */
export const TOC_DEFAULT_SECTION_COLOR: string;

/**
 * Section name -> number color. Keys are matched case-insensitively against
 * an entry's section name.
 */
export type TOCSectionColors = Record<string, string>;

export interface TOCSectionColorOptions {
  /** Section name -> color (CSS color string). */
  sectionColors?: TOCSectionColors;
  /** Used when the section is missing or not listed. Defaults to {@link TOC_DEFAULT_SECTION_COLOR}. */
  defaultSectionColor?: string;
  /**
   * Custom lookup for rules a plain map cannot express (e.g. prefixes). Return
   * `undefined` to fall through to `sectionColors`.
   */
  resolveSectionColor?: (section: string) => string | undefined;
}

/**
 * Resolve the number color of a TOC entry from its section name.
 *
 * Order: `resolveSectionColor`, then `sectionColors` (case-insensitive), then
 * `defaultSectionColor`, then {@link TOC_DEFAULT_SECTION_COLOR}.
 */
export function getTocSectionColor(section: string | undefined, options?: TOCSectionColorOptions): string;

// =============================================================================
// DOCUMENT PARAMETERS
// =============================================================================

/** Read a numeric document parameter from a query string (fallback when absent or invalid). */
export function readDocParam(search: string, name: string, fallback: number): number;
/** Write a numeric document parameter into a URL (removed when it equals the fallback). */
export function writeDocParam(href: string, name: string, value: number, fallback: number): string;
/** The current page's query string ("" outside a browser). */
export function readDocSearch(): string;
/** Call `onChange` whenever a document parameter changes; returns the unsubscribe function. */
export function subscribeDocParams(onChange: () => void): () => void;
/** Set a document parameter in the page URL (no history entry) and notify subscribers. */
export function setDocParam(name: string, value: number, fallback: number): void;
