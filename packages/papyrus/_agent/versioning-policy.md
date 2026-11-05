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
   date, continues `R` within the month (or starts at `0`), skips every burned version, and writes the
   result to both package.json files. `pnpm papyrus:next-version` only prints it.
2. Add a `## <version>` entry at the top of both CHANGELOG.md files.
3. Merge to `main`: the Release workflow's `changeset publish` publishes every version that is not on
   the registry yet.

**Never add a changeset for these two packages.** Changesets would bump the calendar version as
semver (a "minor" turns `26.11.3` into `26.12.0`, a "major" into `27.0.0`).
`src/versioning.test.ts` fails if a changeset names them, and checks that the two versions agree.

Packages that depend on them with `workspace:^` publish `^YY.M.R`, which accepts every later release
of the same year.

## Burned versions

A version that was published and then unpublished can never be reused (npm reserves the number, and
it no longer shows in `npm view … versions`). Record it in `BURNED_VERSIONS` in
`scripts/calendar-version-bump.mjs` and here; the month's `R` counter skips it.

| Version | Why it is burned | Recorded |
| --- | --- | --- |
| none yet | | |
