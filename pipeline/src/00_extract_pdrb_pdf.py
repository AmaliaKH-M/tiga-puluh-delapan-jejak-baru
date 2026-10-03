"""STEP 1a — Ekstraksi tabel dari PDF publikasi BPS
'Produk Domestik Regional Bruto Kabupaten/Kota di Provinsi Jawa Timur
Menurut Lapangan Usaha 2020–2024'.

Output (data/interim/):
  pdf_lu_tables.csv       : setiap halaman tabel 17 lapangan usaha (semua jenis tabel)
  pdf_summary_tables.csv  : setiap halaman tabel ringkasan per kab/kota (kode 35xx)

Script ini HANYA mengekstrak teks apa adanya. Identifikasi jenis tabel
(ADHB/ADHK/indeks implisit/distribusi) dan koreksi dilakukan di 03_pdrb.py.

Catatan teknis: setiap halaman PDF memiliki watermark diagonal
'https://jatim.bps.go.id'. Karakter watermark diputar 45°, jadi disaring
dengan membuang karakter yang matriks transformasinya tidak tegak.
"""
import re
import pdfplumber
import pandas as pd
from common import PDF_PDRB, INTERIM, KODE_LU, ensure_dirs

NUM = r"-?\d{1,3}(?:\.\d{3})*,\d{2}"
TAHUN = [2020, 2021, 2022, 2023, 2024]


def n(s):
    return float(s.replace(".", "").replace(",", "."))


def clean_text(page):
    upright = page.filter(
        lambda o: o.get("object_type") != "char" or abs(o["matrix"][1]) < 1e-6)
    return upright.extract_text() or ""


def parse_lu_page(text):
    """Kembalikan dict {kode_lu: [5 nilai]} + TOTAL + TANPA_MIGAS, atau None."""
    if "ategori" not in text or "PRODUK DOMESTIK REGIONAL BRUTO" not in text:
        return None
    body = text[text.find("(7)"):] if "(7)" in text else text
    pos, start = [], 0
    for c in KODE_LU:
        m = re.search(r"(?:^|\n)\s*" + re.escape(c) + r"\s+[A-Z]", body[start:])
        if not m:
            return None
        pos.append((c, start + m.start()))
        start += m.end()
    t_pos = body.find("PRODUK DOMESTIK REGIONAL BRUTO")
    m_pos = body.find("PDRB TANPA MIGAS")
    out = {}
    for i, (c, s) in enumerate(pos):
        e = pos[i + 1][1] if i + 1 < len(pos) else t_pos
        nums = re.findall(NUM, body[s:e])
        if len(nums) == 0:          # baris tanpa nilai (LU tidak ada di wilayah tsb.)
            out[c] = [None] * 5
            continue
        if len(nums) != 5:
            return None
        out[c] = [n(x) for x in nums]
    tot = re.findall(NUM, body[t_pos:m_pos].replace("- ", "-"))
    nm = re.findall(NUM, body[m_pos:m_pos + 300].replace("- ", "-"))
    if len(tot) < 5 or len(nm) < 5:
        return None
    out["TOTAL"] = [n(x) for x in tot[:5]]
    out["TANPA_MIGAS"] = [n(x) for x in nm[:5]]
    return out


def parse_summary_page(text):
    pat = (r"(35\d\d) ((?:Kab\.|Kota) [A-Za-z ]+?)\s+" +
           r"\s+".join(["(" + NUM + ")"] * 5))
    rows = re.findall(pat, text)
    return rows if len(rows) >= 30 else None


def main():
    ensure_dirs()
    lu_rows, sum_rows = [], []
    with pdfplumber.open(PDF_PDRB) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = clean_text(page)
            lu = parse_lu_page(text)
            if lu:
                for kode, vals in lu.items():
                    for th, v in zip(TAHUN, vals):
                        lu_rows.append((i, kode, th, v))
            sm = parse_summary_page(text)
            if sm:
                for r in sm:
                    for th, v in zip(TAHUN, r[2:]):
                        sum_rows.append((i, r[0], r[1].strip(), th, n(v)))
    lu_df = pd.DataFrame(lu_rows, columns=["halaman_pdf", "kode_lu", "tahun", "nilai"])
    sm_df = pd.DataFrame(sum_rows, columns=["halaman_pdf", "kode_wilayah", "nama_pdf", "tahun", "nilai"])
    lu_df.to_csv(INTERIM / "pdf_lu_tables.csv", index=False)
    sm_df.to_csv(INTERIM / "pdf_summary_tables.csv", index=False)
    print(f"[00] halaman tabel LU: {lu_df.halaman_pdf.nunique()} | "
          f"halaman ringkasan: {sm_df.halaman_pdf.nunique()}")


if __name__ == "__main__":
    main()
