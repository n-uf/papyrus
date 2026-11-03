import React from "react";

export interface IconBoxProps {
  children: React.ReactNode;
  /** Background color (default: rgba(0, 0, 0, 0.03)) */
  background?: string;
  /** Size in pixels (default: 40) */
  size?: number;
  /** Border radius in pixels (default: 8 for rounded-lg) */
  borderRadius?: number;
  /** Additional layout classes (e.g., flex-shrink-0, mt-2) */
  className?: string;
}

/**
 * IconBox - PDF-safe container for icons and LED indicators
 *
 * Consolidates background and borderRadius into inline styles
 * to prevent PDF rendering artifacts.
 */
export function IconBox({
  children,
  background = "rgba(0, 0, 0, 0.03)",
  size = 40,
  borderRadius = 8,
  className,
}: IconBoxProps): React.ReactNode {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        background,
        borderRadius,
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
