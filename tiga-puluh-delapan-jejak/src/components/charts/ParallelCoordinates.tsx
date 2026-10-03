import { useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useData, regionName } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT, CLUSTER_COLORS, ind } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";
import { Button } from "@/components/ui/button";

type Brush = Record<string, [number, number]>; // dalam piksel y (atas, bawah)

/**
 * Parallel coordinates 10 variabel PCA (nilai asli; sumbu log untuk PDRB per kapita & kepadatan).
 * Brushing: seret vertikal pada sumbu untuk memilih rentang; beberapa sumbu = irisan (AND).
 * Hasil brushing dibagikan ke PCA, heatmap, dan peta.
 */
export function ParallelCoordinates() {
  const d = useData();
  const { pca, regions } = d;
  const { selected, hovered, setBrushed, toggleSelected, setHovered } = useSelection();
  const [ref, { width: w0 }] = useSize<HTMLDivElement>();
  const width = Math.max(760, w0);
  const height = 420;
  const m = { t: 40, r: 30, b: 24, l: 30 };
  const vars = pca.variables;
  const xs = d3.scalePoint<string>().domain(vars).range([m.l, width - m.r]);
  const ys = useMemo(() => Object.fromEntries(vars.map((v) => {
    const vals = regions.map((r) => pca.raw[r.kode][v] as number);
    const ext = d3.extent(vals) as [number, number];
    const s = (ind(v).log ? d3.scaleLog() : d3.scaleLinear()).domain(ext).range([height - m.b, m.t]);
    return [v, ind(v).log ? s : (s as d3.ScaleLinear<number, number>).nice()];
  })) as Record<string, d3.ScaleContinuousNumeric<number, number>>, [pca, regions, vars, height]);

  const [brush, setBrush] = useState<Brush>({});
  const drag = useRef<{ v: string; y0: number } | null>(null);
  const passes = (kode: string, b: Brush) => Object.entries(b).every(([v, [a, c]]) => {
    const py = ys[v](pca.raw[kode][v] as number);
    return py >= Math.min(a, c) && py <= Math.max(a, c);
  });
  const update = (b: Brush) => {
    setBrush(b);
    const keys = Object.keys(b);
    setBrushed(keys.length ? regions.filter((r) => passes(r.kode, b)).map((r) => r.kode) : null);
  };
  const line = (kode: string) => d3.line()(vars.map((v) => [xs(v)!, ys[v](pca.raw[kode][v] as number)]));
  const svgY = (e: React.PointerEvent) => e.clientY - (e.currentTarget as Element).closest("svg")!.getBoundingClientRect().top;

  const anyBrush = Object.keys(brush).length > 0;
  const passing = new Set(regions.filter((r) => passes(r.kode, brush)).map((r) => r.kode));

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Seret vertikal pada sumbu untuk memfilter · {anyBrush ? `${passing.size} wilayah lolos filter` : "belum ada filter"}</span>
        {anyBrush && <Button size="sm" variant="outline" onClick={() => update({})}>Hapus filter</Button>}
      </div>
      <div ref={ref} className="overflow-x-auto">
        <svg width={width} height={height}>
          {regions.map((r) => {
            const on = selected === r.kode || hovered === r.kode;
            const out = anyBrush && !passing.has(r.kode);
            return (
              <path key={r.kode} d={line(r.kode) ?? ""} fill="none" className="cursor-pointer"
                stroke={on ? ACCENT : out ? "#d9c9c4" : CLUSTER_COLORS[pca.cluster[r.kode]]}
                strokeWidth={on ? 3 : 1.3} strokeOpacity={on ? 1 : out ? 0.35 : selected ? 0.3 : 0.7}
                onMouseEnter={() => setHovered(r.kode)} onMouseLeave={() => setHovered(null)} onClick={() => toggleSelected(r.kode)}>
                <title>{regionName(d, r.kode)}</title>
              </path>
            );
          })}
          {(hovered ?? selected) && (() => {
            const k = (hovered ?? selected)!;
            return <path d={line(k) ?? ""} fill="none" stroke={ACCENT} strokeWidth={3} pointerEvents="none" />;
          })()}
          {vars.map((v) => {
            const s = ys[v];
            const xv = xs(v)!;
            const b = brush[v];
            return (
              <g key={v}>
                <line x1={xv} x2={xv} y1={m.t} y2={height - m.b} stroke="#2b1d22" strokeOpacity={0.5} />
                {s.ticks(4).map((t) => (
                  <text key={t} x={xv - 5} y={s(t) + 3} textAnchor="end" fontSize={8.5} fill="#9b8a8f">{fmt(t, t < 10 ? 1 : 0)}</text>
                ))}
                <text x={xv} y={m.t - 22} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#2b1d22">{ind(v).short}</text>
                <text x={xv} y={m.t - 10} textAnchor="middle" fontSize={8.5} fill="#9b8a8f">{ind(v).unit}{ind(v).log ? " · log" : ""}</text>
                {b && <rect x={xv - 8} width={16} y={Math.min(...b)} height={Math.abs(b[1] - b[0])} fill="#e74c3c" fillOpacity={0.15} stroke="#e74c3c" />}
                <rect x={xv - 12} width={24} y={m.t} height={height - m.t - m.b} fill="transparent" className="cursor-ns-resize"
                  onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); drag.current = { v, y0: svgY(e) }; }}
                  onPointerMove={(e) => { if (drag.current?.v === v) update({ ...brush, [v]: [drag.current.y0, svgY(e)] }); }}
                  onPointerUp={(e) => {
                    if (drag.current && Math.abs(svgY(e) - drag.current.y0) < 3) { const n = { ...brush }; delete n[v]; update(n); }
                    drag.current = null;
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
