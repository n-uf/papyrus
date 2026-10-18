import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DocumentFooter } from "./document-footer";

describe("DocumentFooter", () => {
  it("has no built-in copyright line", () => {
    const html = renderToStaticMarkup(<DocumentFooter title="Doc" />);
    expect(html).toContain("Doc");
    expect(html).not.toContain("©");
  });

  it("shows the copyright and last-updated date it is given", () => {
    const html = renderToStaticMarkup(
      <DocumentFooter title="Doc" copyright="© 2030 Acme" lastUpdated="2030-01-01" />,
    );
    expect(html).toContain("© 2030 Acme");
    expect(html).toContain("Last updated: 2030-01-01");
  });
});
