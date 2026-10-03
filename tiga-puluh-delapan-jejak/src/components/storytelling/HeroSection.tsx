import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowDown } from "lucide-react";
import { CrowdCanvas } from "@/components/ui/skiper39";
import { JatimSilhouette } from "@/components/map/JatimSilhouette";
import { ASSETS, projectYears } from "@/data/dataConfig";
import { site } from "@/data/narrativeConfig";
import { useData } from "@/lib/data";
import { useIsMobile } from "@/hooks/useSize";
import { asset } from "@/lib/utils";

/**
 * PROLOG — kerumunan orang berjalan di depan ornamen & siluet Jawa Timur.
 * Ganti ornamen: timpa public/assets/java-timur-silhouette.png (tanpa ubah kode).
 */
export function HeroSection() {
  const d = useData();
  const { DATA_YEAR_START, DATA_YEAR_END } = projectYears(d);
  const mobile = useIsMobile();
  const [crowdFailed, setCrowdFailed] = useState(false);
  const [ornamentOk, setOrnamentOk] = useState(true);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-in", { y: 30, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" });
      gsap.to(".hero-text", {
        yPercent: -18, opacity: 0.2, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-ornament", {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="paper grain relative h-[100svh] min-h-[640px] overflow-hidden" aria-label="Pembuka">
      {/* lapis 1: siluet geografis dari GeoJSON */}
      <JatimSilhouette className="absolute left-1/2 top-[44%] w-[135%] max-w-none -translate-x-1/2 -translate-y-1/2 md:w-[92%]" opacity={0.1} />

      {/* lapis 2: ornamen Jawa Timur (samar, di belakang kerumunan) */}
      {ornamentOk && (
        <img
          src={asset(ASSETS.ornament)} alt="" aria-hidden onError={() => setOrnamentOk(false)}
          className="hero-ornament pointer-events-none absolute left-1/2 top-[52%] w-[92%] max-w-[760px] -translate-x-1/2 -translate-y-1/2 opacity-[0.22] mix-blend-multiply [filter:sepia(0.35)_saturate(0.8)] md:top-[56%] md:w-[58%]"
        />
      )}

      {/* lapis 3: teks */}
      <div className="hero-text relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-[11vh] text-center md:pt-[12vh]">
        <p className="hero-in eyebrow">Jawa Timur · {d.regions.length} kabupaten/kota · Data BPS {DATA_YEAR_START}–{DATA_YEAR_END}</p>
        <h1 className="hero-in mt-5 text-[3.1rem] font-medium leading-[0.95] tracking-tight md:text-[6.6rem]">
          {site.title}
        </h1>
        <p className="hero-in mt-5 max-w-2xl text-base text-foreground/75 md:text-xl">{site.subtitle}, {DATA_YEAR_START}–{DATA_YEAR_END}</p>
        <p className="hero-in mt-6 max-w-xl font-display text-xl italic text-secondary md:text-2xl">“{site.hook}”</p>
      </div>

      {/* lapis 4: kerumunan */}
      {!crowdFailed && (
        <div className="absolute inset-x-0 bottom-0 z-[5] h-[46vh] md:h-[54vh]">
          <CrowdCanvas src={ASSETS.crowd.map((s) => (s.startsWith("http") ? s : asset(s)))}
            rows={ASSETS.crowdGrid.rows} cols={ASSETS.crowdGrid.cols}
            density={mobile ? 0.45 : 0.9} className="h-full" onError={() => setCrowdFailed(true)} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-24 bg-gradient-to-t from-background to-transparent" />

      <a href="#prolog" className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        {site.scrollHint}<ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
      <p className="absolute bottom-2 right-3 z-10 text-[0.6rem] text-muted-foreground/70">Ilustrasi: Open Peeps (CC0) · Animasi: Skiper UI</p>
    </section>
  );
}
