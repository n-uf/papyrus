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
      height: 297mm;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .pdf-page {
      page-break-after: always;
      page-break-inside: avoid;
    }
    
    .pdf-page:last-child {
      page-break-after: auto;
    }
    
    .no-print {
      display: none !important;
    }
    
    .avoid-break {
      page-break-inside: avoid;
    }
    
    .glass-panel-print {
      background: rgba(255, 255, 255, 0.85) !important;
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
    
    /* Harbuz showcase components - remove shadows for clean PDF */
    .harbuz-showcase {
      box-shadow: none !important;
    }
    
    /* Zone label badges in dossier anatomy */
    .zone-label-badge {
      box-shadow: none !important;
    }
    
    /* Harbuz internal components - remove glows for clean PDF */
    .led-progress-fill,
    .taxon-count-badge,
    .taxon-toggle-btn,
    .led-glow-dot {
      box-shadow: none !important;
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
