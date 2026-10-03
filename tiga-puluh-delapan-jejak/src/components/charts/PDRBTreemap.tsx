import { useMemo } from "react";
import * as d3 from "d3";
import { useData } from "@/lib/data";
import { useSize } from "@/hooks/useSize";
import { useSelection } from "@/store/selection";
import { buildTree, toHierarchy, findNode, type GrowthNode } from "@/lib/pdrb";
import { ACCENT, DIVERGING } from "@/data/dataConfig";
import { fmt } from "@/lib/formatting";
import { MapTooltip } from "@/components/map/MapTooltip";
import { useTooltip } from "./useTooltip";
import { Breadcrumb } from "./Breadcrumb";

export const growthColor = d3.scaleLinear<string>().domain([-6, -2, 0, 4, 9]).range(DIVERGING).clamp(true);

/**
 * Treemap zoomable. Ukuran = PDRB ADHB (miliar Rp); warna = pertumbuhan riil ADHK dibanding tahun sebelumnya.
 * Klik kotak untuk turun satu level; breadcrumb untuk naik.
 */
export function PDRBTreemap({ year, focus, onFocus }: { year: number; focus: string; onFocus: (id: string) => void }) {
  const d = useData();
  const { selected, setSelected } = useSelection();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const height = Math.min(560, Math.max(360, width * 0.62));
  const { tip, show, hide } = useTooltip<GrowthNode>();
  const root = useMemo(() => toHierarchy(buildTree(d, year)), [d, year]);
  const node = findNode(root, focus);
  const total = root.value ?? 1;

  const layout = useMemo(() => {
    const sub = d3.hierarchy(node.data).sum((n) => n.adhb ?? 0).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    d3.treemap<typeof node.data>().size([width, height]).paddingInner(2).paddingTop((n) => (n.depth === 1 && n.children ? 18 : 0)).round(true)(sub);
    return sub as d3.HierarchyRectangularNode<typeof node.data>;
  }, [node, width, height]);
  const growthOf = (id: string) => findNode(root, id).growth;
  const kids = (layout.children ?? []) as d3.HierarchyRectangularNode<typeof node.data>[];

  return (
    <div className="space-y-3">
      <Breadcrumb node={node} onGo={onFocus} />
      <div ref={ref} className="relative" data-chart>
        <svg width={width} height={height}>
          {kids.map((c) => {
            const g = growthOf(c.data.id);
            const isSel = c.data.level === 1 && c.data.kode === selected;
            const leaves = (c.children ?? [c]) as d3.HierarchyRectangularNode<typeof node.data>[];
            const canDrill = c.data.level < 3;
            return (
              <g key={c.data.id} className={canDrill ? "cursor-pointer" : ""}
                onClick={() => { if (canDrill) { onFocus(c.data.id); if (c.data.level === 1) setSelected(c.data.kode!); } }}>
                {leaves.map((l) => {
                  const lg = growthOf(l.data.id);
                  return (
                    <rect key={l.data.id} x={l.x0} y={l.y0} width={Math.max(0, l.x1 - l.x0)} height={Math.max(0, l.y1 - l.y0)}
                      fill={lg == null ? "#e9dfdb" : growthColor(lg)} stroke="#fff8f5" strokeWidth={0.6}
                      onMouseMove={(e) => show(e, findNode(root, l.data.id))} onMouseLeave={hide} />
                  );
                })}
                <rect x={c.x0} y={c.y0} width={c.x1 - c.x0} height={c.y1 - c.y0} fill="none" stroke={isSel ? ACCENT : "#2b1d22"} strokeWidth={isSel ? 2.5 : 0.8} strokeOpacity={isSel ? 1 : 0.5} pointerEvents="none" />
                {c.x1 - c.x0 > 50 && c.y1 - c.y0 > 16 && (
                  <text x={c.x0 + 4} y={c.y0 + 13} fontSize={11} fontWeight={600} fill="#2b1d22" pointerEvents="none">
                    {c.data.name.replace("Kabupaten ", "Kab. ")}{c.x1 - c.x0 > 140 && g != null ? ` · ${fmt(g, 1)}%` : ""}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {tip && (
          <MapTooltip x={tip.x} y={tip.y} containerWidth={width}>
            <p className="font-semibold">{tip.d.data.name}</p>
            {tip.d.data.level > 1 && <p className="text-muted-foreground">{tip.d.ancestors().slice(1).reverse().slice(0, -1).map((a) => a.data.name).join(" › ")}</p>}
            <p>PDRB ADHB {year}: <b>{fmt(tip.d.value ?? 0, 0)} miliar Rp</b></p>
            <p>Porsi dari Jawa Timur: {fmt(((tip.d.value ?? 0) / total) * 100, 2)}%</p>
            <p>Pertumbuhan riil (ADHK): {tip.d.growth == null ? "—" : `${fmt(tip.d.growth, 2)}%`}</p>
          </MapTooltip>
        )}
      </div>
      <GrowthLegend />
    </div>
  );
}

export function GrowthLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>Warna: pertumbuhan riil ADHK vs tahun sebelumnya</span>
      <span>−6%</span>
      <div className="h-2.5 w-36" style={{ background: `linear-gradient(90deg, ${DIVERGING.join(",")})` }} />
      <span>+9%</span>
      <span>· Ukuran: PDRB ADHB (miliar Rp)</span>
    </div>
  );
}
