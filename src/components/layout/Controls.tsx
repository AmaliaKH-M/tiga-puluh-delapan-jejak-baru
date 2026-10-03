import { cn } from "@/lib/utils";

export function YearSlider({ years, value, onChange, label = "Tahun" }: {
  years: number[]; value: number; onChange: (y: number) => void; label?: string;
}) {
  const i = Math.max(0, years.indexOf(value));
  return (
    <label className="flex min-w-[200px] flex-1 items-center gap-3 text-xs text-muted-foreground md:min-w-[260px]">
      <span>{label}</span>
      <input
        className="year" type="range" min={0} max={years.length - 1} step={1} value={i}
        onChange={(e) => onChange(years[+e.target.value])} aria-label={label}
      />
      <span className="w-12 font-display text-xl text-foreground">{value}</span>
    </label>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-full border border-border bg-card p-0.5 text-xs">
      {options.map((o) => (
        <button
          key={o.value} onClick={() => onChange(o.value)}
          className={cn("rounded-full px-3 py-1.5 transition-colors", o.value === value ? "bg-foreground text-background" : "hover:bg-muted")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SelectBox({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      {label}
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (b: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--secondary)]" />
      {label}
    </label>
  );
}
