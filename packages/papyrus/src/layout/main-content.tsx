import React from "react";

/**
 * MainContent - Primary content area with left padding for sidebar
 *
 * Provides consistent spacing for the main document content,
 * leaving room for the side branding column.
 */
export function MainContent({
  children,
  sidebarWidth = 210,
}: {
  children: React.ReactNode;
  /** Width of the sidebar in pixels (default: 210) */
  sidebarWidth?: number;
}): React.ReactNode {
  return (
    <div
      className="pdf-main-content pt-6 pr-6 pb-6 flex-1 flex flex-col"
      style={{ paddingLeft: `${sidebarWidth}px` }}
    >
      {children}
    </div>
  );
}
