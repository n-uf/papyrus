# @n-uf/papyrus

Documents engine for documents rendered as HTML and exported as PDF. Framework-free: no React, no
Tailwind. It holds the page contract, sheet sizes and print CSS, the document registry, and the PDF
exporter. It contains no brand, copy or document content.

The React components live in [`@n-uf/papyrus-react`](../papyrus-react), which builds on this package.

Plain ESM JavaScript with type declarations, so it runs without a bundler: in a plain HTML page, in a
bundled app, and in Node.

```sh
pnpm add @n-uf/papyrus
```

| Import                       | What                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@n-uf/papyrus`              | page contract (`PAGE_CLASS`, `PAGE_COUNT_ATTR`, ...), `SHEETS` + `sheetCss()`, document registry, `numberToc()`, TOC section colours, document parameters |
| `/sheet-a4.css`, `/sheet-letter.css` | ready-made sheet stylesheets (`sheetCss()` output) for pages without a bundler           |
| `/pdf`                       | PDF export API (Playwright)                                                                          |
| `/server`                    | Web request handler that renders a document to a downloadable PDF                                    |
| `/vite`                      | Vite dev-server plugin that serves `/docs/<id>.pdf`                                                  |

## Page contract

Each element with the class `pdf-page` (`PAGE_CLASS`) is one sheet on screen and one page in the PDF.
`sheetCss(sheet)` sizes it and keeps one per printed page; the exporter counts those elements and checks
the PDF against them (and against `data-papyrus-page-count`, when the page declares it).

```js
import { SHEETS, sheetCss } from "@n-uf/papyrus";

const css = sheetCss(SHEETS.LETTER);                        // US Letter sheets
const alt = sheetCss(SHEETS.A4, { pageClass: "page" });     // your own page class
```

## Document registry

```js
import { docRegistry, numberToc } from "@n-uf/papyrus";

docRegistry.register({ id: "report", meta: { title: "Report", pageCount: 4, toc }, component: render });
numberToc(toc); // Map: entry id -> "1.", "2.", "A." (appendix) or null (skipped)
```

`component` is whatever renders the document; `@n-uf/papyrus-react/dossier` types it as a React component.
There is one global registry per JavaScript realm, shared by every installed copy.

## PDF export

```sh
papyrus pdf --config papyrus.config.json
papyrus --help
```

`playwright` and `vite` are optional peer dependencies, needed only for the PDF export and the Vite plugin.

After changing `src/core/sheet.js`, regenerate the sheet stylesheets: `pnpm --filter @n-uf/papyrus gen:sheets`.
