/** Format angka gaya Indonesia (titik ribuan, koma desimal). */
const nf = (d: number) =>
  new Intl.NumberFormat("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmt = (v: number | null | undefined, digits = 2) =>
  v == null || Number.isNaN(v) ? "—" : nf(digits).format(v);

export const fmtInt = (v: number | null | undefined) => fmt(v, 0);
export const fmtPct = (v: number | null | undefined, digits = 2) => (v == null ? "—" : `${fmt(v, digits)}%`);

/** Angka besar ringkas: 2,9 juta / 235,6 ribu */
export const fmtCompact = (v: number | null | undefined) => {
  if (v == null) return "—";
  const a = Math.abs(v);
  if (a >= 1e12) return `${fmt(v / 1e12, 1)} triliun`;
  if (a >= 1e9) return `${fmt(v / 1e9, 1)} miliar`;
  if (a >= 1e6) return `${fmt(v / 1e6, 1)} juta`;
  if (a >= 1e3) return `${fmt(v / 1e3, 1)} ribu`;
  return fmt(v, 0);
};

/** Format nilai sesuai jumlah desimal indikator. */
export const fmtValue = (v: number | null | undefined, digits: number, unit?: string) =>
  v == null ? "tidak tersedia" : `${fmt(v, digits)}${unit ? ` ${unit}` : ""}`;

/** Isi template narasi: "{{miskinMax2025.nama}}", "{{miskinJatim2010|pct}}", "{{x|int}}" */
export function fillTemplate(text: string, facts: Record<string, unknown>): string {
  return text.replace(/\{\{\s*([\w.]+)(?:\|(\w+))?\s*\}\}/g, (_, path: string, f?: string) => {
    const v = path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], facts);
    if (typeof v === "number") {
      if (f === "pct") return fmtPct(v);
      if (f === "int") return fmtInt(v);
      if (f === "compact") return fmtCompact(v);
      if (f === "x") return `${fmt(v, 1)}×`;
      return fmt(v, Number.isInteger(v) ? 0 : 2);
    }
    return v == null ? `[${path}?]` : String(v);
  });
}
