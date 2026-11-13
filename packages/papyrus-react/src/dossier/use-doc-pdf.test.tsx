// @vitest-environment happy-dom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDocPdf, type DocPdf, type UseDocPdfOptions } from "./use-doc-pdf";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const pdfHeaders = { "content-type": "application/pdf" };
const htmlHeaders = { "content-type": "text/html; charset=utf-8" };

/** Resolves when `settle` is called, so a test can unmount or switch id meanwhile */
function deferred<T>() {
  let settle!: (value: T) => void;
  const promise = new Promise<T>((resolve) => (settle = resolve));
  return { promise, settle };
}

let host: HTMLElement;
let root: Root;
let latest: DocPdf;
let renders: DocPdf[];
let fetchMock: ReturnType<typeof vi.fn>;

function Probe({ id, options }: { id: string | null; options?: UseDocPdfOptions }) {
  const pdf = useDocPdf(id, options);
  // read back by the tests after each render
  useEffect(() => {
    latest = pdf;
    renders.push(pdf);
  });
  return null;
}

// async act, so promises that settle right after the render are flushed inside it
const mount = (id: string | null, options?: UseDocPdfOptions) =>
  act(async () => root.render(<Probe id={id} options={options} />));
const flush = () => act(async () => void (await new Promise((r) => setTimeout(r, 0))));

/** The default fetch: HEAD answers a PDF, GET returns a blob */
function answerPdf() {
  fetchMock.mockImplementation(async (_url: string, init?: RequestInit) =>
    init?.method === "HEAD" ? new Response(null, { headers: pdfHeaders }) : new Response("%PDF-1.7", { headers: pdfHeaders }),
  );
}

let click: ReturnType<typeof vi.spyOn>;
let downloads: Array<{ href: string; download: string }>;

