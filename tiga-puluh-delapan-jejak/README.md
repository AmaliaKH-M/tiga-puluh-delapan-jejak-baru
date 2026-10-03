# Tiga Puluh Delapan Jejak

Website data storytelling: daya beli, kehidupan, dan pergeseran ekonomi Jawa Timur
(38 kabupaten/kota, data BPS 2010–2025). UAS Visualisasi Data dan Informasi, Politeknik Statistika STIS 2026.

## Menjalankan di VS Code

Prasyarat: Node.js 20+ (cek dengan `node -v`).

```bash
npm install        # sekali saja
npm run dev        # buka http://localhost:5173
```

Build produksi: `npm run build` (hasil di folder `dist/`).

## Mengubah data (opsional, butuh Python 3.10+)

```bash
pip install -r pipeline/requirements.txt
python pipeline/src/run_all.py     # data → validasi → public/data/*.json
```

## Di mana mengedit apa

| Ingin mengubah | File |
|---|---|
| Teks cerita, judul, identitas, URL | `src/data/narrativeConfig.ts` |
| Indikator, palet warna chart, path aset | `src/data/dataConfig.ts` |
| Warna dasar & font website | `src/styles/globals.css` |
| Satu bab cerita | `src/components/storytelling/ChapterXX*.tsx` |
| Satu chart | `src/components/charts/*.tsx` |
| Peta | `src/components/map/EastJavaMap.tsx` |
| Urutan bab | `src/App.tsx` |
| Ornamen halaman depan | ganti `public/assets/java-timur-silhouette.png` |
| Sprite kerumunan Open Peeps | simpan sebagai `public/assets/crowd/open-peeps-sheet.png` |

## Deploy ke GitHub Pages

1. Buat repo publik di GitHub, push seluruh folder ini ke branch `main`.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` membangun dan menerbitkan otomatis.
4. Isi `site.repoUrl` dan `site.appUrl` di `narrativeConfig.ts`.

## Sumber & atribusi

- Data utama: Badan Pusat Statistik (detail per visual dan di tombol "Metodologi & Sumber Data").
- Batas wilayah: ghapsara/indonesia-atlas (non-BPS). Lisensi tidak dinyatakan secara eksplisit oleh repository sumber.
- Ilustrasi kerumunan: Open Peeps (CC0). Animasi diadaptasi dari Skiper UI (Skiper 39).
- Dokumentasi pengolahan data: `pipeline/README_data.md`, `pipeline/config/corrections.csv`,
  `pipeline/reports/validation_report.md`.
