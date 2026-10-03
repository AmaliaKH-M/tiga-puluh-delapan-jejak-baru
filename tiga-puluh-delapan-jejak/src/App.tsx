import { DataProvider } from "@/lib/data";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { HeroSection } from "@/components/storytelling/HeroSection";
import { IntroSection } from "@/components/storytelling/IntroSection";
import { Chapter01Context } from "@/components/storytelling/Chapter01Context";
import { Chapter02Poverty } from "@/components/storytelling/Chapter02Poverty";
import { Chapter03PurchasingPower } from "@/components/storytelling/Chapter03PurchasingPower";
import { Chapter04Multivariate } from "@/components/storytelling/Chapter04Multivariate";
import { Chapter05Geospatial } from "@/components/storytelling/Chapter05Geospatial";
import { Chapter06EconomicStructure } from "@/components/storytelling/Chapter06EconomicStructure";
import { Chapter07Change } from "@/components/storytelling/Chapter07Change";
import { ClosingSection } from "@/components/storytelling/ClosingSection";

/** Urutan cerita. Tambah/hapus/ubah urutan bab cukup di sini. */
export default function App() {
  return (
    <DataProvider
      fallback={({ error }) => (
        <div className="paper flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="font-display text-4xl">Tiga Puluh Delapan Jejak</p>
          <p className="text-sm text-muted-foreground">{error ? `Data gagal dimuat: ${error}` : "Memuat data BPS…"}</p>
        </div>
      )}
    >
      <ScrollProgress />
      <main>
        <HeroSection />
        <IntroSection />
        <Chapter01Context />
        <Chapter02Poverty />
        <Chapter03PurchasingPower />
        <Chapter04Multivariate />
        <Chapter05Geospatial />
        <Chapter06EconomicStructure />
        <Chapter07Change />
      </main>
      <ClosingSection />
    </DataProvider>
  );
}
