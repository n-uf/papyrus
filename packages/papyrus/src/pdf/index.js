/**
 * Papyrus PDF export
 *
 * Prints the HTML rendering of a document (the viewer's print route) to an A4
 * PDF with Playwright's Chromium. Content-free: document ids, output folder
 * and URL shape come from the caller or from a `papyrus.config.json`.
 *
 * Plain ESM JavaScript (typed by ./index.d.ts) so it runs under bare Node,
 * including from node_modules where TypeScript sources cannot be executed.
 *
 * Playwright is an OPTIONAL peer dependency: it is loaded lazily, only when a
 * PDF is actually generated.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { CONTAINER_CLASS, NO_PRINT_CLASS, PAGE_CLASS, PAGE_COUNT_ATTR, SHEETS } from "../core/index.js";
import { docSources, fingerprintSources, pdfStatus, readManifest, writeManifest } from "./fingerprint.js";

export {
  MANIFEST_FILE,
  docSources,
  fingerprintSources,
  listSourceFiles,
  pdfStatus,
  readManifest,
  writeManifest,
} from "./fingerprint.js";

/** A4 at 96dpi. */
export const A4_VIEWPORT = { ...SHEETS.A4.viewport };

export const DEFAULT_CONFIG_FILE = "papyrus.config.json";
export const DEFAULT_DOC_URL = "/docs/{id}?print=true";
export const DEFAULT_BASE_URL = "http://localhost:5173";

/**
 * Print-media overrides injected before printing a sheet. They target the
 * page contract (`.pdf-container` / `.pdf-page`, see `src/core/contract.js`)
 * produced by papyrus' layout components.
 *
 * @param {{ pageSize: string, width: string, height: string }} sheet
 */
function exportPrintCss(sheet) {
  return `
  @page { size: ${sheet.pageSize}; margin: 0; }
  html, body { height: auto !important; width: ${sheet.width} !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  #root { height: auto !important; overflow: visible !important; }
  .${CONTAINER_CLASS} { background: none !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; display: block !important; }
  .${PAGE_CLASS} { display: flex !important; flex-direction: column !important; width: ${sheet.width} !important; height: ${sheet.height} !important; overflow: visible !important; margin: 0 !important; box-shadow: none !important; page-break-after: always; break-after: page; }
  .${PAGE_CLASS}:last-child { page-break-after: auto; break-after: auto; }
  .${NO_PRINT_CLASS} { display: none !important; }
  [class*="opacity-"] { opacity: 1 !important; }
`;
}

/** Print-media overrides injected before printing an A4 document. */
export const PDF_PRINT_CSS = exportPrintCss(SHEETS.A4);

/** Load Playwright from this package's context, then from the caller's cwd. */
export async function loadPlaywright() {
  const pick = (mod) => (mod && (mod.chromium ? mod : mod.default)) || mod;
  try {
    return pick(await import("playwright"));
  } catch (firstError) {
    try {
      const req = createRequire(path.join(process.cwd(), "noop.js"));
      return pick(await import(pathToFileURL(req.resolve("playwright")).href));
    } catch {
      const err = new Error(
        "Playwright is required for PDF export but could not be loaded.\n" +
          "  Install it:  pnpm add -D playwright && pnpm exec playwright install chromium",
      );
      err.cause = firstError;
      throw err;
    }
  }
}

/**
 * Launch Chromium. Returns a Playwright Browser.
 * Set PAPYRUS_CHROMIUM_PATH to use an existing Chromium/Chrome binary instead
 * of Playwright's own download.
 */
export async function launchBrowser() {
  const { chromium } = await loadPlaywright();
  const executablePath = process.env.PAPYRUS_CHROMIUM_PATH || undefined;
  return chromium.launch(executablePath ? { executablePath } : {});
}

/** Fill `{id}` in a URL template and join it to the base URL. */
export function buildDocUrl(baseUrl, docUrl, id) {
  const pathPart = (docUrl || DEFAULT_DOC_URL).replace("{id}", encodeURIComponent(id));
  return new URL(pathPart, baseUrl.endsWith("/") ? baseUrl : baseUrl + "/").href;
}

/**
 * Count pages in a PDF buffer by its page objects (`/Type /Page`, not
 * `/Type /Pages`). Chromium's PDF writer emits them uncompressed.
 */
