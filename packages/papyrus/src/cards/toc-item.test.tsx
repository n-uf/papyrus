import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getTocSectionColor, TOC_DEFAULT_SECTION_COLOR, TOCItem } from "./toc-item";

describe("getTocSectionColor", () => {
  it("is neutral and content-free by default", () => {
    expect(getTocSectionColor(undefined)).toBe(TOC_DEFAULT_SECTION_COLOR);
    // names that used to be hard-coded are no longer special
    for (const name of ["gtm", "market", "ux", "Turn 1", "appendix"]) {
      expect(getTocSectionColor(name)).toBe(TOC_DEFAULT_SECTION_COLOR);
    }
  });

  it("looks sections up case-insensitively in sectionColors", () => {
    const sectionColors = { Market: "red", ux: "blue" };
    expect(getTocSectionColor("market", { sectionColors })).toBe("red");
    expect(getTocSectionColor("UX", { sectionColors })).toBe("blue");
    expect(getTocSectionColor("other", { sectionColors })).toBe(TOC_DEFAULT_SECTION_COLOR);
  });

  it("falls back to defaultSectionColor", () => {
    expect(getTocSectionColor("x", { defaultSectionColor: "green" })).toBe("green");
    expect(getTocSectionColor(undefined, { defaultSectionColor: "green" })).toBe("green");
  });

  it("lets resolveSectionColor win, and falls through on undefined", () => {
    const resolveSectionColor = (s: string) => (s.startsWith("turn") ? "purple" : undefined);
    const sectionColors = { turn1: "red", ux: "blue" };
    expect(getTocSectionColor("turn1", { resolveSectionColor, sectionColors })).toBe("purple");
    expect(getTocSectionColor("ux", { resolveSectionColor, sectionColors })).toBe("blue");
  });
});

describe("TOCItem", () => {
  it("tints the number from the configured section colors", () => {
    const html = renderToStaticMarkup(
      <TOCItem number="1" title="Intro" page="3" section="alpha" sectionColors={{ alpha: "rgb(1, 2, 3)" }} />,
    );
    expect(html).toContain("rgb(1, 2, 3)");
    expect(html).toContain("Intro");
  });

  it("renders a link when href is given", () => {
    const html = renderToStaticMarkup(<TOCItem number="1" title="Intro" page="3" href="#intro" />);
    expect(html).toContain('href="#intro"');
  });
});
