"""STEP 1e — Batas wilayah (D20) + kode wilayah BPS.

Sumber: data/raw/jawa-timur.json (FeatureCollection 38 fitur; properti hanya
'provinsi' dan 'kabkot'). Turunan dari ghapsara/indonesia-atlas
(kabupaten-kota/Jawa Timur), data asli gispedia 2016, disederhanakan mapshaper.
Lisensi tidak dinyatakan secara eksplisit oleh repository sumber.

Masalah: tidak ada kode wilayah, dan 7 nama muncul dua kali (Kabupaten & Kota
dengan nama sama, tanpa penanda). Mapping TIDAK berdasarkan urutan fitur:
  1. Nama unik -> langsung ke kode.
  2. Nama kembar -> poligon dengan luas lebih besar = Kabupaten, lebih kecil = Kota.
     Syarat aman: rasio luas >= 5 (diuji; aktualnya 16-90x).
Geometri tidak diubah. CRS: tidak dinyatakan; per RFC 7946 GeoJSON = WGS84 (EPSG:4326).
"""
import json
import math
import pandas as pd
from common import GEOJSON_RAW, GEO, REPORTS, ensure_dirs, load_kode


def ring_area(r):
    return abs(sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))) / 2


def geom_area(g):
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    # luas planar dalam derajat^2 (cukup untuk membandingkan, bukan untuk analisis)
    return sum(ring_area(p[0]) - sum(ring_area(h) for h in p[1:]) for p in polys)


def main():
    ensure_dirs()
    kode = load_kode()
    gj = json.load(open(GEOJSON_RAW, encoding="utf-8"))
    feats = gj["features"]
    assert len(feats) == 38, f"jumlah fitur {len(feats)}"
    by_name = {}
    for i, f in enumerate(feats):
        by_name.setdefault(f["properties"]["kabkot"].strip(), []).append((i, geom_area(f["geometry"])))

    rows = []
    for nama, items in by_name.items():
        cand = kode[kode.nama_singkat == nama]
        if len(items) == 1:
            assert len(cand) == 1, f"nama '{nama}' tidak/ambigu di kode_wilayah"
            rows.append((items[0][0], nama, cand.kode_wilayah.iloc[0], "nama_unik", None))
        else:
            assert len(items) == 2 and len(cand) == 2, f"nama kembar tak terduga: {nama}"
            big, small = sorted(items, key=lambda x: -x[1])
            ratio = big[1] / small[1]
            assert ratio >= 5, f"{nama}: rasio luas {ratio:.1f} terlalu kecil untuk dibedakan aman"
            kab = cand[cand.jenis_wilayah == "Kabupaten"].kode_wilayah.iloc[0]
            kot = cand[cand.jenis_wilayah == "Kota"].kode_wilayah.iloc[0]
            rows.append((big[0], nama, kab, "nama_kembar_luas_terbesar", round(ratio, 1)))
            rows.append((small[0], nama, kot, "nama_kembar_luas_terkecil", round(ratio, 1)))
    mp = pd.DataFrame(rows, columns=["indeks_fitur", "kabkot_asli", "kode_wilayah", "metode", "rasio_luas"])
    assert mp.kode_wilayah.nunique() == 38
    mp = mp.merge(kode[["kode_wilayah", "nama_wilayah", "jenis_wilayah"]], on="kode_wilayah")
    mp.sort_values("indeks_fitur").to_csv(REPORTS / "geo_mapping.csv", index=False)

    m = mp.set_index("indeks_fitur")
    out = {"type": "FeatureCollection", "features": []}
    for i, f in enumerate(feats):
        out["features"].append({
            "type": "Feature",
            "properties": {
                "kode_wilayah": m.loc[i, "kode_wilayah"],
                "nama_wilayah": m.loc[i, "nama_wilayah"],
                "jenis_wilayah": m.loc[i, "jenis_wilayah"],
                "kabkot_asli": f["properties"]["kabkot"],
            },
            "geometry": f["geometry"],
        })
    out["features"].sort(key=lambda f: f["properties"]["kode_wilayah"])
    with open(GEO / "jatim_kabkota.geojson", "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False)
    print(f"[04] geojson: {len(out['features'])} fitur, 38 kode unik; "
          f"rasio luas nama kembar min {mp.rasio_luas.min()}x")


if __name__ == "__main__":
    main()
