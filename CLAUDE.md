pnpm + turbo monorepo of two published packages, `@n-uf/papyrus` (`packages/papyrus`, the
framework-free engine) and `@n-uf/papyrus-react` (`packages/papyrus-react`). See README.md.

- papyrus never imports papyrus-react, React or the UI kits; `src/core` imports nothing outside
  core (eslint enforces both).
- Inside a package, import siblings by relative path, never by the package name.
- Versions are calendar versions `YY.M.R`, one for both packages: a release PR runs
  `pnpm papyrus:version` and adds a CHANGELOG entry to both; merging to `main` publishes through
  `.github/workflows/release.yml` (see its header). Never hand-type a version, reuse a burned one or
  add a changeset (`_agent/versioning-policy.md`), and never publish from a laptop: the npm trusted
  publisher only accepts this repo's release.yml, running on main in the `npm` environment.
- This repo is public. It has no site; the packages are its only output. Their showcase is kavun's
  bare-dossier stories in n-uf/angiospermae's greenhouse, which install the published packages.
- Main users: finfactory/pdf-n-uf (papyrus-react) and dmetelin/resume (papyrus).
- Locally: lint, type-check and test for the changed package only (`pnpm --filter <pkg> ...`).
- Git over HTTPS only.
