import type { Browser } from "playwright";
import type { SheetSize } from "../core/index";

/** A sheet by name ("A4", "letter"; case-insensitive) or a sheet object. */
export type SheetOption = string | SheetSize;

export interface PapyrusDocEntry {
  id: string;
  /** Output file name; defaults to `${id}.pdf`. */
  filename?: string;
  /** Expected PDF page count; overrides the page's own `data-papyrus-page-count`. */
  pageCount?: number;
  /** Source files/folders of this document (relative to the config), for its fingerprint. */
  sources?: string[];
  /** This document's sheet; overrides the config's. */
  sheet?: SheetOption;
  /** This document's page elements; overrides the config's. */
  pageSelector?: string;
}

export interface PapyrusConfig {
  /** Output folder, relative to the config file. */
  outDir?: string;
  /** Server that renders the documents (a `file:///` folder works for plain HTML). Default http://localhost:5173 */
  baseUrl?: string;
  /** Print-route template. Default "/docs/{id}?print=true" */
  docUrl?: string;
  /** Sheet of every document. Default "A4". */
  sheet?: SheetOption;
  /** Page elements of every document. Default ".pdf-page". */
  pageSelector?: string;
  /** Source files/folders shared by every document (relative to the config), for fingerprints. */
  sources?: string[];
  docs: Array<string | PapyrusDocEntry>;
}

export interface RenderPdfOptions {
  /** Sheet size: sets the viewport, the print CSS and the PDF paper. Default A4. */
  sheet?: SheetOption;
  /** Elements that are one PDF page each. Default ".pdf-page" ({@link DEFAULT_PAGE_SELECTOR}). */
  pageSelector?: string;
  /** Default: the sheet's viewport. */
  viewport?: { width: number; height: number };
  /** Wait for web fonts (`document.fonts.ready`) before printing. Default true. */
  waitForFonts?: boolean;
  /** Extra wait after network idle. Default 2000 ms. */
  settleMs?: number;
  /** Navigation timeout. Default 30000 ms. */
  timeoutMs?: number;
  /** Print CSS injected before printing. Default {@link pdfPrintCss} for the sheet and page selector. */
  css?: string;
  /** Fail unless the PDF has exactly this many pages. */
  expectedPages?: number;
  /** Extra request headers for the page (e.g. a session cookie). */
  headers?: Record<string, string>;
}

export interface ExportPdfsOptions extends RenderPdfOptions {
  baseUrl: string;
  outDir: string;
  docs: Array<string | PapyrusDocEntry>;
  docUrl?: string;
  only?: string;
  log?: (message: string) => void;
  /** The whole config (for shared `sources`); default { docs } */
  config?: PapyrusConfig;
  /** Folder sources are relative to (the config's); default cwd */
  configDir?: string;
}

export type PdfStatus = {
  id: string;
  status: "current" | "stale" | "missing" | "unchecked";
  reason?: string;
};

export interface PapyrusManifest {
  docs: Record<string, { fingerprint: string; file: string; pages: number }>;
}

export const MANIFEST_FILE: string;
export function listSourceFiles(dir: string, sources: string[]): string[];
export function fingerprintSources(dir: string, sources: string[] | undefined): string | null;
export function docSources(config: PapyrusConfig, doc: PapyrusDocEntry): string[];
export function readManifest(outDir: string): PapyrusManifest;
export function writeManifest(outDir: string, manifest: PapyrusManifest): void;
export function pdfStatus(options: {
  dir: string;
  outDir: string;
  config: PapyrusConfig;
  doc: Required<Pick<PapyrusDocEntry, "id" | "filename">> & PapyrusDocEntry;
  manifest?: PapyrusManifest;
}): PdfStatus;
export function checkPdfs(options: { config: PapyrusConfig; dir: string; outDir: string; only?: string }): PdfStatus[];

export const A4_VIEWPORT: { width: number; height: number };
export const DEFAULT_CONFIG_FILE: string;
export const DEFAULT_DOC_URL: string;
export const DEFAULT_BASE_URL: string;
/** Print CSS for A4 and `.pdf-page`: `pdfPrintCss()` with the defaults. */
export const PDF_PRINT_CSS: string;
/** ".pdf-page" */
export const DEFAULT_PAGE_SELECTOR: string;

/** A sheet from a name ("A4", "letter") or a sheet object; default A4. Throws on an unknown name or an incomplete object. */
export function resolveSheet(sheet?: SheetOption): SheetSize;
/** Print-media CSS injected before printing a sheet. Default A4 and ".pdf-page". */
export function pdfPrintCss(sheet?: Pick<SheetSize, "pageSize" | "width" | "height">, options?: { pageSelector?: string }): string;
/** `page.pdf()` paper: Playwright's format for the A4 / Letter presets, else the sheet's width and height. */
export function pdfPaper(sheet: SheetSize): { format: string } | { width: string; height: string };

export function loadPlaywright(): Promise<typeof import("playwright")>;
export function launchBrowser(): Promise<Browser>;
export function buildDocUrl(baseUrl: string, docUrl: string | undefined, id: string): string;
/** Count pages in a PDF buffer. */
export function countPdfPages(pdf: Uint8Array): number;
export function renderPdf(browser: Browser, url: string, options?: RenderPdfOptions): Promise<Buffer>;
export function normalizeDocs(
  docs: Array<string | PapyrusDocEntry> | undefined,
): Array<Required<Pick<PapyrusDocEntry, "id" | "filename" | "sources">> & PapyrusDocEntry>;
export function waitForServer(baseUrl: string, timeoutSeconds: number): Promise<void>;
export function readConfig(configPath?: string): { config: PapyrusConfig; dir: string } | null;
export function exportPdfs(
  options: ExportPdfsOptions,
): Promise<{ written: string[]; failed: string[] }>;
