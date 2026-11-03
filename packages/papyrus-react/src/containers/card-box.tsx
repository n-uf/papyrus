import React from "react";

export interface CardBoxProps {
  children: React.ReactNode;
  /** Background color */
  background: string;
  /** Border (e.g., "1px solid rgba(0,0,0,0.1)") */
  border?: string;
  /** Border radius in pixels (default: 6) */
  borderRadius?: number;
  /** Padding in pixels (default: 12) */
  padding?: number;
  /** Additional layout classes */
  className?: string;
}

/**
 * CardBox - PDF-safe container for cards and panels
 *
 * Consolidates all visual styles into inline styles
 * to prevent PDF rendering artifacts.
 */
export function CardBox({
  children,
  background,
  border,
  borderRadius = 6,
  padding = 12,
  className,
}: CardBoxProps): React.ReactNode {
  return (
    <div
      className={className}
      style={{
        background,
        border,
        borderRadius,
        padding,
      }}
    >
      {children}
    </div>
  );
}
