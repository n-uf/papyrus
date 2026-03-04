import React from "react";

// =============================================================================
// TOC Color Utilities
// =============================================================================

/**
 * Color map for TOCLabel sections
 */
export type TOCLabelColor = "teal" | "pink" | "yellow" | "orange" | "slate" | "cyan" | "red";

const tocLabelColors: Record<TOCLabelColor, { bg: string; border: string; badge: string; text: string }> = {
  teal: { bg: "rgba(20, 184, 166, 0.08)", border: "rgba(20, 184, 166, 0.2)", badge: "rgba(20, 184, 166, 0.15)", text: "rgb(15, 118, 110)" },
  pink: { bg: "rgba(236, 72, 153, 0.08)", border: "rgba(236, 72, 153, 0.2)", badge: "rgba(236, 72, 153, 0.15)", text: "rgb(190, 24, 93)" },
  yellow: { bg: "rgba(234, 179, 8, 0.08)", border: "rgba(234, 179, 8, 0.2)", badge: "rgba(234, 179, 8, 0.15)", text: "rgb(161, 98, 7)" },
  orange: { bg: "rgba(249, 115, 22, 0.08)", border: "rgba(249, 115, 22, 0.2)", badge: "rgba(249, 115, 22, 0.15)", text: "rgb(194, 65, 12)" },
  slate: { bg: "rgba(71, 85, 105, 0.06)", border: "rgba(71, 85, 105, 0.15)", badge: "rgba(71, 85, 105, 0.12)", text: "rgb(71, 85, 105)" },
  cyan: { bg: "rgba(6, 182, 212, 0.08)", border: "rgba(6, 182, 212, 0.2)", badge: "rgba(6, 182, 212, 0.15)", text: "rgb(14, 116, 144)" },
  red: { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)", badge: "rgba(239, 68, 68, 0.15)", text: "rgb(185, 28, 28)" },
};

/**
 * Get section color based on section type
 * Matches the SectionBadge color scheme
 */
function getSectionColor(section?: string): string {
  if (!section) return "rgb(14, 116, 144)"; // Default cyan

  const normalized = section.toLowerCase();

  // Strategy (Market, Platform/Document OS): Cyan
  if (
    normalized === "market" ||
    normalized === "platform" ||
    normalized === "document os"
  ) {
    return "rgb(14, 116, 144)";
  }

  // GTM: Muted teal
  if (normalized === "gtm") {
    return "rgb(0, 130, 140)";
  }

  // UX: Muted purple
  if (normalized === "ux") {
    return "rgb(100, 55, 135)";
  }

  // Roadmap (Turns, Summary): Slate blue
  if (normalized.startsWith("turn") || normalized === "summary") {
    return "rgb(71, 85, 105)";
  }

  // Appendix: Light gray
  if (normalized === "appendix") {
    return "rgb(80, 90, 100)";
  }

  return "rgb(14, 116, 144)"; // Default cyan
}

// =============================================================================
// Grid-based TOC Components (used in user-manual style)
// =============================================================================

/**
 * TOCLabel - Section label for grid-based TOC (left column)
 * Use with CSS Grid: gridTemplateColumns: "80px 1fr"
 */
export function TOCLabel({
  label,
  color,
  rows,
}: {
  label: string;
  color: TOCLabelColor;
  rows: number;
}): React.ReactNode {
  const c = tocLabelColors[color];

  return (
    <div
      className="flex items-start justify-start"
      style={{
        gridRow: `span ${rows}`,
        padding: 4,
        borderRadius: 6,
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      <span
        className="text-[9px] font-bold uppercase tracking-wider"
        style={{
          padding: "2px 6px",
          borderRadius: 4,
          background: c.badge,
          color: c.text,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * TOCEntry - Individual TOC entry for grid-based TOC (right column)
 */
export function TOCEntry({
  number,
  title,
  page,
  indent,
  href,
}: {
  number: string;
  title: string;
  page: string;
  indent?: boolean;
  href?: string;
}): React.ReactNode {
  const content = (
    <div
      className="flex items-center justify-between py-0.5 pr-1"
      style={{ paddingLeft: indent ? "20px" : "0" }}
    >
      <div className="flex items-center gap-1">
        {number && (
          <span className="text-[11px] font-semibold" style={{ color: "rgb(55, 65, 81)", minWidth: "18px" }}>
            {number}.
          </span>
        )}
        <span
          className="text-[11px]"
          style={{ color: indent ? "rgba(55, 65, 81, 0.7)" : "rgb(55, 65, 81)", fontWeight: indent ? 400 : 500 }}
        >
          {title}
        </span>
      </div>
      <span className="text-[10px] font-mono" style={{ color: "rgba(100, 100, 110, 0.6)" }}>
        {page}
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block no-underline hover:bg-black/[0.03] rounded transition-colors -mx-1 px-1"
      >
        {content}
      </a>
    );
  }

  return content;
}

// =============================================================================
// Classic TOC Component (used in gtm-thesis style)
// =============================================================================

/**
 * TOCItem - Table of Contents entry (clickable)
 */
export function TOCItem({
  number,
  title,
  page,
  section,
  href,
}: {
  number: string;
  title: string;
  page: string;
  section?: string;
  href?: string;
}): React.ReactNode {
  const sectionColor = getSectionColor(section);

  const content = (
    <div className="flex items-baseline gap-2 text-[14px] py-1">
      <span style={{ color: "rgb(50, 55, 65)" }}>
        <span className="font-semibold" style={{ color: sectionColor }}>
          {number}.
        </span>{" "}
        {title}
      </span>
      <span
        className="flex-1 border-b border-dotted mx-2"
        style={{ borderColor: "rgba(0, 0, 0, 0.12)", marginBottom: "4px" }}
      />
      <span
        className="text-[14px] font-medium"
        style={{ color: "rgb(90, 95, 105)" }}
      >
        {page}
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block no-underline hover:bg-black/[0.02] rounded transition-colors -mx-1 px-1"
      >
        {content}
      </a>
    );
  }

  return content;
}
