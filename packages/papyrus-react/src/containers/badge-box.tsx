import React from "react";

export interface BadgeBoxProps {
  children: React.ReactNode;
  /** Background color */
  background: string;
  /** Text color */
  color: string;
  /** Size in pixels (default: 20) */
  size?: number;
  /** Border radius in pixels (default: 4 for rounded, use size/2 for circular) */
  borderRadius?: number;
  /** Font size in pixels (default: 11) */
  fontSize?: number;
  /** Font weight (default: 700) */
  fontWeight?: number;
  /** Additional layout classes */
  className?: string;
}

/**
 * BadgeBox - PDF-safe container for numbered badges and step indicators
 *
 * Consolidates all visual styles into inline styles
 * to prevent PDF rendering artifacts.
 */
export function BadgeBox({
  children,
  background,
  color,
  size = 20,
  borderRadius = 4,
  fontSize = 11,
  fontWeight = 700,
  className,
}: BadgeBoxProps): React.ReactNode {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        background,
        color,
        borderRadius,
        fontSize,
        fontWeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
