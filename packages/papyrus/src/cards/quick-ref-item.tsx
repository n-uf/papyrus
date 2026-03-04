import React from "react";

/**
 * QuickRefItem - Quick reference shortcut/action pair
 */
export function QuickRefItem({
  shortcut,
  action,
}: {
  shortcut: string;
  action: string;
}): React.ReactNode {
  return (
    <div
      className="flex items-center justify-between py-1.5 border-b"
      style={{ borderColor: "rgba(0, 0, 0, 0.03)" }}
    >
      <span
        className="text-sm font-mono"
        style={{ color: "rgb(99, 102, 241)" }}
      >
        {shortcut}
      </span>
      <span className="text-sm" style={{ color: "rgba(80, 80, 90, 0.7)" }}>
        {action}
      </span>
    </div>
  );
}
