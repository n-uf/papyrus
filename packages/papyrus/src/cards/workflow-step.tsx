import React from "react";
import { GlassPanel } from "../typography/glass-panel";

/**
 * WorkflowStep - Numbered workflow step card
 */
export function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}): React.ReactNode {
  return (
    <GlassPanel className="avoid-break !p-4">
      <div className="flex items-start gap-4">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ background: "rgb(99, 102, 241)", color: "white" }}
        >
          {number}
        </span>
        <div>
          <div
            className="text-base font-medium"
            style={{ color: "rgb(55, 60, 70)" }}
          >
            {title}
          </div>
          <div
            className="text-sm mt-1"
            style={{ color: "rgba(80, 80, 90, 0.7)" }}
          >
            {description}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
