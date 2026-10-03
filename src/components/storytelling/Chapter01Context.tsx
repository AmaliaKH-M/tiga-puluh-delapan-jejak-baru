import { useMemo } from "react";
import * as d3 from "d3";
import { chapters } from "@/data/narrativeConfig";
import { ChapterShell } from "@/components/layout/ChapterShell";
import { ChartFrame } from "@/components/layout/ChartFrame";
import { SourceNote } from "@/components/layout/SourceNote";
import { RegionCard } from "@/components/layout/RegionCard";
import { EastJavaMap } from "@/components/map/EastJavaMap";
import { ClassLegend } from "@/components/map/MapLegend";
import { useData, value, regionName, provValue } from "@/lib/data";
import { classBreaks } from "@/lib/statistics";
import { SEQ5, trendYears } from "@/data/dataConfig";
import { fmt, fmtCompact } from "@/lib/formatting";

/** BAB 1 — 38 kabupaten/kota, 38 konteks. Peta kepadatan + kartu ringkas wilayah. */
export function Chapter01Context() {
  const d = useData();
  const year = trendYears(d, "kepadatan_penduduk").at(-1)!;
  const breaks = useMemo(() => classBreaks(d.regions.map((r) => value(d, "kepadatan_penduduk", r.kode, year) ?? NaN), "quantile"), [d, year]);
  const scale = d3.scaleThreshold<number, string>().domain(breaks).range(SEQ5);
  const nKab = d.regions.filter((r) => r.jenis === "Kabupaten").length;
  return (
    <ChapterShell text={chapters.context}>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-6 lg:col-span-4">
          <div>
            <p className="font-display text-[8rem] leading-none text-primary md:text-[10rem]">{d.regions.length}</p>
            <p className="text-lg">kabupaten dan kota</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div><p className="font-display text-3xl">{nKab}</p><p className="text-muted-foreground">kabupaten</p></div>
              <div><p className="font-display text-3xl">{d.regions.length - nKab}</p><p className="text-muted-foreground">kota</p></div>
              <div><p className="font-display text-3xl">{fmtCompact(provValue(d, "jumlah_penduduk", year))}</p><p className="text-muted-foreground">jiwa ({year})</p></div>
            </div>
          </div>
          <RegionCard year={year} />
        </div>
        <ChartFrame className="lg:col-span-8" title={`Kepadatan penduduk, ${year}`} subtitle="Jiwa per km² · kuantil 5 kelas · arahkan kursor atau klik wilayah"
          footer={<SourceNote ids={["D14", "D13"]} extra="Batas wilayah: ghapsara/indonesia-atlas (non-BPS)" note="Kepadatan hanya ditampilkan untuk tahun dengan luas acuan konsisten (2022–2025)." />}>
          <EastJavaMap reveal
            fill={(k) => { const v = value(d, "kepadatan_penduduk", k, year); return v == null ? undefined : scale(v); }}
            showSymbols={false}
            tooltip={(k) => (
              <>
                <p className="font-semibold">{regionName(d, k)}</p>
                <p>Penduduk: {fmt(value(d, "jumlah_penduduk", k, year), 0)} jiwa</p>
                <p>Kepadatan: <b>{fmt(value(d, "kepadatan_penduduk", k, year), 0)} jiwa/km²</b></p>
              </>
            )}
          />
          <div className="mt-3 max-w-md"><ClassLegend colors={SEQ5} breaks={breaks} digits={0} unit="jiwa/km²" title="Kepadatan" method="kuantil" /></div>
        </ChartFrame>
      </div>
    </ChapterShell>
  );
}
