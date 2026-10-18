import type { Browser } from "playwright";

export interface PapyrusDocEntry {
  id: string;
  /** Output file name; defaults to `${id}.pdf`. */
  filename?: string;
}

export interface PapyrusConfig {
  /** Output folder, relative to the config file. */
  outDir?: string;
  /** Server that renders the documents. Default http://localhost:5173 */
  baseUrl?: string;
  /** Print-route template. Default "/docs/{id}?print=true" */
  docUrl?: string;
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
}

export interface ExportPdfsOptions extends RenderPdfOptions {
  baseUrl: string;
  outDir: string;
  docs: Array<string | PapyrusDocEntry>;
  docUrl?: string;
  only?: string;
  log?: (message: string) => void;
}

export const A4_VIEWPORT: { width: number; height: number };
export const DEFAULT_CONFIG_FILE: string;
export const DEFAULT_DOC_URL: string;
export const DEFAULT_BASE_URL: string;
export const PDF_PRINT_CSS: string;

export function loadPlaywright(): Promise<typeof import("playwright")>;
export function launchBrowser(): Promise<Browser>;
export function buildDocUrl(baseUrl: string, docUrl: string | undefined, id: string): string;
export function renderPdf(browser: Browser, url: string, options?: RenderPdfOptions): Promise<Buffer>;
export function normalizeDocs(
  docs: Array<string | PapyrusDocEntry> | undefined,
): Array<Required<PapyrusDocEntry>>;
export function waitForServer(baseUrl: string, timeoutSeconds: number): Promise<void>;
export function readConfig(configPath?: string): { config: PapyrusConfig; dir: string } | null;
export function exportPdfs(
  options: ExportPdfsOptions,
): Promise<{ written: string[]; failed: string[] }>;
