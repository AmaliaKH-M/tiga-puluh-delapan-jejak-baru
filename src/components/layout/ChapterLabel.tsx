export function ChapterLabel({ number, eyebrow }: { number: string; eyebrow: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-5xl leading-none text-primary md:text-6xl">{number}</span>
      <span className="h-px w-10 bg-secondary/50" />
      <span className="eyebrow">{eyebrow}</span>
    </div>
  );
}
