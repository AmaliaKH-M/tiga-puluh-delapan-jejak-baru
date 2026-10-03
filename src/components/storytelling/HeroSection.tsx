import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowDown } from "lucide-react";
import { CrowdCanvas } from "@/components/ui/skiper39";
import { BannerImage } from "@/components/ui/banner-image";
import { JatimSilhouette } from "@/components/map/JatimSilhouette";
import { ASSETS, projectYears } from "@/data/dataConfig";
import { site } from "@/data/narrativeConfig";
import { useData } from "@/lib/data";
import { useIsMobile } from "@/hooks/useSize";
import { asset } from "@/lib/utils";

/**
 * PROLOG — banner (ornamen/Reog) di paling atas yang memudar ke teks,
 * lalu judul + hook, dan kerumunan berjalan di bagian bawah.
 * Ganti gambar banner: ASSETS.heroBanner di src/data/dataConfig.ts
 */
export function HeroSection() {
  const d = useData();
  const { DATA_YEAR_START, DATA_YEAR_END } = projectYears(d);
  const mobile = useIsMobile();
  const [crowdFailed, setCrowdFailed] = useState(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-in", { y: 30, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" });
      gsap.to(".hero-banner", {
        yPercent: 10, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="paper grain relative h-[100svh] min-h-[720px] overflow-hidden" aria-label="Pembuka">
      {/* lapis 1: siluet geografis dari GeoJSON (sangat samar) */}
      <JatimSilhouette className="absolute left-1/2 top-[62%] w-[135%] max-w-none -translate-x-1/2 -translate-y-1/2 md:w-[85%]" opacity={0.07} />

      {/* lapis 2: banner paling atas, memudar + blur ke bawah */}
      <BannerImage config={ASSETS.heroBanner} className="hero-banner h-[40vh] md:h-[46vh]" />

      {/* lapis 3: teks — berada DI ATAS area kerumunan */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-[30vh] text-center md:pt-[34vh]">
        <p className="hero-in eyebrow">Jawa Timur · {d.regions.length} kabupaten/kota · Data BPS {DATA_YEAR_START}–{DATA_YEAR_END}</p>
        <h1 className="hero-in mt-3 text-[2.9rem] font-medium leading-[0.95] tracking-tight md:text-[5.4rem]">{site.title}</h1>
        <p className="hero-in mt-3 max-w-2xl text-base text-foreground/80 md:text-lg">{site.subtitle}, {DATA_YEAR_START}–{DATA_YEAR_END}</p>
        {/* hook: warna gelap + latar lembut agar selalu terbaca */}
        <p className="hero-in mt-5 max-w-2xl rounded-2xl bg-background/80 px-5 py-2.5 font-display text-xl italic leading-snug text-[#4f2c40] shadow-[0_0_40px_20px_rgba(255,248,245,0.85)] backdrop-blur-sm md:text-2xl">
          “{site.hook}”
        </p>
      </div>

      {/* lapis 4: kerumunan (lebih rendah agar tidak menutupi teks) */}
      {!crowdFailed && (
        <div className="absolute inset-x-0 bottom-[6vh] z-[5] h-[28vh] md:h-[30vh]">
          <CrowdCanvas src={ASSETS.crowd.map((s) => (s.startsWith("http") ? s : asset(s)))}
            rows={ASSETS.crowdGrid.rows} cols={ASSETS.crowdGrid.cols}
            density={mobile ? 0.45 : 0.9} className="h-full" onError={() => setCrowdFailed(true)} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-[6vh] z-[6] h-12 bg-gradient-to-t from-background to-transparent" />

      <a href="#prolog" className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm hover:text-foreground">
        {site.scrollHint}<ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
      <p className="absolute bottom-1 right-3 z-10 text-[0.6rem] text-muted-foreground/70">Ilustrasi: Open Peeps (CC0) · Animasi: Skiper UI</p>
    </section>
  );
}