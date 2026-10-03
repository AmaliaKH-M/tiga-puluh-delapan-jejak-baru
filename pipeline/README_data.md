# Menelusuri Jejak Daya Beli & Pergeseran Ekonomi Jawa Timur

Proyek UAS Visualisasi Data dan Informasi 2026 — Politeknik Statistika STIS.
Lokus: 38 kabupaten/kota di Provinsi Jawa Timur. Topik: **multivariat**, **geospasial**, **hierarki**.

> Status: STEP 1–2 (preprocessing & validasi) selesai. Bagian aplikasi web, tautan deploy,
> dan deklarasi AI akan dilengkapi pada STEP 12.

## Menjalankan pipeline

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate   |  macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python src/run_all.py          # gunakan hasil ekstraksi PDF di data/interim/
python src/run_all.py --pdf    # ekstrak ulang dari PDF (±1–2 menit)
```

Pipeline berhenti dengan error jika ada asumsi yang dilanggar, dan `05_validate.py`
keluar dengan kode 1 bila ada pemeriksaan FAIL. Hasil validasi: `reports/validation_report.md`.

## Struktur folder

```
data/raw/        data mentah, TIDAK PERNAH diubah oleh script
data/interim/    hasil ekstraksi teks PDF (belum dikoreksi)
data/processed/  data siap visualisasi (format long)
data/geo/        GeoJSON 38 kab/kota + kode wilayah BPS
config/          mapping sektor (D22) dan log koreksi (corrections.csv)
src/             00–05 script pipeline + run_all.py
reports/         laporan validasi dan bukti pengecekan
```

## Data processed

| File | Isi | Kunci unik |
|---|---|---|
| `kode_wilayah.csv` | 38 kode (string 4 digit), nama, jenis wilayah | kode_wilayah |
| `indikator_kabkota_long.csv` | 17 indikator × 38 kab/kota, 2010–2025 | kode_wilayah + tahun + indikator |
| `indikator_provinsi_long.csv` | indikator Provinsi Jawa Timur (kode 3500); % miskin 2005–2025 | kode_wilayah + tahun + indikator |
| `pdrb_lu_long.csv` | PDRB ADHB & ADHK 2010=100, 17 LU × 38 kab/kota, 2020–2024 (miliar Rp) | kode_wilayah + tahun + kode_lapangan_usaha |
| `pdrb_total_kabkota.csv` | total PDRB resmi & indeks implisit per kab/kota | kode_wilayah + tahun |
| `inflasi_jatim_2025_long.csv` | inflasi y-on-y 2025 per kelompok/subkelompok | kode_kelompok + bulan |
| `../geo/jatim_kabkota.geojson` | batas 38 kab/kota + `kode_wilayah` | kode_wilayah |

Kolom `flag` menandai kondisi khusus: `tidak_tersedia`, `dikoreksi_Cxx`, `rekonstruksi_adhk_x_implisit`,
`patahan_seri`, `patahan_seri_metode_uhh`, `luas_acuan_berbeda`, `perlu_verifikasi`,
`turunan_makanan_plus_bukan_makanan`. Kolom `status_data` PDRB: 2023 sementara, 2024 sangat sementara.

## Sumber data

Data utama: Badan Pusat Statistik (BPS). Judul tabel, URL, tahun data, dan tanggal akses
tercatat di sheet *Data Inventory* pada Master Plan dan akan ditampilkan di aplikasi.

| ID | Data | Sumber |
|---|---|---|
| D01 | Persentase penduduk miskin Jawa Timur 2005–2025 | BPS |
| D03–D15 | Indikator kab/kota (kemiskinan, PPK, IPM & komponen, TPT, PDRB per kapita, laju PDRB, penduduk, kepadatan, Gini) | BPS / BPS Provinsi Jawa Timur |
| D09 | Umur Harapan Hidup Hasil Long Form SP2020 Menurut Kabupaten/Kota (2020–2025) | BPS |
| D16–D17 | Publikasi *Produk Domestik Regional Bruto Kabupaten/Kota di Provinsi Jawa Timur Menurut Lapangan Usaha 2020–2024* | BPS Provinsi Jawa Timur |
| D18 | Rata-rata pengeluaran per kapita sebulan makanan dan bukan makanan menurut kab/kota | BPS Provinsi Jawa Timur |
| D19 | Inflasi tahunan (y-on-y) menurut kelompok pengeluaran, Jawa Timur 2025 | BPS Provinsi Jawa Timur |
| D20 | Batas kab/kota: `ghapsara/indonesia-atlas` (folder `kabupaten-kota/Jawa Timur`), turunan data gispedia 2016, disederhanakan dengan mapshaper. **Lisensi tidak dinyatakan secara eksplisit oleh repository sumber.** | Non-BPS |
| D22 | Pemetaan 17 lapangan usaha → sektor primer (A–B), sekunder (C–F), tersier (G–U); dibuat sendiri | — |

## Keputusan preprocessing (ringkas)

Seluruh koreksi nilai tercatat di `config/corrections.csv` beserta buktinya.

1. **Format angka.** String format Indonesia dikonversi ke numerik. Pada sheet pengeluaran per kapita
   dan jumlah penduduk, pemisah ribuan hilang di Excel (6.775 terbaca 6,775), sehingga dikali 1.000
   hanya bila nilai di bawah ambang yang tidak ambigu; rentang hasil diuji di validasi.
2. **PDRB menurut lapangan usaha diambil langsung dari PDF publikasi BPS**, bukan dari salinan xlsx.
   Halaman lampiran diidentifikasi melalui kecocokan total dengan tabel ringkasan per kode wilayah,
   bukan urutan halaman. Di xlsx, 6 blok ADHK salah label dan ADHK Kota Malang merupakan salinan ADHB.
3. **ADHB Kota Batu direkonstruksi** (ADHK × indeks implisit / 100). Tabel lampiran ADHB Kota Batu
   di publikasi tercetak bergeser satu kolom (jumlah LU ≠ total). Hasil rekonstruksi cocok dengan
   total resmi (selisih ≤ 0,21 miliar) dan dengan tabel distribusi persentase.
4. **Total ADHB Kab. Kediri** memakai tabel ringkasan (= jumlah LU); baris total di halaman lampiran salah cetak.
5. **UHH 2020–2025 memakai seri Long Form SP2020**, konsisten dengan IPM. Dengan seri ini, IPM 2010–2025
   dapat direkonstruksi dari komponennya (selisih maks 0,015). Lonjakan UHH dan IPM pada 2019→2020
   merupakan patahan metodologis, bukan perubahan riil.
6. **Kepadatan penduduk** hanya konsisten (satu luas acuan) pada 2022–2025; 2010–2021 diberi flag
   `luas_acuan_berbeda` dan tidak dipakai untuk analisis tren.
7. **Jumlah penduduk Gresik 2015** dikoreksi 1.167.313 → 1.256.313 (selisih tepat 89.000 terhadap total provinsi).
8. **Jumlah penduduk** memiliki patahan seri pada 2020 dan 2024; persentase kemiskinan dipakai langsung
   dari BPS dan tidak dihitung ulang dari tabel penduduk.
9. **TPT 2016** kosong di sumber (sampel Sakernas tidak cukup untuk estimasi kab/kota); tidak diimputasi.
10. **Pengeluaran total (D18)** = makanan + bukan makanan.
11. **GeoJSON** tidak memiliki kode wilayah dan memuat 7 nama kembar; nama kembar dibedakan berdasarkan
    luas poligon (kabupaten 22–52× lebih luas dari kota bernama sama). Lihat `reports/geo_mapping.csv`.

## Keterbatasan data

- PDRB menurut lapangan usaha hanya tersedia 2020–2024; 2023–2024 berstatus sementara.
- "Daya beli" dioperasionalkan melalui proxy (pengeluaran per kapita disesuaikan, kemiskinan,
  PDRB per kapita), bukan ukuran kelas menengah.
- Beberapa nilai masih berflag `perlu_verifikasi` (lihat laporan validasi).
