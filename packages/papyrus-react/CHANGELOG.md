# @n-uf/papyrus-react

## 26.11.0

- Calendar versions (`YY.M.R`) from now on, always the same as `@n-uf/papyrus`'s. Same code as 0.4.0, now on `@n-uf/papyrus` 26.11.0: `^0.4.x` ranges do not pick this up, so move them to `^26.11.0`.
- License: PolyForm Perimeter 1.0.1 (was `UNLICENSED`); see `LICENSE`.

## 0.4.0

### Minor Changes

- 31f146f: Papyrus splits into a framework-free engine and a React package.

  **`@n-uf/papyrus` (breaking):** now the framework-free documents engine: no React, no Tailwind, plain ESM + types, so it also runs in a plain HTML page and in Node. Its root export holds the page contract (`PAGE_CLASS`, `PAGE_COUNT_ATTR`, ...), sheet sizes (`SHEETS.A4`, `SHEETS.LETTER`) with `sheetCss()`, the document registry, `numberToc()`, the TOC section colours and the document-parameter URL store; `@n-uf/papyrus/sheet-a4.css` and `sheet-letter.css` are ready-made sheet stylesheets. `/pdf`, `/server`, `/vite` and the `papyrus` CLI are unchanged. The React components moved out: no component, `/dossier`, `/params`, `/styles` or `/tailwind.css` import from `@n-uf/papyrus` works any more; import them from `@n-uf/papyrus-react`.

  **`@n-uf/papyrus-react` (new):** the React components that were in `@n-uf/papyrus` up to 0.3, with the same subpaths (`/layout`, `/cards`, `/tables`, `/dossier`, `/params`, `/styles`, `/tailwind.css`, ...), built on the engine. Migrating: replace `@n-uf/papyrus` with `@n-uf/papyrus-react` in those imports and in `transpilePackages`; output is unchanged.

  **`@n-uf/kavun` (consumer config change):** the bare dossier takes its registry from `@n-uf/papyrus-react/dossier` and numbers its TOC with the engine's `numberToc` (same numbering). kavun now depends on `@n-uf/papyrus-react`, which ships TypeScript source: Next.js apps add `@n-uf/papyrus-react` to `transpilePackages` (in place of `@n-uf/papyrus`, which is plain JavaScript now).

### Patch Changes

- Updated dependencies [31f146f]
  - @n-uf/papyrus@0.4.0
