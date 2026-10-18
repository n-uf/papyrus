# @n-uf/papyrus

## 0.1.0

### Minor Changes

- 62b891b: First release of `@n-uf/papyrus`, the documents engine, moved from `pdfized/pdf-n-docs` (`packages/doc-ui`, `@pdfized/doc-ui` 1.0.10). Content-free UI building blocks, document registry (`./dossier`), PDF export (`./pdf`, the `papyrus` bin) and a Vite plugin (`./vite`). Tailwind v4 source stylesheet: `@import "@n-uf/papyrus/tailwind.css"`.

  Removed compared with `@pdfized/doc-ui` 1.0.10 (PDFized content that moves to a `@pdfized/doc-ui` wrapper):

  - `src/dossier/legacy.ts` and its exports `DOC_CATEGORY_LABELS`, `UserManualFigures`, `DossierFullFigureProps`, `DossierChromeFigureProps`, `DossierTitlebarFigureProps`, `ControlTrayFigureProps`, `AnnotationExplorerFigureProps`, `TaxonExplorerFigureProps`.
  - `Logo` no longer falls back to the PDFized wordmark ("PDFIZED.COM") or to PDFized taglines (home, blog, surface). Without `name` no wordmark is rendered; without `variantTextLines` / `textLines` no tagline. `variant` is now a plain string.
  - `DocumentFooter` no longer falls back to the "© 2026 PDFized" copyright line.
  - `TOCItem` no longer hard-codes section colors for GTM-thesis section names (market, platform, document os, gtm, ux, turn*, summary, appendix). Pass `sectionColors`, `resolveSectionColor` or `defaultSectionColor`; the neutral default is slate.
