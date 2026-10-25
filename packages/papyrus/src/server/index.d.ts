import type { Browser } from "playwright";
import type { RenderPdfOptions } from "../pdf/index";

export interface PdfHandlerOptions {
  /** Document ids that may be rendered (anything else is 404) */
  docs: string[];
  /** Launch Chromium (e.g. @sparticuz/chromium + playwright-core on serverless); called once per request */
  launch: () => Promise<Browser>;
  /**
   * Keep one browser across requests (relaunched when it disconnects) instead
   * of launching and closing one per request. Default false. Leave it off for
   * serverless Chromium (@sparticuz/chromium runs --single-process, where
   * closing a PDF's page context kills the browser); turn it on only for a
   * normal multi-process Chromium on a long-running server.
   */
  reuseBrowser?: boolean;
  /** Print-route template. Default "/docs/{id}?print=true" */
  docUrl?: string;
  /** Query parameter naming the document. Default "doc" */
  docParam?: string;
  /** Cookies forwarded to the print route (e.g. a login gate's session). Default none */
  forwardCookies?: string[];
  /** Download file name. Default `${id}.pdf` */
  fileName?: (id: string) => string;
  /** Origin that serves the print route. Default the request's origin */
  origin?: string;
  renderOptions?: Omit<RenderPdfOptions, "headers">;
}

/** A Web request handler that renders a document to a downloadable PDF. */
export function createPdfHandler(options: PdfHandlerOptions): (request: Request) => Promise<Response>;
