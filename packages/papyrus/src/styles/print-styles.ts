import { SHEETS, sheetCss } from "../core/index.js";

/**
 * Print fixes for papyrus' own blocks (panels, carved text, Tailwind rounded
 * and opacity utilities).
 *
 * Note: Browser PDF renderers don't accurately render CSS shadows.
 * Print styles use borders and flat backgrounds instead.
 */
export const blockPrintStyles = `
  @media print {
    [class*="opacity-"] {
      opacity: 1 !important;
    }

    /* Chromium's PDF renderer skips painting elements with backdrop-filter,
       dropping the whole panel (and its text) from the exported PDF. It also
       composites the panel's translucent fill over white instead of the page
       fill, so flatten it to the color the glass effect resolves to on screen:
       rgba(243,244,246,0.75) over the #f3f4f6 page fill = #f3f4f6. */
    .glass-panel-print {
      background: rgb(243, 244, 246) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      box-shadow: none !important;
      border-color: rgba(0, 0, 0, 0.06) !important;
    }

    /* Flatten shadow effects for accurate PDF rendering */
    .floating-panel {
      box-shadow: none !important;
      transform: none !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
    }

    .beveled-panel {
      box-shadow: none !important;
      border: 1px solid rgba(0, 0, 0, 0.1) !important;
      border-top-color: rgba(0, 0, 0, 0.06) !important;
      border-left-color: rgba(0, 0, 0, 0.06) !important;
    }

    .carved-text {
      text-shadow: none !important;
    }

    /* =========================================================== */
    /* PDF Rendering Fixes                                         */
    /* Browser PDF renderers may draw unwanted bounding rectangles */
    /* around elements with backgrounds and border-radius          */
    /* =========================================================== */

    /* Ensure color accuracy for backgrounds */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Remove any default outlines/borders that might appear as rects */
    [class*="rounded"] {
      outline: none !important;
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }

    /* Flex containers with backgrounds - prevent clipping rect artifacts */
    .flex[class*="rounded"],
    .inline-flex[class*="rounded"],
    div[class*="rounded"],
    span[class*="rounded"] {
      overflow: visible !important;
      isolation: auto !important;
    }

    /* Numbered badges and circular elements */
    .rounded-full {
      transform: translateZ(0); /* Force GPU layer for cleaner rendering */
    }

    /* Feature tags and small pill badges */
    span.rounded, span.rounded-md, span.rounded-sm {
      display: inline-block;
      line-height: 1.4;
    }
  }
`;

/**
 * Print-optimized CSS for PDF-ready documents: A4 sheets (from core's
 * {@link sheetCss}) plus the print fixes for papyrus' blocks.
 */
export const printStyles = sheetCss(SHEETS.A4) + blockPrintStyles;
