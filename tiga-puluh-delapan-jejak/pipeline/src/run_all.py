"""Jalankan seluruh pipeline preprocessing + validasi secara berurutan.

    python src/run_all.py            # pakai hasil ekstraksi PDF yang sudah ada
    python src/run_all.py --pdf      # ekstrak ulang PDF (±1–2 menit)
"""
import runpy
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
steps = ["01_kode_wilayah.py", "02_indikator.py", "03_pdrb.py", "04_geo.py", "06_export_web.py", "05_validate.py"]
if "--pdf" in sys.argv or not (HERE.parent / "data" / "interim" / "pdf_lu_tables.csv").exists():
    steps.insert(0, "00_extract_pdrb_pdf.py")
for s in steps:
    print(f"\n=== {s} ===")
    runpy.run_path(str(HERE / s), run_name="__main__")
