import { useState } from "react";
import { chapters } from "@/data/narrativeConfig";
import { ChapterShell } from "@/components/layout/ChapterShell";
import { ChartFrame } from "@/components/layout/ChartFrame";
import { SourceNote } from "@/components/layout/SourceNote";
import { SelectBox } from "@/components/layout/Controls";
import { SlopeChart } from "@/components/charts/SlopeChart";
import { SectorShareChange } from "@/components/charts/SectorShareChange";
import { PovertyChoropleth } from "@/components/charts/PovertyChoropleth";
import { useData } from "@/lib/data";
import { CHANGE_INDICATORS, ind, trendYears } from "@/data/dataConfig";

/** BAB 7 — Apa yang berubah: slope chart, peta sebelum–sesudah, pergeseran porsi lapangan usaha. */
export function Chapter07Change() {
  const d = useData();
  const [indicator, setIndicator] = useState("persen_penduduk_miskin");
  const meta = ind(indicator);
  const ys = trendYears(d, indicator);
  const py = trendYears(d, "persen_penduduk_miskin");
  return (
    <ChapterShell text={chapters.change}>
      <ChartFrame title={`${meta.label}: ${ys[0]} → ${ys.at(-1)}`} subtitle={`Periode mengikuti data yang metodenya konsisten${meta.note ? ` · ${meta.note}` : ""}`}
        controls={<SelectBox label="Indikator" value={indicator} onChange={setIndicator}
          options={CHANGE_INDICATORS.map((i) => { const y = trendYears(d, i); return { value: i, label: `${ind(i).label} (${y[0]}–${y.at(-1)})` }; })} />}
        footer={<SourceNote ids={meta.sources} />}>
        <SlopeChart indicator={indicator} />
      </ChartFrame>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartFrame title={`Persentase penduduk miskin, ${py[0]}`} subtitle="Kelas warna sama dengan peta di sebelahnya" footer={<SourceNote ids={["D03"]} />}>
          <PovertyChoropleth year={py[0]} zoomable={false} aspect={0.6} />
        </ChartFrame>
        <ChartFrame title={`Persentase penduduk miskin, ${py.at(-1)}`} subtitle="Kelas warna tetap lintas tahun" footer={<SourceNote ids={["D03"]} />}>
          <PovertyChoropleth year={py.at(-1)!} zoomable={false} aspect={0.6} />
        </ChartFrame>
      </div>

      <ChartFrame title={`Porsi lapangan usaha terhadap PDRB, ${d.pdrb.years[0]} vs ${d.pdrb.years.at(-1)}`}
        subtitle="Persen PDRB ADHB · Jawa Timur, atau wilayah yang sedang dipilih"
        footer={<SourceNote ids={["D16", "D22"]} note="Angka 2024 sangat sementara." />}>
        <SectorShareChange />
      </ChartFrame>
    </ChapterShell>
  );
}
