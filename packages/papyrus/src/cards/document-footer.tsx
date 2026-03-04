import React from "react";
import { BeveledPanel } from "../typography/content-panels";
import { CarvedText } from "../typography/carved-text";

/**
 * DocumentFooter - Reusable footer for PDF documents
 *
 * @param logo - Optional logo element (e.g., <Logo variant="surface" size="xs" />)
 * @param title - Document title
 * @param copyright - Copyright text (defaults to "© 2026 PDFized")
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
  const copyrightText = copyright ?? "© 2026 PDFized";
  const updatedText = lastUpdated ? ` • Last updated: ${lastUpdated}` : "";

  return (
    <BeveledPanel className="mt-auto !py-2">
      <div className="flex items-center justify-between">
        {logo && <div className="opacity-80">{logo}</div>}
        <div className={logo ? "text-right" : ""}>
          <CarvedText className="text-[11px]">{title}</CarvedText>
          <CarvedText className="text-[10px] opacity-70">
            {copyrightText}{updatedText}
          </CarvedText>
        </div>
      </div>
    </BeveledPanel>
  );
}
