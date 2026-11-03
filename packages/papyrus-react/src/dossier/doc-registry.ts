/**
 * Doc Registry - Document component registration and lookup
 *
 * The React face of core's document registry: the same global instance
 * (`@n-uf/papyrus` `docRegistry`), typed so each document is rendered
 * by a React component. Documents are registered at app startup and looked
 * up when opening in the dossier.
 *
 * @example
 * ```tsx
 * // Register documents at app init
 * import { docRegistry } from "@n-uf/papyrus-react/dossier";
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

import type React from "react";
import {
  createDocRegistry as createCoreDocRegistry,
  docRegistry as coreDocRegistry,
} from "@n-uf/papyrus";
import type { DocPageProps, DocRegistry, RegisteredDoc } from "./doc-dossier-types";

/**
 * Create a new document registry
 */
export function createDocRegistry(): DocRegistry {
  return createCoreDocRegistry<React.ComponentType<DocPageProps>>();
}

/**
 * Global document registry instance, shared by every copy of papyrus loaded in
 * the same realm (it is core's global registry). Use this for most cases.
 * Create custom registries with {@link createDocRegistry} for isolated contexts.
 */
export const docRegistry: DocRegistry = coreDocRegistry as DocRegistry;

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
