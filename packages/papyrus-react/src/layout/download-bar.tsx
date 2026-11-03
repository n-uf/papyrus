import React from "react";

interface DownloadBarProps {
  /** URL or path to the downloadable PDF */
  href: string;
  /** Filename suggested to the browser on download */
  filename: string;
}

/**
 * DownloadBar — teal button anchored to the right above the pdf-container.
 * Hidden in print via the `no-print` class from printStyles.
 */
export function DownloadBar({ href, filename }: DownloadBarProps): React.ReactNode {
  return (
    <div
      className="no-print"
      style={{
        maxWidth: "210mm",
        margin: "0 auto 16px auto",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <a
        href={href}
        download={filename}
        className="inline-flex items-center gap-2 text-[14px] font-medium"
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          background: "rgb(0, 115, 135)",
          color: "#fff",
          textDecoration: "none",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download PDF
      </a>
    </div>
  );
}
