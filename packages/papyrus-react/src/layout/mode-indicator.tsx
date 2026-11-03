import React from "react";

/**
 * ModeIndicator - Floating badge showing current page mode/section
 *
 * Displays at the bottom center of the page to indicate
 * the current section or mode (e.g., "Cover", "Toolbar", "Shortcuts").
 *
 * Uses inline styles for visual properties to ensure PDF rendering consistency.
 */
export function ModeIndicator({
  text,
  color = "rgb(0, 185, 220)",
}: {
  text: string;
  /** Background color (default: cyan) */
  color?: string;
}): React.ReactNode {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
      <div
        className="text-sm font-semibold uppercase tracking-wider"
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          background: color,
          color: "rgba(255, 255, 255, 0.95)",
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          letterSpacing: "0.05em",
        }}
      >
        {text}
      </div>
    </div>
  );
}