beforeEach(() => {
  renders = [];
  downloads = [];
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  URL.createObjectURL = vi.fn(() => "blob:fake");
  URL.revokeObjectURL = vi.fn();
  click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push({ href: this.href, download: this.download });
  });
  window.history.replaceState({}, "", "/docs/calc?print=true&raised=750000&closed=1");
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  click.mockRestore();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useDocPdf: available", () => {
  it("is true when a HEAD on /docs/<id>.pdf answers a PDF", async () => {
    answerPdf();
    await mount("calc");
    await flush();
    expect(fetchMock).toHaveBeenCalledWith("/docs/calc.pdf", { method: "HEAD" });
    expect(latest.available).toBe(true);
  });

  it("is false when a rewrite answers 200 with HTML", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200, headers: htmlHeaders }));
    await mount("calc");
    await flush();
    expect(latest.available).toBe(false);
  });

  it("is false on a 404, a network error and without an id", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404, headers: pdfHeaders }));
    await mount("calc");
    await flush();
    expect(latest.available).toBe(false);

    fetchMock.mockRejectedValue(new Error("offline"));
    await mount("other");
    await flush();
    expect(latest.available).toBe(false);

    fetchMock.mockClear();
    await mount(null);
    await flush();
    expect(latest.available).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses a configurable base path", async () => {
    answerPdf();
    await mount("calc", { basePath: "/files/pdf/" });
    await flush();
    expect(fetchMock).toHaveBeenCalledWith("/files/pdf/calc.pdf", { method: "HEAD" });
    expect(latest.available).toBe(true);
  });

  it("resets when the id changes, until the new document answers", async () => {
    answerPdf();
    await mount("calc");
    await flush();
    expect(latest.available).toBe(true);

    const head = deferred<Response>();
    fetchMock.mockReturnValue(head.promise);
    await mount("other");
    expect(latest.available).toBe(false);
    head.settle(new Response(null, { headers: htmlHeaders }));
    await flush();
    expect(latest.available).toBe(false);
  });

  it("is false while rendering on the server", () => {
    function Server() {
      const pdf = useDocPdf("calc");
      return <i>{String(pdf.available)}|{pdf.state}</i>;
    }
    expect(renderToStaticMarkup(<Server />)).toBe("<i>false|idle</i>");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("useDocPdf: render", () => {
  it("downloads the PDF with the page's parameters, minus the ignored ones", async () => {
    answerPdf();
    await mount("calc", { ignore: ["print", "closed"] });
    await flush();
    fetchMock.mockClear();
    await act(() => latest.render());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/docs/calc.pdf?raised=750000");
    expect(downloads).toEqual([{ href: "blob:fake", download: "calc.pdf" }]);
    expect(latest.state).toBe("idle");
  });

  it("names the file with fileName(docId) and drops the whole query when nothing is left", async () => {
    answerPdf();
    window.history.replaceState({}, "", "/docs/calc?print=true");
    await mount("calc", { ignore: ["print"], fileName: (id) => `acme-${id}.pdf` });
    await flush();
    fetchMock.mockClear();
    await act(() => latest.render());
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/docs/calc.pdf");
    expect(downloads[0]?.download).toBe("acme-calc.pdf");
  });

  it("revokes the object URL after 10 seconds", async () => {
    answerPdf();
    await mount("calc");
    await flush();
    vi.useFakeTimers();
    await act(() => latest.render());
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(9_999);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake");
  });

  it("is busy while rendering and ignores a second call", async () => {
    answerPdf();
    await mount("calc");
    await flush();
    const get = deferred<Response>();
    fetchMock.mockClear();
    fetchMock.mockReturnValue(get.promise);
    let first!: Promise<void>;
    await act(async () => {
      first = latest.render();
      void latest.render();
    });
    expect(latest.state).toBe("busy");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    get.settle(new Response("%PDF", { headers: pdfHeaders }));
    await act(() => first);
    expect(latest.state).toBe("idle");
  });

  it("fails (state failed, no download) on an HTML answer, an error status or a network error", async () => {
    answerPdf();
    await mount("calc");
    await flush();

    fetchMock.mockResolvedValueOnce(new Response("<html>", { status: 200, headers: htmlHeaders }));
    await act(() => latest.render());
    expect(latest.state).toBe("failed");

    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500, headers: pdfHeaders }));
    await act(() => latest.render());
    expect(latest.state).toBe("failed");

    fetchMock.mockRejectedValueOnce(new Error("offline"));
    await act(() => latest.render());
    expect(latest.state).toBe("failed");
    expect(downloads).toEqual([]);

    // and recovers
    await act(() => latest.render());
    expect(latest.state).toBe("idle");
    expect(downloads).toHaveLength(1);
  });

  it("resets to idle when the id changes", async () => {
    answerPdf();
    await mount("calc");
    await flush();
    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));
    await act(() => latest.render());
    expect(latest.state).toBe("failed");
    await mount("other");
    expect(latest.state).toBe("idle");
    // coming back to the document that failed starts from idle too (not the old "failed")
    await mount("calc");
    expect(latest.state).toBe("idle");
  });

  it("always leaves papyrus' own `print` parameter out of the render request, with or without an ignore list", async () => {
    answerPdf();
    await mount("calc");
    await flush();
    fetchMock.mockClear();
    await act(() => latest.render());
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/docs/calc.pdf?raised=750000&closed=1");
  });

  it("drops the result of a render that outlived its document id", async () => {
    answerPdf();
    await mount("calc");
    await flush();
    const get = deferred<Response>();
    fetchMock.mockReturnValue(get.promise);
    let pending!: Promise<void>;
    await act(async () => {
      pending = latest.render();
    });
    expect(latest.state).toBe("busy");
    await mount("other");
    get.settle(new Response("%PDF", { headers: pdfHeaders }));
    await act(() => pending);
    expect(downloads).toEqual([]);
    expect(latest.state).toBe("idle");
    // the old document comes back: not stuck busy
    await mount("calc");
    expect(latest.state).toBe("idle");
  });

  it("sets no state and downloads nothing after unmount", async () => {
    answerPdf();
    await mount("calc");
    await flush();
    const get = deferred<Response>();
    fetchMock.mockReturnValue(get.promise);
    let pending!: Promise<void>;
    await act(async () => {
      pending = latest.render();
    });
    const rendersBefore = renders.length;
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => root.unmount());
    get.settle(new Response("%PDF", { headers: pdfHeaders }));
    await pending;
    expect(renders.length).toBe(rendersBefore);
    expect(downloads).toEqual([]);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
    // afterEach unmounts again: give it a live root
    root = createRoot(host);
  });
});
