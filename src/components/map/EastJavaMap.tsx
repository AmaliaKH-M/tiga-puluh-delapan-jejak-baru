import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as d3 from "d3";
import { gsap } from "gsap";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useData } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT } from "@/data/dataConfig";
import { makeProjection, mainCentroid, FRAME_NOTE } from "./geo";
import { MapTooltip } from "./MapTooltip";

export type EastJavaMapProps = {
  /** warna isi per kode (choropleth); undefined = netral */
  fill?: (kode: string) => string | undefined;
  /** simbol proporsional: radius per kode (px pada zoom 1) */
  symbol?: (kode: string) => number | undefined;
  symbolColor?: string;
  showChoropleth?: boolean;
  showSymbols?: boolean;
  showLabels?: boolean;
  zoomable?: boolean;
  /** animasi kemunculan wilayah satu per satu saat terlihat */
  reveal?: boolean;
  tooltip?: (kode: string) => ReactNode;
  aspect?: number;
  className?: string;
};

/**
 * Peta 38 kab/kota Jawa Timur.
 * Terhubung ke store seleksi: klik = pilih (sorot di semua visual), hover = tooltip + kartu ringkas.
 */
export function EastJavaMap({
  fill, symbol, symbolColor = "#87506a", showChoropleth = true, showSymbols = true, showLabels = false,
  zoomable = true, reveal = false, tooltip, aspect = 0.56, className,
}: EastJavaMapProps) {
  const { geo, regions } = useData();
  const [wrapRef, { width }] = useSize<HTMLDivElement>();
  const height = Math.max(240, width * aspect);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [k, setK] = useState(1);
  const [tip, setTip] = useState<{ kode: string; x: number; y: number } | null>(null);
  const { selected, hovered, brushed, toggleSelected, setHovered } = useSelection();

  const { path, centroids } = useMemo(() => {
    const proj = makeProjection(geo, width, height);
    const path = d3.geoPath(proj);
    const centroids = new Map(geo.features.map((f) => [f.properties.kode_wilayah, mainCentroid(f, path)]));
    return { path, centroids };
  }, [geo, width, height]);

  // zoom & pan
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  useEffect(() => {
    if (!svgRef.current || !gRef.current || !zoomable) return;
    const svg = d3.select(svgRef.current);
    const z = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[-width * 0.3, -height * 0.7], [width * 1.3, height * 1.1]]) // boleh geser ke pulau di luar bingkai
      .filter((e) => (e.type === "wheel" ? e.ctrlKey || e.metaKey : !e.button)) // scroll halaman tetap normal
      .on("zoom", (e) => {
        d3.select(gRef.current).attr("transform", e.transform.toString());
        setK(e.transform.k);
      });
    svg.call(z);
    zoomRef.current = z;
    return () => { svg.on(".zoom", null); };
  }, [zoomable, width, height]);
  const zoomBy = (f: number) => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(350).call(zoomRef.current.scaleBy, f);
  const zoomReset = () => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.transform, d3.zoomIdentity);

  // animasi kemunculan wilayah satu per satu (IntersectionObserver: tahan terhadap pergeseran layout)
  useEffect(() => {
    const g = gRef.current;
    if (!reveal || !g || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const paths = g.querySelectorAll("path.region");
    gsap.set(paths, { opacity: 0 });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      gsap.to(paths, { opacity: 1, duration: 0.5, stagger: 0.045, ease: "power2.out", clearProps: "opacity" });
      io.disconnect();
    }, { threshold: 0.25 });
    io.observe(g);
    return () => { io.disconnect(); gsap.set(paths, { clearProps: "opacity" }); };
  }, [reveal]);

  const active = hovered ?? selected;
  const symbolsSorted = useMemo(
    () => (symbol ? [...regions].map((r) => ({ kode: r.kode, r: symbol(r.kode) ?? 0 })).sort((a, b) => b.r - a.r) : []),
    [symbol, regions],
  );

  return (
    <div ref={wrapRef} className={`relative w-full ${className ?? ""}`}>
      <svg
        ref={svgRef} width={width} height={height} role="img" aria-label="Peta kabupaten/kota Jawa Timur"
        className="touch-pan-y select-none" onMouseLeave={() => { setTip(null); setHovered(null); }}
      >
        <g ref={gRef}>
          {geo.features.map((f) => {
            const kode = f.properties.kode_wilayah;
            const isSel = selected === kode;
            const dim = (brushed && !brushed.includes(kode)) || (selected && !isSel);
            const c = showChoropleth ? fill?.(kode) : undefined;
            return (
              <path
                key={kode} className="region cursor-pointer transition-[opacity,fill] duration-300" d={path(f) ?? ""}
                fill={c ?? "#f1e3dd"} stroke="#fffaf7" strokeWidth={0.8} vectorEffect="non-scaling-stroke"
                opacity={dim ? 0.35 : 1}
                onMouseMove={(e) => {
                  const b = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setTip({ kode, x: e.clientX - b.left, y: e.clientY - b.top });
                  setHovered(kode);
                }}
                onClick={() => toggleSelected(kode)}
              />
            );
          })}
          {/* garis sorotan di atas semua wilayah */}
          {active && (() => {
            const f = geo.features.find((x) => x.properties.kode_wilayah === active);
            return f ? <path d={path(f) ?? ""} fill="none" stroke={ACCENT} strokeWidth={2.2} vectorEffect="non-scaling-stroke" pointerEvents="none" /> : null;
          })()}
          {showSymbols && symbolsSorted.map(({ kode, r }) => {
            const [cx, cy] = centroids.get(kode)!;
            const dim = (brushed && !brushed.includes(kode)) || (selected && selected !== kode);
            return (
              <circle
                key={kode} cx={cx} cy={cy} r={r / k} fill={symbolColor} fillOpacity={dim ? 0.12 : 0.38}
                stroke={selected === kode ? ACCENT : symbolColor} strokeWidth={selected === kode ? 2 : 0.8}
                vectorEffect="non-scaling-stroke" pointerEvents="none"
              />
            );
          })}
          {showLabels && geo.features.map((f) => {
            const kode = f.properties.kode_wilayah;
            const [x, y] = centroids.get(kode)!;
            const nm = f.properties.nama_wilayah.replace("Kabupaten ", "").replace("Kota ", "Kt. ");
            return (
              <text key={kode} x={x} y={y} fontSize={9 / k} textAnchor="middle" fill="#4f2c40" pointerEvents="none" opacity={0.75}>{nm}</text>
            );
          })}
        </g>
      </svg>
      {zoomable && (
        <div className="absolute right-2 top-2 flex flex-col overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm">
          <button className="p-2 hover:bg-muted" onClick={() => zoomBy(1.6)} aria-label="Perbesar"><Plus className="h-4 w-4" /></button>
          <button className="p-2 hover:bg-muted" onClick={() => zoomBy(1 / 1.6)} aria-label="Perkecil"><Minus className="h-4 w-4" /></button>
          <button className="p-2 hover:bg-muted" onClick={zoomReset} aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
        </div>
      )}
      <p className="mt-1 text-[0.65rem] text-muted-foreground">{zoomable ? "Seret untuk menggeser · Ctrl/⌘ + scroll atau tombol untuk zoom · klik wilayah untuk memilih · " : ""}{FRAME_NOTE}</p>
      {tip && tooltip && <MapTooltip x={tip.x} y={tip.y} containerWidth={width}>{tooltip(tip.kode)}</MapTooltip>}
    </div>
  );
}
