import { useState } from "react";
import * as d3 from "d3";
import { useData, regionName } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT, CLUSTER_COLORS, ind } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";
import { MapTooltip } from "@/components/map/MapTooltip";
import { Toggle } from "@/components/layout/Controls";
import { useTooltip } from "./useTooltip";

/** Scatter skor PC1–PC2 (warna = klaster), opsi biplot (panah loading), label pencilan & wilayah terpilih. */
export function PCAChart() {
  const { pca, regions } = useData();
  const d = useData();
  const { selected, hovered, brushed, toggleSelected, setHovered } = useSelection();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const [biplot, setBiplot] = useState(true);
  const { tip, show, hide } = useTooltip<string>();
  const height = Math.min(520, Math.max(320, width * 0.72));
  const m = 34;
  const S = pca.scores;
  const ext = d3.max(Object.values(S).flatMap(([a, b]) => [Math.abs(a), Math.abs(b)]))! * 1.1;
  const x = d3.scaleLinear().domain([-ext, ext]).range([m, width - m]);
  const y = d3.scaleLinear().domain([-ext * (height / width), ext * (height / width)]).range([height - m, m]);
  const L = Math.min(width, height) * 0.36; // panjang panah loading
  const [e1, e2] = pca.explained;
  const extremes = new Set([...regions].sort((a, b) => S[a.kode][0] - S[b.kode][0]).filter((_, i, arr) => i < 2 || i >= arr.length - 2).map((r) => r.kode));
  return (
    <div ref={ref} className="relative" data-chart>
      <div className="mb-2 flex justify-end"><Toggle checked={biplot} onChange={setBiplot} label="Tampilkan loading (biplot)" /></div>
      <svg width={width} height={height}>
        <line x1={x(0)} x2={x(0)} y1={m} y2={height - m} stroke="#ead8d1" />
        <line x1={m} x2={width - m} y1={y(0)} y2={y(0)} stroke="#ead8d1" />
        <text x={width - m} y={y(0) - 6} textAnchor="end" fontSize={11} fill="#6e5a60">PC1 ({fmt(e1 * 100, 1)}%) →</text>
        <text x={x(0) + 6} y={m - 8} fontSize={11} fill="#6e5a60">↑ PC2 ({fmt(e2 * 100, 1)}%)</text>
        {biplot && Object.entries(pca.loadings).map(([v, [a, b]]) => (
          <g key={v} opacity={0.75}>
            <line x1={x(0)} y1={y(0)} x2={x(0) + a * L} y2={y(0) - b * L} stroke="#87506a" strokeWidth={1} markerEnd="url(#arrow)" />
            <text x={x(0) + a * L * 1.12} y={y(0) - b * L * 1.12} fontSize={9.5} fill="#87506a" textAnchor={a >= 0 ? "start" : "end"}>{ind(v).short}</text>
          </g>
        ))}
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="#87506a" /></marker></defs>
        {regions.map((r) => {
          const [a, b] = S[r.kode];
          const on = selected === r.kode || hovered === r.kode;
          const dim = (brushed && !brushed.includes(r.kode)) || (selected && !on);
          const c = CLUSTER_COLORS[pca.cluster[r.kode]];
          const lab = on || pca.outliers.includes(r.kode) || extremes.has(r.kode);
          return (
            <g key={r.kode} className="cursor-pointer" opacity={dim ? 0.2 : 1}
              onMouseMove={(e) => { show(e, r.kode); setHovered(r.kode); }} onMouseLeave={() => { hide(); setHovered(null); }}
              onClick={() => toggleSelected(r.kode)}>
              <circle cx={x(a)} cy={y(b)} r={on ? 8 : 6} fill={c} stroke={on ? ACCENT : "#fff"} strokeWidth={on ? 2.5 : 1} />
              {lab && <text x={x(a) + 9} y={y(b) + 3} fontSize={10.5} fill={on ? ACCENT : "#2b1d22"} fontWeight={on ? 600 : 400}>{r.nama.replace("Kabupaten ", "")}</text>}
            </g>
          );
        })}
      </svg>
      {tip && (
        <MapTooltip x={tip.x} y={tip.y} containerWidth={width}>
          <p className="font-semibold">{regionName(d, tip.d)}</p>
          <p>{pca.clusters[pca.cluster[tip.d]].label}{pca.outliers.includes(tip.d) ? " · pencilan" : ""}</p>
          <p className="text-muted-foreground">PC1 {fmt(S[tip.d][0], 2)} · PC2 {fmt(S[tip.d][1], 2)}</p>
        </MapTooltip>
      )}
      <ExplainedBars />
    </div>
  );
}

/** Scree mini: proporsi varians tiap komponen. */
function ExplainedBars() {
  const { pca } = useData();
  return (
    <div className="mt-3 flex items-end gap-1" aria-label="Proporsi varians tiap komponen utama">
      {pca.explained.slice(0, 6).map((e, i) => (
        <div key={i} className="flex flex-col items-center text-[0.6rem] text-muted-foreground">
          <div className="w-7 rounded-t bg-secondary/70" style={{ height: e * 90 }} />PC{i + 1}<br />{fmt(e * 100, 0)}%
        </div>
      ))}
      <span className="ml-3 text-xs text-muted-foreground">Varians dijelaskan per komponen</span>
    </div>
  );
}
