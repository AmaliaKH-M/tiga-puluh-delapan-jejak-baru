import { useMemo } from "react";
import * as d3 from "d3";
import { EastJavaMap } from "@/components/map/EastJavaMap";
import { SymbolLegend } from "@/components/map/MapLegend";
import { useData, value, regionName, validYears } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { fmt, fmtPct } from "@/lib/formatting";

const IND = "jumlah_penduduk_miskin";

/** Simbol proporsional jumlah penduduk miskin (angka absolut; luas lingkaran ∝ nilai). */
export function PovertySymbolMap({ year }: { year: number }) {
  const d = useData();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const rMax = Math.max(14, Math.min(30, width / 26));
  const max = useMemo(() => d3.max(validYears(d, IND).flatMap((y) => d.regions.map((r) => value(d, IND, r.kode, y) ?? 0))) ?? 1, [d]);
  const r = d3.scaleSqrt().domain([0, max]).range([0, rMax]);
  return (
    <div ref={ref}>
      <EastJavaMap
        showChoropleth={false}
        symbol={(k) => r(value(d, IND, k, year) ?? 0)}
        tooltip={(k) => (
          <>
            <p className="font-semibold">{regionName(d, k)}</p>
            <p>Jumlah penduduk miskin {year}: <b>{fmt(value(d, IND, k, year), 2)} ribu jiwa</b></p>
            <p className="text-muted-foreground">Persentase: {fmtPct(value(d, "persen_penduduk_miskin", k, year))}</p>
          </>
        )}
      />
      <div className="mt-3">
        <SymbolLegend values={[50, 150, 250]} radius={r} title="Jumlah penduduk miskin" unit="ribu jiwa" />
      </div>
    </div>
  );
}
