# @n-uf/papyrus-react

React components for the [`@n-uf/papyrus`](../papyrus) documents engine: content-free building blocks
for documents rendered as HTML and exported as A4 PDF. It contains no brand, copy or document content;
the documents package supplies those.

Ships TypeScript source (`exports` point at `./src`); list it in a Next.js app's `transpilePackages`.

```sh
pnpm add @n-uf/papyrus-react
```

| Import                                                                                                       | What                                                                                       |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `@n-uf/papyrus-react`                                                                                        | everything below, re-exported, plus the engine's page contract and sheets                  |
| `/layout`, `/typography`, `/containers`, `/cards`, `/tables`, `/lists`, `/indicator`, `/logo`, `/file-list` | page and content blocks (`PDFPage`, `Logo`, `DocumentFooter`, `TOCItem`, ...)              |
| `/dossier`                                                                                                   | the engine's document registry typed for React (`registerDoc`, `docRegistry`), `DocPageProps` |
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

## Moving from `@n-uf/papyrus` 0.3

Up to 0.3, these components were part of `@n-uf/papyrus`. Replace `@n-uf/papyrus` with
`@n-uf/papyrus-react` in component, `/dossier`, `/params`, `/styles` and `/tailwind.css` imports, and
`transpilePackages`. Imports of `@n-uf/papyrus/pdf`, `/server` and `/vite` stay as they are.
