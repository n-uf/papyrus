/**
 * Papyrus Vite plugin (dev server only).
 *
 * Intercepts requests for `/<routePrefix>/<id>.pdf` (default `/docs/<id>.pdf`),
 * prints the document's print route with Playwright, writes the result into
 * the public folder and serves it. Production builds use the committed static
 * files directly. Requires the optional `playwright` peer dependency.
 *
 * Without a working browser the committed PDF (if any) is served instead of an
 * error, so downloads keep working in dev; HEAD answers from the committed
 * file without generating (200 when it exists, 404 when not).
 */

import fs from "node:fs";
import path from "node:path";
import { buildDocUrl, launchBrowser, renderPdf } from "../pdf/index.js";

/**
 * @param {{ routePrefix?: string, docUrl?: string, logPrefix?: string }} [options]
 * @returns {import("vite").Plugin}
 */
export function papyrusPdfPlugin(options = {}) {
  const { routePrefix = "docs", docUrl, logPrefix = "[papyrus]" } = options;
  const route = new RegExp(`^/${routePrefix.replace(/^\/|\/$/g, "")}/([\\w-]+)\\.pdf$`);
  /** @type {import("playwright").Browser | null} */
  let browser = null;

  async function getBrowser() {
    if (browser?.isConnected()) return browser;
    browser = await launchBrowser();
    return browser;
  }

  return {
    name: "papyrus-pdf",
    apply: "serve",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const id = req.url?.split("?")[0]?.match(route)?.[1];
        if (!id) return next();

        const addr = server.httpServer?.address();
        const port =
          typeof addr === "object" && addr ? addr.port : (server.config.server.port ?? 5173);
        const filePath = path.join(server.config.publicDir, routePrefix, `${id}.pdf`);

        // HEAD (e.g. "is there a PDF?"): the committed file decides, nothing is generated
        if (req.method === "HEAD") {
          const exists = fs.existsSync(filePath);
          res.statusCode = exists ? 200 : 404;
          if (exists) {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Length", fs.statSync(filePath).size.toString());
          }
          res.end();
          return;
        }

        console.log(`${logPrefix} Generating ${id}.pdf ...`);
        const start = Date.now();

        getBrowser()
          .then((b) => renderPdf(b, buildDocUrl(`http://localhost:${port}`, docUrl, id)))
          .then((pdf) => {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, pdf);
            console.log(
              `${logPrefix} ${id}.pdf ready (${((Date.now() - start) / 1000).toFixed(1)}s, ${(pdf.length / 1024).toFixed(0)} KB)`,
            );
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Length", pdf.length.toString());
            res.end(pdf);
          })
          .catch((err) => {
            // Fall back to the committed PDF (may be older than the source)
            if (fs.existsSync(filePath)) {
              const pdf = fs.readFileSync(filePath);
              console.warn(`${logPrefix} Generation failed, serving the committed ${id}.pdf:`, err?.message ?? err);
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader("Content-Length", pdf.length.toString());
              res.setHeader("X-Papyrus-Pdf", "committed");
              res.end(pdf);
              return;
            }
            console.error(`${logPrefix} Generation failed:`, err);
            res.statusCode = 500;
            res.end(`PDF generation failed: ${err}`);
          });
      });
    },

    buildEnd() {
      browser?.close().catch(() => {});
      browser = null;
    },
  };
}

export default papyrusPdfPlugin;
