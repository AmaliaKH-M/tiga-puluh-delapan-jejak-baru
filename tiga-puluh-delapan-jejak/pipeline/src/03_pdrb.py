"""STEP 1d — PDRB menurut lapangan usaha (D16 ADHB, D17 ADHK) dari PDF publikasi BPS.

Sumber utama : data/interim/pdf_*.csv (hasil 00_extract_pdrb_pdf.py)
Pembanding   : sheet 'pdrb adhb/adhk lap usaha' di UAS_VISDAT.xlsx (hanya untuk laporan)

Identifikasi tabel TIDAK berdasarkan urutan halaman, melainkan berdasarkan
kecocokan total PDRB setiap halaman lampiran dengan tabel ringkasan per kode
wilayah (35xx):
  hlm 69 = PDRB ADHB per kab/kota, hlm 71 = PDRB ADHK, hlm 83 = indeks implisit.
Identitas ADHB/ADHK*100 = indeks implisit diuji untuk memastikan ketiganya benar.

Rekonsiliasi otomatis (terdokumentasi di config/corrections.csv):
  - Jika jumlah 17 LU ADHB != total resmi (selisih > 1 miliar) dan
    ADHK x indeks implisit/100 menghasilkan jumlah = total resmi, nilai LU ADHB
    diganti hasil rekonstruksi (flag 'rekonstruksi_adhk_x_implisit'). Kasus: Kota Batu.
  - Total ADHB resmi diambil dari tabel ringkasan (bukan baris total halaman lampiran,
    yang salah cetak untuk Kab. Kediri).
"""
import re
import openpyxl
import pandas as pd
from common import INTERIM, PROCESSED, REPORTS, CONFIG, XLSX, KODE_LU, ensure_dirs, load_kode, id_num

HAL = {"ADHB": 69, "ADHK": 71, "IMPLISIT": 83}
TAHUN = [2020, 2021, 2022, 2023, 2024]
STATUS = {2020: "tetap", 2021: "tetap", 2022: "tetap", 2023: "sementara", 2024: "sangat_sementara"}


def parse_xlsx(sheet):
    """Parser blok sheet xlsx (hanya untuk cross-check)."""
    ws = openpyxl.load_workbook(XLSX, data_only=True)[sheet]
    blocks, cur, title = [], None, None
    for r in ws.iter_rows(values_only=True):
        a = r[0]
        if a is None:
            continue
        a = str(a).strip()
        if a.startswith("Kategori"):
            cur = {"title": title, "lu": {}}
            blocks.append(cur)
            continue
        m = re.match(r"^([A-Z](?:,[A-Z])*)\s+", a)
        if cur is not None and m and r[1] is not None and not a.startswith(("PRODUK", "PDRB")):
            cur["lu"][m.group(1)] = [id_num(x) for x in r[1:6]]
        elif r[1] is None:
            title = a
    return blocks


