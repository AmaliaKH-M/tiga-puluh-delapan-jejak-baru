import { useMemo, useState } from "react";
import * as d3 from "d3";
import { useData, value, regionName } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { ACCENT, INK } from "@/data/dataConfig";
import { fmtPct } from "@/lib/formatting";

const IND = "persen_penduduk_miskin";
/** Tahun awal yang ditampilkan. Ubah ke 2005 jika sumber 2005–2009 sudah terdokumentasi. */
const START_YEAR = 2010;

/**
 * Tren % penduduk miskin: garis provinsi (2005–2025; 2005–2009 putus-putus karena sumber belum
 * terverifikasi), 38 garis tipis kab/kota (2010–2025), dan wilayah terpilih berwarna aksen.
 */
export function PovertyTrend() {
  const d = useData();
  const { selected, setHovered } = useSelection();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const height = Math.min(440, Math.max(300, width * 0.48));
  const m = { t: 20, r: 24, b: 34, l: 44 };
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  const prov = useMemo(() =>
    Object.entries(d.province.data[IND]).map(([y, v]) => ({
      year: +y, v: v as number, unverified: (d.province.flags[IND]?.[y] ?? "").includes("perlu_verifikasi"),
})).filter((p) => p.year >= START_YEAR).sort((a, b) => a.year - b.year), [d]);
  const kabYears = d3.range(2010, 2026);
  const lines = useMemo(() => d.regions.map((r) => ({
    kode: r.kode, pts: kabYears.map((y) => ({ year: y, v: value(d, IND, r.kode, y) })).filter((p) => p.v != null) as { year: number; v: number }[],
  })), [d]);

  const x = d3.scaleLinear().domain([prov[0].year, 2025]).range([m.l, width - m.r]);
  const yMax = d3.max(lines.flatMap((l) => l.pts.map((p) => p.v))) ?? 35;
  const y = d3.scaleLinear().domain([0, Math.ceil(yMax / 5) * 5]).range([height - m.b, m.t]).nice();
  const line = d3.line<{ year: number; v: number }>().x((p) => x(p.year)).y((p) => y(p.v));

  const sel = lines.find((l) => l.kode === selected);

  return (
    <div ref={ref} className="relative" data-chart>
      <svg width={width} height={height} onMouseLeave={() => setHoverYear(null)}
        onMouseMove={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          const yr = Math.round(x.invert(e.clientX - b.left));
          setHoverYear(yr >= prov[0].year && yr <= 2025 ? yr : null);
        }}>
        {/* pita COVID */}
        <rect x={x(2019.5)} width={x(2021.5) - x(2019.5)} y={m.t} height={height - m.t - m.b} fill="#ffcdb2" opacity={0.35} />
        <text x={x(2020.5)} y={m.t + 12} textAnchor="middle" fontSize={10} fill="#87506a">Pandemi</text>
        {y.ticks(5).map((t) => (
          <g key={t}>
            <line x1={m.l} x2={width - m.r} y1={y(t)} y2={y(t)} stroke="#ead8d1" strokeDasharray="2 3" />
            <text x={m.l - 8} y={y(t) + 3} textAnchor="end" fontSize={10} fill="#6e5a60">{t}%</text>
          </g>
        ))}
        {x.ticks(width < 500 ? 5 : 10).map((t) => (
          <text key={t} x={x(t)} y={height - 12} textAnchor="middle" fontSize={10} fill="#6e5a60">{t}</text>
        ))}
        {lines.map((l) => (
          <path key={l.kode} d={line(l.pts) ?? ""} fill="none" stroke="#c9a9b0" strokeWidth={0.8} opacity={selected ? 0.25 : 0.5}
            onMouseEnter={() => setHovered(l.kode)} onMouseLeave={() => setHovered(null)} />
        ))}
<path d={line(prov) ?? ""} fill="none" stroke={INK} strokeWidth={2.6} />
        {sel && <path d={line(sel.pts) ?? ""} fill="none" stroke={ACCENT} strokeWidth={2.6} />}
        <text x={x(2025) - 2} y={y(prov[prov.length - 1].v) - 8} textAnchor="end" fontSize={11} fontWeight={600} fill={INK}>Jawa Timur</text>
        {sel && <text x={x(2025) - 2} y={y(sel.pts[sel.pts.length - 1].v) + 16} textAnchor="end" fontSize={11} fontWeight={600} fill={ACCENT}>{regionName(d, sel.kode)}</text>}
        {hoverYear && <line x1={x(hoverYear)} x2={x(hoverYear)} y1={m.t} y2={height - m.b} stroke="#87506a" strokeWidth={0.8} />}
      </svg>
      {hoverYear && (
        <div className="pointer-events-none absolute top-2 rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow"
          style={{ left: Math.min(width - 190, x(hoverYear) + 10) }}>
          <p className="font-display text-lg">{hoverYear}</p>
          <p>Jawa Timur: <b>{fmtPct(prov.find((p) => p.year === hoverYear)?.v)}</b>
            {prov.find((p) => p.year === hoverYear)?.unverified && <span className="text-muted-foreground"> (sumber belum terverifikasi)</span>}</p>
          {sel && <p style={{ color: ACCENT }}>{regionName(d, sel.kode)}: <b>{fmtPct(value(d, IND, sel.kode, hoverYear))}</b></p>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-foreground" />Jawa Timur</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-[#c9a9b0]" />38 kab/kota (2010–2025)</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5" style={{ background: ACCENT }} />wilayah terpilih</span>
      </div>
    </div>
  );
}
