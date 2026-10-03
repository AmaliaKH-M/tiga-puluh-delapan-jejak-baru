import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { INDICATORS, projectYears } from "@/data/dataConfig";
import { closing } from "@/data/narrativeConfig";
import { useData } from "@/lib/data";

/** Tombol "Metodologi & Sumber Data": sumber, definisi, satuan, pra-pemrosesan, catatan metodologis. */
export function MethodologyDialog({ compact = false }: { compact?: boolean }) {
  const d = useData();
  const { DATA_YEAR_START, DATA_YEAR_END } = projectYears(d);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={compact ? "ghost" : "outline"} size={compact ? "sm" : "default"}>
          <BookOpen className="h-4 w-4" />{compact ? <span className="hidden sm:inline">Metodologi</span> : "Metodologi & Sumber Data"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-display text-3xl">Metodologi & Sumber Data</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">
          Periode inti {DATA_YEAR_START}–{DATA_YEAR_END} (dihitung otomatis dari ketersediaan data). Unit analisis: 38 kabupaten/kota Jawa Timur.
        </DialogDescription>

        <h4 className="mt-8 eyebrow">Indikator</h4>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="py-2 pr-3">Indikator</th><th className="pr-3">Satuan</th><th className="pr-3">Definisi</th><th>Catatan</th></tr>
            </thead>
            <tbody>
              {Object.values(INDICATORS).map((m) => (
                <tr key={m.id} className="border-t border-border/70 align-top">
                  <td className="py-2 pr-3 font-medium">{m.label}</td>
                  <td className="pr-3 text-muted-foreground">{m.unit || "—"}</td>
                  <td className="pr-3">{m.definition}</td>
                  <td className="text-muted-foreground">{m.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mt-8 eyebrow">Sumber</h4>
        <ul className="mt-3 space-y-2 text-sm">
          {d.sources.filter((s) => s.judul).map((s) => (
            <li key={s.id} className="border-t border-border/60 pt-2">
              <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs">{s.id}</span>
              {s.sumber}, “{s.judul}”, tahun data {s.tahun || "—"}{s.akses ? `, diakses ${s.akses}` : ""}.{" "}
              {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-dotted">Buka sumber</a> : <em className="text-muted-foreground">URL belum diisi</em>}
            </li>
          ))}
        </ul>

        <h4 className="mt-8 eyebrow">Pra-pemrosesan</h4>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
          <li>Seluruh pengolahan dilakukan dengan skrip Python yang dapat direproduksi (folder <code>pipeline/</code>); setiap koreksi tercatat di <code>pipeline/config/corrections.csv</code>.</li>
          <li>PDRB menurut lapangan usaha diekstrak langsung dari PDF publikasi BPS; ADHB Kota Batu direkonstruksi (ADHK × indeks implisit) karena tabel lampirannya tercetak bergeser satu kolom.</li>
          <li>PCA {d.pca.year}: {d.pca.variables.length} variabel distandardisasi (z-score); PDRB per kapita dan kepadatan ditransformasi log. IPM tidak dimasukkan karena merupakan komposit dari komponennya. Klaster: Ward pada z-score.</li>
          <li>Nilai kosong dibiarkan kosong (tidak diimputasi). Pencilan tidak dihapus.</li>
          <li>Pemetaan sektor (dibuat sendiri): Primer = A–B; Sekunder = C–F; Tersier = G–U (17 kategori PDRB).</li>
        </ul>

        <h4 className="mt-8 eyebrow">Keterbatasan</h4>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{closing.limitations.map((l) => <li key={l}>{l}</li>)}</ul>

        <h4 className="mt-8 eyebrow">Data non-BPS & atribusi</h4>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
          <li>Batas wilayah: ghapsara/indonesia-atlas (turunan data gispedia 2016), disederhanakan. Bukan data BPS. Lisensi tidak dinyatakan secara eksplisit oleh repository sumber (<em>license: not explicitly specified in source repository</em>). Kode wilayah BPS ditambahkan oleh penulis.</li>
          <li>Ilustrasi kerumunan: Open Peeps (Pablo Stanley, CC0). Animasi diadaptasi dari komponen Skiper UI (Skiper 39).</li>
          <li>Ornamen Jawa Timur di halaman pembuka: <em>sumber & lisensi diisi penulis</em>.</li>
        </ul>

        <h4 className="mt-8 eyebrow">Deklarasi penggunaan AI</h4>
        <p className="mt-2 text-sm">{closing.aiDeclaration}</p>
      </DialogContent>
    </Dialog>
  );
}
