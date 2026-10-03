import { Fragment } from "react";
import { useData } from "@/lib/data";
import { fillTemplate } from "@/lib/formatting";

/** Render teks narasi: isi token {{fakta}} lalu ubah **tebal**. */
export function useFill() {
  const { facts } = useData();
  return (t: string) => fillTemplate(t, facts);
}

export function RichText({ text }: { text: string }) {
  const fill = useFill();
  const parts = fill(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

export function Paragraphs({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={`prose-story ${className ?? ""}`}>
      {items.map((t, i) => (
        <p key={i}><RichText text={t} /></p>
      ))}
    </div>
  );
}
