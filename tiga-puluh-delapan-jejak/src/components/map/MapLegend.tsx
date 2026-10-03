import { fmt } from "@/lib/formatting";

/** Legenda kelas choropleth (warna) — label batas kelas. */
export function ClassLegend({ colors, breaks, digits, unit, title, method }: {
  colors: string[]; breaks: number[]; digits: number; unit?: string; title: string; method?: string;
}) {
  return (
    <div className="text-xs">
      <p className="mb-1.5 font-medium text-foreground/80">{title}{unit ? ` (${unit})` : ""}</p>
      <div className="flex">
        {colors.map((c, i) => (
          <div key={c} className="flex-1">
            <div className="h-2.5 border-r border-card" style={{ background: c }} />
            <div className="mt-1 text-[0.65rem] text-muted-foreground">
              {i === 0 ? `< ${fmt(breaks[0], digits)}` : i === colors.length - 1 ? `≥ ${fmt(breaks[i - 1], digits)}` : `${fmt(breaks[i - 1], digits)}`}
            </div>
          </div>
        ))}
      </div>
      {method && <p className="mt-1 text-[0.65rem] text-muted-foreground">Klasifikasi: {method}</p>}
    </div>
  );
}

/** Legenda ukuran simbol proporsional (luas ∝ nilai). */
export function SymbolLegend({ values, radius, title, digits = 0, unit }: {
  values: number[]; radius: (v: number) => number; title: string; digits?: number; unit?: string;
}) {
  const rMax = radius(Math.max(...values));
  const base = rMax * 2 + 10; // garis dasar lingkaran
  // label diberi jarak minimal 12px agar tidak bertumpuk
  let lastY = Infinity;
  const ys = [...values].sort((a, b) => a - b).map((v) => {
    let ty = base - 2 * radius(v) + 3;
    if (lastY - ty < 12) ty = lastY - 12;
    lastY = ty;
    return { v, ty };
  });
  return (
    <div className="text-xs">
      <p className="mb-1.5 font-medium text-foreground/80">{title}{unit ? ` (${unit})` : ""}</p>
      <svg width={rMax * 2 + 110} height={base + 4} style={{ overflow: "visible" }}>
        {ys.map(({ v, ty }) => {
          const r = radius(v);
          return (
            <g key={v}>
              <circle cx={rMax + 2} cy={base - r} r={r} fill="none" stroke="#87506a" strokeWidth={1} />
              <line x1={rMax + 2} x2={rMax * 2 + 12} y1={base - 2 * r} y2={ty - 3} stroke="#c9b5ba" strokeDasharray="2 2" />
              <text x={rMax * 2 + 16} y={ty} fontSize={10} fill="#6e5a60">{fmt(v, digits)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function CategoryLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />{i.label}
        </span>
      ))}
    </div>
  );
}
