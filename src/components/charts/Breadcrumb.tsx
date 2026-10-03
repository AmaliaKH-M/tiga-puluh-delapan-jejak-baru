import { ChevronRight } from "lucide-react";
import type { GrowthNode } from "@/lib/pdrb";

/** Penunjuk posisi drill-down (syarat hierarki: breadcrumb). */
export function Breadcrumb({ node, onGo }: { node: GrowthNode; onGo: (id: string) => void }) {
  const path = node.ancestors().reverse();
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Posisi hierarki">
      {path.map((n, i) => (
        <span key={n.data.id} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          <button
            onClick={() => onGo(n.data.id)} disabled={i === path.length - 1}
            className={i === path.length - 1 ? "font-semibold" : "text-secondary underline decoration-dotted hover:text-foreground"}
          >
            {n.data.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
