import * as d3 from "d3";
import { useData, value, regionName } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT } from "@/data/dataConfig";
import { fmt, fmtPct } from "@/lib/formatting";
import { MapTooltip } from "@/components/map/MapTooltip";
import { useTooltip } from "./useTooltip";

/** Scatter pengeluaran per kapita (x) vs % penduduk miskin (y). Bentuk: lingkaran = kabupaten, kotak = kota. */
export function PPKScatter({ year }: { year: number }) {
  const d = useData();
  const { selected, hovered, toggleSelected, setHovered } = useSelection();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const { tip, show, hide } = useTooltip<string>();
  const height = Math.min(420, Math.max(300, width * 0.62));
  const m = { t: 16, r: 18, b: 42, l: 46 };
  const pts = d.regions.map((r) => ({
    ...r, x: value(d, "pengeluaran_per_kapita_disesuaikan", r.kode, year) ?? 0, y: value(d, "persen_penduduk_miskin", r.kode, year) ?? 0,
  }));
  const x = d3.scaleLinear().domain(d3.extent(pts, (p) => p.x) as [number, number]).nice().range([m.l, width - m.r]);
  const y = d3.scaleLinear().domain([0, d3.max(pts, (p) => p.y)! * 1.08]).nice().range([height - m.b, m.t]);
  const label = new Set([...pts].sort((a, b) => b.y - a.y).slice(0, 2).map((p) => p.kode)
    .concat([...pts].sort((a, b) => b.x - a.x).slice(0, 2).map((p) => p.kode)));
  return (
    <div ref={ref} className="relative" data-chart>
      <svg width={width} height={height}>
        {y.ticks(5).map((t) => (
          <g key={t}><line x1={m.l} x2={width - m.r} y1={y(t)} y2={y(t)} stroke="#ead8d1" strokeDasharray="2 3" />
            <text x={m.l - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill="#6e5a60">{t}%</text></g>
        ))}
        {x.ticks(5).map((t) => <text key={t} x={x(t)} y={height - m.b + 16} textAnchor="middle" fontSize={10} fill="#6e5a60">{fmt(t / 1000, 0)} jt</text>)}
        <text x={(m.l + width - m.r) / 2} y={height - 4} textAnchor="middle" fontSize={11} fill="#2b1d22">Pengeluaran per kapita disesuaikan (juta Rp/orang/tahun)</text>
        <text transform={`translate(12,${(m.t + height - m.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill="#2b1d22">% penduduk miskin</text>
        {pts.map((p) => {
          const on = selected === p.kode || hovered === p.kode;
          const dim = selected && !on;
          const c = on ? ACCENT : p.jenis === "Kota" ? "#87506a" : "#e3a2a1";
          const ev = {
            onMouseMove: (e: React.MouseEvent) => { show(e, p.kode); setHovered(p.kode); },
            onMouseLeave: () => { hide(); setHovered(null); }, onClick: () => toggleSelected(p.kode),
            className: "cursor-pointer", opacity: dim ? 0.3 : 0.9,
          };
          return (
            <g key={p.kode}>
              {p.jenis === "Kota"
                ? <rect x={x(p.x) - 5} y={y(p.y) - 5} width={10} height={10} fill={c} stroke="#fff" {...ev} />
                : <circle cx={x(p.x)} cy={y(p.y)} r={on ? 7 : 5.5} fill={c} stroke="#fff" {...ev} />}
              {(label.has(p.kode) || on) && (
                <text x={x(p.x) + 8} y={y(p.y) - 6} fontSize={10} fill={on ? ACCENT : "#4f2c40"} pointerEvents="none">
                  {p.nama.replace("Kabupaten ", "")}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {tip && (
        <MapTooltip x={tip.x} y={tip.y} containerWidth={width}>
          <p className="font-semibold">{regionName(d, tip.d)}</p>
          <p>PPK: {fmt(value(d, "pengeluaran_per_kapita_disesuaikan", tip.d, year), 0)} ribu Rp</p>
          <p>% miskin: {fmtPct(value(d, "persen_penduduk_miskin", tip.d, year))}</p>
        </MapTooltip>
      )}
    </div>
  );
}
