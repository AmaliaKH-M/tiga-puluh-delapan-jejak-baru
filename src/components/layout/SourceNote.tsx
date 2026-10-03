import { useData } from "@/lib/data";

/** Catatan sumber wajib di bawah setiap visual (Soal 2.b). */
export function SourceNote({ ids, extra, note }: { ids: string[]; extra?: string; note?: string }) {
  const { sources } = useData();
  const items = ids.map((id) => sources.find((s) => s.id === id)).filter(Boolean);
  return (
    <div className="mt-4 border-t border-border/70 pt-3 text-[0.72rem] leading-relaxed text-muted-foreground">
      {note && <p className="mb-1 italic">Catatan: {note}</p>}
      <p>
        <span className="font-semibold text-foreground/80">Sumber: BPS</span>
        {items.map((s) => (
          <span key={s!.id}>
            {" · "}Badan Pusat Statistik, “{s!.judul}”, tahun data {s!.tahun}
            {s!.akses ? `, diakses ${s!.akses}` : ""}
            {s!.url ? (
              <> (<a className="underline decoration-dotted hover:text-foreground" href={s!.url} target="_blank" rel="noreferrer">tautan</a>)</>
            ) : " (URL belum diisi)"}
          </span>
        ))}
        {extra && <span>{" · "}{extra}</span>}
      </p>
    </div>
  );
}
