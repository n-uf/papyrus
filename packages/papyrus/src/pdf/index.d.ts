import type { Browser } from "playwright";

export interface PapyrusDocEntry {
  id: string;
  /** Output file name; defaults to `${id}.pdf`. */
  filename?: string;
  /** Expected PDF page count; overrides the page's own `data-papyrus-page-count`. */
  pageCount?: number;
  /** Source files/folders of this document (relative to the config), for its fingerprint. */
  sources?: string[];
}

export interface PapyrusConfig {
  /** Output folder, relative to the config file. */
  outDir?: string;
  /** Server that renders the documents. Default http://localhost:5173 */
  baseUrl?: string;
  /** Print-route template. Default "/docs/{id}?print=true" */
  docUrl?: string;
  /** Source files/folders shared by every document (relative to the config), for fingerprints. */
  sources?: string[];
  docs: Array<string | PapyrusDocEntry>;
}

export interface RenderPdfOptions {
  viewport?: { width: number; height: number };
  /** Extra wait after network idle. Default 2000 ms. */
  settleMs?: number;
  /** Navigation timeout. Default 30000 ms. */
  timeoutMs?: number;
  /** Print CSS injected before printing. Default {@link PDF_PRINT_CSS}. */
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
export const PDF_PRINT_CSS: string;

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
