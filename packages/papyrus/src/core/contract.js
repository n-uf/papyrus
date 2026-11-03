/**
 * Page contract: the class names and attributes the document DOM and the PDF
 * exporter agree on. Whatever renders a document (React, plain HTML) puts
 * these on its elements; the print CSS and the exporter look for them.
 */

/** One element with this class is one PDF page. */
export const PAGE_CLASS = "pdf-page";

/** Wraps the pages; grey canvas on screen, nothing in print. */
export const CONTAINER_CLASS = "pdf-container";

/** A page's content box; shrinks to the page and clips in print. */
export const MAIN_CONTENT_CLASS = "pdf-main-content";

/** Hidden in print and in the PDF. */
export const NO_PRINT_CLASS = "no-print";

/** Not split across pages. */
export const AVOID_BREAK_CLASS = "avoid-break";

/** Declared page count, checked against the exported PDF. */
export const PAGE_COUNT_ATTR = "data-papyrus-page-count";
