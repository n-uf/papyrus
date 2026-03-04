import React from "react";

/**
 * GlassPanel - Frosted glass card with soft shadows
 *
 * A container with glassmorphism effect, providing a subtle
 * frosted appearance with backdrop blur.
 */
export function GlassPanel({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  /** Optional id for anchor navigation */
  id?: string;
}): React.ReactNode {
  return (
    <div
      id={id}
      className={`rounded-lg p-4 glass-panel-print ${className}`}
      style={{
        background: "rgba(243, 244, 246, 0.75)",
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
        boxShadow:
          "0 1px 3px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
    >
      {children}
    </div>
  );
}
