import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

/**
 * Animasi masuk saat elemen terlihat. Memakai IntersectionObserver (bukan posisi ScrollTrigger)
 * agar tidak macet ketika tinggi halaman berubah setelah data/chart dimuat.
 */
export function Reveal({ children, className, y = 28, delay = 0, stagger = 0 }: {
  children: ReactNode; className?: string; y?: number; delay?: number; stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = stagger ? Array.from(el.children) : [el];
    gsap.set(targets, { opacity: 0, y });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      gsap.to(targets, { opacity: 1, y: 0, duration: 0.9, delay, stagger, ease: "power3.out", clearProps: "transform,opacity" });
      io.disconnect();
    }, { threshold: 0.12 });
    io.observe(el);
    return () => { io.disconnect(); gsap.set(targets, { clearProps: "transform,opacity" }); };
  }, [y, delay, stagger]);
  return <div ref={ref} className={cn(className)}>{children}</div>;
}
