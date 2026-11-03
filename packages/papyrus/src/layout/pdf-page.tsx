import React from "react";
import { PAGE_CLASS } from "../core/index.js";

/**
 * PDFPage - A4-sized page container for printable documents
 *
 * Provides the base layout for PDF-ready pages with proper
 * print styling and page break handling.
 */
export function PDFPage({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}): React.ReactNode {
  return (
    <div
      id={id}
      className={`${PAGE_CLASS} relative flex flex-col`}
      style={{ background: "#f3f4f6" }}
    >
      {children}
    </div>
  );
}
