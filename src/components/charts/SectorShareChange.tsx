import * as d3 from "d3";
import { useData } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { SECTOR_COLORS } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";

/** Dumbbell porsi tiap lapangan usaha terhadap PDRB ADHB, tahun awal vs akhir (Jawa Timur atau wilayah terpilih). */
export function SectorShareChange() {
  const d = useData();
  const { selected } = useSelection();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const [ya, yb] = [d.pdrb.years[0], d.pdrb.years[d.pdrb.years.length - 1]];
  const kodes = selected ? [selected] : d.regions.map((r) => r.kode);
  const share = (y: number) => {
    const tot = d3.sum(kodes, (k) => d3.sum(d.pdrb.lu, (l) => d.pdrb.data[k][String(y)][l.kode][0]));
    return new Map(d.pdrb.lu.map((l) => [l.kode, (d3.sum(kodes, (k) => d.pdrb.data[k][String(y)][l.kode][0]) / tot) * 100]));
  };
  const A = share(ya), B = share(yb);
  const rows = [...d.pdrb.lu].sort((p, q) => B.get(q.kode)! - B.get(p.kode)!);
  const rowH = 22, m = { t: 24, r: 70, b: 10, l: width < 560 ? 150 : 260 };
  const height = m.t + rows.length * rowH + m.b;
  const x = d3.scaleLinear().domain([0, d3.max([...A.values(), ...B.values()])! * 1.05]).range([m.l, width - m.r]);
  return (
    <div ref={ref}>
      <svg width={width} height={height}>
        {x.ticks(5).map((t) => <text key={t} x={x(t)} y={14} textAnchor="middle" fontSize={10} fill="#6e5a60">{t}%</text>)}
        {rows.map((l, i) => {
          const yy = m.t + i * rowH + rowH / 2;
          const a = A.get(l.kode)!, b = B.get(l.kode)!;
          const c = SECTOR_COLORS[l.sektor];
          return (
            <g key={l.kode}>
              <text x={m.l - 8} y={yy + 3.5} textAnchor="end" fontSize={10.5} fill="#2b1d22">{l.kode} · {width < 560 ? l.nama.slice(0, 18) : l.nama.slice(0, 40)}</text>
              <line x1={x(a)} x2={x(b)} y1={yy} y2={yy} stroke={c} strokeWidth={2} />
              <circle cx={x(a)} cy={yy} r={4} fill="#fff" stroke={c} strokeWidth={1.5} />
              <circle cx={x(b)} cy={yy} r={4.5} fill={c} />
              <text x={Math.max(x(a), x(b)) + 8} y={yy + 3.5} fontSize={9.5} fill={b >= a ? "#a23e55" : "#2f6690"}>{b >= a ? "+" : ""}{fmt(b - a, 2)} poin</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-xs text-muted-foreground">○ {ya} · ● {yb} ({d.pdrb.status[String(yb)]}) · warna = sektor · {selected ? "wilayah terpilih" : "seluruh Jawa Timur (jumlah 38 kab/kota)"}</p>
    </div>
  );
}
