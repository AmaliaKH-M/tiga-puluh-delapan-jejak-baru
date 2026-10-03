/**
 * KONFIGURASI DATA — metadata indikator, aset, dan palet.
 * Periode TIDAK di-hard-code: dihitung dari data (lib/data.ts → validYears/commonYears).
 * Yang ditulis di sini hanya ATURAN (flag mana yang dikecualikan untuk analisis tren).
 */
import type { AppData } from "@/lib/data";
import { commonYears, validYears } from "@/lib/data";
import type { BannerConfig } from "@/components/ui/banner-image";

export type IndicatorMeta = {
  id: string;
  label: string;
  short: string;
  unit: string;
  digits: number;
  /** ID sumber di sources.json (Data Inventory Master Plan) */
  sources: string[];
  /** boleh dipetakan sebagai choropleth (rasio/persentase/per kapita/kepadatan) */
  ratio: boolean;
  /** flag yang dikecualikan saat menentukan periode valid untuk tren */
  trendExclude?: string[];
  /** catatan metodologis yang ditampilkan di UI */
  note?: string;
  log?: boolean;
  definition: string;
};

export const INDICATORS: Record<string, IndicatorMeta> = {
  persen_penduduk_miskin: {
    id: "persen_penduduk_miskin", label: "Persentase penduduk miskin", short: "% miskin", unit: "%", digits: 2,
    sources: ["D03"], ratio: true,
    definition: "Persentase penduduk dengan rata-rata pengeluaran per kapita per bulan di bawah garis kemiskinan (P0).",
  },
  jumlah_penduduk_miskin: {
    id: "jumlah_penduduk_miskin", label: "Jumlah penduduk miskin", short: "Jml miskin", unit: "ribu jiwa", digits: 2,
    sources: ["D04"], ratio: false,
    definition: "Banyaknya penduduk miskin (ribu jiwa). Angka absolut: dipetakan dengan simbol proporsional, bukan choropleth.",
  },
  pengeluaran_per_kapita_disesuaikan: {
    id: "pengeluaran_per_kapita_disesuaikan", label: "Pengeluaran per kapita disesuaikan", short: "PPK",
    unit: "ribu Rp/orang/tahun", digits: 0, sources: ["D05"], ratio: true,
    definition: "Komponen standar hidup layak dalam IPM (harga konstan, paritas daya beli). Dipakai sebagai proxy daya beli, bukan ukuran kelas menengah.",
  },
  ipm: {
    id: "ipm", label: "Indeks Pembangunan Manusia", short: "IPM", unit: "", digits: 2, sources: ["D06"], ratio: true,
    trendExclude: ["patahan_seri_metode_uhh"],
    note: "Patahan metodologis 2019→2020 (UHH Long Form SP2020 dipakai mulai 2020). Tren dibaca mulai 2020.",
    definition: "Indeks komposit umur panjang dan hidup sehat, pengetahuan, dan standar hidup layak.",
  },
  rls: {
    id: "rls", label: "Rata-rata lama sekolah", short: "RLS", unit: "tahun", digits: 2, sources: ["D07"], ratio: true,
    definition: "Rata-rata jumlah tahun yang dijalani penduduk usia 25 tahun ke atas di pendidikan formal.",
  },
  hls: {
    id: "hls", label: "Harapan lama sekolah", short: "HLS", unit: "tahun", digits: 2, sources: ["D08"], ratio: true,
    definition: "Lamanya sekolah (tahun) yang diharapkan dirasakan anak usia 7 tahun di masa mendatang.",
  },
  uhh: {
    id: "uhh", label: "Umur harapan hidup", short: "UHH", unit: "tahun", digits: 2, sources: ["D09b", "D09"], ratio: true,
    trendExclude: ["patahan_seri_metode_uhh"],
    note: "2020–2025 memakai UHH hasil Long Form SP2020; 2010–2019 metode lama dan tidak dibandingkan langsung.",
    definition: "Rata-rata perkiraan lama hidup yang dapat ditempuh seseorang sejak lahir.",
  },
  tpt: {
    id: "tpt", label: "Tingkat pengangguran terbuka", short: "TPT", unit: "%", digits: 2, sources: ["D10"], ratio: true,
    note: "2016 tidak tersedia: sampel Sakernas tidak cukup untuk estimasi kab/kota (tidak diimputasi).",
    definition: "Persentase penganggur terhadap angkatan kerja (Sakernas Agustus).",
  },
  pdrb_per_kapita_adhb: {
    id: "pdrb_per_kapita_adhb", label: "PDRB per kapita ADHB", short: "PDRB/kapita", unit: "ribu Rp", digits: 0,
    sources: ["D11"], ratio: true, log: true,
    note: "Harga berlaku (nominal). Kota Kediri pencilan sah (industri pengolahan tembakau).",
    definition: "Nilai tambah bruto atas dasar harga berlaku dibagi jumlah penduduk pertengahan tahun.",
  },
  laju_pertumbuhan_pdrb_adhk: {
    id: "laju_pertumbuhan_pdrb_adhk", label: "Laju pertumbuhan PDRB ADHK", short: "Pertumbuhan", unit: "%", digits: 2,
    sources: ["D12"], ratio: true,
    definition: "Pertumbuhan PDRB atas dasar harga konstan 2010 dibanding tahun sebelumnya.",
  },
  jumlah_penduduk: {
    id: "jumlah_penduduk", label: "Jumlah penduduk", short: "Penduduk", unit: "jiwa", digits: 0, sources: ["D13"],
    ratio: false, trendExclude: ["patahan_seri"],
    note: "Patahan seri 2020 dan 2024 (perubahan basis proyeksi).",
    definition: "Jumlah penduduk menurut kabupaten/kota.",
  },
  kepadatan_penduduk: {
    id: "kepadatan_penduduk", label: "Kepadatan penduduk", short: "Kepadatan", unit: "jiwa/km²", digits: 0,
    sources: ["D14"], ratio: true, log: true, trendExclude: ["luas_acuan_berbeda"],
    note: "Hanya 2022–2025 memakai luas acuan yang konsisten.",
    definition: "Jumlah penduduk per km² luas wilayah.",
  },
  gini_ratio: {
    id: "gini_ratio", label: "Gini ratio", short: "Gini", unit: "", digits: 2, sources: ["D15"], ratio: true,
    definition: "Ukuran ketimpangan pengeluaran (0 = merata sempurna, 1 = timpang sempurna).",
  },
  pengeluaran_makanan: {
    id: "pengeluaran_makanan", label: "Pengeluaran makanan", short: "Makanan", unit: "Rp/kapita/bulan", digits: 0,
    sources: ["D18"], ratio: true, definition: "Rata-rata pengeluaran per kapita sebulan untuk makanan.",
  },
  pengeluaran_bukan_makanan: {
    id: "pengeluaran_bukan_makanan", label: "Pengeluaran bukan makanan", short: "Bukan makanan",
    unit: "Rp/kapita/bulan", digits: 0, sources: ["D18"], ratio: true,
    definition: "Rata-rata pengeluaran per kapita sebulan untuk bukan makanan.",
  },
};

