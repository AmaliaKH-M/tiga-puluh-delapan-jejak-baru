import * as d3 from "d3";

export type ClassMethod = "quantile" | "equal";

/** Batas kelas untuk choropleth (5 kelas). */
export function classBreaks(values: number[], method: ClassMethod, k = 5): number[] {
  const v = values.filter((x) => Number.isFinite(x)).sort(d3.ascending);
  if (!v.length) return [];
  if (method === "quantile") return d3.range(1, k).map((i) => d3.quantileSorted(v, i / k) as number);
  const [lo, hi] = [v[0], v[v.length - 1]];
  return d3.range(1, k).map((i) => lo + ((hi - lo) * i) / k);
}

export function median(values: number[]) {
  return d3.median(values.filter(Number.isFinite)) ?? NaN;
}

/** Skala akar luas untuk proportional symbol (luas lingkaran ∝ nilai). */
export function sqrtRadius(max: number, rMax: number) {
  return d3.scaleSqrt().domain([0, max]).range([0, rMax]);
}
