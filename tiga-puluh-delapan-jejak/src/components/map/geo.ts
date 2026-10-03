import * as d3 from "d3";
import type { Feature, Geometry, Polygon } from "geojson";
import type { Geo, RegionProps } from "@/lib/data";

/**
 * Bingkai peta: daratan Jawa Timur + Madura + Bawean + Kepulauan Kangean.
 * Tiga pulau kecil Kepulauan Masalembu (Sumenep, lintang ±5,0–5,6° LS) berada di luar bingkai
 * agar daratan tidak terlalu kecil; datanya tetap melekat pada Kabupaten Sumenep.
 */
export const MAP_FRAME: [[number, number], [number, number]] = [[110.85, -8.85], [116.3, -5.68]];
export const FRAME_NOTE = "Kepulauan Masalembu (Kab. Sumenep) berada di luar bingkai peta.";

/** Proyeksi Mercator yang dipaskan ke bingkai di atas. */
export function makeProjection(_geo: Geo, width: number, height: number, pad = 10) {
  const [[x0, y0], [x1, y1]] = MAP_FRAME;
  const frame = { type: "MultiPoint" as const, coordinates: [[x0, y0], [x1, y1], [x0, y1], [x1, y0]] };
  return d3.geoMercator().fitExtent([[pad, pad], [width - pad, height - pad]], frame);
}

/** Titik pusat poligon terbesar (agar simbol tidak jatuh di laut untuk wilayah kepulauan). */
export function mainCentroid(f: Feature<Geometry, RegionProps>, path: d3.GeoPath): [number, number] {
  const g = f.geometry;
  if (g.type !== "MultiPolygon") return path.centroid(f);
  let best: Feature<Polygon> | null = null;
  let area = -1;
  for (const coords of g.coordinates) {
    const poly: Feature<Polygon> = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: coords } };
    const a = path.area(poly);
    if (a > area) { area = a; best = poly; }
  }
  return path.centroid(best!);
}
