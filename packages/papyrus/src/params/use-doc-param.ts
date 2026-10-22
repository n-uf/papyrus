import { useCallback, useSyncExternalStore } from "react";

/**
 * Document parameters: values a document lets the reader change (e.g. a
 * calculator's inputs), kept in the page URL's query string. Every rendering
 * of the document reads the same values (a viewer's page, its thumbnail, the
 * print copy, the PDF export of `?print=true&...`), and a link carries them.
 */

const CHANGE = "papyrus-doc-params";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const readSearch = (): string => (typeof window === "undefined" ? "" : window.location.search);

/** Read a numeric document parameter from a query string (fallback when absent or invalid). */
export function readDocParam(search: string, name: string, fallback: number): number {
  const raw = new URLSearchParams(search).get(name);
  if (raw === null || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Write a numeric document parameter into a URL (removed when it equals the fallback). */
export function writeDocParam(href: string, name: string, value: number, fallback: number): string {
  const url = new URL(href);
  if (value === fallback) url.searchParams.delete(name);
  else url.searchParams.set(name, String(value));
  return url.toString();
}

/**
 * A numeric document parameter synced with the URL (`?name=value`). The
 * default is not written, so untouched documents keep clean URLs.
 *
 * @example
 * const [raised, setRaised] = useDocParam("raised", 500_000);
 */
export function useDocParam(name: string, fallback: number): [number, (value: number) => void] {
  const search = useSyncExternalStore(subscribe, readSearch, () => "");
  const value = readDocParam(search, name, fallback);
  const set = useCallback(
    (next: number) => {
      const href = writeDocParam(window.location.href, name, next, fallback);
      window.history.replaceState(window.history.state, "", href);
      window.dispatchEvent(new Event(CHANGE));
    },
    [name, fallback],
  );
  return [value, set];
}
