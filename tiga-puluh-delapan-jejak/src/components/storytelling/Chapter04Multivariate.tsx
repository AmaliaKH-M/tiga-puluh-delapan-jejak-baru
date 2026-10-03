import { chapters } from "@/data/narrativeConfig";
import { ChapterShell } from "@/components/layout/ChapterShell";
import { ChartFrame } from "@/components/layout/ChartFrame";
import { SourceNote } from "@/components/layout/SourceNote";
import { RegionPicker } from "@/components/layout/RegionPicker";
import { PCAChart } from "@/components/charts/PCAChart";
import { ParallelCoordinates } from "@/components/charts/ParallelCoordinates";
import { ClusterHeatmap } from "@/components/charts/ClusterHeatmap";
import { EastJavaMap } from "@/components/map/EastJavaMap";
import { CategoryLegend } from "@/components/map/MapLegend";
import { useData, regionName } from "@/lib/data";
import { useSelection } from "@/store/selection";
import { CLUSTER_COLORS } from "@/data/dataConfig";

const SRC = ["D03", "D05", "D07", "D08", "D09b", "D10", "D11", "D12", "D14", "D15"];

/** BAB 4 — Multivariat: PCA + parallel coordinates + heatmap terklaster + peta klaster (brushing & linking). */
export function Chapter04Multivariate() {
  const d = useData();
  const { pca } = d;
  const { brushed, setBrushed } = useSelection();
  const note = `PCA pada ${pca.variables.length} variabel ${pca.year} (z-score; PDRB per kapita & kepadatan di-log). IPM tidak dimasukkan karena merupakan komposit komponennya. Klaster: Ward.`;
  return (
    <ChapterShell text={chapters.multivariate}>
      <div className="grid gap-6 lg:grid-cols-12">
        <ChartFrame className="lg:col-span-7" title={`Peta profil 38 wilayah (PCA ${pca.year})`}
          subtitle="Posisi = skor komponen utama · warna = kelompok · panah = arah kontribusi variabel"
          controls={<RegionPicker />} footer={<SourceNote ids={SRC} note={note} />}>
          <PCAChart />
        </ChartFrame>
        <div className="space-y-4 lg:col-span-5">
          {pca.clusters.map((c) => (
            <button key={c.id}
              onClick={() => setBrushed(brushed && brushed.length === c.anggota.length && c.anggota.every((k) => brushed.includes(k)) ? null : c.anggota)}
              className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: CLUSTER_COLORS[c.idx] }} />
                <span className="font-display text-xl">{c.label}</span>
                <span className="text-xs text-muted-foreground">· {c.n} wilayah{c.n === 1 ? " (pencilan)" : ""}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Ciri relatif: {c.ciri.join(", ")}</p>
              <p className="mt-1 line-clamp-2 text-xs">{c.anggota.map((k) => regionName(d, k).replace("Kabupaten ", "")).join(", ")}</p>
            </button>
          ))}
          <p className="text-xs text-muted-foreground">Klik kartu untuk menyorot anggotanya di semua tampilan. “Ciri relatif” = rata-rata z-score paling menonjol, bukan label penilaian.</p>
          <ChartFrame title="Kelompok di peta" subtitle="Klik wilayah untuk memilih" className="p-3 md:p-4">
            <EastJavaMap zoomable={false} aspect={0.6} showSymbols={false}
              fill={(k) => CLUSTER_COLORS[pca.cluster[k]]}
              tooltip={(k) => <><p className="font-semibold">{regionName(d, k)}</p><p>{pca.clusters[pca.cluster[k]].label}</p></>} />
            <div className="mt-2"><CategoryLegend items={pca.clusters.map((c) => ({ label: c.label, color: CLUSTER_COLORS[c.idx] }))} /></div>
          </ChartFrame>
        </div>
      </div>

      <ChartFrame title="Parallel coordinates" subtitle={`${pca.variables.length} variabel, nilai asli ${pca.year} · garis = wilayah · warna = kelompok`}
        footer={<SourceNote ids={SRC} />}>
        <ParallelCoordinates />
      </ChartFrame>

      <ChartFrame title="Heatmap terklaster" subtitle="Baris dan kolom diurutkan menurut kemiripan · warna = z-score"
        footer={<SourceNote ids={SRC} note={note} />}>
        <ClusterHeatmap />
      </ChartFrame>
    </ChapterShell>
  );
}
