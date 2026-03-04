import React from "react";

const FOOTER_ACTION_STYLES = {
  pink: {
    color: "rgb(255, 80, 170)",
    shadow: "0 1px 0 rgba(255, 255, 255, 0.6)",
  },
  cyan: {
    color: "rgb(0, 175, 215)",
    shadow: "0 1px 0 rgba(255, 255, 255, 0.5)",
  },
} as const;

export type FooterActionColor = keyof typeof FOOTER_ACTION_STYLES;

/**
 * FooterActionBadge - Footer action indicator with description
 */
export function FooterActionBadge({
  label,
  color,
  description,
}: {
  label: string;
  color: FooterActionColor;
  description: string;
}): React.ReactNode {
  const style = FOOTER_ACTION_STYLES[color];

  return (
    <div className="flex flex-col gap-1">
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: style.color,
          textShadow: style.shadow,
        }}
      >
        {label}
      </span>
      <span
        className="text-[10px] leading-relaxed"
        style={{ color: "rgba(60, 65, 75, 0.85)" }}
      >
        {description}
      </span>
    </div>
  );
}
