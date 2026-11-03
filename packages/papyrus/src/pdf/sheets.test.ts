import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SHEETS } from "../core/index.js";
import {
  A4_VIEWPORT,
  DEFAULT_PAGE_SELECTOR,
  PDF_PRINT_CSS,
  countPdfPages,
  exportPdfs,
  launchBrowser,
  normalizeDocs,
  pdfPaper,
  pdfPrintCss,
  renderPdf,
  resolveSheet,
} from "./index.js";

describe("sheet options", () => {
  it("defaults to A4 and .pdf-page, exactly as before", () => {
    expect(resolveSheet()).toBe(SHEETS.A4);
    expect(DEFAULT_PAGE_SELECTOR).toBe(".pdf-page");
    expect(pdfPrintCss()).toBe(PDF_PRINT_CSS);
    expect(pdfPaper(SHEETS.A4)).toEqual({ format: "A4" });
    expect(A4_VIEWPORT).toEqual({ width: 794, height: 1123 });
  });

  it("resolves sheets by name or object", () => {
    expect(resolveSheet("letter")).toBe(SHEETS.LETTER);
    expect(resolveSheet("LETTER")).toBe(SHEETS.LETTER);
    const custom = { name: "half", pageSize: "5.5in 8.5in", width: "5.5in", height: "8.5in", viewport: { width: 528, height: 816 } };
    expect(resolveSheet(custom)).toBe(custom);
    expect(() => resolveSheet("A5")).toThrow(/Unknown sheet "A5"/);
    expect(() => resolveSheet({ name: "x" } as never)).toThrow(/missing "pageSize"/);
  });

  it("sizes paper and print CSS to the sheet and the page selector", () => {
    expect(pdfPaper(SHEETS.LETTER)).toEqual({ format: "Letter" });
    expect(pdfPaper({ ...SHEETS.LETTER })).toEqual({ width: "8.5in", height: "11in" });
    const css = pdfPrintCss(SHEETS.LETTER, { pageSelector: ".page" });
    expect(css).toContain("@page { size: letter; margin: 0; }");
    expect(css).toContain(".page { display: flex !important;");
    expect(css).toContain("width: 8.5in !important; height: 11in !important;");
    expect(css).not.toContain(".pdf-page");
  });

  it("carries a document's own sheet and page selector", () => {
    expect(normalizeDocs([{ id: "resume", sheet: "letter", pageSelector: ".page" }])[0]).toMatchObject({
      id: "resume",
      filename: "resume.pdf",
      sheet: "letter",
      pageSelector: ".page",
    });
  });
});

// Real printing needs Chromium: Playwright's download or PAPYRUS_CHROMIUM_PATH.
// Where neither is installed (CI for this package), these tests are skipped.
let browser: Browser | undefined;
let skipReason = "";
let dir: string;

const sheetsHtml = (count: number, pageClass: string) => `<!doctype html><meta charset="utf-8">
<style>body{margin:0} .${pageClass}{box-sizing:border-box;padding:48px;font:16px sans-serif}</style>
${Array.from({ length: count }, (_, i) => `<section class="${pageClass}">Sheet ${i + 1}</section>`).join("\n")}`;

/** Page size of the first page, in PDF points, from its MediaBox. */
const mediaBox = (pdf: Buffer) => {
  const m = pdf.toString("latin1").match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};

/** Paper sizes in points; Chromium rounds A4 (595.28 x 841.89) up to its own pixel grid. */
const LETTER_PT = [612, 792];
const A4_PT = [595.28, 841.89];
const expectPaper = (pdf: Buffer, size: number[]) => {
  const box = mediaBox(pdf);
  expect(box).not.toBeNull();
  expect(Math.abs(box![0]! - size[0]!)).toBeLessThan(1.5);
  expect(Math.abs(box![1]! - size[1]!)).toBeLessThan(1.5);
};

describe("printing plain HTML over file://", () => {
  beforeAll(async () => {
    try {
      browser = await launchBrowser();
    } catch (err) {
      skipReason = String(err).split("\n")[0] ?? "no browser";
    }
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "papyrus-sheets-"));
    fs.writeFileSync(path.join(dir, "resume.html"), sheetsHtml(3, "page"));
    fs.writeFileSync(path.join(dir, "report.html"), sheetsHtml(2, "pdf-page"));
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }, 60_000);

  it("prints US Letter sheets with a custom page selector", async (ctx) => {
    if (!browser) return ctx.skip(`no Chromium: ${skipReason}`);
    const url = pathToFileURL(path.join(dir, "resume.html")).href;
    const pdf = await renderPdf(browser, url, { sheet: "letter", pageSelector: ".page", expectedPages: 3, settleMs: 0 });
    expect(countPdfPages(pdf)).toBe(3);
    expectPaper(pdf, LETTER_PT); // 8.5 x 11 in
  }, 60_000);

  it("still prints A4 by default", async (ctx) => {
    if (!browser) return ctx.skip(`no Chromium: ${skipReason}`);
    const pdf = await renderPdf(browser, pathToFileURL(path.join(dir, "report.html")).href, { settleMs: 0 });
    expect(countPdfPages(pdf)).toBe(2);
    expectPaper(pdf, A4_PT); // 210 x 297 mm
  }, 60_000);

  it("fails on a page selector that matches nothing", async (ctx) => {
    if (!browser) return ctx.skip(`no Chromium: ${skipReason}`);
    const url = pathToFileURL(path.join(dir, "resume.html")).href;
    await expect(renderPdf(browser, url, { sheet: "letter", settleMs: 0 })).rejects.toThrow(/no \.pdf-page elements/);
  }, 60_000);

  it("exports from a config with a file:// base URL and per-document sheets", async (ctx) => {
    if (!browser) return ctx.skip(`no Chromium: ${skipReason}`);
    const outDir = path.join(dir, "out");
    const { written, failed } = await exportPdfs({
      baseUrl: pathToFileURL(dir + path.sep).href,
      docUrl: "{id}.html",
      outDir,
      docs: [{ id: "resume", sheet: "letter", pageSelector: ".page", pageCount: 3 }, "report"],
      settleMs: 0,
      log: () => {},
    });
    expect(failed).toEqual([]);
    expect(written.map((f) => path.basename(f))).toEqual(["resume.pdf", "report.pdf"]);
    expectPaper(fs.readFileSync(path.join(outDir, "resume.pdf")), LETTER_PT);
    expectPaper(fs.readFileSync(path.join(outDir, "report.pdf")), A4_PT);
  }, 120_000);
});
