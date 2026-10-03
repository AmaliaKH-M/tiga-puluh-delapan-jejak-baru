# Laporan Validasi Data

PASS: 27 | FAIL: 0 | CATATAN: 6

## A. Kode wilayah

| Pemeriksaan | Status | Detail |
|---|---|---|
| tepat 38 kab/kota | PASS | 38 baris |
| string 4 digit | PASS |  |
| unik & tidak NULL | PASS |  |
| himpunan = 3501–3529, 3571–3579 | PASS |  |

## B. Indikator kab/kota

| Pemeriksaan | Status | Detail |
|---|---|---|
| tidak ada baris provinsi (3500) | PASS |  |
| key kode_wilayah+tahun+indikator unik | PASS | 0 duplikat |
| 38 wilayah di setiap indikator×tahun | PASS | min 38, max 38 |
| nilai kosong selalu ber-flag 'tidak_tersedia' | PASS | 38 sel kosong: tpt 2016 |
| rentang nilai masuk akal (cek konversi ribuan) | PASS | semua dalam rentang |
| cakupan tahun per indikator | CATATAN | gini_ratio: 2010–2025; hls: 2010–2025; ipm: 2010–2025; jumlah_penduduk: 2010–2025; jumlah_penduduk_miskin: 2010–2025; kepadatan_penduduk: 2010–2025; laju_pertumbuhan_pdrb_adhk: 2011–2025; pdrb_per_kapita_adhb: 2010–2025; pengeluaran_bukan_makanan: 2020–2025; pengeluaran_makanan: 2020–2025; pengeluaran_per_kapita_disesuaikan: 2010–2025; pengeluaran_total: 2020–2025; persen_penduduk_miskin: 2010–2025; rls: 2010–2025; tpt: 2010–2025; uhh: 2010–2025 |
| jumlah flag | CATATAN | patahan_seri_metode_uhh=760, luas_acuan_berbeda=456, turunan_makanan_plus_bukan_makanan=228, uhh_lf_sp2020=228, patahan_seri=76, tidak_tersedia=38, perlu_verifikasi=8, dikoreksi_C01=1 |

## C. Indikator provinsi

| Pemeriksaan | Status | Detail |
|---|---|---|
| key unik | PASS |  |
| Σ penduduk 38 kab/kota = baris Jatim (toleransi 10.000 jiwa) | PASS | selisih maks 5,578 (2025) |
| Σ jumlah miskin vs baris Jatim | CATATAN | tidak diagregasi; selisih 2010–2014: 2010: +50.2, 2011: -129.41, 2012: -77.98, 2013: +121.74, 2014: -38.49 |

## D. Konsistensi IPM

| Pemeriksaan | Status | Detail |
|---|---|---|
| IPM dapat direkonstruksi dari komponennya (≤0,02) | PASS | selisih maks 0.015 (rata-rata 0.0033) |

## E. PDRB lapangan usaha

| Pemeriksaan | Status | Detail |
|---|---|---|
| jumlah baris 38×17×5 = 3230 | PASS | 3230 |
| key kode_wilayah+tahun+kode_LU unik | PASS |  |
| seluruh 17 kategori termapping ke sektor | PASS |  |
| 38 kode valid | PASS |  |
| Σ17 LU ADHB = total resmi (≤0,5 miliar) | PASS | maks 0.21 (3579, 2024) |
| Σ17 LU ADHK = total resmi (≤0,5 miliar) | PASS | maks 0.04 (3573, 2024) |
| deflator ADHB/ADHK dalam 0,9–2,5 | PASS | min 1.008 (3522, 2020), max 1.781 (3571, 2024) |
| tidak ada wilayah dengan ADHK = salinan ADHB | PASS |  |
| ADHB/ADHK per LU = indeks implisit lampiran (35 wilayah, ≤1%) | PASS | deviasi relatif maks 0.11% (3527) |
| lampiran indeks implisit bergeser kolom di publikasi (tidak dipakai) | CATATAN | 3505, 3506, 3515 |
| status data | CATATAN | 2023 = sementara, 2024 = sangat sementara (kolom status_data) |

## F. GeoJSON

| Pemeriksaan | Status | Detail |
|---|---|---|
| 38 fitur, kode unik | PASS |  |
| kode GeoJSON = tabel kode wilayah | PASS |  |
| geometri valid (shapely) | PASS |  |
| join indikator 2025 ↔ GeoJSON 38/38 | PASS |  |

## G. Kesiapan PCA

| Pemeriksaan | Status | Detail |
|---|---|---|
| tahun 2024: ≥8 variabel × ≥34 unit, tanpa NA | PASS | 38 unit × 10 variabel |
| tahun 2025: ≥8 variabel × ≥34 unit, tanpa NA | PASS | 38 unit × 10 variabel |

## H. Catatan sumber

| Pemeriksaan | Status | Detail |
|---|---|---|
| sheet D02 vs D05 (dipakai D05) | CATATAN | 1 sel beda: [('Kota Batu', 2021)] |

