import { useCallback, useSyncExternalStore } from "react";
import { readDocParam, readDocSearch, setDocParam, subscribeDocParams } from "../core/index.js";

/**
 * Document parameters: values a document lets the reader change (e.g. a
 * calculator's inputs), kept in the page URL's query string. The URL store
 * lives in `@n-uf/papyrus/core`; this is its React hook.
 */

export { readDocParam, writeDocParam } from "../core/index.js";

/**
 * A numeric document parameter synced with the URL (`?name=value`). The
 * default is not written, so untouched documents keep clean URLs.
 *
 * @example
 * const [raised, setRaised] = useDocParam("raised", 500_000);
 */
export function useDocParam(name: string, fallback: number): [number, (value: number) => void] {
  const search = useSyncExternalStore(subscribeDocParams, readDocSearch, () => "");
  const value = readDocParam(search, name, fallback);
  const set = useCallback((next: number) => setDocParam(name, next, fallback), [name, fallback]);
  return [value, set];
}
