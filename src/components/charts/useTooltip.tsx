import { useState, type MouseEvent } from "react";

/** Posisi tooltip relatif terhadap kontainer chart. */
export function useTooltip<T>() {
  const [tip, setTip] = useState<{ x: number; y: number; d: T } | null>(null);
  const show = (e: MouseEvent, d: T) => {
    const host = (e.currentTarget as Element).closest("[data-chart]") as HTMLElement | null;
    const b = host?.getBoundingClientRect();
    setTip({ x: e.clientX - (b?.left ?? 0), y: e.clientY - (b?.top ?? 0), d });
  };
  return { tip, show, hide: () => setTip(null) };
}
