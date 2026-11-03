import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

// @ts-expect-error plain JS script without type declarations
import { sheetCssFile, sheetCssPath } from "../../scripts/gen-sheet-css.js";
import {
  PAGE_CLASS,
  SHEETS,
  createDocRegistry,
  docRegistry,
  getSheet,
  getTocSectionColor,
  numberToc,
  readDocSearch,
  setDocParam,
  sheetCss,
  subscribeDocParams,
  TOC_DEFAULT_SECTION_COLOR,
} from "./index.js";

describe("sheets", () => {
  it("knows A4 and US Letter", () => {
    expect(SHEETS.A4).toMatchObject({ pageSize: "A4", width: "210mm", height: "297mm", viewport: { width: 794, height: 1123 } });
    expect(SHEETS.LETTER).toMatchObject({ pageSize: "letter", width: "8.5in", height: "11in", viewport: { width: 816, height: 1056 } });
    expect(getSheet("letter")).toBe(SHEETS.LETTER);
    expect(() => getSheet("A5")).toThrow(/Unknown sheet "A5"/);
  });

  it("sizes the page element to the sheet", () => {
    const css = sheetCss(SHEETS.LETTER);
    expect(css).toContain("size: letter;");
    expect(css).toMatch(/\.pdf-page \{\s*width: 8\.5in;\s*height: 11in;/);
    expect(sheetCss()).toContain("size: A4;");
  });

  it("uses another page class when asked", () => {
    const css = sheetCss(SHEETS.LETTER, { pageClass: "page" });
    expect(css).toContain(".page:last-child");
    expect(css).not.toContain(`.${PAGE_CLASS}`);
  });

  it.each(Object.values(SHEETS))("ships an up-to-date sheet-$name stylesheet", (sheet) => {
    // Out of date: run `pnpm --filter @n-uf/papyrus gen:sheets`.
    expect(fs.readFileSync(sheetCssPath(sheet), "utf8")).toBe(sheetCssFile(sheet));
  });
});

describe("numberToc", () => {
  it("numbers regular entries, letters appendices, skips marked ones", () => {
    const numbering = numberToc([
      { id: "cover", skipNumbering: true },
      { id: "intro" },
      { id: "market" },
      { id: "sources", isAppendix: true },
      { id: "glossary", isAppendix: true },
    ]);
    expect(Object.fromEntries(numbering)).toEqual({ cover: null, intro: "1.", market: "2.", sources: "A.", glossary: "B." });
  });
});

describe("getTocSectionColor", () => {
  it("resolves custom, then map (case-insensitive), then default", () => {
    const sectionColors = { Market: "red" };
    expect(getTocSectionColor("market", { sectionColors })).toBe("red");
    expect(getTocSectionColor("x", { sectionColors, resolveSectionColor: () => "blue" })).toBe("blue");
    expect(getTocSectionColor("other", { sectionColors, defaultSectionColor: "grey" })).toBe("grey");
    expect(getTocSectionColor(undefined)).toBe(TOC_DEFAULT_SECTION_COLOR);
  });
});

describe("registry", () => {
  it("keeps one global registry per realm", () => {
    expect((globalThis as Record<symbol, unknown>)[Symbol.for("@n-uf/papyrus/docRegistry")]).toBe(docRegistry);
  });

  it("creates isolated registries", () => {
    const registry = createDocRegistry<string>();
    registry.register({ id: "a", meta: { title: "A", pageCount: 1, toc: [] }, component: "render-a" });
    expect(registry.get("a")?.component).toBe("render-a");
    expect(docRegistry.has("a")).toBe(false);
  });
});

describe("document parameters store", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("writes the URL and notifies subscribers", () => {
    let href = "https://docs.test/docs/calc?print=true";
    const events = new EventTarget();
    vi.stubGlobal(
      "window",
      Object.assign(events, {
        location: {
          get href() {
            return href;
          },
          get search() {
            return new URL(href).search;
          },
        },
        history: { state: null, replaceState: (_s: unknown, _t: string, next: string) => (href = next) },
      }),
    );

    const onChange = vi.fn();
    const unsubscribe = subscribeDocParams(onChange);
    setDocParam("raised", 750_000, 500_000);
    expect(readDocSearch()).toBe("?print=true&raised=750000");
    expect(onChange).toHaveBeenCalledTimes(1);

    setDocParam("raised", 500_000, 500_000);
    expect(readDocSearch()).toBe("?print=true");

    unsubscribe();
    setDocParam("raised", 1, 500_000);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("reads an empty query string outside a browser", () => {
    expect(readDocSearch()).toBe("");
  });
});
