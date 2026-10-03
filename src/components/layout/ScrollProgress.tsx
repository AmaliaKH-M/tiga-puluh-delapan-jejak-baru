import { useEffect, useState } from "react";
import { chapters } from "@/data/narrativeConfig";
import { RegionPicker } from "./RegionPicker";
import { MethodologyDialog } from "./MethodologyDialog";

const NAV = Object.values(chapters).map((c) => ({ id: c.id, n: c.number, label: c.eyebrow }));

/** Bilah progres atas + navigasi chapter + pemilih wilayah global. */
export function ScrollProgress() {
  const [p, setP] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      setP(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight));
      const mid = window.innerHeight * 0.4;
      const cur = NAV.filter((c) => {
        const el = document.getElementById(c.id);
        return el && el.getBoundingClientRect().top < mid;
      }).pop();
      setActive(cur?.id ?? null);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const show = p > 0.06;
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-[3px] bg-transparent">
        <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${p * 100}%` }} />
      </div>
      <header
        className={`fixed inset-x-0 top-[3px] z-30 transition-all duration-500 ${show ? "translate-y-0 opacity-100" : "-translate-y-4 pointer-events-none opacity-0"}`}
      >
        <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between gap-3 rounded-full border border-border/70 bg-background/85 px-3 py-1.5 backdrop-blur md:px-4">
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Chapter">
            {NAV.map((c) => (
              <a
                key={c.id} href={`#${c.id}`}
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs transition-colors ${active === c.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                {c.n}<span className="hidden xl:inline"> · {c.label}</span>
              </a>
            ))}
          </nav>
          <span className="font-display text-lg lg:hidden">{NAV.find((c) => c.id === active)?.label ?? "Prolog"}</span>
          <div className="flex items-center gap-2">
            <RegionPicker compact />
            <MethodologyDialog compact />
          </div>
        </div>
      </header>
    </>
  );
}