export const ind = (id: string) => INDICATORS[id];

/** Indikator yang boleh dipilih di atlas (choropleth wajib rasio). */
export const ATLAS_INDICATORS = [
  "persen_penduduk_miskin", "pengeluaran_per_kapita_disesuaikan", "ipm", "rls", "hls", "uhh", "tpt",
  "pdrb_per_kapita_adhb", "kepadatan_penduduk", "gini_ratio",
];
/** Pilihan simbol proporsional (angka absolut). */
export const SYMBOL_INDICATORS = ["jumlah_penduduk_miskin", "jumlah_penduduk"];
/** Indikator perbandingan awal–akhir (Chapter 7). */
export const CHANGE_INDICATORS = [
  "persen_penduduk_miskin", "pengeluaran_per_kapita_disesuaikan", "rls", "hls", "tpt", "uhh", "ipm",
];

/** Periode valid untuk tren suatu indikator (mengikuti data + aturan flag). */
export function trendYears(d: AppData, id: string) {
  return validYears(d, id, INDICATORS[id]?.trendExclude ?? []);
}

/** Rentang tahun proyek: dihitung dari indikator inti, bukan diketik manual. */
export function projectYears(d: AppData) {
  const core = ["persen_penduduk_miskin", "pengeluaran_per_kapita_disesuaikan", "rls", "hls", "pdrb_per_kapita_adhb"];
  const ys = commonYears(d, core);
  return { DATA_YEAR_START: ys[0], DATA_YEAR_END: ys[ys.length - 1] };
}

/* ---------- Aset (ganti file di public/ tanpa mengubah kode) ---------- */
export const ASSETS = {
  /** Ornamen/siluet Jawa Timur di belakang kerumunan. Ganti file ini saja. */
ornament: "assets/java-timur-silhouette.png",
/**
 * Banner atas halaman pembuka & penutup (memudar + blur ke bawah).
 * Untuk foto/ilustrasi (mis. Reog): simpan di public/assets/banner/ lalu ubah src & fit: "cover".
 */
heroBanner: { src: "assets/banner/hero.jpeg", fit: "cover", position: "center 30%", opacity: 0.9 } as BannerConfig,
closingBanner: { src: "assets/banner/closing.jpeg", fit: "cover", position: "center 35%", opacity: 0.95 } as BannerConfig,
  /**
   * Sprite kerumunan, dicoba berurutan:
   * 1) salinan lokal Open Peeps (CC0) — unduh dari URL CDN di bawah, simpan sebagai public/assets/crowd/open-peeps-sheet.png
   * 2) CDN 21st.dev
   * 3) sprite cadangan sederhana buatan sendiri (selalu tersedia)
   */
  crowd: ["assets/crowd/open-peeps-sheet.png",
    "https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png",
    "assets/crowd/fallback-sheet.png"],
  crowdGrid: { rows: 15, cols: 7 },
};

/* ---------- Palet chart (aman buta warna) ---------- */
export const SEQ = ["#fff1ea", "#f7cdbf", "#e3a2a1", "#bf7a88", "#87506a", "#4f2c40"];
export const SEQ5 = SEQ.slice(1);
export const DIVERGING = ["#2f6690", "#8db3d3", "#f3ece9", "#e4a3a3", "#a23e55"];
export const CLUSTER_COLORS = ["#e69f00", "#0072b2", "#009e73", "#cc79a7", "#56b4e9"];
export const SECTOR_COLORS: Record<string, string> = { Primer: "#009e73", Sekunder: "#0072b2", Tersier: "#e69f00" };
export const ACCENT = "#e74c3c";
export const INK = "#2b1d22";
export const INK_SOFT = "#9b8a8f";
