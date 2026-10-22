import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkPdfs, fingerprintSources, readManifest, writeManifest } from "./index.js";

let dir: string;
const write = (rel: string, content: string) => {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "papyrus-fp-"));
  write("src/shared/brand.tsx", "brand");
  write("src/report/page.tsx", "report v1");
  write("src/other/page.tsx", "other");
  write("out/report.pdf", "%PDF");
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const config = {
  outDir: "out",
  sources: ["src/shared"],
  docs: [{ id: "report", sources: ["src/report"] }, { id: "other", sources: ["src/other"] }, "loose"],
};
const outDir = () => path.join(dir, "out");
const statusOf = (id: string) => checkPdfs({ config, dir, outDir: outDir() }).find((s) => s.id === id);

describe("source fingerprints", () => {
  it("is stable, and changes with any listed file", () => {
    const a = fingerprintSources(dir, ["src/shared", "src/report"]);
    expect(fingerprintSources(dir, ["src/report", "src/shared"])).toBe(a);
    write("src/report/page.tsx", "report v2");
    expect(fingerprintSources(dir, ["src/shared", "src/report"])).not.toBe(a);
    expect(fingerprintSources(dir, [])).toBeNull();
  });

  it("reports current, stale, missing and unchecked PDFs", () => {
    const manifest = readManifest(outDir());
    manifest.docs.report = { fingerprint: fingerprintSources(dir, ["src/shared", "src/report"])!, file: "report.pdf", pages: 1 };
    writeManifest(outDir(), manifest);

    expect(statusOf("report")?.status).toBe("current");
    expect(statusOf("other")?.status).toBe("missing");

    // A shared source changes: the PDF printed before is stale
    write("src/shared/brand.tsx", "brand v2");
    expect(statusOf("report")).toMatchObject({ status: "stale", reason: "sources changed since it was printed" });

    // No sources at all: not checked
    write("out/loose.pdf", "%PDF");
    expect(checkPdfs({ config: { outDir: "out", docs: ["loose"] }, dir, outDir: outDir() })[0]?.status).toBe("unchecked");
  });
});
