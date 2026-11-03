/**
 * Doc Registry Types
 *
 * The document model lives in `@n-uf/papyrus/core`; this layer pins what
 * renders a document to a React component.
 */

import type React from "react";
import type {
  DocFigures,
  DocRegistry as CoreDocRegistry,
  RegisteredDoc as CoreRegisteredDoc,
} from "../core/index.js";

export type { DocCategory, DocFigures, DocMeta, DocTocEntry } from "../core/index.js";

// =============================================================================
// DOC PAGE PROPS
// =============================================================================

/**
 * Props passed to document page components by the rendering host.
 */
export interface DocPageProps {
  /** Whether the PDF download action is available. Defaults to true on direct routes, false in embedded surfaces. */
  downloadable?: boolean;
  /** Host-injected figure components (see {@link DocFigures}). */
  figures?: DocFigures;
}

// =============================================================================
// REGISTRY TYPES
// =============================================================================

/**
 * Registered document definition: a React component renders it.
 */
export type RegisteredDoc = CoreRegisteredDoc<React.ComponentType<DocPageProps>>;

/**
 * Document registry for mapping IDs to components
 */
export type DocRegistry = CoreDocRegistry<React.ComponentType<DocPageProps>>;
