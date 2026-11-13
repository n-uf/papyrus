/**
 * DocPrintView: the markup `papyrus pdf` (and the request handler behind it)
 * expects around a document.
 *
 * The exporter opens a page, counts the page elements (`.pdf-page`) and, when
 * an element carries `data-papyrus-page-count`, checks the PDF's page count
 * against it (the document's declared `meta.pageCount`), so a document that
 * grows or loses a page fails the export instead of shipping a wrong PDF.
 * `data-papyrus-doc` names the document for tooling. The wrapper uses
 * `display: contents`, so it adds no box of its own to the print layout.
 */

import { PAGE_COUNT_ATTR } from "@n-uf/papyrus";
import type { RegisteredDoc } from "./doc-dossier-types";

export interface DocPrintViewProps {
  /** The registered document to render for export. */
  doc: RegisteredDoc;
}

/**
 * Render a registered document for the PDF export: the print route of a viewer.
 *
 * @example
 * const doc = docRegistry.get(docId);
 * if (doc && print) return <DocPrintView doc={doc} />;
 */
export function DocPrintView({ doc }: DocPrintViewProps) {
  const DocComponent = doc.component;
  return (
    <div
      data-papyrus-doc={doc.id}
      {...{ [PAGE_COUNT_ATTR]: doc.meta.pageCount }}
      style={{ display: "contents" }}
    >
      <DocComponent figures={doc.figures} downloadable={false} />
    </div>
  );
}
