# @n-uf/papyrus

Documents engine for documents rendered as HTML and exported as PDF. Framework-free: no React, no
Tailwind. It holds the page contract, sheet sizes and print CSS, the document registry, and the PDF
exporter. It contains no brand, copy or document content.

> [!CAUTION]
> ## Not yet stable
>
> **@n-uf/papyrus is young and still changing. Its API, page contract and sheet styling are not final.**
>
> Version numbers are dates (YY.M.R), not semantic versions, so any release may break things, including the page contract, the sheet sizes and print CSS, the document registry, and the PDF exporter, request handler and Vite plugin. Pin an exact version and read the [CHANGELOG](https://github.com/n-uf/papyrus/blob/main/packages/papyrus/CHANGELOG.md) before you upgrade.

The React components live in [`@n-uf/papyrus-react`](https://github.com/n-uf/papyrus/tree/main/packages/papyrus-react), which builds on this package.

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

Every PDF is checked before it is written: the number of page elements, the PDF's page count and the
expected `pageCount` must agree, so a broken render is never saved.

**Sheet size.** A4 by default. Set `"sheet": "letter"` (or a sheet object) for the whole config or per
document; it sets the viewport, the print CSS and the PDF paper. `"pageSelector"` names the page elements
when they are not `.pdf-page` (one selector; those pages keep their own layout). Web fonts are awaited
before printing (`waitForFonts`, default on, at most 10 s), so pagination does not depend on load timing.
A PDF printed on another sheet or selector records that in the manifest, so `--check` reports it stale
when the config changes it.

**Plain HTML.** Point `baseUrl` at a folder; no server needed:

```json
{
  "baseUrl": "file:///Users/me/resume/src/",
  "docUrl": "{id}.html",
  "outDir": "../dist",
  "docs": [{ "id": "resume", "sheet": "letter", "pageSelector": ".page", "pageCount": 3 }]
}
```

The same options work in code: `renderPdf(browser, url, { sheet: "letter", pageSelector: ".page" })`.

`playwright` and `vite` are optional peer dependencies, needed only for the PDF export and the Vite plugin.
Set `PAPYRUS_CHROMIUM_PATH` to print with an installed Chrome/Chromium instead of Playwright's download.

After changing `src/core/sheet.js`, regenerate the sheet stylesheets: `pnpm --filter @n-uf/papyrus gen:sheets`.

## Versions

Calendar versions `YY.M.R`, like hypr-tiling, doodl and debugsy: `26.11.0` is the first release of
November 2026. `@n-uf/papyrus` and `@n-uf/papyrus-react` always share one version. Releases up to
`0.4.1` used semver and sort below every calendar version. Published to npmjs (with provenance) and
GitHub Packages from [n-uf/papyrus](https://github.com/n-uf/papyrus). See
[`_agent/versioning-policy.md`](https://github.com/n-uf/papyrus/blob/main/_agent/versioning-policy.md).

## License

[PolyForm Perimeter 1.0.1](https://polyformproject.org/licenses/perimeter/1.0.1), the same license as
hypr-tiling; see [`LICENSE`](LICENSE).
