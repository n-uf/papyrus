/**
 * Print-optimized CSS for PDF-ready documents
 *
 * Includes A4 page sizing, print color adjustments,
 * page break handling, and flattened shadows for PDF rendering.
 *
 * Note: Browser PDF renderers don't accurately render CSS shadows.
 * Print styles use borders and flat backgrounds instead.
 */
export const printStyles = `
  @page {
    size: A4;
    margin: 0;
  }
  
  @media print {
    html, body {
      width: 210mm;
      height: auto !important;
      overflow: visible !important;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .pdf-container {
      background: none !important;
      padding: 0 !important;
      margin: 0 !important;
      min-height: 0 !important;
      overflow: visible !important;
    }
    
    .pdf-page {
      width: 210mm;
      height: 297mm;
      overflow: visible !important;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid-page;
      margin: 0 !important;
      box-shadow: none !important;
    }
    
    .pdf-page:last-child {
      page-break-after: auto;
    }
    
    /* Flex children default to min-height:auto, so a content box taller than
       the fixed A4 page (e.g. due to its own bottom padding) overflows the
       page and Chromium's print fragmentation slices the bottom-most block
       onto the next sheet. Let it shrink to the page and clip the excess. */
    .pdf-main-content {
      min-height: 0 !important;
      overflow: hidden !important;
    }
    
    .no-print {
      display: none !important;
    }

    [class*="opacity-"] {
      opacity: 1 !important;
    }
    
    .avoid-break {
      page-break-inside: avoid;
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
  
  @media screen {
    .pdf-container {
      background: #d1d5db;
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .pdf-page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      margin: 0 auto 40px auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      box-sizing: border-box;
    }
  }
`;
