"use client";

import React from "react";
import { cn } from "../utils/cn";
import {
  LEGACY_VARIANT_TEXT_LINES,
  legacyDefaultWordmark,
} from "../dossier/legacy";

// =============================================================================
// TYPES
// =============================================================================

export type LogoSize = "xs" | "sm" | "md" | "lg";
export type LogoLayout = "stacked" | "inline";

export interface LogoProps {
  className?: string;
  /** Tagline lines rendered above (stacked) or before (inline) the wordmark. */
  textLines?: string[];
  /**
   * Wordmark content. Rendered inside the `.logo-name` element. The host
   * application owns the brand: pass its wordmark (and style it via the
   * `logo-*` classes) from the document package. When omitted, a deprecated
   * fallback (the legacy wordmark, see dossier/legacy.ts) is rendered so
   * older document packages keep working.
   */
  name?: React.ReactNode;
  /**
   * Tagline lines per `variant`, used when `textLines` is not provided.
   * Hosts supply their own copy; defaults to the deprecated legacy set.
   */
  variantTextLines?: Record<string, string[]>;
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

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Logo — brand-agnostic logotype frame for document page headers and footers.
 *
 * Renders tagline lines plus a wordmark (`name`) using the `logo-*` CSS
 * classes provided by the host. The brand itself (wordmark and taglines)
 * is supplied by the document package.
 */
export function Logo({
  className,
  textLines: propTextLines,
  name: propName,
  variantTextLines = LEGACY_VARIANT_TEXT_LINES,
  href,
  variant = "home",
  onClick,
  as: Component,
  size = "md",
  fontSize,
  layout = "stacked",
  inlineSeparator = "·",
}: LogoProps): React.ReactNode {
  const textLines = propTextLines ?? variantTextLines[variant] ?? [];
  const name = propName ?? legacyDefaultWordmark();
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
            {name}
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
            {name}
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
