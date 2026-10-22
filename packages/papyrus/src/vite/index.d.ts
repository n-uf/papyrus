import type { Plugin } from "vite";

export interface PapyrusPdfPluginOptions {
  /** URL folder that serves PDFs. Default "docs" (i.e. /docs/<id>.pdf). */
  routePrefix?: string;
  /** Print-route template. Default "/docs/{id}?print=true" */
  docUrl?: string;
  logPrefix?: string;
  /** papyrus.config.json (for fingerprints of committed PDFs); default the nearest one above the Vite root */
  config?: string;
}

export function papyrusPdfPlugin(options?: PapyrusPdfPluginOptions): Plugin;
export default papyrusPdfPlugin;
