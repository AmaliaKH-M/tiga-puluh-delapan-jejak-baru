import type { ReactNode } from "react";

/** Tooltip mengambang yang mengikuti kursor di dalam kontainer peta/chart. */
export function MapTooltip({ x, y, children, containerWidth }: { x: number; y: number; children: ReactNode; containerWidth: number }) {
  const left = x > containerWidth - 230 ? x - 220 : x + 14;
  return (
    <div
      className="pointer-events-none absolute z-20 w-[210px] rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
      style={{ left, top: Math.max(4, y - 10) }}
      role="tooltip"
    >
      {children}
    </div>
  );
}
