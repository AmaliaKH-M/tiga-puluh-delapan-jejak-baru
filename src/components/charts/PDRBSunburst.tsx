import { useMemo } from "react";
import * as d3 from "d3";
import { useData } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { buildTree, toHierarchy, findNode, type GrowthNode, type PNode } from "@/lib/pdrb";
import { SECTOR_COLORS } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";
import { MapTooltip } from "@/components/map/MapTooltip";
import { CategoryLegend } from "@/components/map/MapLegend";
import { useTooltip } from "./useTooltip";
import { Breadcrumb } from "./Breadcrumb";

/**
 * Sunburst (representasi hierarki kedua). Ukuran sudut = PDRB ADHB; warna = sektor (primer/sekunder/tersier).
 * Menampilkan 2 cincin dari node fokus; klik cincin untuk zoom, klik pusat untuk naik.
 */
export function PDRBSunburst({ year, focus, onFocus }: { year: number; focus: string; onFocus: (id: string) => void }) {
  const d = useData();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const size = Math.min(width, 560);
  const R = size / 2;
  const { tip, show, hide } = useTooltip<GrowthNode>();
  const root = useMemo(() => toHierarchy(buildTree(d, year)), [d, year]);
  const node = findNode(root, focus);
  const part = useMemo(() => {
    const h = d3.hierarchy<PNode>(node.data).sum((n) => n.adhb ?? 0).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return d3.partition<PNode>().size([2 * Math.PI, 3])(h);
  }, [node]);
  const ring = R / 3;
  const arc = d3.arc<d3.HierarchyRectangularNode<PNode>>()
    .startAngle((n) => n.x0).endAngle((n) => n.x1).padAngle(0.003)
    .innerRadius((n) => n.y0 * ring).outerRadius((n) => n.y1 * ring - 1);
  const nodes = part.descendants().filter((n) => n.depth > 0 && n.depth <= 2);
  const fill = (n: d3.HierarchyRectangularNode<PNode>) => {
    if (n.data.sektor) return SECTOR_COLORS[n.data.sektor];
    return "#d8c3c8";
  };
  const total = root.value ?? 1;
  return (
    <div className="space-y-3">
      <Breadcrumb node={node} onGo={onFocus} />
      <div ref={ref} className="relative flex justify-center" data-chart>
        <svg width={size} height={size} viewBox={`${-R} ${-R} ${size} ${size}`}>
          {nodes.map((n) => (
            <path key={n.data.id} d={arc(n) ?? ""} fill={fill(n)}
              fillOpacity={n.data.level === 3 ? 0.65 : n.data.level === 1 ? 0.75 : 0.95}
              stroke="#fff8f5" strokeWidth={0.5} className={n.data.level < 3 ? "cursor-pointer" : ""}
              onClick={() => n.data.level < 3 && onFocus(n.data.id)}
              onMouseMove={(e) => show(e, findNode(root, n.data.id))} onMouseLeave={hide} />
          ))}
          {nodes.filter((n) => n.depth === 1 && n.x1 - n.x0 > 0.18).map((n) => {
            const a = ((n.x0 + n.x1) / 2) * (180 / Math.PI) - 90;
            const r = ((n.y0 + n.y1) / 2) * ring;
            return (
              <text key={`t${n.data.id}`} transform={`rotate(${a}) translate(${r},0) rotate(${a > 90 ? 180 : 0})`}
                textAnchor="middle" dy="0.35em" fontSize={10} fill="#2b1d22" pointerEvents="none">
                {n.data.name.replace("Kabupaten ", "").replace("Kota ", "Kt. ").slice(0, 14)}
              </text>
            );
          })}
          <circle r={ring - 2} fill="#fffdfb" className={node.parent ? "cursor-pointer" : ""} onClick={() => node.parent && onFocus(node.parent.data.id)} />
          <text textAnchor="middle" y={-6} fontSize={14} fontFamily="var(--font-display)" fill="#2b1d22">{node.data.name.replace("Kabupaten ", "Kab. ").slice(0, 22)}</text>
          <text textAnchor="middle" y={12} fontSize={10} fill="#6e5a60">{fmt((node.value ?? 0) / 1000, 1)} triliun Rp</text>
          {node.parent && <text textAnchor="middle" y={28} fontSize={9} fill="#b5828c">klik untuk naik</text>}
        </svg>
        {tip && (
          <MapTooltip x={tip.x} y={tip.y} containerWidth={width}>
            <p className="font-semibold">{tip.d.data.name}</p>
            <p>PDRB ADHB {year}: <b>{fmt(tip.d.value ?? 0, 0)} miliar Rp</b></p>
            <p>Porsi dari induk: {fmt(((tip.d.value ?? 0) / (tip.d.parent?.value ?? 1)) * 100, 1)}% · dari Jatim {fmt(((tip.d.value ?? 0) / total) * 100, 2)}%</p>
          </MapTooltip>
        )}
      </div>
      <CategoryLegend items={Object.entries(SECTOR_COLORS).map(([label, color]) => ({ label: `Sektor ${label.toLowerCase()}`, color }))} />
    </div>
  );
}
