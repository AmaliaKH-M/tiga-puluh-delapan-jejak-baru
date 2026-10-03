import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import * as d3 from "d3";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { asset } from "./utils";

/* ---------- Tipe data (lihat pipeline/src/06_export_web.py) ---------- */
export type Region = { kode: string; nama: string; singkat: string; jenis: "Kabupaten" | "Kota" };
type Packed = {
  data: Record<string, Record<string, Record<string, number | null>>>;
  flags: Record<string, Record<string, Record<string, string>>>;
  units: Record<string, string>;
};
type ProvincePacked = {
  data: Record<string, Record<string, number | null>>;
  flags: Record<string, Record<string, string>>;
  units: Record<string, string>;
};
export type PdrbData = {
  years: number[];
  status: Record<string, string>;
  unit: string;
  lu: { kode: string; nama: string; sektor: "Primer" | "Sekunder" | "Tersier" }[];
  reconstructed: string[];
  data: Record<string, Record<string, Record<string, [number, number]>>>;
};
export type PcaData = {
  year: number;
  variables: string[];
  log_transformed: string[];
  explained: number[];
  loadings: Record<string, [number, number]>;
  scores: Record<string, [number, number]>;
  cluster: Record<string, number>;
  clusters: { id: number; idx: number; label: string; n: number; ciri: string[]; anggota: string[] }[];
  outliers: string[];
  heatmap: { row_order: string[]; col_order: string[]; z: Record<string, number[]> };
  raw: Record<string, Record<string, number | null>>;
};
export type Source = {
  id: string; data: string; judul: string; sumber: string; url: string;
  tahun: string; akses: string; satuan: string; catatan: string | null;
};
export type RegionProps = { kode_wilayah: string; nama_wilayah: string; jenis_wilayah: string };
export type Geo = FeatureCollection<Geometry, RegionProps>;

export type AppData = {
  regions: Region[];
  indicators: Packed;
  province: ProvincePacked;
  pdrb: PdrbData;
  pca: PcaData;
  facts: Record<string, unknown>;
  sources: Source[];
  geo: Geo;
};

/* ---------- GeoJSON: pastikan arah ring sesuai konvensi d3 ---------- */
function rewind(geo: Geo): Geo {
  // d3-geo memakai geometri sferis: ring luar harus searah jarum jam.
  // Jika luas fitur > setengah bola, urutannya terbalik → balikkan setiap ring.
  const flip = (f: Feature<Geometry, RegionProps>) => {
    if (d3.geoArea(f) <= 2 * Math.PI) return f;
    const g = f.geometry;
    if (g.type === "Polygon") g.coordinates = g.coordinates.map((r) => [...r].reverse());
    if (g.type === "MultiPolygon") g.coordinates = g.coordinates.map((p) => p.map((r) => [...r].reverse()));
    return f;
  };
  return { ...geo, features: geo.features.map(flip) };
}

async function loadAll(): Promise<AppData> {
  const get = <T,>(f: string) => fetch(asset(`data/${f}`)).then((r) => {
    if (!r.ok) throw new Error(`Gagal memuat ${f} (${r.status})`);
    return r.json() as Promise<T>;
  });
  const [regions, indicators, province, pdrb, pca, facts, sources, geo] = await Promise.all([
    get<Region[]>("regions.json"),
    get<Packed>("indicators.json"),
    get<ProvincePacked>("province.json"),
    get<PdrbData>("pdrb.json"),
    get<PcaData>("pca.json"),
    get<Record<string, unknown>>("facts.json"),
    get<Source[]>("sources.json"),
    get<Geo>("d20_batas_kabkota_jatim.geojson"),
  ]);
  if (regions.length !== 38 || geo.features.length !== 38) throw new Error("Data wilayah tidak 38 unit");
  return { regions, indicators, province, pdrb, pca, facts, sources, geo: rewind(geo) };
}

/* ---------- Provider & hook ---------- */
const Ctx = createContext<AppData | null>(null);
type State = { data: AppData | null; error: string | null };

export function DataProvider({ children, fallback }: { children: ReactNode; fallback: (s: State) => ReactNode }) {
  const [state, setState] = useState<State>({ data: null, error: null });
  useEffect(() => {
    loadAll().then((data) => setState({ data, error: null })).catch((e) => setState({ data: null, error: String(e) }));
  }, []);
  if (!state.data) return createElement("div", null, fallback(state));
  return createElement(Ctx.Provider, { value: state.data }, children);
}

export function useData(): AppData {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData harus di dalam DataProvider");
  return v;
}

/* ---------- Helper akses ---------- */
export function value(d: AppData, ind: string, kode: string, year: number): number | null {
  return d.indicators.data[ind]?.[kode]?.[String(year)] ?? null;
}
export function flag(d: AppData, ind: string, kode: string, year: number): string | undefined {
  return d.indicators.flags[ind]?.[kode]?.[String(year)];
}
export function provValue(d: AppData, ind: string, year: number): number | null {
  return d.province.data[ind]?.[String(year)] ?? null;
}
export function regionName(d: AppData, kode: string) {
  return d.regions.find((r) => r.kode === kode)?.nama ?? kode;
}

/** Tahun di mana indikator tersedia untuk ke-38 wilayah. */
export function validYears(d: AppData, ind: string, excludeFlags: string[] = []): number[] {
  const byKode = d.indicators.data[ind];
  if (!byKode) return [];
  const years = new Set<number>();
  Object.values(byKode).forEach((ys) => Object.keys(ys).forEach((y) => years.add(+y)));
  return [...years].sort().filter((y) =>
    d.regions.every((r) => {
      const v = byKode[r.kode]?.[String(y)];
      const f = d.indicators.flags[ind]?.[r.kode]?.[String(y)] ?? "";
      return v != null && !excludeFlags.some((x) => f.includes(x));
    }),
  );
}

/** Tahun yang valid bersama untuk sekumpulan indikator. */
export function commonYears(d: AppData, inds: string[], excludeFlags: string[] = []): number[] {
  return inds.map((i) => validYears(d, i, excludeFlags)).reduce((a, b) => a.filter((y) => b.includes(y)));
}

/** Nilai seluruh wilayah untuk satu indikator × tahun. */
export function cross(d: AppData, ind: string, year: number): Map<string, number | null> {
  return new Map(d.regions.map((r) => [r.kode, value(d, ind, r.kode, year)]));
}
