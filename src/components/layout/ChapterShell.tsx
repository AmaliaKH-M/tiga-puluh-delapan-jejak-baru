import type { ReactNode } from "react";
import type { ChapterText } from "@/data/narrativeConfig";
import { ChapterLabel } from "./ChapterLabel";
import { Paragraphs, RichText } from "./Narrative";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

/** Kerangka satu chapter: label, judul, lede, pertanyaan, teks, lalu konten visual. */
export function ChapterShell({ text, children, className, aside }: {
  text: ChapterText; children: ReactNode; className?: string; aside?: ReactNode;
}) {
  return (
    <section id={text.id} data-chapter={text.number} className={cn("relative border-t border-border/70 py-24 md:py-32", className)}>
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <ChapterLabel number={text.number} eyebrow={text.eyebrow} />
            <h2 className="mt-6 text-4xl font-medium leading-[1.05] md:text-6xl">{text.title}</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"><RichText text={text.lede} /></p>
            {text.question && (
              <p className="mt-6 border-l-2 border-accent pl-4 font-display text-xl italic text-foreground/80">{text.question}</p>
            )}
          </div>
          <div className="md:col-span-5 md:pt-24">
            <Paragraphs items={text.body} />
            {aside}
          </div>
        </Reveal>
        <div className="mt-14 space-y-16">{children}</div>
      </div>
    </section>
  );
}
