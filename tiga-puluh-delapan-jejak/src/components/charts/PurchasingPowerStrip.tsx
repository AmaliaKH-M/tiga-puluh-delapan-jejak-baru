import * as d3 from "d3";
import { useData, value, provValue } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT, INK_SOFT } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";

const IND = "pengeluaran_per_kapita_disesuaikan";

/** Ranking pengeluaran per kapita disesuaikan (dot plot terurut) + garis provinsi. */
export function PurchasingPowerStrip({ year }: { year: number }) {
  const d = useData();
  const { selected, hovered, toggleSelected, setHovered } = useSelection();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const rows = d.regions
    .map((r) => ({ ...r, v: value(d, IND, r.kode, year) ?? 0 }))
    .sort((a, b) => b.v - a.v);
  const rowH = 17;
  const m = { t: 26, r: 56, b: 10, l: width < 520 ? 118 : 150 };
  const height = m.t + rows.length * rowH + m.b;
  const x = d3.scaleLinear().domain([d3.min(rows, (r) => r.v)! * 0.92, d3.max(rows, (r) => r.v)! * 1.02]).range([m.l, width - m.r]);
  const pv = provValue(d, IND, year);
  return (
    <div ref={ref}>
      <svg width={width} height={height}>
        {x.ticks(5).map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={m.t - 6} y2={height - m.b} stroke="#ead8d1" strokeDasharray="2 3" />
            <text x={x(t)} y={m.t - 12} textAnchor="middle" fontSize={10} fill="#6e5a60">{fmt(t / 1000, 0)} jt</text>
          </g>
        ))}
        {pv != null && (
          <g>
            <line x1={x(pv)} x2={x(pv)} y1={m.t - 6} y2={height - m.b} stroke="#87506a" strokeWidth={1.2} />
            <text x={x(pv) + 4} y={height - m.b - 4} fontSize={10} fill="#87506a">Jawa Timur</text>
          </g>
        )}
        {rows.map((r, i) => {
          const yy = m.t + i * rowH + rowH / 2;
          const on = selected === r.kode || hovered === r.kode;
          const nm = r.nama.replace("Kabupaten ", "Kab. ");
          return (
            <g key={r.kode} className="cursor-pointer" onClick={() => toggleSelected(r.kode)}
              onMouseEnter={() => setHovered(r.kode)} onMouseLeave={() => setHovered(null)}>
              <rect x={0} y={yy - rowH / 2} width={width} height={rowH} fill={on ? "#ffcdb2" : "transparent"} opacity={0.4} />
              <text x={m.l - 8} y={yy + 3.5} textAnchor="end" fontSize={10.5} fill={on ? ACCENT : "#2b1d22"} fontWeight={on ? 600 : 400}>{nm}</text>
              <line x1={x.range()[0]} x2={x(r.v)} y1={yy} y2={yy} stroke={INK_SOFT} strokeOpacity={0.35} />
              <circle cx={x(r.v)} cy={yy} r={on ? 5.5 : 4} fill={on ? ACCENT : r.jenis === "Kota" ? "#87506a" : "#e3a2a1"} />
              <text x={x(r.v) + 8} y={yy + 3.5} fontSize={9.5} fill="#6e5a60">{fmt(r.v, 0)}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#e3a2a1]" />Kabupaten</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#87506a]" />Kota</span>
        <span>Satuan: ribu rupiah/orang/tahun</span>
      </div>
    </div>
  );
}
