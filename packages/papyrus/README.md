# @n-uf/papyrus

Documents engine: content-free building blocks for documents rendered as HTML and exported as A4 PDF.
It contains no brand, copy or document content; the documents package supplies those.

Ships TypeScript source for the React parts (`exports` point at `./src`) and plain ESM for the Node parts.

```sh
pnpm add @n-uf/papyrus
```

| Import                                                                                                           | What                                                                                   |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `@n-uf/papyrus`                                                                                                  | everything below, re-exported                                                          |
| `/layout`, `/typography`, `/containers`, `/cards`, `/tables`, `/lists`, `/indicator`, `/logo`, `/file-list`     | page and content blocks (`PDFPage`, `Logo`, `DocumentFooter`, `TOCItem`, ...)          |
| `/dossier`                                                                                                       | document registry (`registerDoc`, `docRegistry`) and the `DocMeta` / `DocPageProps` types |
| `/styles`                                                                                                        | `printStyles` (CSS string)                                                             |
| `/tailwind.css`                                                                                                  | Tailwind v4 source stylesheet: `@import "@n-uf/papyrus/tailwind.css"`                  |
| `/pdf`                                                                                                           | PDF export API (Playwright)                                                            |
| `/vite`                                                                                                          | Vite dev-server plugin that serves `/docs/<id>.pdf`                                    |

## Branding

`Logo` and `DocumentFooter` render only what you pass:

```tsx
<Logo name={<MyWordmark />} variantTextLines={{ home: ["MADE BY"] }} />
<DocumentFooter title="Report" copyright="© 2030 Acme" />
<TOCItem number="1" title="Intro" page="3" section="market" sectionColors={{ market: "rgb(14, 116, 144)" }} />
```

## PDF export

```sh
papyrus pdf --config papyrus.config.json
papyrus --help
```

`playwright` and `vite` are optional peer dependencies, needed only for the PDF export and the Vite plugin.
