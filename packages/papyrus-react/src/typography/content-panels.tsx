import React from "react";

/**
 * FloatingPanel - Prominent floating paper panel with layered perspective shadows
 *
 * Use for primary content sections that need emphasis:
 * - Executive summaries
 * - Key highlights
 * - Important callouts
 *
 * Note: Shadow effects are flattened in print mode for accurate PDF rendering.
 * Uses inline styles for visual properties to ensure PDF rendering consistency.
 */
export function FloatingPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactNode {
  return (
    <div
      className={`floating-panel ${className}`}
      style={{
        padding: 20,
        borderRadius: 8,
        background: "#ffffff",
        boxShadow:
          "0 1px 1px rgba(0,0,0,0.03), 0 2px 2px rgba(0,0,0,0.03), 0 4px 4px rgba(0,0,0,0.03), 0 8px 8px rgba(0,0,0,0.03), 0 16px 16px rgba(0,0,0,0.03), 0 32px 32px rgba(0,0,0,0.04)",
        transform: "translateY(-2px)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * BeveledPanel - Subtle beveled edge panel with classic cut styling
 *
 * Use for secondary content sections:
 * - Table of contents
 * - Reference sections
 * - Supporting information
 *
 * Uses inline styles for visual properties to ensure PDF rendering consistency.
 */
export function BeveledPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactNode {
  return (
    <div
      className={`beveled-panel ${className}`}
      style={{
        padding: 20,
        borderRadius: 8,
        background: "#f8f9fb",
        borderTop: "2px solid rgba(255, 255, 255, 0.95)",
        borderLeft: "2px solid rgba(255, 255, 255, 0.8)",
        borderRight: "2px solid rgba(0, 0, 0, 0.05)",
        borderBottom: "2px solid rgba(0, 0, 0, 0.07)",
        boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.06)",
      }}
    >
      {children}
    </div>
  );
}
