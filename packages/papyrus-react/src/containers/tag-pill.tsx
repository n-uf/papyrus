import React from "react";

export interface TagPillProps {
  children: React.ReactNode;
  /** Background color */
  background: string;
  /** Text color */
  color: string;
  /** Border radius in pixels (default: 4) */
  borderRadius?: number;
  /** Font size in pixels (default: 10) */
  fontSize?: number;
  /** Horizontal padding in pixels (default: 8) */
  paddingX?: number;
  /** Vertical padding in pixels (default: 2) */
  paddingY?: number;
  /** Additional layout classes */
  className?: string;
}

/**
 * TagPill - PDF-safe inline tag/pill badge
 *
 * Consolidates all visual styles into inline styles
 * to prevent PDF rendering artifacts.
 */
export function TagPill({
  children,
  background,
  color,
  borderRadius = 4,
  fontSize = 10,
  paddingX = 8,
  paddingY = 2,
  className,
}: TagPillProps): React.ReactNode {
  return (
    <span
      className={className}
      style={{
        background,
        color,
        borderRadius,
        fontSize,
        padding: `${paddingY}px ${paddingX}px`,
        display: "inline-block",
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}
