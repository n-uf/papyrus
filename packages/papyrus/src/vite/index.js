/**
 * Papyrus Vite plugin (dev server only).
 *
 * Intercepts requests for `/<routePrefix>/<id>.pdf` (default `/docs/<id>.pdf`),
 * prints the document's print route with Playwright, writes the result into
 * the public folder and serves it. Production builds use the committed static
 * files directly. Requires the optional `playwright` peer dependency.
 *
 * Document parameters: `/docs/<id>.pdf?raised=750000` prints
 * `/docs/<id>?print=true&raised=750000` and serves it without touching the
 * committed file (it would not match the defaults).
 *
 * Without a working browser the committed PDF is served instead, but only
 * while it is current: when papyrus.config.json lists the document's sources,
 * their fingerprint must match the one recorded at export
 * (papyrus-manifest.json); a stale PDF gets 409 instead. HEAD answers from the
 * committed file without generating (200 when it exists, 404 when not).
 */

import fs from "node:fs";
import path from "node:path";
import { buildDocUrl, launchBrowser, normalizeDocs, pdfStatus, readConfig, renderPdf } from "../pdf/index.js";

/** papyrus.config.json from the given path, else the nearest one above `root`. */
function findConfig(configPath, root) {
  if (configPath) return readConfig(path.resolve(root, configPath));
  for (let dir = root; ; dir = path.dirname(dir)) {
    const loaded = readConfig(path.join(dir, "papyrus.config.json"));
    if (loaded) return loaded;
    if (path.dirname(dir) === dir) return null;
  }
}

/**
 * @param {{ routePrefix?: string, docUrl?: string, logPrefix?: string, config?: string }} [options]
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
      const loaded = findConfig(options.config, server.config.root);

      /** Whether the committed PDF of `id` may stand in for a fresh one. */
      const committedStatus = (id, filePath) => {
        const entry = loaded && normalizeDocs(loaded.config.docs).find((d) => d.id === id);
        if (!entry) return fs.existsSync(filePath) ? { status: "unchecked" } : { status: "missing" };
        const outDir = path.resolve(loaded.dir, loaded.config.outDir ?? "pdf");
        return pdfStatus({ dir: loaded.dir, outDir, config: loaded.config, doc: entry });
      };

      server.middlewares.use((req, res, next) => {
        const [pathname, query = ""] = (req.url ?? "").split("?");
        const id = pathname?.match(route)?.[1];
        if (!id) return next();

        const addr = server.httpServer?.address();
        const port =
          typeof addr === "object" && addr ? addr.port : (server.config.server.port ?? 5173);
        const filePath = path.join(server.config.publicDir, routePrefix, `${id}.pdf`);
        const params = new URLSearchParams(query);
        const withParams = [...params.keys()].length > 0;

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

        let url = buildDocUrl(`http://localhost:${port}`, docUrl, id);
        if (withParams) {
          const u = new URL(url);
          for (const [k, v] of params) u.searchParams.set(k, v);
          url = u.toString();
        }

        console.log(`${logPrefix} Generating ${id}.pdf${withParams ? ` (${params})` : ""} ...`);
        const start = Date.now();

        getBrowser()
          .then((b) => renderPdf(b, url))
          .then((pdf) => {
            // Only the default rendering becomes the committed file
            if (!withParams) {
              fs.mkdirSync(path.dirname(filePath), { recursive: true });
              fs.writeFileSync(filePath, pdf);
            }
            console.log(
              `${logPrefix} ${id}.pdf ready (${((Date.now() - start) / 1000).toFixed(1)}s, ${(pdf.length / 1024).toFixed(0)} KB)`,
            );
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Length", pdf.length.toString());
            res.end(pdf);
          })
          .catch((err) => {
            const message = err?.message ?? String(err);
            // Fall back to the committed PDF, but never an out-of-date one,
            // and never for a parametrised request (it would show the defaults)
            const committed = withParams ? { status: "params" } : committedStatus(id, filePath);
            if (committed.status === "current" || committed.status === "unchecked") {
              const pdf = fs.readFileSync(filePath);
              console.warn(`${logPrefix} Generation failed, serving the committed ${id}.pdf (${committed.status}): ${message}`);
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader("Content-Length", pdf.length.toString());
              res.setHeader("X-Papyrus-Pdf", `committed-${committed.status}`);
              res.end(pdf);
              return;
            }
            console.error(`${logPrefix} Generation failed (${committed.status}):`, err);
            res.statusCode = committed.status === "stale" ? 409 : 500;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end(
              committed.status === "stale"
                ? `${id}.pdf could not be generated and the committed PDF is out of date (${committed.reason}).\n${message}`
                : `PDF generation failed: ${message}`,
            );
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
