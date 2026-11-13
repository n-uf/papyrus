/**
 * useDocPdf: the exported PDF of a registered document.
 *
 * Two questions a viewer asks about a document's PDF: is there one (a file the
 * host serves at `<basePath>/<id>.pdf`), and can I get one rendered with the
 * reader's values (`<basePath>/<id>.pdf?<document params>`, printed on request
 * by papyrus' Vite plugin in dev or its request handler in production).
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseDocPdfOptions {
  /** Where the host serves PDFs: `<basePath>/<id>.pdf`. Default `/docs`. */
  basePath?: string;
  /**
   * Query parameters that belong to the host, not to the document: they are
   * left out of the render request (the rest of the page's query is the
   * reader's document parameters).
   */
  ignore?: readonly string[];
  /** File name of the downloaded PDF. Default `<id>.pdf`. */
  fileName?: (docId: string) => string;
}

export type DocPdfState = "idle" | "busy" | "failed";

export interface DocPdf {
  /** The document has an exported PDF (a HEAD request answers a PDF). */
  available: boolean;
  /** `busy` while {@link DocPdf.render} runs, `failed` after it failed. */
  state: DocPdfState;
  /**
   * Render the PDF with the current page's document parameters and download
   * it. Never rejects: a failure sets `state` to `failed`. Does nothing when
   * a render is already running, and drops its result when the document id
   * changes or the host unmounts meanwhile.
   */
  render: () => Promise<void>;
}

const DEFAULT_BASE_PATH = "/docs";

const isPdf = (res: Response) => res.ok && (res.headers.get("content-type") ?? "").includes("application/pdf");

function pdfUrl(basePath: string, docId: string): string {
  return `${basePath.replace(/\/+$/, "")}/${encodeURIComponent(docId)}.pdf`;
}

/**
 * The PDF of a document: whether it exists, and rendering it on request.
 *
 * `available` is decided by a HEAD request on `<basePath>/<id>.pdf` and the
 * response's content type: Vercel rewrites unknown paths to index.html with
 * 200, so the status alone proves nothing (papyrus' dev plugin answers HEAD
 * from the committed file).
 *
 * @example
 * const pdf = useDocPdf(doc.id, { ignore: ["print", "closed"], fileName: (id) => `acme-${id}.pdf` });
 * <button disabled={!pdf.available || pdf.state === "busy"} onClick={pdf.render}>Download PDF</button>
 */
export function useDocPdf(docId: string | null | undefined, options: UseDocPdfOptions = {}): DocPdf {
  const basePath = options.basePath ?? DEFAULT_BASE_PATH;
  // What a result belongs to; a result of another document (or base path) is
  // read as "unknown yet", which resets both fields when the id changes.
  const key = docId ? pdfUrl(basePath, docId) : null;

  const [probe, setProbe] = useState<{ key: string; available: boolean } | null>(null);
  const [run, setRun] = useState<{ key: string; state: DocPdfState } | null>(null);

  // Latest options without making `render` change identity on every render
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!key) return;
    let live = true;
    fetch(key, { method: "HEAD" })
      .then((res) => live && setProbe({ key, available: isPdf(res) }))
      .catch(() => live && setProbe({ key, available: false }));
    return () => {
      live = false;
    };
  }, [key]);

  // The running render, aborted when the document changes or the host unmounts
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
      // an aborted render never settles: do not leave its document "busy"
      // for when the reader comes back to it (a no-op after unmount)
      setRun((prev) => (prev?.state === "busy" ? null : prev));
    },
    [key],
  );

  const render = useCallback(async () => {
    if (!key || !docId || controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    const settle = (state: DocPdfState) => {
      if (controller.signal.aborted) return;
      controllerRef.current = null;
      setRun({ key, state });
    };
    setRun({ key, state: "busy" });
    try {
      const { ignore = [], fileName = (id: string) => `${id}.pdf` } = optionsRef.current;
      const params = new URLSearchParams(window.location.search);
      for (const name of ignore) params.delete(name);
      const query = params.toString();
      const res = await fetch(`${key}${query ? `?${query}` : ""}`, { signal: controller.signal });
      if (!isPdf(res)) throw new Error(`PDF failed: ${res.status}`);
      const blob = await res.blob();
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement("a"), { href: url, download: fileName(docId) });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      settle("idle");
    } catch {
      settle("failed");
    }
  }, [key, docId]);

  return {
    available: key !== null && probe?.key === key && probe.available,
    state: key !== null && run?.key === key ? run.state : "idle",
    render,
  };
}
