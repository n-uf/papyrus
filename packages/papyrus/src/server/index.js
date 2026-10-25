/**
 * Papyrus PDF server handler: renders a document's print route to a PDF on
 * request, with the reader's document parameters, for a serverless function
 * or any server with a Web `Request`. The PDF downloads directly (no print
 * dialog) and comes from the same Chromium print engine as `papyrus pdf`.
 *
 *   GET /api/pdf?doc=partnership-calculator&raised=750000
 *   -> renders <origin>/docs/partnership-calculator?print=true&raised=750000
 *
 * The app passes how to launch Chromium (e.g. @sparticuz/chromium on
 * serverless, Playwright locally), which documents may be rendered, and which
 * cookies to forward (e.g. a login session that guards the print route).
 *
 * Each request launches its own browser and closes it when done. Serverless
 * Chromium (@sparticuz/chromium) runs with --single-process, and closing the
 * page's context after a PDF takes the whole browser down; a browser kept
 * across requests would fail every request after the first. Pass
 * `reuseBrowser: true` only where Chromium runs as a normal multi-process
 * browser and the launch cost matters.
 */

import { buildDocUrl, renderPdf } from "../pdf/index.js";

const ID = /^[\w-]+$/;

/**
 * @param {{
 *   docs: string[],
 *   launch: () => Promise<import("playwright").Browser>,
 *   reuseBrowser?: boolean,
 *   docUrl?: string,
 *   docParam?: string,
 *   forwardCookies?: string[],
 *   fileName?: (id: string) => string,
 *   origin?: string,
 *   renderOptions?: import("../pdf/index.js").RenderPdfOptions,
 * }} options
 * @returns {(request: Request) => Promise<Response>}
 */
export function createPdfHandler(options) {
  const {
    docs,
    launch,
    reuseBrowser = false,
    docUrl,
    docParam = "doc",
    forwardCookies = [],
    fileName = (id) => `${id}.pdf`,
    renderOptions,
  } = options;
  const allowed = new Set(docs);
  /** Kept across requests only with `reuseBrowser` */
  /** @type {import("playwright").Browser | null} */
  let shared = null;

  const text = (status, body) =>
    new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

  return async function handlePdf(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get(docParam) ?? "";
    if (!ID.test(id) || !allowed.has(id)) return text(404, `No such document: ${id || "(none)"}`);

    // The print route with the reader's parameters (everything but the doc id)
    const target = new URL(buildDocUrl(options.origin ?? url.origin, docUrl, id));
    for (const [k, v] of url.searchParams) {
      if (k !== docParam && k !== "print") target.searchParams.set(k, v);
    }

    // Forward only the named cookies (e.g. the session of a login gate)
    const cookies = (request.headers.get("cookie") ?? "")
      .split(";")
      .map((c) => c.trim())
      .filter((c) => forwardCookies.includes(c.split("=")[0]));
    const headers = cookies.length ? { cookie: cookies.join("; ") } : undefined;

    /** @type {import("playwright").Browser | null} */
    let browser = null;
    try {
      if (reuseBrowser) {
        if (!shared?.isConnected()) shared = await launch();
        browser = shared;
      } else {
        browser = await launch();
      }
      const pdf = await renderPdf(browser, target.toString(), { ...renderOptions, headers });
      return new Response(pdf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": String(pdf.length),
          "Content-Disposition": `attachment; filename="${fileName(id).replace(/"/g, "")}"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (err) {
      console.error(`[papyrus] ${id}.pdf failed:`, err);
      return text(500, `Could not render ${id}.pdf`);
    } finally {
      // Per-request browsers always close, even if single-process Chromium already died
      if (!reuseBrowser && browser) await browser.close().catch(() => {});
    }
  };
}
