import { intro } from "@/data/narrativeConfig";
import { Paragraphs } from "@/components/layout/Narrative";
import { Reveal } from "@/components/layout/Reveal";

/** Prolog naratif: dari angka ke manusia. */
export function IntroSection() {
  return (
    <section id="prolog" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="eyebrow">{intro.eyebrow}</p>
          <h2 className="mt-5 text-4xl leading-[1.05] md:text-6xl">{intro.title}</h2>
        </Reveal>
        <Reveal className="mt-10" stagger={0.12}>
          <Paragraphs items={intro.body} className="md:text-lg" />
        </Reveal>
      </div>
    </section>
  );
}
