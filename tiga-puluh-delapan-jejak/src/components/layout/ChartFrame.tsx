import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bingkai visual: judul, subjudul (periode/satuan), kontrol, isi, catatan. */
export function ChartFrame({ title, subtitle, controls, children, footer, className }: {
  title: string; subtitle?: ReactNode; controls?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string;
}) {
  return (
    <figure className={cn("rounded-2xl border border-border/80 bg-card/80 p-4 md:p-6", className)}>
      <figcaption className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-display text-2xl leading-tight md:text-[1.7rem]">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
      </figcaption>
      {children}
      {footer}
    </figure>
  );
}
