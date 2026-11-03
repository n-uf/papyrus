/**
 * Document parameters: values a document lets the reader change (e.g. a
 * calculator's inputs), kept in the page URL's query string. Every rendering
 * of the document reads the same values (a viewer's page, its thumbnail, the
 * print copy, the PDF export of `?print=true&...`), and a link carries them.
 */

const CHANGE = "papyrus-doc-params";

/** Read a numeric document parameter from a query string (fallback when absent or invalid). */
export function readDocParam(search, name, fallback) {
  const raw = new URLSearchParams(search).get(name);
  if (raw === null || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Write a numeric document parameter into a URL (removed when it equals the fallback). */
export function writeDocParam(href, name, value, fallback) {
  const url = new URL(href);
  if (value === fallback) url.searchParams.delete(name);
  else url.searchParams.set(name, String(value));
  return url.toString();
}

/** The current page's query string ("" outside a browser). */
export function readDocSearch() {
  return typeof window === "undefined" ? "" : window.location.search;
}

/** Call `onChange` whenever a document parameter changes; returns the unsubscribe function. */
export function subscribeDocParams(onChange) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/** Set a document parameter in the page URL (no history entry) and notify subscribers. */
export function setDocParam(name, value, fallback) {
  const href = writeDocParam(window.location.href, name, value, fallback);
  window.history.replaceState(window.history.state, "", href);
  window.dispatchEvent(new Event(CHANGE));
}
