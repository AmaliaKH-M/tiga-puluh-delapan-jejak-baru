import { useState } from "react";
import { closing, site } from "@/data/narrativeConfig";
import { Paragraphs } from "@/components/layout/Narrative";
import { Reveal } from "@/components/layout/Reveal";
import { MethodologyDialog } from "@/components/layout/MethodologyDialog";
import { CrowdCanvas } from "@/components/ui/skiper39";
import { JatimSilhouette } from "@/components/map/JatimSilhouette";
import { ASSETS } from "@/data/dataConfig";
import { asset } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useSize";

/** EPILOG — kembali ke manusia. */
export function ClosingSection() {
  const mobile = useIsMobile();
  const [failed, setFailed] = useState(false);
  return (
    <section id="epilog" className="paper grain relative overflow-hidden border-t border-border/70 pt-28">
      <JatimSilhouette className="absolute left-1/2 top-16 w-[120%] -translate-x-1/2 md:w-[80%]" opacity={0.07} />
      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="eyebrow">{closing.eyebrow}</p>
          <h2 className="mt-5 text-4xl leading-[1.05] md:text-6xl">{closing.title}</h2>
        </Reveal>
        <Reveal className="mt-10" stagger={0.15}><Paragraphs items={closing.body} className="md:text-lg" /></Reveal>
        <Reveal className="mt-12 rounded-2xl border border-border bg-card/80 p-6">
          <p className="eyebrow">Keterbatasan</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{closing.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <MethodologyDialog />
            <a href={site.repoUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm hover:bg-muted">Repositori kode & data</a>
          </div>
        </Reveal>
      </div>
      <div className="relative mt-16 h-[34vh] md:h-[40vh]">
        {!failed && <CrowdCanvas src={ASSETS.crowd.map((s) => (s.startsWith("http") ? s : asset(s)))} rows={ASSETS.crowdGrid.rows} cols={ASSETS.crowdGrid.cols}
          density={mobile ? 0.3 : 0.55} className="h-full" onError={() => setFailed(true)} />}
      </div>
      <footer className="relative z-10 border-t border-border/70 bg-background px-6 py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:justify-between">
          <p>{site.title} · {site.author} · UAS Visualisasi Data dan Informasi, Politeknik Statistika STIS 2026</p>
          <p>Sumber data: BPS · Batas wilayah: ghapsara/indonesia-atlas · Ilustrasi: Open Peeps (CC0) · Animasi: Skiper UI</p>
        </div>
      </footer>
    </section>
  );
}
