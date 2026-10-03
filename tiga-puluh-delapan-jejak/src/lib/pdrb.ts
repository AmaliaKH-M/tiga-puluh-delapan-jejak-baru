import * as d3 from "d3";
import type { AppData } from "./data";

/** Node hierarki PDRB: Jawa Timur → Kab/Kota → Sektor → Lapangan Usaha. */
export type PNode = {
  id: string;          // path unik, mis. "3578/Tersier/G"
  name: string;
  level: 0 | 1 | 2 | 3;
  kode?: string;       // kode wilayah (level ≥1)
  sektor?: string;     // level ≥2
  lu?: string;         // level 3
  adhb?: number;       // nilai (hanya daun)
  adhk?: number;
  adhkPrev?: number;
  children?: PNode[];
};

export function buildTree(d: AppData, year: number): PNode {
  const prev = String(year - 1);
  const children: PNode[] = d.regions.map((r) => {
    const yr = d.pdrb.data[r.kode][String(year)];
    const yp = d.pdrb.data[r.kode][prev];
    const sectors = ["Primer", "Sekunder", "Tersier"].map((s) => ({
      id: `${r.kode}/${s}`, name: s, level: 2 as const, kode: r.kode, sektor: s,
      children: d.pdrb.lu.filter((l) => l.sektor === s).map((l) => ({
        id: `${r.kode}/${s}/${l.kode}`, name: l.nama, level: 3 as const, kode: r.kode, sektor: s, lu: l.kode,
        adhb: yr[l.kode][0], adhk: yr[l.kode][1], adhkPrev: yp ? yp[l.kode][1] : undefined,
      })),
    }));
    return { id: r.kode, name: r.nama, level: 1 as const, kode: r.kode, children: sectors };
  });
  return { id: "root", name: "Jawa Timur", level: 0, children };
}

/** Hierarki d3 dengan nilai (ADHB) dan pertumbuhan riil (ADHK) teragregasi per node. */
export function toHierarchy(root: PNode) {
  const h = d3.hierarchy(root).sum((n) => n.adhb ?? 0).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  h.each((n) => {
    const leaves = n.leaves();
    const k = d3.sum(leaves, (l) => l.data.adhk ?? 0);
    const kp = d3.sum(leaves, (l) => l.data.adhkPrev ?? 0);
    (n as GrowthNode).growth = kp > 0 ? (k / kp - 1) * 100 : null;
  });
  return h as GrowthNode;
}
export type GrowthNode = d3.HierarchyNode<PNode> & { growth: number | null };

/** Cari node berdasarkan id path. */
export function findNode(h: GrowthNode, id: string): GrowthNode {
  return (h.find((n) => n.data.id === id) as GrowthNode) ?? h;
}
