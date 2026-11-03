"use client";

import React from "react";
import { cn } from "../utils/cn";

// =============================================================================
// TYPES
// =============================================================================

export interface DocFileItem {
  id: string;
  name: string;
  extension?: string;
  size?: number;
  modifiedAt?: Date;
  isDirectory?: boolean;
}

export interface FileListIllustrationProps {
  files: DocFileItem[];
  /** IDs of files shown as open (cyan LED) */
  openedIds?: ReadonlySet<string>;
  /** IDs of files currently loading/opening (orange LED) */
  openingIds?: ReadonlySet<string>;
  /** IDs of files shown as selected (highlighted row) */
  selectedIds?: ReadonlySet<string>;
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(date?: Date): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

function getLedColor(
  id: string,
  openedIds: ReadonlySet<string>,
  openingIds: ReadonlySet<string>,
): string {
  if (openedIds.has(id)) return "#06b6d4"; // cyan — opened
  if (openingIds.has(id)) return "#f97316"; // orange — loading
  return "rgba(0,0,0,0.12)"; // inactive
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * FileListIllustration — Static file browser illustration for documentation.
 *
 * Renders a compact, read-only file list with LED status indicators.
 * Used in documentation pages to illustrate the Document Explorer UI.
 */
export function FileListIllustration({
  files,
  openedIds = new Set(),
  openingIds = new Set(),
  selectedIds = new Set(),
  className,
}: FileListIllustrationProps): React.ReactNode {
  return (
    <div
      className={cn("flex flex-col text-[11px]", className)}
      style={{
        background: "rgba(243, 244, 246, 0.85)",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          background: "rgba(230, 232, 236, 0.9)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ color: "rgba(0,0,0,0.4)", fontSize: 10 }}>
          Documents
        </span>
        <span
          style={{
            marginLeft: "auto",
            background: "rgba(0,0,0,0.06)",
            borderRadius: 3,
            padding: "1px 5px",
            fontSize: 9,
            color: "rgba(0,0,0,0.4)",
          }}
        >
          List
        </span>
      </div>

      {/* File rows */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {files.map((file) => {
          const isSelected = selectedIds.has(file.id);
          const ledColor = getLedColor(file.id, openedIds, openingIds);

          return (
            <div
              key={file.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 8px",
                background: isSelected
                  ? "rgba(6, 182, 212, 0.08)"
                  : "transparent",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              {/* LED indicator */}
              <span
                style={{
                  width: 6,
                  height: 4,
                  borderRadius: 2,
                  background: ledColor,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />

              {/* File name */}
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: isSelected
                    ? "rgb(6, 95, 120)"
                    : "rgba(30, 32, 38, 0.85)",
                  fontWeight: isSelected ? 500 : 400,
                }}
              >
                {file.name}
              </span>

              {/* Extension badge */}
              {file.extension && (
                <span
                  style={{
                    fontSize: 8,
                    padding: "1px 4px",
                    borderRadius: 2,
                    background: "rgba(0,0,0,0.06)",
                    color: "rgba(0,0,0,0.4)",
                    flexShrink: 0,
                    textTransform: "uppercase",
                  }}
                >
                  {file.extension}
                </span>
              )}

              {/* Date */}
              {file.modifiedAt && (
                <span
                  style={{
                    fontSize: 9,
                    color: "rgba(0,0,0,0.3)",
                    flexShrink: 0,
                  }}
                >
                  {formatDate(file.modifiedAt)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          background: "rgba(230, 232, 236, 0.9)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          padding: "3px 8px",
          display: "flex",
          alignItems: "center",
          color: "rgba(0,0,0,0.35)",
          fontSize: 9,
        }}
      >
        <span>{files.length} documents</span>
      </div>
    </div>
  );
}

// =============================================================================
// MOCK DATA HELPER
// =============================================================================

/** Default mock files used in the User Manual Document Explorer illustration */
export const DEFAULT_EXPLORER_FILES: DocFileItem[] = [
  {
    id: "doc-1",
    name: "api-client-integration",
    isDirectory: false,
    size: 1548576,
    modifiedAt: new Date("2024-12-07"),
    extension: "pdf",
  },
  {
    id: "doc-2",
    name: "Board Meeting Minutes - January 2025",
    isDirectory: false,
    size: 892416,
    modifiedAt: new Date("2025-01-10"),
    extension: "pdf",
  },
  {
    id: "doc-3",
    name: "Brand Guidelines - Master Template",
    isDirectory: false,
    size: 756000,
    modifiedAt: new Date("2024-11-17"),
    extension: "pdf",
  },
  {
    id: "doc-4",
    name: "Client Call Recording - Project Kickoff",
    isDirectory: false,
    size: 180000,
    modifiedAt: new Date("2024-12-17"),
    extension: "pdf",
  },
  {
    id: "doc-5",
    name: "Company Logo - Full Color RGB",
    isDirectory: false,
    size: 425000,
    modifiedAt: new Date("2024-12-19"),
    extension: "pdf",
  },
  {
    id: "doc-6",
    name: "data-transformation-pipeline",
    isDirectory: false,
    size: 312000,
    modifiedAt: new Date("2024-12-04"),
    extension: "pdf",
  },
];
