import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Logo } from "./logo";

describe("Logo", () => {
  it("renders no brand by default", () => {
    const html = renderToStaticMarkup(<Logo />);
    expect(html).toContain("logo-container");
    expect(html).not.toContain("logo-name");
    expect(html).not.toContain("logo-with");
    expect(html).not.toMatch(/pdf|ized/i);
  });

  it("renders the wordmark and tagline the host passes", () => {
    const html = renderToStaticMarkup(<Logo name="ACME" textLines={["MADE BY"]} />);
    expect(html).toContain("ACME");
    expect(html).toContain("MADE BY");
  });

  it("takes taglines per variant from the host", () => {
    const variantTextLines = { home: ["HOME"], blog: ["BLOG"] };
    expect(renderToStaticMarkup(<Logo variantTextLines={variantTextLines} />)).toContain("HOME");
    expect(renderToStaticMarkup(<Logo variantTextLines={variantTextLines} variant="blog" />)).toContain("BLOG");
    expect(renderToStaticMarkup(<Logo variantTextLines={variantTextLines} variant="other" />)).not.toContain("logo-with");
  });

  it("omits the wordmark in the inline layout too", () => {
    expect(renderToStaticMarkup(<Logo layout="inline" />)).not.toContain("logo-name");
  });
});
