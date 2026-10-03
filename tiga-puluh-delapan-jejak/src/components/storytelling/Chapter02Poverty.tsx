import { useState } from "react";
import { chapters } from "@/data/narrativeConfig";
import { ChapterShell } from "@/components/layout/ChapterShell";
import { ChartFrame } from "@/components/layout/ChartFrame";
import { SourceNote } from "@/components/layout/SourceNote";
import { YearSlider } from "@/components/layout/Controls";
import { RegionPicker } from "@/components/layout/RegionPicker";
import { PovertyTrend } from "@/components/charts/PovertyTrend";
import { PovertyChoropleth } from "@/components/charts/PovertyChoropleth";
import { PovertySymbolMap } from "@/components/charts/PovertySymbolMap";
import { useData } from "@/lib/data";
import { trendYears } from "@/data/dataConfig";

/** BAB 2 — Jejak kemiskinan: tren, choropleth (persentase), simbol proporsional (jumlah). */
export function Chapter02Poverty() {
  const d = useData();
  const years = trendYears(d, "persen_penduduk_miskin");
  const [year, setYear] = useState(years.at(-1)!);
  return (
    <ChapterShell text={chapters.poverty}>
      <ChartFrame
        title="Persentase penduduk miskin, Jawa Timur dan 38 kabupaten/kota"
        subtitle={`Persen · provinsi 2005–${years.at(-1)}, kab/kota ${years[0]}–${years.at(-1)}`}
        controls={<RegionPicker />}
        footer={<SourceNote ids={["D01", "D03"]} note="Nilai provinsi 2005–2009 belum memiliki tabel sumber terdokumentasi; ditampilkan putus-putus sebagai konteks." />}
      >
        <PovertyTrend />
      </ChartFrame>

      <div className="sticky top-14 z-20 rounded-full border border-border bg-background/90 px-4 py-2 backdrop-blur">
        <YearSlider years={years} value={year} onChange={setYear} label="Tahun peta" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title={`Persentase penduduk miskin, ${year}`} subtitle="Choropleth · rasio (persen), bukan angka absolut"
          footer={<SourceNote ids={["D03"]} />}>
          <PovertyChoropleth year={year} />
        </ChartFrame>
        <ChartFrame title={`Jumlah penduduk miskin, ${year}`} subtitle="Simbol proporsional · luas lingkaran ∝ ribu jiwa"
          footer={<SourceNote ids={["D04"]} />}>
          <PovertySymbolMap year={year} />
        </ChartFrame>
      </div>
    </ChapterShell>
  );
}
