# @n-uf/papyrus

## 0.4.1

### Patch Changes

- 76bbfd2: The PDF exporter prints any sheet size. `renderPdf`, `exportPdfs`, the Vite plugin and `papyrus.config.json` (whole config or per document) take `sheet` (`"A4"`, the default, or `"letter"` or a sheet object), which sets the viewport, the print CSS and the PDF paper, and `pageSelector` (one selector, default `.pdf-page`) for pages that use another class; such pages keep their own layout. Web fonts are awaited before printing (`waitForFonts`, default on, at most 10 s). Plain HTML prints from a `file:///` base URL without a server. A PDF printed on a non-default sheet or selector records it as `layout` in the manifest, so `papyrus pdf --check` reports it stale when the config changes it; existing manifests stay valid. A4 output with the defaults is unchanged. New helpers: `resolveSheet`, `resolvePageSelector`, `pdfPrintCss`, `pdfPaper`, `printLayout`, `DEFAULT_PAGE_SELECTOR`.

## 0.4.0

### Minor Changes

- 31f146f: Papyrus splits into a framework-free engine and a React package.

  **`@n-uf/papyrus` (breaking):** now the framework-free documents engine: no React, no Tailwind, plain ESM + types, so it also runs in a plain HTML page and in Node. Its root export holds the page contract (`PAGE_CLASS`, `PAGE_COUNT_ATTR`, ...), sheet sizes (`SHEETS.A4`, `SHEETS.LETTER`) with `sheetCss()`, the document registry, `numberToc()`, the TOC section colours and the document-parameter URL store; `@n-uf/papyrus/sheet-a4.css` and `sheet-letter.css` are ready-made sheet stylesheets. `/pdf`, `/server`, `/vite` and the `papyrus` CLI are unchanged. The React components moved out: no component, `/dossier`, `/params`, `/styles` or `/tailwind.css` import from `@n-uf/papyrus` works any more; import them from `@n-uf/papyrus-react`.

  **`@n-uf/papyrus-react` (new):** the React components that were in `@n-uf/papyrus` up to 0.3, with the same subpaths (`/layout`, `/cards`, `/tables`, `/dossier`, `/params`, `/styles`, `/tailwind.css`, ...), built on the engine. Migrating: replace `@n-uf/papyrus` with `@n-uf/papyrus-react` in those imports and in `transpilePackages`; output is unchanged.

  **`@n-uf/kavun` (consumer config change):** the bare dossier takes its registry from `@n-uf/papyrus-react/dossier` and numbers its TOC with the engine's `numberToc` (same numbering). kavun now depends on `@n-uf/papyrus-react`, which ships TypeScript source: Next.js apps add `@n-uf/papyrus-react` to `transpilePackages` (in place of `@n-uf/papyrus`, which is plain JavaScript now).

## 0.3.4

### Patch Changes

- 9bcd84c: `createPdfHandler` (`@n-uf/papyrus/server`) launches a browser for each request and closes it when the PDF is done, instead of keeping one across requests. Serverless Chromium (@sparticuz/chromium) runs `--single-process`, where closing a PDF's page context kills the browser, so the kept browser failed every request after the first on a warm instance ("browser.newPage: Target page, context or browser has been closed"). Apps that build the handler per request to work around this can go back to one module-level handler. A new `reuseBrowser` option (default false) keeps the old behaviour for a normal multi-process Chromium on a long-running server.

## 0.3.3

### Patch Changes

- 6a3b5fc: Vite plugin: only documents on the config's export list are written to the public folder; documents rendered on request (not exported) are served but never saved, so no stray PDF can be committed.

## 0.3.2

### Patch Changes

- 1f6642b: `TableCell mono` follows `--font-mono` like the other papyrus monospace text.

## 0.3.1

### Patch Changes

- abee513: Monospace text in papyrus components follows the app's `--font-mono` (Tailwind's theme variable), falling back to the system monospace, so documents can pin their fonts and print identically on every machine.

## 0.3.0

### Minor Changes

- bbabb0e: - PDF fingerprints: `papyrus pdf` records a hash of each document's sources (config `sources`, shared and per document) in `<outDir>/papyrus-manifest.json`; `papyrus pdf --check` reports committed PDFs whose sources changed (exit 1), without a browser. `checkPdfs`, `pdfStatus`, `fingerprintSources`.
  - Vite plugin: serves a committed PDF in place of a failed generation only while it is current (409 when stale); `/docs/<id>.pdf?<params>` renders with the document parameters and never overwrites the committed file; `config` option.
  - `@n-uf/papyrus/server`: `createPdfHandler`, a Web request handler that renders a document's print route (with the reader's parameters and forwarded login cookies) to a downloadable PDF, for serverless functions.
  - `renderPdf` `headers` option.

## 0.2.0

### Minor Changes

- b671368: Document parameters (`@n-uf/papyrus/params`): `useDocParam(name, fallback)` keeps a reader-changeable value (e.g. a calculator input) in the URL query string, so every rendering of a document (viewer page, thumbnail, print copy, `?print=true` export) shows the same values and links carry them. Also `readDocParam`, `writeDocParam`.

## 0.1.1

### Patch Changes

- 4410d65: Vite plugin (dev): when generating a PDF fails (e.g. no matching Playwright browser), serve the committed PDF instead of a 500; HEAD requests answer from the committed file (200 / 404) without generating.

## 0.1.0

### Minor Changes

- 62b891b: First release of `@n-uf/papyrus`, the documents engine, moved from `pdfized/pdf-n-docs` (`packages/doc-ui`, `@pdfized/doc-ui` 1.0.10). Content-free UI building blocks, document registry (`./dossier`), PDF export (`./pdf`, the `papyrus` bin) and a Vite plugin (`./vite`). Tailwind v4 source stylesheet: `@import "@n-uf/papyrus/tailwind.css"`.

  Removed compared with `@pdfized/doc-ui` 1.0.10 (PDFized content that moves to a `@pdfized/doc-ui` wrapper):

  - `src/dossier/legacy.ts` and its exports `DOC_CATEGORY_LABELS`, `UserManualFigures`, `DossierFullFigureProps`, `DossierChromeFigureProps`, `DossierTitlebarFigureProps`, `ControlTrayFigureProps`, `AnnotationExplorerFigureProps`, `TaxonExplorerFigureProps`.
  - `Logo` no longer falls back to the PDFized wordmark ("PDFIZED.COM") or to PDFized taglines (home, blog, surface). Without `name` no wordmark is rendered; without `variantTextLines` / `textLines` no tagline. `variant` is now a plain string.
  - `DocumentFooter` no longer falls back to the "© 2026 PDFized" copyright line.
  - `TOCItem` no longer hard-codes section colors for GTM-thesis section names (market, platform, document os, gtm, ux, turn*, summary, appendix). Pass `sectionColors`, `resolveSectionColor` or `defaultSectionColor`; the neutral default is slate.
