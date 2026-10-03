"use client";
/**
 * Skiper 39 — CrowdCanvas (diadaptasi untuk proyek ini).
 * Inspired by and adapted from https://codepen.io/zadvorsky/pen/xxwbBQV
 * Illustration: Open Peeps by Pablo Stanley — https://www.openpeeps.com/ (CC0)
 * Komponen asli: Skiper UI (@gurvinder-singh02, https://gxuri.me). Atribusi Skiper UI wajib untuk versi gratis.
 *
 * Perubahan dari versi asli:
 *  - beberapa sumber gambar (lokal lalu CDN) + callback gagal → parent bisa menampilkan fallback
 *  - DPR dibatasi 2, kepadatan kerumunan bisa dikurangi (ponsel)
 *  - animasi berhenti saat kanvas tidak terlihat (IntersectionObserver)
 *  - prefers-reduced-motion: kerumunan diam (satu frame)
 *  - cleanup lengkap saat unmount
 */
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Rect = [number, number, number, number];
type Peep = {
  rect: Rect; width: number; height: number;
  x: number; y: number; anchorY: number; scaleX: number;
  walk: gsap.core.Timeline | null;
};

export interface CrowdCanvasProps {
  src: string | string[];
  rows?: number;
  cols?: number;
  /** 0–1: proporsi figur yang dipakai (1 = semua) */
  density?: number;
  className?: string;
  onError?: () => void;
}

export function CrowdCanvas({ src, rows = 15, cols = 7, density = 1, className, onError }: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const sources = Array.isArray(src) ? src : [src];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const stage = { width: 0, height: 0 };
    const img = new Image();
    const all: Peep[] = [];
    const available: Peep[] = [];
    const crowd: Peep[] = [];
    let running = false;
    let disposed = false;

    const reset = (p: Peep) => {
      const dir = Math.random() > 0.5 ? 1 : -1;
      // sebaran vertikal relatif terhadap tinggi figur (asli: +100…−150 px)
      const offsetY = p.height * (0.35 - 0.95 * gsap.parseEase("power2.in")(Math.random()));
      const startY = stage.height - p.height + offsetY;
      const startX = dir === 1 ? -p.width : stage.width + p.width;
      const endX = dir === 1 ? stage.width : 0;
      p.scaleX = dir;
      p.x = startX;
      p.y = startY;
      p.anchorY = startY;
      return { startY, endX };
    };

    const walk = (p: Peep, { startY, endX }: { startY: number; endX: number }) => {
      const tl = gsap.timeline();
      tl.timeScale(rnd(0.5, 1.5));
      tl.to(p, { duration: 10, x: endX, ease: "none" }, 0);
      tl.to(p, { duration: 0.25, repeat: 40, yoyo: true, y: startY - 10 }, 0);
      return tl;
    };

    const add = (): Peep => {
      const p = available.splice((Math.random() * available.length) | 0, 1)[0];
      p.walk = walk(p, reset(p)).eventCallback("onComplete", () => {
        crowd.splice(crowd.indexOf(p), 1);
        available.push(p);
        if (!disposed) add();
      });
      if (!running || reduced) p.walk.pause();
      crowd.push(p);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return p;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      for (const p of crowd) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.scaleX, 1);
        ctx.drawImage(img, p.rect[0], p.rect[1], p.rect[2], p.rect[3], 0, 0, p.width, p.height);
        ctx.restore();
      }
      ctx.restore();
    };

    const resize = () => {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * dpr;
      canvas.height = stage.height * dpr;
      // skala figur agar muat di kanvas (tidak menabrak teks di atasnya)
      const fit = all.length ? Math.min(1, (stage.height * 0.5) / all[0].rect[3]) : 1;
      all.forEach((p) => { p.width = p.rect[2] * fit; p.height = p.rect[3] * fit; });
      crowd.forEach((p) => p.walk?.kill());
      crowd.length = 0;
      available.length = 0;
      available.push(...all);
      while (available.length) add().walk?.progress(Math.random());
      render();
    };

    const setRunning = (on: boolean) => {
      if (reduced || on === running) return;
      running = on;
      crowd.forEach((p) => (on ? p.walk?.resume() : p.walk?.pause()));
      if (on) gsap.ticker.add(render);
      else gsap.ticker.remove(render);
    };

    img.onload = () => {
      if (disposed) return;
      const w = img.naturalWidth / rows;
      const h = img.naturalHeight / cols;
      const total = rows * cols;
      const keep = Math.max(8, Math.round(total * density));
      const idx = gsap.utils.shuffle([...Array(total).keys()]).slice(0, keep);
      for (const i of idx) {
        all.push({ rect: [(i % rows) * w, ((i / rows) | 0) * h, w, h], width: w, height: h,
          x: 0, y: 0, anchorY: 0, scaleX: 1, walk: null });
      }
      resize();
      io.observe(canvas);
    };
    let attempt = 0;
    img.onerror = () => {
      attempt += 1;
      if (attempt < sources.length) img.src = sources[attempt];
      else onError?.();
    };
    img.src = sources[0];

    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { threshold: 0.05 });
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => all.length && resize(), 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
      gsap.ticker.remove(render);
      crowd.forEach((p) => p.walk?.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={cn("absolute bottom-0 h-[90vh] w-full", className)} aria-hidden />;
}

/** Demo asli Skiper39 (tidak dipakai langsung di halaman; lihat HeroSection). */
export function Skiper39({ src }: { src: string | string[] }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute bottom-0 h-full w-full">
        <CrowdCanvas src={src} rows={15} cols={7} />
      </div>
    </div>
  );
}

export default Skiper39;
