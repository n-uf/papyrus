/**
 * Doc Registry Types
 *
 * Type definitions for document registration and lookup.
 */

import type React from "react";

// =============================================================================
// DOCUMENT METADATA
// =============================================================================

/**
 * Table of Contents entry for document navigation
 */
export interface DocTocEntry {
  /** Unique identifier for the entry */
  id: string;
  /** Display title (without numbering - numbering is auto-generated) */
  title: string;
  /** Page number (1-based) */
  page: number;
  /** Nesting level (0 = top level) */
  level: number;
  /** Anchor ID for scrolling (optional) */
  anchor?: string;
  /** Mark as appendix entry - uses letter numbering (A, B, C) instead of numbers */
  isAppendix?: boolean;
  /** Skip auto-numbering for this entry (e.g., Cover page) */
  skipNumbering?: boolean;
}

/**
 * Document category for sidebar grouping.
 *
 * Free-form: the documents package decides which categories exist and how
 * they are labelled and ordered.
 */
export type DocCategory = string;

/**
 * Document metadata for dossier display
 */
export interface DocMeta {
  /** Document title */
  title: string;
  /** Total page count */
  pageCount: number;
  /** Table of contents entries */
  toc: DocTocEntry[];
  /** Sidebar category grouping */
  category?: DocCategory;
  /** Document description (optional) */
  description?: string;
  /** Last updated date (optional) */
  lastUpdated?: string;
  /** Document version (optional) */
  version?: string;
}

// =============================================================================
// DOC PAGE PROPS
// =============================================================================

/**
 * Host-injected figure components, keyed by name.
 *
 * Documents that embed live illustrations (rather than static placeholders)
 * declare which keys they read; the rendering host supplies them through
 * `registerDoc({ figures })`. The shape is deliberately open so this engine
 * knows nothing about any particular document's figures.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocFigures = Record<string, any>;

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
 * Registered document definition
 */
export interface RegisteredDoc {
  /** Unique document identifier */
  id: string;
  /** Document metadata */
  meta: DocMeta;
  /** React component that renders the document */
  component: React.ComponentType<DocPageProps>;
  /** Injected figure components for pages that read them */
  figures?: DocFigures;
}

/**
 * Document registry for mapping IDs to components
 */
export interface DocRegistry {
  /** Get document by ID */
  get: (docId: string) => RegisteredDoc | undefined;
  /** Get all registered document IDs */
  getIds: () => string[];
  /** Check if document exists */
  has: (docId: string) => boolean;
  /** Register a new document */
  register: (doc: RegisteredDoc) => void;
}