def main():
    ensure_dirs()
    kode = load_kode()
    kode2nama = dict(zip(kode.kode_wilayah, kode.nama_wilayah))
    pdf2kode = dict(zip(kode.nama_pdf, kode.kode_wilayah))
    sektor = pd.read_csv(CONFIG / "mapping_sektor.csv")

    lu = pd.read_csv(INTERIM / "pdf_lu_tables.csv")
    sm = pd.read_csv(INTERIM / "pdf_summary_tables.csv", dtype={"kode_wilayah": str})
    S = {k: sm[sm.halaman_pdf == p].pivot(index="kode_wilayah", columns="tahun", values="nilai")
         for k, p in HAL.items()}
    for k in S:
        assert len(S[k]) == 38, f"ringkasan {k} tidak 38 wilayah"
    ident = (S["ADHB"] / S["ADHK"] * 100 - S["IMPLISIT"]).abs().max().max()
    assert ident < 0.01, f"identitas ADHB/ADHK=implisit gagal ({ident})"

    W = lu.pivot_table(index=["halaman_pdf", "kode_lu"], columns="tahun", values="nilai")
    pages = sorted(lu.halaman_pdf.unique())

    def page_vals(p):
        return W.loc[p]

    # cocokkan halaman lampiran -> (jenis, kode wilayah) via total
    assign, log = {}, []
    for p in pages:
        tot = page_vals(p).loc["TOTAL"]
        for jenis in HAL:
            d = ((S[jenis] - tot).abs() / S[jenis].abs()).max(axis=1)  # selisih relatif
            k = d.idxmin()
            if d.min() < 5e-4:  # 0,05%: menoleransi salah cetak total Kab. Kediri (0,013%)
                assert (jenis, k) not in assign, f"dua halaman untuk {jenis} {k}"
                assign[(jenis, k)] = p
                log.append((jenis, k, p, round(float((S[jenis].loc[k] - tot).abs().max()), 2)))
    for jenis in ("ADHB", "ADHK"):
        n = sum(1 for j, _ in assign if j == jenis)
        assert n == 38, f"{jenis}: hanya {n} halaman cocok"
    # Indeks implisit per LU hanya dipakai untuk rekonstruksi & validasi.
    # Di publikasi, lampiran indeks implisit Kab. Blitar, Kab. Kediri, Kab. Sidoarjo
    # tercetak bergeser satu kolom sehingga tidak cocok dengan ringkasan; dicatat saja.
    for k in sorted(set(S["IMPLISIT"].index) - {kk for j, kk in assign if j == "IMPLISIT"}):
        for p in pages:
            tot = page_vals(p).loc["TOTAL"]
            if (tot[[2021, 2022, 2023, 2024]].values - S["IMPLISIT"].loc[k, [2020, 2021, 2022, 2023]].values
                    ).__abs__().max() < 0.02:
                log.append(("IMPLISIT_BERGESER_1_KOLOM", k, p, None))
    pd.DataFrame(log, columns=["jenis", "kode_wilayah", "halaman_pdf", "selisih_total_maks"]
                 ).sort_values(["jenis", "kode_wilayah"]).to_csv(REPORTS / "pdrb_pdf_page_map.csv", index=False)

    rows, recon_log = [], []
    for k in kode.kode_wilayah:
        B = page_vals(assign[("ADHB", k)]).reindex(KODE_LU)
        K = page_vals(assign[("ADHK", k)]).reindex(KODE_LU)
        I = page_vals(assign[("IMPLISIT", k)]).reindex(KODE_LU) if ("IMPLISIT", k) in assign else None
        assert not B.isna().any().any() and not K.isna().any().any(), f"{k}: ada sel ADHB/ADHK kosong"
        flagB = ""
        diff_sum = (B.sum() - S["ADHB"].loc[k]).abs().max()
        if diff_sum > 1:
            assert I is not None, f"{k}: perlu indeks implisit untuk rekonstruksi"
            R = (K * I / 100).round(2)
            diff_rec = (R.sum() - S["ADHB"].loc[k]).abs().max()
            if diff_rec < 1:
                recon_log.append((k, kode2nama[k], round(diff_sum, 2), round(diff_rec, 2)))
                B, flagB = R, "rekonstruksi_adhk_x_implisit"
            else:
                raise ValueError(f"{k}: ADHB tidak konsisten dan tidak bisa direkonstruksi")
        for c in KODE_LU:
            for th in TAHUN:
                rows.append({
                    "kode_wilayah": k, "nama_wilayah": kode2nama[k], "tahun": th,
                    "kode_lapangan_usaha": c,
                    "pdrb_adhb": round(float(B.loc[c, th]), 2),
                    "pdrb_adhk": round(float(K.loc[c, th]), 2),
                    "satuan": "miliar rupiah",
                    "status_data": STATUS[th],
                    "flag": flagB,
                })
    df = pd.DataFrame(rows).merge(sektor, on="kode_lapangan_usaha", how="left")
    df = df[["kode_wilayah", "nama_wilayah", "tahun", "kode_lapangan_usaha", "nama_lapangan_usaha",
             "sektor", "pdrb_adhb", "pdrb_adhk", "satuan", "status_data", "flag"]]
    df.to_csv(PROCESSED / "pdrb_lu_long.csv", index=False)

    # total resmi per kab/kota (dari tabel ringkasan PDF)
    tot = []
    for k in kode.kode_wilayah:
        for th in TAHUN:
            tot.append((k, kode2nama[k], th, S["ADHB"].loc[k, th], S["ADHK"].loc[k, th],
                        S["IMPLISIT"].loc[k, th], "miliar rupiah", STATUS[th]))
    pd.DataFrame(tot, columns=["kode_wilayah", "nama_wilayah", "tahun", "pdrb_adhb_total_resmi",
                               "pdrb_adhk_total_resmi", "indeks_implisit", "satuan", "status_data"]
                 ).to_csv(PROCESSED / "pdrb_total_kabkota.csv", index=False)

    # cross-check xlsx vs hasil final (per blok berlabel di xlsx)
    cc = []
    final = df.set_index(["kode_wilayah", "kode_lapangan_usaha", "tahun"])
    for jenis, sheet, col in [("ADHB", "pdrb adhb lap usaha", "pdrb_adhb"),
                              ("ADHK", "pdrb adhk lap usaha", "pdrb_adhk")]:
        for b in parse_xlsx(sheet):
            t = b["title"].replace("PDRB ", "").replace(" ADHB", "").replace("Kabupaten", "Kab.").strip()
            k = pdf2kode[t]
            nbeda = sum(abs((b["lu"][c][j] or 0) - final.loc[(k, c, th), col]) > 0.005
                        for c in KODE_LU for j, th in enumerate(TAHUN))
            cc.append((jenis, t, k, nbeda))
    pd.DataFrame(cc, columns=["jenis", "label_blok_xlsx", "kode_wilayah", "sel_berbeda_dari_final_85"]
                 ).to_csv(REPORTS / "pdrb_crosscheck_xlsx.csv", index=False)
    pd.DataFrame(recon_log, columns=["kode_wilayah", "nama_wilayah", "selisih_jumlah_LU_tercetak",
                                     "selisih_jumlah_rekonstruksi"]
                 ).to_csv(REPORTS / "pdrb_rekonstruksi.csv", index=False)
    print(f"[03] pdrb_lu_long: {len(df)} baris | direkonstruksi: {[r[1] for r in recon_log]} | "
          f"blok xlsx berbeda: {[(j, t) for j, t, _, n in cc if n]}")


if __name__ == "__main__":
    main()
