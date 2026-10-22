/**
 * Source fingerprints for exported PDFs.
 *
 * A committed PDF is "current" while the sources it was printed from are
 * unchanged. `papyrus pdf` records a fingerprint per document (a hash of its
 * source files) in a manifest next to the PDFs; `papyrus pdf --check` and the
 * dev server compare it with the sources as they are now. Pure Node, no
 * browser.
 *
 * Config (papyrus.config.json, paths relative to it):
 *   "sources": ["packages/docs/src/shared"],             shared by every document
 *   "docs": [{ "id": "gtm-thesis", "sources": ["packages/docs/src/gtm-thesis"] }]
 * Without any sources a document is not fingerprinted (always reported as unchecked).
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const MANIFEST_FILE = "papyrus-manifest.json";

const SKIP_DIRS = new Set(["node_modules", ".git", ".turbo", "dist", ".next"]);

/** Every file under the given paths (files or folders), sorted, as absolute paths. */
export function listSourceFiles(dir, sources) {
  const files = [];
  const walk = (abs) => {
    if (!fs.existsSync(abs)) throw new Error(`Source not found: ${path.relative(dir, abs) || abs}`);
    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      files.push(abs);
      return;
    }
    for (const name of fs.readdirSync(abs)) {
      if (name.startsWith(".") || SKIP_DIRS.has(name)) continue;
      walk(path.join(abs, name));
    }
  };
  for (const source of sources) walk(path.resolve(dir, source));
  return [...new Set(files)].sort();
}

/** sha256 over each file's path (relative to `dir`) and content; null without sources. */
export function fingerprintSources(dir, sources) {
  if (!sources || sources.length === 0) return null;
  const hash = crypto.createHash("sha256");
  for (const file of listSourceFiles(dir, sources)) {
    hash.update(path.relative(dir, file).split(path.sep).join("/"));
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

/** The sources of one document: the config's shared ones plus its own. */
export function docSources(config, doc) {
  return [...(config.sources ?? []), ...(doc.sources ?? [])];
}

/** Read the manifest in an output folder ({ docs: {} } when absent). */
export function readManifest(outDir) {
  const file = path.join(outDir, MANIFEST_FILE);
  if (!fs.existsSync(file)) return { docs: {} };
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeManifest(outDir, manifest) {
  const docs = Object.fromEntries(Object.entries(manifest.docs).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(path.join(outDir, MANIFEST_FILE), `${JSON.stringify({ docs }, null, 2)}\n`);
}

/**
 * Whether a document's committed PDF is current.
 * @returns {{ id: string, status: "current" | "stale" | "missing" | "unchecked", reason?: string }}
 */
export function pdfStatus({ dir, outDir, config, doc, manifest }) {
  const file = path.join(outDir, doc.filename);
  if (!fs.existsSync(file)) return { id: doc.id, status: "missing", reason: `${doc.filename} does not exist` };
  const fingerprint = fingerprintSources(dir, docSources(config, doc));
  if (fingerprint === null) return { id: doc.id, status: "unchecked", reason: "no sources configured" };
  const recorded = (manifest ?? readManifest(outDir)).docs[doc.id]?.fingerprint;
  if (!recorded) return { id: doc.id, status: "stale", reason: "not in the manifest" };
  if (recorded !== fingerprint) return { id: doc.id, status: "stale", reason: "sources changed since it was printed" };
  return { id: doc.id, status: "current" };
}
