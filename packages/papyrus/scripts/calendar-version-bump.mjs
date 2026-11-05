#!/usr/bin/env node
// Calendar version bump for `@n-uf/papyrus` and `@n-uf/papyrus-react`
// (`YY.M.R`, the same policy as `@n-uf/hypr-tiling` and `@n-uf/debugsy`; see
// `_agent/versioning-policy.md`). The two packages move together: one version
// for both.
//
// `YY.M` is derived from TODAY's date — `M` is the calendar month of the
// release, never "the last month + 1". `R` continues within the same
// year/month and resets to `0` when the month changes, then skips any BURNED
// value.
//
// Burned versions: a registry may keep an unpublished/deleted version number
// reserved (npm always does), so a mis-numbered publish that was removed must
// never be reused. Record every burned number here; the month's `R` counter
// starts after it.
//
// `R` follows the version in package.json, not the registry: keep one papyrus
// release PR open at a time, or two PRs can both claim the same number (the
// second publish would be skipped silently).
//
// Usage (from the repo root): `pnpm papyrus:next-version` prints the next
// version; `pnpm papyrus:version` writes it to both package.json files.
// Test overrides: `CALENDAR_VERSION_TODAY=YYYY-MM-DD`,
// `CALENDAR_VERSION_CURRENT=YY.M.R`.
//
// Never release these two through a changeset: changesets would bump the
// calendar version as semver (a "minor" turns 26.11.3 into 26.12.0).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Version numbers that must never be proposed. None yet. (Releases up to
 * 0.4.1 predate calendar versions and sort below every `YY.M.R`.)
 */
export const BURNED_VERSIONS = new Set([]);

const packagesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const PACKAGE_JSON_PATHS = ["papyrus", "papyrus-react"].map((dir) => join(packagesDir, dir, "package.json"));

const VERSION = /^(\d+)\.(\d+)\.(\d+)$/;

/** The next calendar version after `current` on `today` (a Date), skipping `burned`. */
export function nextCalendarVersion(current, today, burned = BURNED_VERSIONS) {
  const match = VERSION.exec(String(current));
  if (!match) throw new Error(`Current version "${current}" is not a three-segment numeric version.`);
  const year = today.getUTCFullYear() % 100;
  const month = today.getUTCMonth() + 1;
  let release = Number(match[1]) === year && Number(match[2]) === month ? Number(match[3]) + 1 : 0;
  while (burned.has(`${year}.${month}.${release}`)) release += 1;
  return `${year}.${month}.${release}`;
}

/** The highest of the packages' current versions (they normally agree). */
function currentVersion() {
  const versions = PACKAGE_JSON_PATHS.map((file) => JSON.parse(readFileSync(file, "utf8")).version);
  return versions.reduce((a, b) => (compare(a, b) >= 0 ? a : b));
}

function compare(a, b) {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

/** Write `version` into a package.json, changing only its "version" line. */
function writeVersion(file, version) {
  const raw = readFileSync(file, "utf8");
  const next = raw.replace(/("version":\s*")[^"]*(")/, `$1${version}$2`);
  if (next === raw && JSON.parse(raw).version !== version) throw new Error(`No "version" field in ${file}`);
  writeFileSync(file, next);
}

function main() {
  // The release date is the operator's local date (as in hypr-tiling and
  // debugsy): late on the 30th in California is still that month, not UTC's next.
  const todayOverride = process.env.CALENDAR_VERSION_TODAY;
  const local = new Date();
  const today = todayOverride
    ? new Date(`${todayOverride}T12:00:00Z`)
    : new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate(), 12));
  if (Number.isNaN(today.getTime())) {
    console.error(`CALENDAR_VERSION_TODAY "${todayOverride}" is not a YYYY-MM-DD date.`);
    process.exit(1);
  }
  const next = nextCalendarVersion(process.env.CALENDAR_VERSION_CURRENT ?? currentVersion(), today);

  if (process.argv.includes("--dry-run")) {
    console.log(next);
    return;
  }
  if (!process.argv.includes("--apply")) {
    console.error("Expected --apply or --dry-run");
    process.exit(1);
  }
  for (const file of PACKAGE_JSON_PATHS) writeVersion(file, next);
  console.log(`@n-uf/papyrus and @n-uf/papyrus-react -> ${next}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
