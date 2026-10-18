import React from "react";
import { BeveledPanel } from "../typography/content-panels";
import { CarvedText } from "../typography/carved-text";

/**
 * DocumentFooter - Reusable footer for PDF documents
 *
 * @param logo - Optional logo element (e.g., a brand wordmark built on <Logo />)
 * @param title - Document title
 * @param copyright - Copyright / legal line shown under the title (omitted when not provided)
 * @param lastUpdated - Optional last updated date
 */
export function DocumentFooter({
  logo,
  title,
  copyright,
  lastUpdated,
}: {
  logo?: React.ReactNode;
  title: string;
  copyright?: string;
  lastUpdated?: string;
}): React.ReactNode {
  const updatedText = lastUpdated ? `Last updated: ${lastUpdated}` : "";
  const metaText = [copyright, updatedText].filter(Boolean).join(" • ");

  return (
    <BeveledPanel className="mt-auto !py-2">
      <div className="flex items-center justify-between">
        {logo && <div className="opacity-80">{logo}</div>}
        <div className={logo ? "text-right" : ""}>
          <CarvedText className="text-[11px]">{title}</CarvedText>
          {metaText && (
            <CarvedText className="text-[10px] opacity-70">{metaText}</CarvedText>
          )}
        </div>
      </div>
    </BeveledPanel>
  );
}
