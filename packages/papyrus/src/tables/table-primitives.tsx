import React from "react";

/**
 * TableWrapper - Container for documentation tables
 */
export function TableWrapper({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <table
      className="w-full text-base mt-3"
      style={{ borderCollapse: "collapse" }}
    >
      {children}
    </table>
  );
}

/**
 * TableHeaderRow - Header row wrapper
 */
export function TableHeaderRow({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return <tr>{children}</tr>;
}

/**
 * TableHeader - Table header cell (th)
 */
export function TableHeader({
  children,
  width,
}: {
  children: React.ReactNode;
  width?: string;
}): React.ReactNode {
  return (
    <th
      className="text-left py-2.5 px-3 text-[13px] font-semibold uppercase"
      style={{
        color: "rgb(80, 85, 95)",
        letterSpacing: "0.04em",
        borderBottom: "2px solid rgba(0, 0, 0, 0.08)",
        width,
      }}
    >
      {children}
    </th>
  );
}

/**
 * TableRow - Table body row wrapper
 */
export function TableRow({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return <tr>{children}</tr>;
}

/**
 * TableCell - Table body cell (td)
 */
export function TableCell({
  children,
  bold,
  mono,
  width,
}: {
  children: React.ReactNode;
  /** Apply bold font weight */
  bold?: boolean;
  /** Use monospace font */
  mono?: boolean;
  /** Cell width (e.g., "40%") */
  width?: string;
}): React.ReactNode {
  return (
    <td
      className={`py-2.5 px-3 text-[15px] ${bold ? "font-medium" : ""}`}
      style={{
        color: "rgb(50, 55, 65)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
        fontFamily: mono ? "ui-monospace, monospace" : undefined,
        lineHeight: 1.5,
        width,
      }}
    >
      {children}
    </td>
  );
}