export function countPdfPages(pdf) {
  const text = Buffer.from(pdf).toString("latin1");
  return (text.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
}

/**
 * Render one URL to a PDF buffer.
 *
 * Fails (so a bad render can never be saved or committed) when the page has
 * no `.pdf-page` elements (e.g. "document not found"), when the PDF's page
 * count differs from the number of `.pdf-page` elements, or when it differs
 * from the expected count. The expected count is `options.expectedPages`, else
 * the `data-papyrus-page-count` attribute the viewer puts on the document
 * (the document's `meta.pageCount`), when present.
 *
 * @param {import("playwright").Browser} browser
 * @param {string} url
 * @param {{ viewport?: {width:number,height:number}, settleMs?: number, timeoutMs?: number, css?: string, expectedPages?: number }} [options]
 * @returns {Promise<Buffer>}
 */
export async function renderPdf(browser, url, options = {}) {
  const {
    viewport = A4_VIEWPORT,
    settleMs = 2_000,
    timeoutMs = 30_000,
    css = PDF_PRINT_CSS,
    headers,
  } = options;
  const page = await browser.newPage({ viewport });
  try {
    // e.g. the reader's session cookie, when the documents sit behind a login
    if (headers) await page.setExtraHTTPHeaders(headers);
    await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
    await page.waitForTimeout(settleMs);
    await page.emulateMedia({ media: "print" });
    await page.addStyleTag({ content: css });
    const dom = await page.evaluate(
      ({ countAttr, pageSelector }) => {
        const attr = document.querySelector(`[${countAttr}]`)?.getAttribute(countAttr);
        return {
          pages: document.querySelectorAll(pageSelector).length,
          declared: attr ? Number(attr) : null,
        };
      },
      { countAttr: PAGE_COUNT_ATTR, pageSelector: `.${PAGE_CLASS}` },
    );
    const expected = options.expectedPages ?? dom.declared;
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    const buffer = Buffer.from(pdf);
    const actual = countPdfPages(buffer);
    if (dom.pages === 0) {
      throw new Error(`${url}: no .pdf-page elements rendered (document not found or blank page)`);
    }
    if (actual !== dom.pages) {
      throw new Error(`${url}: PDF has ${actual} page(s) but the document renders ${dom.pages} .pdf-page element(s)`);
    }
    if (expected != null && actual !== expected) {
      throw new Error(`${url}: PDF has ${actual} page(s), expected ${expected}`);
    }
    return buffer;
  } finally {
    await page.close();
  }
}

/** Normalise `docs` entries (string | {id, filename?, pageCount?, sources?}) to {id, filename, pageCount?, sources}. */
export function normalizeDocs(docs) {
  return (docs ?? []).map((entry) => {
    const doc = typeof entry === "string" ? { id: entry } : entry;
    if (!doc || !doc.id) throw new Error(`Invalid docs entry: ${JSON.stringify(entry)}`);
    return { id: doc.id, filename: doc.filename ?? `${doc.id}.pdf`, pageCount: doc.pageCount, sources: doc.sources ?? [] };
  });
}

/**
 * Status of every committed PDF against its sources (no browser, no server).
 * @param {{ config: object, dir: string, outDir: string, only?: string }} options
 */
export function checkPdfs({ config, dir, outDir, only }) {
  const manifest = readManifest(outDir);
  return normalizeDocs(config.docs)
    .filter((doc) => !only || doc.id === only)
    .map((doc) => pdfStatus({ dir, outDir, config, doc, manifest }));
}

/** Poll until the server answers, so CI can start the viewer in the background. */
export async function waitForServer(baseUrl, timeoutSeconds) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseUrl);
      if (res.ok || res.status < 500) return;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `Server at ${baseUrl} did not become reachable within ${timeoutSeconds}s (${lastError}).`,
  );
}

/**
 * Read papyrus.config.json. Relative paths in it resolve against the config's
 * own folder. Returns { config, dir } or null when the file does not exist.
 */
export function readConfig(configPath) {
  const file = path.resolve(configPath ?? DEFAULT_CONFIG_FILE);
  if (!fs.existsSync(file)) return null;
  return { config: JSON.parse(fs.readFileSync(file, "utf8")), dir: path.dirname(file) };
}

/**
 * Export PDFs for a set of documents.
 *
 * @param {object} options
 * @param {string} options.baseUrl     Running server, e.g. http://localhost:5173
 * @param {string} options.outDir      Absolute output folder
 * @param {Array<string|{id:string,filename?:string,pageCount?:number}>} options.docs
 * @param {string} [options.docUrl]    URL template, default "/docs/{id}?print=true"
 * @param {string} [options.only]      Restrict to one doc id
 * @param {(msg: string) => void} [options.log]
 * @returns {Promise<{ written: string[]; failed: string[] }>}
 */
export async function exportPdfs(options) {
  const { baseUrl, outDir, docUrl, only, log = console.log } = options;
  let docs = normalizeDocs(options.docs);
  if (only) {
    docs = docs.filter((d) => d.id === only);
    if (docs.length === 0) throw new Error(`No document with id "${only}" in the config.`);
  }
  if (docs.length === 0) throw new Error("No documents to export (empty `docs`).");

  log(`Generating PDFs from ${baseUrl}\nOutput: ${outDir}\n`);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await launchBrowser();
  const written = [];
  const failed = [];
  // Source fingerprints (when the config lists sources): recorded per written PDF
  const config = options.config ?? { docs: options.docs };
  const configDir = options.configDir ?? process.cwd();
  const manifest = readManifest(outDir);
  try {
    for (const doc of docs) {
      const outputPath = path.join(outDir, doc.filename);
      log(`  ${doc.id} -> ${doc.filename}`);
      try {
        const pdf = await renderPdf(browser, buildDocUrl(baseUrl, docUrl, doc.id), {
          ...options,
          expectedPages: doc.pageCount,
        });
        fs.writeFileSync(outputPath, pdf);
        written.push(outputPath);
        const fingerprint = fingerprintSources(configDir, docSources(config, doc));
        if (fingerprint) {
          manifest.docs[doc.id] = { fingerprint, file: doc.filename, pages: countPdfPages(pdf) };
          writeManifest(outDir, manifest);
        }
        log(`    ok ${(pdf.length / 1024).toFixed(0)} KB\n`);
      } catch (err) {
        failed.push(doc.id);
        log(`    FAILED ${err}\n`);
      }
    }
  } finally {
    await browser.close();
  }
  log(failed.length ? `Done with ${failed.length} failure(s).` : "Done.");
  return { written, failed };
}
