import { useMemo } from "react";
import * as d3 from "d3";
import { useData } from "@/lib/data";

/** Siluet geografis Jawa Timur yang digambar dari GeoJSON (tanpa file gambar tambahan). */
export function JatimSilhouette({ className, color = "#b5828c", opacity = 0.12 }: { className?: string; color?: string; opacity?: number }) {
  const { geo } = useData();
  const d = useMemo(() => {
    const proj = d3.geoMercator().fitSize([1000, 560], geo);
    const p = d3.geoPath(proj);
    return geo.features.map((f) => p(f) ?? "").join(" ");
  }, [geo]);
  return (
    <svg viewBox="0 0 1000 560" className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      <path d={d} fill={color} fillOpacity={opacity} stroke={color} strokeOpacity={opacity * 1.6} strokeWidth={0.6} />
    </svg>
  );
}
