# papyrus

Documents rendered as HTML and exported as PDF.

Overview page: [n-uf.com/papyrus](https://n-uf.com/papyrus)

Two packages, always released together at one version:

| Package | Folder | What |
| --- | --- | --- |
| [`@n-uf/papyrus`](packages/papyrus) | `packages/papyrus` | the engine, framework-free: page contract, sheet sizes and print CSS, document registry, PDF export (CLI, request handler, Vite plugin) |
| [`@n-uf/papyrus-react`](packages/papyrus-react) | `packages/papyrus-react` | content-free React components on top of the engine, the React-typed registry and print styles |

> [!CAUTION]
> Not yet stable. Version numbers are dates (`YY.M.R`), not semantic versions: any release may break
> things. Pin an exact version and read the CHANGELOGs before you upgrade.

## Use

```sh
pnpm add @n-uf/papyrus            # engine only (plain JavaScript, no bundler needed)
pnpm add @n-uf/papyrus-react      # React components (TypeScript source: add it to transpilePackages)
```

Both are on npmjs (with provenance) and on GitHub Packages under the same names. Each package's README
has the details.

## Develop

```sh
pnpm install
pnpm check        # lint, type-check, test, build for both packages
```

Node 22, pnpm 10. `packages/eslint-config`, `packages/typescript-config` and `packages/vitest-config`
are internal and never published.

## Versions and release

Calendar versions `YY.M.R`, one version for both packages, the same scheme as hypr-tiling, doodl and
debugsy ([`_agent/versioning-policy.md`](_agent/versioning-policy.md)):

1. In a release PR: `pnpm papyrus:version` (writes the next version to both package.json files), plus
   a `## <version>` entry at the top of both CHANGELOGs.
2. Merge to `main`. [`release.yml`](.github/workflows/release.yml) publishes both packages to npmjs
   (trusted publishing, no token) and GitHub Packages, tags `v<version>` and notifies pdf-n-uf.

Never publish from a laptop, never hand-type or reuse a version, and never add changesets.

## History

Until 2026-11-09 papyrus lived in `n-uf/angiospermae` (and before that in `pdfized/pdf-n-docs` as
`doc-ui`); this repo keeps its history from angiospermae.

## License

[PolyForm Perimeter 1.0.1](https://polyformproject.org/licenses/perimeter/1.0.1); see [`LICENSE`](LICENSE).
