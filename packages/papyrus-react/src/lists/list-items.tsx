import React from "react";

/**
 * SmallListItem - Compact list item with bullet point
 */
export function SmallListItem({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: "rgb(100, 110, 125)" }}
      />
      <span
        className="text-[14px] leading-relaxed"
        style={{ color: "rgb(55, 60, 70)" }}
      >
        {children}
      </span>
    </li>
  );
}

/**
 * NumberedItem - List item with circled number
 */
export function NumberedItem({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <li className="flex items-start gap-3">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
        style={{
          background: "rgba(80, 90, 105, 0.1)",
          color: "rgb(70, 80, 95)",
        }}
      >
        {number}
      </span>
      <span
        className="text-[15px] pt-0.5 leading-relaxed"
        style={{ color: "rgb(55, 60, 70)" }}
      >
        {children}
      </span>
    </li>
  );
}
