import React from "react";

/**
 * CarvedText - Paragraph text with carved/embossed appearance
 *
 * Provides subtle text shadow for a carved-into-surface effect,
 * commonly used for body text in documentation.
 */
export function CarvedText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactNode {
  return (
    <p
      className={`text-[15px] leading-[1.7] ${className}`}
      style={{
        color: "rgb(65, 70, 80)",
        textShadow: "0 1px 0 rgba(255, 255, 255, 0.5)",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </p>
  );
}
