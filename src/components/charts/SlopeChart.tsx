import * as d3 from "d3";
import { useData, value, flag, regionName } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT, ind, trendYears } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";

/**
 * Slope chart awal → akhir periode valid indikator (periode dihitung dari data).
 * Biru = turun, rose = naik (tanpa penilaian baik/buruk). Garis putus-putus = nilai berflag perlu verifikasi.
 */
export function SlopeChart({ indicator }: { indicator: string }) {
  const d = useData();
  const meta = ind(indicator);
  const { selected, hovered, toggleSelected, setHovered } = useSelection();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const years = trendYears(d, indicator);
  const [y0, y1] = [years[0], years[years.length - 1]];
  const height = 520;
  const m = { t: 34, b: 20, l: width < 560 ? 92 : 170, r: width < 560 ? 92 : 170 };
  const rows = d.regions.map((r) => ({
    ...r, a: value(d, indicator, r.kode, y0) ?? NaN, b: value(d, indicator, r.kode, y1) ?? NaN,
    unverified: [y0, y1].some((y) => (flag(d, indicator, r.kode, y) ?? "").includes("perlu_verifikasi")),
  }));
  const all = rows.flatMap((r) => [r.a, r.b]);
  const y = d3.scaleLinear().domain(d3.extent(all) as [number, number]).nice().range([height - m.b, m.t]);
  const xa = m.l, xb = width - m.r;
  const labelled = new Set([
    ...[...rows].sort((p, q) => q.b - p.b).slice(0, 3).map((r) => r.kode),
    ...[...rows].sort((p, q) => p.b - q.b).slice(0, 3).map((r) => r.kode),
  ]);
  const short = (n: string) => n.replace("Kabupaten ", "").replace("Kota ", "Kt. ");
  return (
    <div ref={ref}>
      <svg width={width} height={height}>
        <text x={xa} y={18} textAnchor="middle" fontFamily="var(--font-display)" fontSize={20} fill="#2b1d22">{y0}</text>
        <text x={xb} y={18} textAnchor="middle" fontFamily="var(--font-display)" fontSize={20} fill="#2b1d22">{y1}</text>
        <line x1={xa} x2={xa} y1={m.t} y2={height - m.b} stroke="#ead8d1" />
        <line x1={xb} x2={xb} y1={m.t} y2={height - m.b} stroke="#ead8d1" />
        {rows.map((r) => {
          const on = selected === r.kode || hovered === r.kode;
          const c = on ? ACCENT : r.b < r.a ? "#2f6690" : "#a23e55";
          const showLab = on || labelled.has(r.kode);
          return (
            <g key={r.kode} className="cursor-pointer" opacity={selected && !on ? 0.18 : on ? 1 : 0.55}
              onClick={() => toggleSelected(r.kode)} onMouseEnter={() => setHovered(r.kode)} onMouseLeave={() => setHovered(null)}>
              <line x1={xa} x2={xb} y1={y(r.a)} y2={y(r.b)} stroke={c} strokeWidth={on ? 3 : 1.4} strokeDasharray={r.unverified ? "4 3" : undefined} />
              <line x1={xa} x2={xb} y1={y(r.a)} y2={y(r.b)} stroke="transparent" strokeWidth={8} />
              <circle cx={xa} cy={y(r.a)} r={on ? 4.5 : 2.5} fill={c} />
              <circle cx={xb} cy={y(r.b)} r={on ? 4.5 : 2.5} fill={c} />
              {showLab && (
                <>
                  <text x={xa - 8} y={y(r.a) + 3} textAnchor="end" fontSize={10} fill={on ? ACCENT : "#2b1d22"}>{short(r.nama)} {fmt(r.a, meta.digits)}</text>
                  <text x={xb + 8} y={y(r.b) + 3} fontSize={10} fill={on ? ACCENT : "#2b1d22"}>{fmt(r.b, meta.digits)} {short(r.nama)}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-[#2f6690]" />turun</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-[#a23e55]" />naik</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-foreground/50" />nilai perlu verifikasi</span>
        <span>Satuan: {meta.unit || "indeks"} · {selected ? regionName(d, selected) : "klik garis untuk memilih wilayah"}</span>
      </div>
    </div>
  );
}
