// @vitest-environment happy-dom
import { act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { DocPageProps, RegisteredDoc } from "./doc-dossier-types";
import { DOC_PAGE_SIZE, DocPageSlice } from "./doc-page";
import { printStyles } from "../styles";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let seen: DocPageProps[] = [];

/** A document of three pages, each with a marker, wrapped in the container */
function ThreePages(props: DocPageProps) {
  seen.push(props);
  return (
    <div className="pdf-container">
      <div className="pdf-page" data-testid="p1">one</div>
      <section>
        <div className="pdf-page" data-testid="p2">two</div>
      </section>
      <div className="pdf-page" data-testid="p3">three</div>
    </div>
  );
}

const figures = { chart: () => null };
const doc = (id = "d"): RegisteredDoc => ({
  id,
  meta: { title: id, pageCount: 3, toc: [] },
  component: ThreePages,
  figures,
});

let host: HTMLElement;
let root: Root;

const render = (node: React.ReactNode) => act(() => root.render(node));
const visible = () =>
  [...host.querySelectorAll<HTMLElement>(".pdf-page")].filter((el) => el.style.display !== "none").map((el) => el.textContent);

beforeEach(() => {
  seen = [];
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("DocPageSlice", () => {
  it("shows only page N (1-based), wherever the page sits in the document", async () => {
    await render(<DocPageSlice doc={doc()} page={2} />);
    expect(visible()).toEqual(["two"]);
  });

  it("follows a changed page and a changed document", async () => {
    await render(<DocPageSlice doc={doc()} page={1} />);
    expect(visible()).toEqual(["one"]);
    await render(<DocPageSlice doc={doc()} page={3} />);
    expect(visible()).toEqual(["three"]);
    await render(<DocPageSlice doc={doc("other")} page={2} />);
    expect(visible()).toEqual(["two"]);
  });

  it("shows nothing for a page beyond the count, or below 1", async () => {
    await render(<DocPageSlice doc={doc()} page={4} />);
    expect(visible()).toEqual([]);
    await render(<DocPageSlice doc={doc()} page={0} />);
    expect(visible()).toEqual([]);
  });

  it("marks its root with data-papyrus-slice and lays it out at the natural A4 size", async () => {
    await render(<DocPageSlice doc={doc()} page={1} className="slot" style={{ position: "absolute" }} />);
    const el = host.firstElementChild as HTMLElement;
    expect(el.hasAttribute("data-papyrus-slice")).toBe(true);
    expect(el.className).toBe("slot");
    expect(el.style.width).toBe(`${DOC_PAGE_SIZE.width}px`);
    expect(el.style.height).toBe(`${DOC_PAGE_SIZE.height}px`);
    expect(el.style.position).toBe("absolute");
    // clipped to one page's room, so the other pages do not spill below it before they are hidden; a host may override that
    expect(el.style.overflow).toBe("hidden");
    expect(DOC_PAGE_SIZE).toEqual({ width: 794, height: 1123 });
  });

  it("renders the real component with the doc's figures and no download action", async () => {
    await render(<DocPageSlice doc={doc()} page={1} />);
    expect(seen.at(-1)?.figures).toBe(figures);
    expect(seen.at(-1)?.downloadable).toBe(false);
  });

  it("hides a page the document adds later", async () => {
    function Growing({ extra }: { extra: boolean }) {
      return (
        <div>
          <div className="pdf-page">one</div>
          {extra && <div className="pdf-page">two</div>}
        </div>
      );
    }
    let setExtra: (v: boolean) => void = () => {};
    function Doc() {
      const [extra, set] = useState(false);
      useEffect(() => {
        setExtra = set;
      }, [set]);
      return <Growing extra={extra} />;
    }
    const growing: RegisteredDoc = { id: "g", meta: { title: "g", pageCount: 2, toc: [] }, component: Doc };
    await render(<DocPageSlice doc={growing} page={1} />);
    await act(async () => setExtra(true));
    // the observer runs in a microtask
    await act(async () => {
      await Promise.resolve();
    });
    expect(visible()).toEqual(["one"]);
  });
});

describe("printStyles", () => {
  it("strips the sheet-stack framing under a slice, on screen only", () => {
    expect(printStyles).toMatch(/@media screen \{\s*\[data-papyrus-slice\] \.pdf-container/);
    expect(printStyles).toContain("[data-papyrus-slice] .pdf-page");
  });
});
