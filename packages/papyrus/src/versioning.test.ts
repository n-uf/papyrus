import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// @ts-expect-error plain JS script without type declarations
import { PACKAGE_JSON_PATHS, nextCalendarVersion } from "../scripts/calendar-version-bump.mjs";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const CALENDAR = /^\d{2}\.(?:[1-9]|1[0-2])\.\d+$/;
const PACKAGES = ["@n-uf/papyrus", "@n-uf/papyrus-react"];
const day = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe("calendar versions (YY.M.R)", () => {
  it("gives @n-uf/papyrus and @n-uf/papyrus-react one calendar version", () => {
    const manifests = (PACKAGE_JSON_PATHS as string[]).map((file) => JSON.parse(fs.readFileSync(file, "utf8")));
    expect(manifests.map((m) => m.name)).toEqual(PACKAGES);
    expect(manifests[0].version).toMatch(CALENDAR);
    expect(manifests[1].version).toBe(manifests[0].version);
  });

  it("continues R within the month and resets it in a new month", () => {
    expect(nextCalendarVersion("26.11.0", day("2026-11-20"))).toBe("26.11.1");
    expect(nextCalendarVersion("26.11.9", day("2026-11-30"))).toBe("26.11.10");
    expect(nextCalendarVersion("26.11.4", day("2026-12-01"))).toBe("26.12.0");
    expect(nextCalendarVersion("26.12.2", day("2027-01-03"))).toBe("27.1.0");
    // From the semver releases before calendar versions
    expect(nextCalendarVersion("0.4.1", day("2026-11-05"))).toBe("26.11.0");
  });

  it("skips burned versions", () => {
    expect(nextCalendarVersion("26.9.4", day("2026-10-02"), new Set(["26.10.0", "26.10.1"]))).toBe("26.10.2");
  });

  it("never lets a changeset name papyrus (changesets would bump the calendar version as semver)", () => {
    const dir = path.join(repoRoot, ".changeset");
    const named = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .filter((f) => {
        const frontmatter = fs.readFileSync(path.join(dir, f), "utf8").split("---")[1] ?? "";
        return PACKAGES.some((name) => new RegExp(`["']${name}["']\\s*:`).test(frontmatter));
      });
    // Release papyrus with `pnpm papyrus:version` and a CHANGELOG entry instead.
    expect(named).toEqual([]);
  });
});
