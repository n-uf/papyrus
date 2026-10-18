/**
 * Doc Registry - Document component registration and lookup
 *
 * Provides a global registry for mapping document IDs to their
 * React components and metadata. Documents are registered at app
 * startup and looked up when opening in the dossier.
 *
 * @example
 * ```tsx
 * // Register documents at app init
 * import { docRegistry } from "@pdfized/doc-ui/dossier";
 * import { MyDocPage } from "./my-doc";
 *
 * docRegistry.register({
 *   id: "my-doc",
 *   meta: {
 *     title: "My Document",
 *     pageCount: 12,
 *     toc: [
 *       { id: "intro", title: "Introduction", page: 2, level: 0 },
 *       // ...
 *     ],
 *   },
 *   component: MyDocPage,
 * });
 *
 * // Later, look up by ID
 * const doc = docRegistry.get("my-doc");
 * if (doc) {
 *   const { component: DocComponent, meta } = doc;
 *   return <DocComponent />;
 * }
 * ```
 */

import type { DocRegistry, RegisteredDoc } from "./doc-dossier-types";

// =============================================================================
// REGISTRY IMPLEMENTATION
// =============================================================================

/**
 * Create a new document registry
 */
export function createDocRegistry(): DocRegistry {
  const docs = new Map<string, RegisteredDoc>();

  return {
    get(docId: string): RegisteredDoc | undefined {
      return docs.get(docId);
    },

    getIds(): string[] {
      return Array.from(docs.keys());
    },

    has(docId: string): boolean {
      return docs.has(docId);
    },

    register(doc: RegisteredDoc): void {
      if (docs.has(doc.id)) {
        console.warn(
          `[DocRegistry] Document "${doc.id}" is already registered. Overwriting.`,
        );
      }
      docs.set(doc.id, doc);
    },
  };
}

// =============================================================================
// GLOBAL REGISTRY INSTANCE
// =============================================================================

/**
 * Global document registry instance.
 * Use this for most cases. Create custom registries for isolated contexts.
 */
export const docRegistry: DocRegistry = createDocRegistry();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get document component by ID from global registry
 */
export function getDocComponent(
  docId: string,
): React.ComponentType | undefined {
  const doc = docRegistry.get(docId);
  return doc?.component;
}

/**
 * Get document metadata by ID from global registry
 */
export function getDocMeta(docId: string): RegisteredDoc["meta"] | undefined {
  const doc = docRegistry.get(docId);
  return doc?.meta;
}

/**
 * Check if document exists in global registry
 */
export function hasDoc(docId: string): boolean {
  return docRegistry.has(docId);
}

/**
 * Register document in global registry
 */
export function registerDoc(doc: RegisteredDoc): void {
  docRegistry.register(doc);
}

/**
 * Get all registered document IDs from global registry
 */
export function getRegisteredDocIds(): string[] {
  return docRegistry.getIds();
}
