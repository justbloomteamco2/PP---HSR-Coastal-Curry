import type { ReactNode } from "react";

type BentoGridProps = { children: ReactNode; className?: string };
type BentoCardProps = { children: ReactNode; className?: string };

/** Adapted from the installed 21st.dev Bento Grid for vanilla CSS projects. */
export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return <div className={`bento-grid ${className}`.trim()}>{children}</div>;
}

export function BentoCard({ children, className = "" }: BentoCardProps) {
  return <article className={`bento-card ${className}`.trim()}>{children}</article>;
}
