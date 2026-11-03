"use client";

import React from "react";
import { cn } from "../utils/cn";

// =============================================================================
// VARIANT MAPS
// =============================================================================

const VARIANT_CLASSES: Record<string, string> = {
  success: "bg-green-500",
  error: "bg-[#e91e8c]",
  warning: "bg-yellow-400",
  info: "bg-cyan-400",
  primary: "bg-cyan-400",
  neutral: "bg-slate-400",
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "w-1.5 h-1",
  md: "w-2 h-1",
  lg: "w-3 h-1.5",
};

const SHAPE_CLASSES: Record<string, string> = {
  slit: "",
  "vertical-slit": "!w-1 !h-2",
  dot: "rounded-full aspect-square",
  square: "aspect-square",
};

// =============================================================================
// TYPES
// =============================================================================

export type IndicatorVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "primary"
  | "neutral";

export type IndicatorSize = "sm" | "md" | "lg";

export type IndicatorShape = "slit" | "vertical-slit" | "dot" | "square";

export interface IndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: IndicatorVariant;
  size?: IndicatorSize;
  shape?: IndicatorShape;
  /** Whether the indicator is active. When false, renders with inactiveVariant. */
  active?: boolean;
  /** Variant used when active=false */
  inactiveVariant?: "error" | "neutral" | "primary";
  /** Whether the indicator should pulse */
  pulsing?: boolean;
  /** Special animation type */
  animation?: "processing";
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Indicator — LED-style status pip for documentation pages.
 *
 * Used as a decorative section marker conveying semantic color (info/warning/error).
 */
export const Indicator = React.forwardRef<HTMLSpanElement, IndicatorProps>(
  (
    {
      className,
      variant = "neutral",
      size = "md",
      shape = "slit",
      active = true,
      inactiveVariant = "error",
      pulsing = false,
      animation,
      ...props
    },
    ref,
  ) => {
    const effectiveVariant = active ? variant : inactiveVariant;
    const animClass =
      animation === "processing"
        ? "animate-pulse"
        : pulsing
          ? "animate-pulse"
          : "";

    return (
      <span
        ref={ref}
        className={cn(
          "inline-block rounded-sm transition-colors duration-150",
          VARIANT_CLASSES[effectiveVariant] ?? VARIANT_CLASSES.neutral,
          SIZE_CLASSES[size],
          SHAPE_CLASSES[shape],
          animClass,
          className,
        )}
        role="status"
        aria-label={active ? "Active" : "Inactive"}
        {...props}
      />
    );
  },
);

Indicator.displayName = "Indicator";
