"use client";

import React from "react";
import { cn } from "../utils/cn";

// =============================================================================
// TYPES
// =============================================================================

export type LogoSize = "xs" | "sm" | "md" | "lg";
export type LogoLayout = "stacked" | "inline";

export interface LogoProps {
  className?: string;
  textLines?: string[];
  href?: string;
  variant?: "home" | "blog" | "surface";
  onClick?: () => void;
  /** Custom wrapper component (e.g. Next.js Link) */
  as?: React.ElementType;
  size?: LogoSize;
  /** Custom font size override (e.g. "14px") */
  fontSize?: string;
  layout?: LogoLayout;
  inlineSeparator?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SIZE_SCALES: Record<LogoSize, { tagline: string; name: string }> = {
  xs: { tagline: "0.65rem", name: "0.85rem" },
  sm: { tagline: "0.75rem", name: "1.0rem" },
  md: { tagline: "0.9rem", name: "1.2rem" },
  lg: { tagline: "1.1rem", name: "1.4rem" },
};

const VARIANT_TEXT_LINES: Record<string, string[]> = {
  home: ["AUTOMATICALLY", "WITH"],
  blog: ["BLOG:", "TIPS 'n TRICKS BY"],
  surface: ["REDACT WITH"],
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Logo — PDFIZED.COM logotype for documentation page headers and footers.
 */
export function Logo({
  className,
  textLines: propTextLines,
  href,
  variant = "home",
  onClick,
  as: Component,
  size = "md",
  fontSize,
  layout = "stacked",
  inlineSeparator = "·",
}: LogoProps): React.ReactNode {
  const textLines = propTextLines ?? VARIANT_TEXT_LINES[variant] ?? [];
  const sizeScale = SIZE_SCALES[size];
  const taglineFontSize = fontSize ?? sizeScale.tagline;
  const nameFontSize = fontSize ? `calc(${fontSize} * 1.33)` : sizeScale.name;

  const LogoContent =
    layout === "inline" ? (
      <div
        className={cn("logo-container logo-inline", className)}
        style={{ display: "flex", alignItems: "center", gap: "0.4em" }}
      >
        <div
          className="logo-text"
          style={{ display: "flex", alignItems: "center", gap: "0.4em" }}
        >
          {textLines.length > 0 && (
            <>
              <span
                className="logo-with"
                style={{ fontSize: taglineFontSize, marginBottom: 0 }}
              >
                {textLines.join(" ")}
              </span>
              <span
                className="logo-separator"
                style={{
                  fontSize: taglineFontSize,
                  color: "var(--logo-gray, #858585)",
                  opacity: 0.6,
                }}
              >
                {inlineSeparator}
              </span>
            </>
          )}
          <span
            className="logo-name"
            style={{
              fontSize: nameFontSize,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span className="pdf-text-p">P</span>
            <span className="pdf-text-d">D</span>
            <span className="pdf-text-f">F</span>
            <span className="logo-ized">IZED.COM</span>
          </span>
        </div>
      </div>
    ) : (
      <div className={cn("logo-container", className)}>
        <div className="logo-text">
          {textLines.map((line, index) => (
            <div
              key={index}
              className="logo-with"
              style={{ fontSize: taglineFontSize }}
            >
              {line}
            </div>
          ))}
          <div className="logo-name" style={{ fontSize: nameFontSize }}>
            <span className="pdf-text-p">P</span>
            <span className="pdf-text-d">D</span>
            <span className="pdf-text-f">F</span>
            <span className="logo-ized">IZED.COM</span>
          </div>
        </div>
      </div>
    );

  if (Component) {
    return (
      <Component href={href} className="inline-block" onClick={onClick}>
        {LogoContent}
      </Component>
    );
  }

  if (href) {
    return (
      <a href={href} className="inline-block" onClick={onClick}>
        {LogoContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" className="inline-block" onClick={onClick}>
        {LogoContent}
      </button>
    );
  }

  return LogoContent;
}

export const LogoVariants = {
  Home: (props: Omit<LogoProps, "variant">) => (
    <Logo {...props} variant="home" />
  ),
  Blog: (props: Omit<LogoProps, "variant">) => (
    <Logo {...props} variant="blog" />
  ),
  Surface: (props: Omit<LogoProps, "variant">) => (
    <Logo {...props} variant="surface" />
  ),
} as const;

export default Logo;
