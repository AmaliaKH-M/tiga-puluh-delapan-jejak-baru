import { useMemo, useState } from "react";
import * as d3 from "d3";
import { chapters } from "@/data/narrativeConfig";
import { ChapterShell } from "@/components/layout/ChapterShell";
import { ChartFrame } from "@/components/layout/ChartFrame";
import { SourceNote } from "@/components/layout/SourceNote";
import { RegionCard } from "@/components/layout/RegionCard";
import { SelectBox, Segmented, Toggle, YearSlider } from "@/components/layout/Controls";
import { EastJavaMap } from "@/components/map/EastJavaMap";
import { ClassLegend, SymbolLegend } from "@/components/map/MapLegend";
import { useData, value, regionName, flag, commonYears } from "@/lib/data";
import { classBreaks, type ClassMethod } from "@/lib/statistics";
import { ATLAS_INDICATORS, SEQ5, SYMBOL_INDICATORS, ind, trendYears } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";
import { useSize } from "@/hooks/useSize";

/** BAB 5 — Atlas interaktif: pilih indikator & tahun, kontrol layer (choropleth/simbol/label), zoom/pan, klasifikasi. */
export function Chapter05Geospatial() {
  const d = useData();
  const [indicator, setIndicator] = useState("persen_penduduk_miskin");
  const [symbolInd, setSymbolInd] = useState("jumlah_penduduk_miskin");
  const [method, setMethod] = useState<ClassMethod>("quantile");
  const [layers, setLayers] = useState({ choropleth: true, symbols: true, labels: false });
  const meta = ind(indicator);
  const years = commonYears(d, [indicator]).filter((y) => trendYears(d, indicator).includes(y));
  const [yearRaw, setYear] = useState(2025);
  const year = years.includes(yearRaw) ? yearRaw : years.at(-1)!;
  const symYears = trendYears(d, symbolInd);
  const symYear = symYears.includes(year) ? year : symYears.at(-1)!;

  const breaks = useMemo(() => classBreaks(d.regions.map((r) => value(d, indicator, r.kode, year) ?? NaN), method), [d, indicator, year, method]);
  const scale = d3.scaleThreshold<number, string>().domain(breaks).range(SEQ5);
  const [ref, { width }] = useSize<HTMLDivElement>();
  const rMax = Math.max(12, Math.min(28, width / 30));
  const symMax = d3.max(d.regions, (r) => value(d, symbolInd, r.kode, symYear) ?? 0) ?? 1;
  const r = d3.scaleSqrt().domain([0, symMax]).range([0, rMax]);
  const symMeta = ind(symbolInd);
  const legendVals = symbolInd === "jumlah_penduduk" ? [500000, 1500000, 2900000] : [50, 150, 250];

  return (
    <ChapterShell text={chapters.atlas}>
      <ChartFrame
        title={`${meta.label}, ${year}`}
        subtitle={`${meta.unit || "indeks"} · periode tersedia ${years[0]}–${years.at(-1)}${meta.note ? ` · ${meta.note}` : ""}`}
        controls={
          <>
            <SelectBox label="Warna" value={indicator} onChange={setIndicator}
              options={ATLAS_INDICATORS.map((i) => ({ value: i, label: ind(i).label }))} />
            <SelectBox label="Lingkaran" value={symbolInd} onChange={setSymbolInd}
              options={SYMBOL_INDICATORS.map((i) => ({ value: i, label: ind(i).label }))} />
          </>
        }
        footer={<SourceNote ids={[...meta.sources, ...symMeta.sources]} extra="Batas wilayah: ghapsara/indonesia-atlas (non-BPS, lisensi tidak dinyatakan eksplisit)" />}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <YearSlider years={years} value={year} onChange={setYear} />
          <Segmented value={method} onChange={setMethod} options={[{ value: "quantile", label: "Kuantil" }, { value: "equal", label: "Interval sama" }]} />
          <span className="text-xs text-muted-foreground">Layer:</span>
          <Toggle label="Choropleth" checked={layers.choropleth} onChange={(b) => setLayers({ ...layers, choropleth: b })} />
          <Toggle label="Lingkaran" checked={layers.symbols} onChange={(b) => setLayers({ ...layers, symbols: b })} />
          <Toggle label="Label" checked={layers.labels} onChange={(b) => setLayers({ ...layers, labels: b })} />
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <div ref={ref} className="lg:col-span-9">
            <EastJavaMap aspect={0.6}
              showChoropleth={layers.choropleth} showSymbols={layers.symbols} showLabels={layers.labels}
              fill={(k) => { const v = value(d, indicator, k, year); return v == null ? undefined : scale(v); }}
              symbol={(k) => r(value(d, symbolInd, k, symYear) ?? 0)}
              tooltip={(k) => (
                <>
                  <p className="font-semibold">{regionName(d, k)}</p>
                  <p>{meta.short} {year}: <b>{fmt(value(d, indicator, k, year), meta.digits)}</b> {meta.unit}</p>
                  <p>{symMeta.short} {symYear}: {fmt(value(d, symbolInd, k, symYear), symMeta.digits)} {symMeta.unit}</p>
                  {flag(d, indicator, k, year) && <p className="text-muted-foreground">Catatan: {flag(d, indicator, k, year)!.replaceAll("_", " ")}</p>}
                </>
              )}
            />
          </div>
          <div className="space-y-5 lg:col-span-3">
            {layers.choropleth && <ClassLegend colors={SEQ5} breaks={breaks} digits={meta.digits === 0 ? 0 : 1} unit={meta.unit} title={meta.short} method={method === "quantile" ? "kuantil (kelas terisi seimbang)" : "interval sama (jarak nilai)"} />}
            {layers.symbols && <SymbolLegend values={legendVals.filter((v) => v <= symMax * 1.05)} radius={r} title={`${symMeta.short} (${symYear})`} unit={symMeta.unit} />}
            <RegionCard year={year} />
          </div>
        </div>
      </ChartFrame>
    </ChapterShell>
  );
}
