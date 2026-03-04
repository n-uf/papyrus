import React from "react";

/**
 * KeyBadge - Keyboard key indicator badge
 *
 * Displays keyboard shortcuts in a styled badge.
 */
export function KeyBadge({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <kbd
      className="inline-block text-xs font-medium"
      style={{
        padding: "2px 8px",
        borderRadius: 4,
        background: "rgba(0, 0, 0, 0.04)",
        color: "rgb(55, 60, 70)",
        fontFamily: "ui-monospace, monospace",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        margin: "0 2px",
      }}
    >
      {children}
    </kbd>
  );
}
