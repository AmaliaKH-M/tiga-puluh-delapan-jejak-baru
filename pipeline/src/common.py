"""Fungsi dan konstanta bersama untuk pipeline preprocessing.

Semua path relatif terhadap root project agar bisa dijalankan dari mana saja.
Data mentah di data/raw/ TIDAK PERNAH ditulis ulang.
"""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
INTERIM = ROOT / "data" / "interim"
PROCESSED = ROOT / "data" / "processed"
GEO = ROOT / "data" / "geo"
CONFIG = ROOT / "config"
REPORTS = ROOT / "reports"

XLSX = RAW / "UAS_VISDAT.xlsx"
PDF_PDRB = RAW / "pdrb_kabkota_jatim_lu_2020_2024.pdf"
GEOJSON_RAW = RAW / "jawa-timur.json"
UHH_LF = RAW / "uhh_lf_sp2020_2020_2025.csv"

YEARS = list(range(2010, 2026))
KODE_LU = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
           "M,N", "O", "P", "Q", "R,S,T,U"]


def id_num(v):
    """Ubah angka format Indonesia ('1.234,56') menjadi float.

    Nilai yang sudah numerik dikembalikan apa adanya (tanpa skala).
    String kosong / '-' / '…' -> None.
    """
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    if s in ("", "-", "…", "...", "\\~0", "~0"):
        return None
    return float(s.replace(".", "").replace(",", "."))


def ensure_dirs():
    for d in (INTERIM, PROCESSED, GEO, REPORTS):
        d.mkdir(parents=True, exist_ok=True)


def load_kode():
    return pd.read_csv(PROCESSED / "kode_wilayah.csv", dtype={"kode_wilayah": str})
