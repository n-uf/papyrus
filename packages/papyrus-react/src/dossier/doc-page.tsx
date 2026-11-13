/**
 * DocPageSlice: one page of a registered document, at its natural size.
 *
 * Documents are single components holding all their `.pdf-page` elements, so
 * a host that wants page N alone (a dossier thumbnail, a reader's page slot)
 * cannot render "just that page". The slice renders the whole document
 * component and shows only its Nth page. That costs one full render of the
 * document per slice (an N-page document drawn as N slices renders N times),
 * and it is deliberate:
 *
 * - interactive pages (e.g. a calculator whose inputs live in the document
 *   component) keep working, because the real component runs;
 * - the layout is the one the PDF export prints, not a re-implementation.
 *
 * Scaling to a width is the host's job: the slice lays the page out at
 * {@link DOC_PAGE_SIZE} (A4 at 96 dpi) and a host wraps it in its own scaler.
 */

import { PAGE_CLASS, SHEETS } from "@n-uf/papyrus";
import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { RegisteredDoc } from "./doc-dossier-types";

/** The natural size of a slice in CSS pixels: an A4 sheet at 96 dpi. */
export const DOC_PAGE_SIZE: { readonly width: number; readonly height: number } = SHEETS.A4.viewport;

/**
 * Set on the slice's root. The screen styles (`printStyles`) strip the
 * documents' grey sheet-stack framing under it.
 */
const SLICE_ATTR = "data-papyrus-slice";

/** Marks a page element the slice has hidden, so only those are restored. */
const HIDDEN_ATTR = "data-papyrus-slice-hidden";

/** Show page `page` (1-based) of `root` and hide every other `.pdf-page`. */
function showOnlyPage(root: HTMLElement, page: number): void {
  const pages = root.querySelectorAll<HTMLElement>(`.${PAGE_CLASS}`);
  pages.forEach((el, i) => {
    if (i === page - 1) {
      if (el.hasAttribute(HIDDEN_ATTR)) {
        el.removeAttribute(HIDDEN_ATTR);
        el.style.display = "";
      }
    } else if (!el.hasAttribute(HIDDEN_ATTR)) {
      el.setAttribute(HIDDEN_ATTR, "");
      el.style.display = "none";
    }
  });
}

export interface DocPageSliceProps {
  /** The registered document to draw a page of. */
  doc: RegisteredDoc;
  /** 1-based page number. A page the document does not have shows nothing. */
  page: number;
  className?: string;
  /** Merged over the natural size (`width`, `height`). */
  style?: CSSProperties;
}

/**
 * Page `page` (1-based) of `doc` at its natural size ({@link DOC_PAGE_SIZE}),
 * without the document's screen framing (grey canvas, margins, shadow).
 *
 * @example
 * <DocPageSlice doc={doc} page={2} />
 */
export function DocPageSlice({ doc, page, className, style }: DocPageSliceProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep only page N visible. Re-runs when the document or page changes, and
  // when the document component adds or replaces page elements later (e.g. a
  // calculator that reveals a page), so those do not show up unhidden.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    showOnlyPage(root, page);
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => showOnlyPage(root, page));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [doc, page]);

  const DocComponent = doc.component;
  return (
    <div
      ref={ref}
      {...{ [SLICE_ATTR]: "" }}
      className={className}
      style={{ width: DOC_PAGE_SIZE.width, height: DOC_PAGE_SIZE.height, ...style }}
    >
      <DocComponent figures={doc.figures} downloadable={false} />
    </div>
  );
}
