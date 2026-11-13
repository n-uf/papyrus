import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { DocPageProps, RegisteredDoc } from "./doc-dossier-types";
import { DocPrintView } from "./print-view";

describe("DocPrintView", () => {
  const figures = { chart: () => null };
  let props: DocPageProps | undefined;
  const doc: RegisteredDoc = {
    id: "my-doc",
    meta: { title: "My doc", pageCount: 7, toc: [] },
    component: (p: DocPageProps) => {
      props = p;
      return <div className="pdf-page">content</div>;
    },
    figures,
  };

  it("wraps the document in the elements `papyrus pdf` reads", () => {
    const html = renderToStaticMarkup(<DocPrintView doc={doc} />);
    expect(html).toContain('data-papyrus-doc="my-doc"');
    expect(html).toContain('data-papyrus-page-count="7"');
    expect(html).toContain("display:contents");
    expect(html).toContain('<div class="pdf-page">content</div>');
  });

  it("renders the document with its figures and without the download action", () => {
    renderToStaticMarkup(<DocPrintView doc={doc} />);
    expect(props?.figures).toBe(figures);
    expect(props?.downloadable).toBe(false);
  });
});
