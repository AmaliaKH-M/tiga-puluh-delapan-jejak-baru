import { useState } from "react";
import { chapters } from "@/data/narrativeConfig";
import { ChapterShell } from "@/components/layout/ChapterShell";
import { ChartFrame } from "@/components/layout/ChartFrame";
import { SourceNote } from "@/components/layout/SourceNote";
import { Segmented } from "@/components/layout/Controls";
import { Button } from "@/components/ui/button";
import { PDRBTreemap } from "@/components/charts/PDRBTreemap";
import { PDRBSunburst } from "@/components/charts/PDRBSunburst";
import { useData, regionName } from "@/lib/data";
import { useSelection } from "@/store/selection";

/**
 * BAB 6 — Hierarki PDRB: Jawa Timur → Kab/Kota → Sektor → Lapangan Usaha.
 * Treemap & sunburst berbagi fokus drill-down yang sama.
 */
export function Chapter06EconomicStructure() {
  const d = useData();
  const { selected } = useSelection();
  // pertumbuhan butuh tahun sebelumnya → tahun pertama data tidak bisa diberi warna
  const years = d.pdrb.years.slice(1);
  const [year, setYear] = useState(years.at(-1)!);
  const [focus, setFocus] = useState("root");
  const status = d.pdrb.status[String(year)];
  const recon = d.pdrb.reconstructed.map((k) => regionName(d, k)).join(", ");
  const note = `ADHB = atas dasar harga berlaku; ADHK = atas dasar harga konstan 2010. ${status ? `Angka ${year} ${status}. ` : ""}ADHB ${recon} direkonstruksi (ADHK × indeks implisit) karena tabel lampiran publikasi tercetak bergeser satu kolom.`;
  return (
    <ChapterShell text={chapters.economy}>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={String(year)} onChange={(v) => setYear(+v)} options={years.map((y) => ({ value: String(y), label: `${y}${d.pdrb.status[String(y)] ? "*" : ""}` }))} />
        {selected && focus !== selected && (
          <Button size="sm" variant="soft" onClick={() => setFocus(selected)}>Buka {regionName(d, selected)}</Button>
        )}
        {focus !== "root" && <Button size="sm" variant="outline" onClick={() => setFocus("root")}>Kembali ke Jawa Timur</Button>}
        <span className="text-xs text-muted-foreground">* 2023 sementara, 2024 sangat sementara</span>
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <ChartFrame className="xl:col-span-7" title={`Treemap PDRB, ${year}`} subtitle="Ukuran = nilai PDRB ADHB · warna = pertumbuhan riil · klik untuk turun satu level"
          footer={<SourceNote ids={["D16", "D17", "D22"]} note={note} />}>
          <PDRBTreemap year={year} focus={focus} onFocus={setFocus} />
        </ChartFrame>
        <ChartFrame className="xl:col-span-5" title={`Sunburst PDRB, ${year}`} subtitle="Sudut = nilai PDRB ADHB · warna = sektor · klik cincin untuk zoom"
          footer={<SourceNote ids={["D16", "D22"]} />}>
          <PDRBSunburst year={year} focus={focus} onFocus={setFocus} />
        </ChartFrame>
      </div>
    </ChapterShell>
  );
}
