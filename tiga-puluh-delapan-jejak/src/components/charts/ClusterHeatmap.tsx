import * as d3 from "d3";
import { useData, regionName } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT, CLUSTER_COLORS, DIVERGING, ind } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";
import { MapTooltip } from "@/components/map/MapTooltip";
import { useTooltip } from "./useTooltip";

/**
 * Heatmap terklaster: baris (38 wilayah) & kolom (variabel) diurutkan dengan klaster hierarkis.
 * Warna = z-score (divergen biru–rose, aman buta warna). Strip kiri = kelompok.
 */
export function ClusterHeatmap() {
  const d = useData();
  const { pca } = d;
  const { selected, hovered, brushed, toggleSelected, setHovered } = useSelection();
  const [ref, { width: w0 }] = useSize<HTMLDivElement>();
  const width = Math.max(600, w0);
  const { row_order: rows, col_order: cols, z } = pca.heatmap;
  const m = { t: 70, r: 10, b: 10, l: 150 };
  const cw = (width - m.l - m.r) / cols.length;
  const ch = 15;
  const height = m.t + rows.length * ch + m.b;
  const color = d3.scaleLinear<string>().domain([-2.5, -1, 0, 1, 2.5]).range(DIVERGING).clamp(true);
  const { tip, show, hide } = useTooltip<{ k: string; v: string; z: number }>();
  return (
    <div ref={ref} className="relative overflow-x-auto" data-chart>
      <svg width={width} height={height}>
        {cols.map((v, j) => (
          <text key={v} transform={`translate(${m.l + j * cw + cw / 2},${m.t - 8}) rotate(-35)`} fontSize={10.5} fill="#2b1d22">{ind(v).short}</text>
        ))}
        {rows.map((k, i) => {
          const on = selected === k || hovered === k;
          const dim = (brushed && !brushed.includes(k)) || (selected && !on);
          const yy = m.t + i * ch;
          return (
            <g key={k} opacity={dim ? 0.25 : 1} className="cursor-pointer" onClick={() => toggleSelected(k)}
              onMouseEnter={() => setHovered(k)} onMouseLeave={() => { setHovered(null); hide(); }}>
              <rect x={m.l - 10} y={yy + 1} width={6} height={ch - 2} fill={CLUSTER_COLORS[pca.cluster[k]]} />
              <text x={m.l - 14} y={yy + ch / 2 + 3.5} textAnchor="end" fontSize={10} fill={on ? ACCENT : "#2b1d22"} fontWeight={on ? 600 : 400}>
                {regionName(d, k).replace("Kabupaten ", "Kab. ")}
              </text>
              {cols.map((v, j) => (
                <rect key={v} x={m.l + j * cw} y={yy} width={cw - 1} height={ch - 1} fill={color(z[k][j])}
                  onMouseMove={(e) => show(e, { k, v, z: z[k][j] })} />
              ))}
              {on && <rect x={m.l} y={yy - 0.5} width={cols.length * cw - 1} height={ch} fill="none" stroke={ACCENT} strokeWidth={1.8} />}
            </g>
          );
        })}
      </svg>
      {tip && (
        <MapTooltip x={tip.x} y={tip.y} containerWidth={width}>
          <p className="font-semibold">{regionName(d, tip.d.k)}</p>
          <p>{ind(tip.d.v).label}: <b>{fmt(pca.raw[tip.d.k][tip.d.v], ind(tip.d.v).digits)}</b> {ind(tip.d.v).unit}</p>
          <p className="text-muted-foreground">z-score {fmt(tip.d.z, 2)}</p>
        </MapTooltip>
      )}
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>di bawah rata-rata</span>
        <div className="h-2.5 w-40" style={{ background: `linear-gradient(90deg, ${DIVERGING.join(",")})` }} />
        <span>di atas rata-rata (z-score)</span>
      </div>
    </div>
  );
}
