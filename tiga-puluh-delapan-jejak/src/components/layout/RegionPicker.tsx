import { X } from "lucide-react";
import { useData } from "@/lib/data";
import { useSelection } from "@/store/selection";

/** Pemilih kab/kota global — terhubung ke semua visual. */
export function RegionPicker({ compact = false }: { compact?: boolean }) {
  const { regions } = useData();
  const { selected, setSelected } = useSelection();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card pl-3 text-sm">
      {!compact && <span className="text-xs text-muted-foreground">Wilayah</span>}
      <select
        value={selected ?? ""} onChange={(e) => setSelected(e.target.value || null)}
        className="max-w-[190px] bg-transparent py-1.5 pr-1 focus:outline-none" aria-label="Pilih kabupaten/kota"
      >
        <option value="">Semua (38)</option>
        <optgroup label="Kabupaten">
          {regions.filter((r) => r.jenis === "Kabupaten").map((r) => <option key={r.kode} value={r.kode}>{r.nama}</option>)}
        </optgroup>
        <optgroup label="Kota">
          {regions.filter((r) => r.jenis === "Kota").map((r) => <option key={r.kode} value={r.kode}>{r.nama}</option>)}
        </optgroup>
      </select>
      {selected && (
        <button onClick={() => setSelected(null)} className="mr-1 rounded-full p-1 hover:bg-muted" aria-label="Hapus pilihan">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
