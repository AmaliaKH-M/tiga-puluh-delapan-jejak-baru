import * as d3 from "d3";
import { useData, value, flag, provValue } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";

const COLORS = { makanan: "#e3a2a1", bukan: "#4f2c40" };

/** Porsi makanan vs bukan makanan (100%) per kab/kota, terurut menurut porsi bukan makanan. */
export function FoodShareBars({ year }: { year: number }) {
  const d = useData();
  const { selected, hovered, toggleSelected, setHovered } = useSelection();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const rows = d.regions.map((r) => {
    const f = value(d, "pengeluaran_makanan", r.kode, year) ?? 0;
    const n = value(d, "pengeluaran_bukan_makanan", r.kode, year) ?? 0;
    return { ...r, f, n, share: n / (f + n), flagged: (flag(d, "pengeluaran_bukan_makanan", r.kode, year) ?? "").includes("perlu_verifikasi") };
  }).sort((a, b) => b.share - a.share);
  const rowH = 16;
  const m = { t: 22, r: 44, b: 6, l: width < 520 ? 118 : 150 };
  const height = m.t + rows.length * rowH + m.b;
  const x = d3.scaleLinear().domain([0, 1]).range([m.l, width - m.r]);
  const pf = provValue(d, "pengeluaran_makanan", year), pn = provValue(d, "pengeluaran_bukan_makanan", year);
  const pShare = pf && pn ? pn / (pf + pn) : null;
  return (
    <div ref={ref}>
      <svg width={width} height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={x(t)} y={m.t - 8} textAnchor="middle" fontSize={10} fill="#6e5a60">{t * 100}%</text>
        ))}
        {rows.map((r, i) => {
          const yy = m.t + i * rowH;
          const on = selected === r.kode || hovered === r.kode;
          return (
            <g key={r.kode} className="cursor-pointer" opacity={selected && !on ? 0.4 : 1}
              onClick={() => toggleSelected(r.kode)} onMouseEnter={() => setHovered(r.kode)} onMouseLeave={() => setHovered(null)}>
              <text x={m.l - 8} y={yy + rowH / 2 + 3.5} textAnchor="end" fontSize={10.5} fill={on ? ACCENT : "#2b1d22"} fontWeight={on ? 600 : 400}>
                {r.nama.replace("Kabupaten ", "Kab. ")}{r.flagged ? " *" : ""}
              </text>
              <rect x={x(0)} y={yy + 2} width={x(1 - r.share) - x(0)} height={rowH - 4} fill={COLORS.makanan} />
              <rect x={x(1 - r.share)} y={yy + 2} width={x(1) - x(1 - r.share)} height={rowH - 4} fill={COLORS.bukan} />
              {on && <rect x={x(0)} y={yy + 1} width={x(1) - x(0)} height={rowH - 2} fill="none" stroke={ACCENT} strokeWidth={1.5} />}
              <text x={x(1) + 4} y={yy + rowH / 2 + 3.5} fontSize={9.5} fill="#6e5a60">{fmt(r.share * 100, 0)}%</text>
            </g>
          );
        })}
        {pShare && <line x1={x(1 - pShare)} x2={x(1 - pShare)} y1={m.t - 4} y2={height} stroke="#fff" strokeWidth={1.5} strokeDasharray="3 2" />}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4" style={{ background: COLORS.makanan }} />Makanan</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4" style={{ background: COLORS.bukan }} />Bukan makanan (angka = porsinya)</span>
        <span>Garis putus putih: Jawa Timur · * nilai perlu verifikasi</span>
      </div>
    </div>
  );
}
