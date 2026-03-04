import React from "react";

/**
 * SourceCard - Document source description card
 */
export function SourceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}): React.ReactNode {
  return (
    <div
      className="p-4 rounded"
      style={{
        background: "rgba(50, 60, 80, 0.04)",
        border: "1px solid rgba(50, 60, 80, 0.10)",
      }}
    >
      <div
        className="text-lg font-semibold"
        style={{ color: "rgb(45, 55, 70)" }}
      >
        {title}
      </div>
      <div
        className="text-[14px] mt-1.5 leading-relaxed"
        style={{ color: "rgb(60, 65, 75)" }}
      >
        {description}
      </div>
    </div>
  );
}
