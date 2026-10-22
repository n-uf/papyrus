import type { Browser } from "playwright";
import type { RenderPdfOptions } from "../pdf/index";

export interface PdfHandlerOptions {
  /** Document ids that may be rendered (anything else is 404) */
  docs: string[];
  /** Launch Chromium (e.g. @sparticuz/chromium + playwright-core on serverless); reused while connected */
  launch: () => Promise<Browser>;
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
