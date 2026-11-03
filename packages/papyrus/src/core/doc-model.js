/**
 * Document model: the registry of documents and table-of-contents helpers.
 * Framework-free; what a registered document's `component` is (a React
 * component, a render function, a URL) is up to the layer on top.
 */

/** Create an isolated document registry. */
export function createDocRegistry() {
  const docs = new Map();

  return {
    get(docId) {
      return docs.get(docId);
    },

    getIds() {
      return Array.from(docs.keys());
    },

    has(docId) {
      return docs.has(docId);
    },

    register(doc) {
      if (docs.has(doc.id)) {
        console.warn(`[DocRegistry] Document "${doc.id}" is already registered. Overwriting.`);
      }
      docs.set(doc.id, doc);
    },
  };
}

/**
 * Key under which the global registry is stored on `globalThis`.
 *
 * Papyrus ships source, so an app can end up with two installed copies (for
 * example the one a UI kit depends on and the one the app depends on). A
 * module-level registry would then split in two: documents registered through
 * one copy would not be found through the other. Sharing the instance through
 * `Symbol.for` keeps one registry per JavaScript realm.
 */
const DOC_REGISTRY_KEY = Symbol.for("@n-uf/papyrus/docRegistry");

/** Global document registry, shared by every copy of papyrus in the realm. */
export const docRegistry = (globalThis[DOC_REGISTRY_KEY] ??= createDocRegistry());

/**
 * Number TOC entries: "1.", "2.", ... for regular entries, "A.", "B.", ... for
 * appendix entries, `null` for entries marked `skipNumbering`.
 *
 * @param {Array<{ id: string, isAppendix?: boolean, skipNumbering?: boolean }>} toc
 * @returns {Map<string, string | null>} entry id -> number label
 */
export function numberToc(toc) {
  const numbering = new Map();
  let regularIndex = 0;
  let appendixIndex = 0;

  for (const entry of toc) {
    if (entry.skipNumbering) {
      numbering.set(entry.id, null);
    } else if (entry.isAppendix) {
      numbering.set(entry.id, `${String.fromCharCode(65 + appendixIndex)}.`);
      appendixIndex++;
    } else {
      regularIndex++;
      numbering.set(entry.id, `${regularIndex}.`);
    }
  }

  return numbering;
}

/** Neutral accent used for TOC numbers when a section has no configured color. */
export const TOC_DEFAULT_SECTION_COLOR = "rgb(71, 85, 105)";

/**
 * Resolve the number color of a TOC entry from its section name.
 *
 * Order: `resolveSectionColor`, then `sectionColors` (case-insensitive), then
 * `defaultSectionColor`, then {@link TOC_DEFAULT_SECTION_COLOR}.
 *
 * @param {string | undefined} section
 * @param {{ sectionColors?: Record<string, string>, defaultSectionColor?: string, resolveSectionColor?: (section: string) => string | undefined }} [options]
 */
export function getTocSectionColor(section, { sectionColors, defaultSectionColor, resolveSectionColor } = {}) {
  const fallback = defaultSectionColor ?? TOC_DEFAULT_SECTION_COLOR;
  if (!section) return fallback;

  const custom = resolveSectionColor?.(section);
  if (custom) return custom;

  const normalized = section.toLowerCase();
  if (sectionColors) {
    for (const [name, color] of Object.entries(sectionColors)) {
      if (name.toLowerCase() === normalized) return color;
    }
  }
  return fallback;
}
