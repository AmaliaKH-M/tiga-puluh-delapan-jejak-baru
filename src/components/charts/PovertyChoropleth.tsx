import { useMemo } from "react";
import * as d3 from "d3";
import { EastJavaMap } from "@/components/map/EastJavaMap";
import { ClassLegend } from "@/components/map/MapLegend";
import { useData, value, regionName, flag, validYears } from "@/lib/data";
import { classBreaks } from "@/lib/statistics";
import { SEQ5 } from "@/data/dataConfig";
import { fmtPct } from "@/lib/formatting";

const IND = "persen_penduduk_miskin";

/**
 * Choropleth % penduduk miskin. Batas kelas TETAP lintas tahun (kuantil dari seluruh nilai
 * 2010–2025) agar perubahan warna antar tahun mencerminkan perubahan nilai.
 */
export function PovertyChoropleth({ year, aspect, zoomable = true }: { year: number; aspect?: number; zoomable?: boolean }) {
  const d = useData();
  const breaks = useMemo(() => {
    const ys = validYears(d, IND);
    return classBreaks(ys.flatMap((y) => d.regions.map((r) => value(d, IND, r.kode, y) ?? NaN)), "quantile");
  }, [d]);
  const scale = d3.scaleThreshold<number, string>().domain(breaks).range(SEQ5);
  return (
    <div>
      <EastJavaMap
        aspect={aspect} zoomable={zoomable}
        fill={(k) => { const v = value(d, IND, k, year); return v == null ? undefined : scale(v); }}
        showSymbols={false}
        tooltip={(k) => (
          <>
            <p className="font-semibold">{regionName(d, k)}</p>
            <p>% penduduk miskin {year}: <b>{fmtPct(value(d, IND, k, year))}</b></p>
            {flag(d, IND, k, year)?.includes("perlu_verifikasi") && <p className="text-muted-foreground">Nilai perlu verifikasi</p>}
          </>
        )}
      />
      <div className="mt-3 max-w-sm">
        <ClassLegend colors={SEQ5} breaks={breaks} digits={1} unit="%" title="Penduduk miskin" method="kuantil, batas tetap 2010–2025" />
      </div>
    </div>
  );
}
