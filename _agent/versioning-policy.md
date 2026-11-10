# papyrus versioning reference

`@n-uf/papyrus` and `@n-uf/papyrus-react` use calendar versions, the same policy as hypr-tiling
(`n-uf/hypr-tiling` `_agent/versioning-policy.md`), doodl and debugsy. The two packages always share
one version.

## Version format

`YY.M.R`

- `YY`: two-digit year (`26` for 2026).
- `M`: the **calendar month of the release date**, without leading zero. Never "the next number after
  the last release": a release cut in November 2026 is `26.11.x`, and `26.12.x` is only valid for a
  release dated in December.
- `R`: release counter within that year and month, starting at `0`.

No zero padding (`26.06.1` is not valid semver). Releases up to `0.4.1` (papyrus) and `0.4.0`
(papyrus-react) used semver; they sort below every calendar version, so `latest` moves to the first
calendar release on its own.

## How to release

1. In the release PR, from the repo root: `pnpm papyrus:version`. It computes `YY.M` from today's
   local date, continues `R` within the month (or starts at `0`), skips every burned version, and
   writes the result to both package.json files. `pnpm papyrus:next-version` only prints it.
2. Add a `## <version>` entry at the top of both CHANGELOG.md files.
3. Merge to `main`: `.github/workflows/release.yml` publishes both packages at that version to npmjs
   (trusted publishing, with provenance) and to GitHub Packages, wherever the version is new, and tags
   `v<version>`. Never publish from a laptop.

- **One papyrus release PR at a time.** `R` follows package.json, not the registry: two open release
  PRs would both claim the same number, and the second publish would be skipped without an error.
- **Month changed before the merge?** Re-run `pnpm papyrus:version` (and fix the CHANGELOG heading),
  so a release merged in December is not published as `26.11.x`.

**Never use changesets here.** They would bump the calendar version as semver (a "minor" turns
`26.11.3` into `26.12.0`, a "major" into `27.0.0`). `packages/papyrus/src/versioning.test.ts` fails if
a `.changeset` folder appears, and checks that the two versions agree.

papyrus-react depends on papyrus with `workspace:^`, which publishes as `^YY.M.R` and accepts every
later release of the same year.

## Where the versions came from

- Up to `26.11.0`, both packages were released from `n-uf/angiospermae` to GitHub Packages only.
- 2026-11-09: moved to this repo with their history. `26.11.0` went to npmjs by hand from this repo
  (same source as on GitHub Packages): npm can only set up trusted publishing for a package that
  already exists there.
- From `26.11.1` on, every release comes from this repo's `release.yml`, to both registries.

## Burned versions

A version that was published and then unpublished or deleted must never be reused (npm reserves the
number for good and it no longer shows in `npm view … versions`; treat GitHub Packages the same way).
Record it in `BURNED_VERSIONS` in `packages/papyrus/scripts/calendar-version-bump.mjs` and here; the
month's `R` counter skips it.

| Version | Why it is burned | Recorded |
| --- | --- | --- |
| none yet | | |
