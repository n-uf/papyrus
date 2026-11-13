# @n-uf/papyrus-react

React components for the [`@n-uf/papyrus`](https://github.com/n-uf/papyrus/tree/main/packages/papyrus) documents engine: content-free building blocks
for documents rendered as HTML and exported as A4 PDF. It contains no brand, copy or document content;
the documents package supplies those.

> [!CAUTION]
> ## Not yet stable
>
> **@n-uf/papyrus-react is young and still changing. Its components, props and print styling are not final.**
>
> Version numbers are dates (YY.M.R), not semantic versions, so any release may break things, including component props, the print styles and the Tailwind stylesheet. Pin an exact version and read the [CHANGELOG](https://github.com/n-uf/papyrus/blob/main/packages/papyrus-react/CHANGELOG.md) before you upgrade.

Ships TypeScript source (`exports` point at `./src`); list it in a Next.js app's `transpilePackages`.

```sh
pnpm add @n-uf/papyrus-react
```

| Import                                                                                                       | What                                                                                       |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `@n-uf/papyrus-react`                                                                                        | everything below, re-exported, plus the engine's page contract and sheets                  |
| `/layout`, `/typography`, `/containers`, `/cards`, `/tables`, `/lists`, `/indicator`, `/logo`, `/file-list` | page and content blocks (`PDFPage`, `Logo`, `DocumentFooter`, `TOCItem`, ...)              |
| `/dossier`                                                                                                   | the engine's document registry typed for React (`registerDoc`, `docRegistry`), `DocPageProps`, and viewer helpers (`DocPageSlice`, `useDocPdf`, `DocPrintView`) |
| `/params`                                                                                                    | `useDocParam`: a document parameter synced with the URL                                    |
| `/styles`                                                                                                    | `printStyles` (A4 sheet CSS + print fixes for these blocks, as a CSS string)               |
| `/tailwind.css`                                                                                              | Tailwind v4 source stylesheet: `@import "@n-uf/papyrus-react/tailwind.css"`                |

The PDF exporter, the request handler and the Vite plugin are in `@n-uf/papyrus` (`/pdf`, `/server`,
`/vite`).

## Branding

`Logo` and `DocumentFooter` render only what you pass:

```tsx
<Logo name={<MyWordmark />} variantTextLines={{ home: ["MADE BY"] }} />
<DocumentFooter title="Report" copyright="© 2030 Acme" />
<TOCItem number="1" title="Intro" page="3" section="market" sectionColors={{ market: "rgb(14, 116, 144)" }} />
```

## Viewing registered documents

`@n-uf/papyrus-react/dossier` also holds what a document viewer needs around a registered document, so
the viewer carries no document plumbing of its own:

| Export | What |
| --- | --- |
| `DocPageSlice` | page N (1-based) of a document at its natural size, `DOC_PAGE_SIZE` (A4 at 96 dpi), without the grey sheet-stack framing |
| `useDocPdf(docId, options?)` | `{ available, state, render }` for the exported PDF at `<basePath>/<id>.pdf` |
| `DocPrintView` | the markup `papyrus pdf` checks (`data-papyrus-doc`, `data-papyrus-page-count`) around the document |

```tsx
import { DOC_PAGE_SIZE, DocPageSlice, DocPrintView, docRegistry, useDocPdf } from "@n-uf/papyrus-react/dossier";
import { printStyles } from "@n-uf/papyrus-react/styles";

// Print route: what the PDF export opens
const doc = docRegistry.get(docId);
if (doc && print) return <DocPrintView doc={doc} />;

// A thumbnail of page 2, scaled by the host to 200 px wide
const scale = 200 / DOC_PAGE_SIZE.width;
<div style={{ width: 200, height: DOC_PAGE_SIZE.height * scale, overflow: "hidden", position: "relative" }}>
  <DocPageSlice doc={doc} page={2} style={{ position: "absolute", transform: `scale(${scale})`, transformOrigin: "0 0" }} />
</div>;

// The PDF: a committed file when `available` (a plain link), else one printed on request with the
// reader's document parameters (a document whose values the reader sets, such as a calculator)
const pdf = useDocPdf(docId, { ignore: ["closed"], fileName: (id) => `acme-${id}.pdf` });
{pdf.available ? (
  <a href={`/docs/${docId}.pdf`} download={`acme-${docId}.pdf`}>Download PDF</a>
) : (
  <button disabled={pdf.state === "busy"} onClick={pdf.render}>
    {pdf.state === "busy" ? "Preparing PDF…" : pdf.state === "failed" ? "Try again" : "Download PDF"}
  </button>
)}
```

- A slice renders the whole document component and shows only its Nth `.pdf-page`: interactive pages
  keep working and the layout is the one the PDF prints, but a document drawn as N slices renders N
  times. Scaling to a width is the host's job. The slice needs the documents' `printStyles` (documents
  inject them already): its screen rules, keyed on `data-papyrus-slice`, strip the sheet framing.
- `available` is a HEAD request whose content type must be a PDF, because hosts such as Vercel answer
  unknown paths with `index.html` and status 200. `render()` requests
  `<basePath>/<id>.pdf?<current query minus papyrus's own `print` and your `ignore`>` and downloads the
  result; it is the way to a PDF for a document with no committed file (when `available`, link to the
  file). It never rejects (a failure sets `state` to `"failed"`), and its result is dropped after
  unmount or an id change; going back to a document starts from `"idle"`.

## Moving from `@n-uf/papyrus` 0.3

Up to 0.3, these components were part of `@n-uf/papyrus`. Replace `@n-uf/papyrus` with
`@n-uf/papyrus-react` in component, `/dossier`, `/params`, `/styles` and `/tailwind.css` imports, and
`transpilePackages`. Imports of `@n-uf/papyrus/pdf`, `/server` and `/vite` stay as they are.

## Versions

Calendar versions `YY.M.R`, always the same as `@n-uf/papyrus`'s (see its
[versioning policy](https://github.com/n-uf/papyrus/blob/main/_agent/versioning-policy.md)). Releases up to `0.4.0` used semver.

## License

[PolyForm Perimeter 1.0.1](https://polyformproject.org/licenses/perimeter/1.0.1), the same license as
hypr-tiling; see [`LICENSE`](LICENSE).
