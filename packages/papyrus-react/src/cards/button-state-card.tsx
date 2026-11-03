import React from "react";

const BUTTON_COLORS: Record<string, { bg: string; text: string }> = {
  pink: { bg: "rgb(233, 30, 140)", text: "#ffffff" },
  gray: { bg: "rgb(55, 65, 81)", text: "rgb(156, 163, 175)" },
  green: { bg: "rgb(34, 197, 94)", text: "#000000" },
  yellow: { bg: "rgb(234, 179, 8)", text: "#000000" },
  cyan: { bg: "rgb(0, 212, 170)", text: "#000000" },
  orange: { bg: "rgb(249, 115, 22)", text: "#000000" },
};

export type ButtonStateColor = keyof typeof BUTTON_COLORS;

/**
 * ButtonStateCard - Shows button state as realistic terminal button
 */
export function ButtonStateCard({
  color,
  label,
  description,
}: {
  color: ButtonStateColor;
  label: string;
  description: string;
}): React.ReactNode {
  const defaultConfig = { bg: "rgb(0, 212, 170)", text: "#000000" };
  const colorConfig = BUTTON_COLORS[color] ?? defaultConfig;
  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Realistic button */}
      <div
        className="px-3 py-1.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wide text-center min-w-[100px]"
        style={{
          backgroundColor: colorConfig.bg,
          color: colorConfig.text,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {label}
      </div>
      {/* Description */}
      <div
        className="text-[10px] text-center"
        style={{ color: "rgba(80, 80, 90, 0.7)" }}
      >
        {description}
      </div>
    </div>
  );
}
