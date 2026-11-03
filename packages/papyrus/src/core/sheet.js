/**
 * Sheet sizes and the CSS that keeps each page element exactly one sheet, on
 * screen and in print.
 */

import { AVOID_BREAK_CLASS, CONTAINER_CLASS, MAIN_CONTENT_CLASS, NO_PRINT_CLASS, PAGE_CLASS } from "./contract.js";

/** Paper sizes. `viewport` is the sheet in CSS pixels at 96dpi. */
export const SHEETS = Object.freeze({
  A4: Object.freeze({
    name: "A4",
    pageSize: "A4",
    width: "210mm",
    height: "297mm",
    viewport: Object.freeze({ width: 794, height: 1123 }),
  }),
  LETTER: Object.freeze({
    name: "LETTER",
    pageSize: "letter",
    width: "8.5in",
    height: "11in",
    viewport: Object.freeze({ width: 816, height: 1056 }),
  }),
});

/**
 * Look a sheet up by name (case-insensitive): "A4", "letter".
 *
 * @param {string} name
 */
export function getSheet(name) {
  const sheet = SHEETS[/** @type {keyof typeof SHEETS} */ (String(name).toUpperCase())];
  if (!sheet) throw new Error(`Unknown sheet "${name}". Known: ${Object.keys(SHEETS).join(", ")}`);
  return sheet;
}

/**
 * CSS for fixed sheets: `@page` size, one page element per printed page, and a
 * grey canvas with shadowed sheets on screen.
 *
 * @param {{ pageSize: string, width: string, height: string }} [sheet] default A4
 * @param {{ pageClass?: string }} [options] page element class, default `pdf-page`
 */
export function sheetCss(sheet = SHEETS.A4, { pageClass = PAGE_CLASS } = {}) {
  const page = `.${pageClass}`;
  return `
  @page {
    size: ${sheet.pageSize};
    margin: 0;
  }

  @media print {
    html, body {
      width: ${sheet.width};
      height: auto !important;
      overflow: visible !important;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .${CONTAINER_CLASS} {
      background: none !important;
      padding: 0 !important;
      margin: 0 !important;
      min-height: 0 !important;
      overflow: visible !important;
    }

    ${page} {
      width: ${sheet.width};
      height: ${sheet.height};
      overflow: visible !important;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid-page;
      margin: 0 !important;
      box-shadow: none !important;
    }

    ${page}:last-child {
      page-break-after: auto;
    }

    /* Flex children default to min-height:auto, so a content box taller than
       the fixed page (e.g. due to its own bottom padding) overflows the page
       and Chromium's print fragmentation slices the bottom-most block onto
       the next sheet. Let it shrink to the page and clip the excess. */
    .${MAIN_CONTENT_CLASS} {
      min-height: 0 !important;
      overflow: hidden !important;
    }

    .${NO_PRINT_CLASS} {
      display: none !important;
    }

    .${AVOID_BREAK_CLASS} {
      page-break-inside: avoid;
    }
  }

  @media screen {
    .${CONTAINER_CLASS} {
      background: #d1d5db;
      min-height: 100vh;
      padding: 40px 20px;
    }

    ${page} {
      width: ${sheet.width};
      height: ${sheet.height};
      min-height: ${sheet.height};
      margin: 0 auto 40px auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      box-sizing: border-box;
    }
  }
`;
}
