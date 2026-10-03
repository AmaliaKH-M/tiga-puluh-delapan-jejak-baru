import { useData, value, regionName } from "@/lib/data";
import { useSelection } from "@/store/selection";
import { ind } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";

const ROWS = ["jumlah_penduduk", "kepadatan_penduduk", "persen_penduduk_miskin", "pengeluaran_per_kapita_disesuaikan", "ipm", "tpt"];

/** Ringkasan statistik wilayah terpilih (berubah saat wilayah diklik di visual mana pun). */
export function RegionCard({ year = 2025 }: { year?: number }) {
  const d = useData();
  const { selected, hovered } = useSelection();
  const k = hovered ?? selected;
  if (!k) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        Pilih atau arahkan kursor ke satu wilayah untuk melihat ringkasannya ({year}).
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="eyebrow">{year}</p>
      <h4 className="mt-1 font-display text-3xl leading-tight">{regionName(d, k)}</h4>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {ROWS.map((r) => {
          const m = ind(r);
          return (
            <div key={r}>
              <dt className="text-xs text-muted-foreground">{m.short}</dt>
              <dd className="font-medium">{fmt(value(d, r, k, year), m.digits)} <span className="text-xs text-muted-foreground">{m.unit}</span></dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
