import React from "react";

const PROCESS_COLORS: Record<string, string> = {
  cyan: "rgb(0, 185, 220)",
  yellow: "rgb(234, 179, 8)",
  orange: "rgb(249, 115, 22)",
  pink: "rgb(255, 90, 160)",
};

/**
 * ProcessBadge - Process state indicator with description
 */
export function ProcessBadge({
  color,
  label,
  description,
}: {
  color: string;
  label: string;
  description: string;
}): React.ReactNode {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: 12,
        borderRadius: 4,
        background: "rgba(0, 0, 0, 0.02)",
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          background: PROCESS_COLORS[color],
          flexShrink: 0,
        }}
      />
      <div>
        <div
          className="text-[15px] font-semibold"
          style={{ color: "rgb(50, 55, 65)" }}
        >
          {label}
        </div>
        <div
          className="text-[13px] leading-snug"
          style={{ color: "rgb(80, 85, 95)" }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
