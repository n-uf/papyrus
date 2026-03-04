import React from "react";
import { GlassPanel } from "./glass-panel";

/**
 * SectionTitle - Primary section heading (h2)
 */
export function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <h2 className="text-xl font-semibold" style={{ color: "rgb(40, 45, 55)" }}>
      {children}
    </h2>
  );
}

/**
 * SubsectionTitle - Secondary section heading (h3)
 */
export function SubsectionTitle({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <h3 className="text-lg font-semibold" style={{ color: "rgb(50, 55, 65)" }}>
      {children}
    </h3>
  );
}

/**
 * PageHeader - Page section header with glass panel wrapper
 */
export function PageHeader({
  title,
  className = "",
  id,
}: {
  title: string;
  className?: string;
  /** Optional anchor id for navigation */
  id?: string;
}): React.ReactNode {
  return (
    <GlassPanel className={`mb-4 !py-3 ${className}`} id={id}>
      <h2
        className="text-2xl font-semibold"
        style={{ color: "rgb(40, 45, 55)" }}
      >
        {title}
      </h2>
    </GlassPanel>
  );
}
