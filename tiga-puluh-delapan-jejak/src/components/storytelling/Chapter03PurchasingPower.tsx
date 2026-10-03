import { useState } from "react";
import { chapters } from "@/data/narrativeConfig";
import { ChapterShell } from "@/components/layout/ChapterShell";
import { ChartFrame } from "@/components/layout/ChartFrame";
import { SourceNote } from "@/components/layout/SourceNote";
import { YearSlider } from "@/components/layout/Controls";
import { PurchasingPowerStrip } from "@/components/charts/PurchasingPowerStrip";
import { PPKScatter } from "@/components/charts/PPKScatter";
import { FoodShareBars } from "@/components/charts/FoodShareBars";
import { useData, commonYears } from "@/lib/data";
import { trendYears } from "@/data/dataConfig";

/** BAB 3 — Daya beli: ranking PPK, PPK vs kemiskinan, komposisi pengeluaran. */
export function Chapter03PurchasingPower() {
  const d = useData();
  const yPPK = commonYears(d, ["pengeluaran_per_kapita_disesuaikan", "persen_penduduk_miskin"]);
  const yFood = trendYears(d, "pengeluaran_makanan");
  const [year, setYear] = useState(yPPK.at(-1)!);
  const [yearF, setYearF] = useState(yFood.at(-1)!);
  return (
    <ChapterShell text={chapters.purchasing}>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title={`Pengeluaran per kapita disesuaikan, ${year}`} subtitle="Ribu rupiah/orang/tahun · terurut · garis = Jawa Timur"
          controls={<YearSlider years={yPPK} value={year} onChange={setYear} />}
          footer={<SourceNote ids={["D05"]} note="Komponen IPM; bukan ukuran kelas menengah." />}>
          <PurchasingPowerStrip year={year} />
        </ChartFrame>
        <div className="space-y-6">
          <ChartFrame title="Pengeluaran per kapita dan kemiskinan" subtitle={`${year} · tiap titik = satu kab/kota · keterkaitan, bukan sebab-akibat`}
            footer={<SourceNote ids={["D05", "D03"]} />}>
            <PPKScatter year={year} />
          </ChartFrame>
          <ChartFrame title={`Komposisi pengeluaran, ${yearF}`} subtitle={`Porsi makanan vs bukan makanan · data ${yFood[0]}–${yFood.at(-1)}`}
            controls={<YearSlider years={yFood} value={yearF} onChange={setYearF} />}
            footer={<SourceNote ids={["D18"]} note="Pengeluaran total = makanan + bukan makanan (nominal, rupiah/kapita/bulan)." />}>
            <FoodShareBars year={yearF} />
          </ChartFrame>
        </div>
      </div>
    </ChapterShell>
  );
}
