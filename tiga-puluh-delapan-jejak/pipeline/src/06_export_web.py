"""STEP 1f — Ekspor data processed ke JSON untuk aplikasi web (public/data/).

Semua analisis (PCA, klaster, fakta naratif) dihitung DI SINI agar reprodusibel
dan bisa dikutip di Metodologi. Front-end hanya merender.

Output:
  regions.json      : 38 kab/kota
  indicators.json   : nilai per indikator × kode × tahun (+ flag)
  province.json     : indikator Provinsi Jawa Timur
  pdrb.json         : PDRB ADHB/ADHK per kab/kota × LU × tahun
  pca.json          : PCA 2025 (skor, loading, explained), klaster Ward, urutan heatmap
  facts.json        : angka-angka untuk narasi (diturunkan otomatis dari data)
  sources.json      : metadata sumber dari Master Plan (Data Inventory)
  d20_batas_kabkota_jatim.geojson
"""
import json
import shutil
import numpy as np
import pandas as pd
import openpyxl
from scipy.cluster.hierarchy import linkage, fcluster, leaves_list
from common import ROOT, PROCESSED, GEO, load_kode

OUT = ROOT.parent / "public" / "data"
MASTER = ROOT / "docs" / "Master_Plan_Visdat_Jatim_2026_rev.xlsx"
PCA_YEAR = 2025
PCA_VARS = ["persen_penduduk_miskin", "pengeluaran_per_kapita_disesuaikan", "rls", "hls", "uhh", "tpt",
            "pdrb_per_kapita_adhb", "laju_pertumbuhan_pdrb_adhk", "kepadatan_penduduk", "gini_ratio"]
LOG_VARS = ["pdrb_per_kapita_adhb", "kepadatan_penduduk"]
N_CLUSTER = 4
LABEL = {"persen_penduduk_miskin": "kemiskinan", "pengeluaran_per_kapita_disesuaikan": "pengeluaran per kapita",
         "rls": "rata-rata lama sekolah", "hls": "harapan lama sekolah", "uhh": "umur harapan hidup",
         "tpt": "pengangguran terbuka", "pdrb_per_kapita_adhb": "PDRB per kapita",
         "laju_pertumbuhan_pdrb_adhk": "pertumbuhan ekonomi", "kepadatan_penduduk": "kepadatan",
         "gini_ratio": "ketimpangan (Gini)"}


def dump(name, obj):
    with open(OUT / name, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, separators=(",", ":"))


def clean(v):
    return None if v is None or (isinstance(v, float) and np.isnan(v)) else round(float(v), 4)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    kode = load_kode()
    ind = pd.read_csv(PROCESSED / "indikator_kabkota_long.csv", dtype={"kode_wilayah": str})
    prov = pd.read_csv(PROCESSED / "indikator_provinsi_long.csv", dtype={"kode_wilayah": str})
    pdrb = pd.read_csv(PROCESSED / "pdrb_lu_long.csv", dtype={"kode_wilayah": str})

    dump("regions.json", [{"kode": r.kode_wilayah, "nama": r.nama_wilayah, "singkat": r.nama_singkat,
                           "jenis": r.jenis_wilayah} for r in kode.itertuples()])

    def pack(df):
        data, flags, units = {}, {}, {}
        for r in df.itertuples():
            data.setdefault(r.indikator, {}).setdefault(r.kode_wilayah, {})[str(r.tahun)] = clean(r.nilai)
            if isinstance(r.flag, str) and r.flag:
                flags.setdefault(r.indikator, {}).setdefault(r.kode_wilayah, {})[str(r.tahun)] = r.flag
            units[r.indikator] = r.satuan
        return {"data": data, "flags": flags, "units": units}

    dump("indicators.json", pack(ind))
    p = pack(prov)
    p["data"] = {k: v["3500"] for k, v in p["data"].items()}
    p["flags"] = {k: v.get("3500", {}) for k, v in p["flags"].items()}
    dump("province.json", p)

    # PDRB: {kode: {tahun: {lu: [adhb, adhk]}}}
    lu = pdrb.drop_duplicates("kode_lapangan_usaha")[["kode_lapangan_usaha", "nama_lapangan_usaha", "sektor"]]
    pd_data = {}
    for r in pdrb.itertuples():
        pd_data.setdefault(r.kode_wilayah, {}).setdefault(str(r.tahun), {})[r.kode_lapangan_usaha] = [
            r.pdrb_adhb, r.pdrb_adhk]
    dump("pdrb.json", {
        "years": sorted(int(y) for y in pdrb.tahun.unique()),
        "status": {"2023": "sementara", "2024": "sangat sementara"},
        "unit": "miliar rupiah",
        "lu": [{"kode": r.kode_lapangan_usaha, "nama": r.nama_lapangan_usaha, "sektor": r.sektor}
               for r in lu.itertuples()],
        "reconstructed": sorted(pdrb[pdrb.flag.fillna("").str.contains("rekonstruksi")].kode_wilayah.unique().tolist()),
        "data": pd_data,
    })

    # PCA
    X = ind[(ind.tahun == PCA_YEAR) & ind.indikator.isin(PCA_VARS)].pivot(
        index="kode_wilayah", columns="indikator", values="nilai")[PCA_VARS]
    assert X.shape == (38, len(PCA_VARS)) and not X.isna().any().any()
    Xt = X.copy()
    for v in LOG_VARS:
        Xt[v] = np.log(Xt[v])
    Z = (Xt - Xt.mean()) / Xt.std(ddof=0)
    ev, vec = np.linalg.eigh(np.cov(Z.T.values, bias=True))
    o = ev.argsort()[::-1]
    ev, vec = ev[o], vec[:, o]
    # orientasi: PC1 positif = pengeluaran per kapita lebih tinggi (hanya konvensi tanda)
    for j in range(2):
        if vec[PCA_VARS.index("pengeluaran_per_kapita_disesuaikan") if j == 0 else PCA_VARS.index(
                "laju_pertumbuhan_pdrb_adhk"), j] < 0:
            vec[:, j] *= -1
    S = Z.values @ vec[:, :2]
    link = linkage(Z.values, method="ward")
    cl = fcluster(link, N_CLUSTER, criterion="maxclust")
    order = [Z.index[i] for i in leaves_list(link)]
    var_order = [PCA_VARS[i] for i in leaves_list(linkage(Z.T.values, method="average", metric="correlation"))]
    # deskripsi klaster dari data: 2 variabel dengan rata-rata z paling ekstrem
    clusters = []
    for c in sorted(set(cl)):
        m = Z[cl == c].mean().sort_values()
        parts = [f"{LABEL[v]} {'tinggi' if m[v] > 0 else 'rendah'}" for v in
                 list(m.abs().sort_values(ascending=False).index[:3])]
        clusters.append({"id": int(c), "n": int((cl == c).sum()), "ciri": parts,
                         "anggota": Z.index[cl == c].tolist()})
    # urutkan id klaster berdasarkan rata-rata PC1 agar label stabil (A = PC1 terendah)
    pc1_mean = {c["id"]: float(S[cl == c["id"], 0].mean()) for c in clusters}
    rank = {cid: i for i, cid in enumerate(sorted(pc1_mean, key=pc1_mean.get))}
    letters = "ABCDEFGH"
    for c in clusters:
        c["label"] = f"Kelompok {letters[rank[c['id']]]}"
        c["idx"] = rank[c["id"]]
    clusters.sort(key=lambda c: c["idx"])
    cl_map = {k: rank[int(c)] for k, c in zip(Z.index, cl)}
    # pencilan: jarak Mahalanobis pada 2 PC (z-score skor > 2.5 pada salah satu PC)
    sz = (S - S.mean(0)) / S.std(0)
    outliers = [Z.index[i] for i in range(38) if np.abs(sz[i]).max() > 2.5]
    dump("pca.json", {
        "year": PCA_YEAR, "variables": PCA_VARS, "log_transformed": LOG_VARS,
        "explained": [round(float(e / ev.sum()), 4) for e in ev],
        "loadings": {v: [round(float(vec[i, 0]), 4), round(float(vec[i, 1]), 4)] for i, v in enumerate(PCA_VARS)},
        "scores": {k: [round(float(S[i, 0]), 4), round(float(S[i, 1]), 4)] for i, k in enumerate(Z.index)},
        "cluster": cl_map, "clusters": clusters, "outliers": outliers,
        "heatmap": {"row_order": order, "col_order": var_order,
                    "z": {k: [round(float(Z.loc[k, v]), 3) for v in var_order] for k in Z.index}},
        "raw": {k: {v: clean(X.loc[k, v]) for v in PCA_VARS} for k in X.index},
    })

    # Fakta naratif (semua dari data)
    nm = dict(zip(kode.kode_wilayah, kode.nama_wilayah))

    def series(indic, year):
        return ind[(ind.indikator == indic) & (ind.tahun == year)].set_index("kode_wilayah").nilai

    pv = lambda y: float(prov[(prov.indikator == "persen_penduduk_miskin") & (prov.tahun == y)].nilai.iloc[0])
    m10, m19, m21, m25 = (series("persen_penduduk_miskin", y) for y in (2010, 2019, 2021, 2025))
    jm25 = series("jumlah_penduduk_miskin", 2025)
    ppk25 = series("pengeluaran_per_kapita_disesuaikan", 2025)
    pk25 = series("pdrb_per_kapita_adhb", 2025)
    pen25 = series("jumlah_penduduk", 2025)
    dens25 = series("kepadatan_penduduk", 2025)
    s = pdrb.groupby(["tahun", "sektor"]).pdrb_adhb.sum().unstack()
    sh = s.div(s.sum(1), axis=0) * 100
    lus = pdrb.groupby(["tahun", "kode_lapangan_usaha"]).pdrb_adhb.sum().unstack()
    lush = lus.div(lus.sum(1), axis=0) * 100
    dom = pdrb[pdrb.tahun == 2024].loc[lambda x: x.groupby("kode_wilayah").pdrb_adhb.idxmax()]
    g = pdrb.groupby(["kode_wilayah", "tahun"]).pdrb_adhk.sum().unstack()
    cagr = ((g[2024] / g[2020]) ** 0.25 - 1) * 100
    f = {
        "nWilayah": 38, "nKabupaten": int((kode.jenis_wilayah == "Kabupaten").sum()),
        "nKota": int((kode.jenis_wilayah == "Kota").sum()),
        "pendudukJatim2025": float(prov[(prov.indikator == "jumlah_penduduk") & (prov.tahun == 2025)].nilai.iloc[0]),
        "miskinJatim2010": pv(2010), "miskinJatim2019": pv(2019), "miskinJatim2021": pv(2021),
        "miskinJatim2025": pv(2025),
        "nNaik2019_2021": int((m21 > m19).sum()),
        "miskinMax2025": {"nama": nm[m25.idxmax()], "nilai": float(m25.max())},
        "miskinMin2025": {"nama": nm[m25.idxmin()], "nilai": float(m25.min())},
        "rasioMiskin2010": round(float(m10.max() / m10.min()), 1),
        "rasioMiskin2025": round(float(m25.max() / m25.min()), 1),
        "jumlahMiskinMax2025": {"nama": nm[jm25.idxmax()], "nilai": float(jm25.max())},
        "ppkMax2025": {"nama": nm[ppk25.idxmax()], "nilai": float(ppk25.max())},
        "ppkMin2025": {"nama": nm[ppk25.idxmin()], "nilai": float(ppk25.min())},
        "rasioPpk2025": round(float(ppk25.max() / ppk25.min()), 2),
        "pdrbKapMax2025": {"nama": nm[pk25.idxmax()], "rasioMedian": round(float(pk25.max() / pk25.median()), 1)},
        "pendudukMax2025": {"nama": nm[pen25.idxmax()], "nilai": float(pen25.max())},
        "kepadatanMax2025": {"nama": nm[dens25.idxmax()], "nilai": float(dens25.max())},
        "kepadatanMin2025": {"nama": nm[dens25.idxmin()], "nilai": float(dens25.min())},
        "sektor2020": {k: round(float(v), 1) for k, v in sh.loc[2020].items()},
        "sektor2024": {k: round(float(v), 1) for k, v in sh.loc[2024].items()},
        "luTerbesar2024": {"kode": lush.loc[2024].idxmax(), "share": round(float(lush.loc[2024].max()), 1)},
        "shareA2020": round(float(lush.loc[2020, "A"]), 1), "shareA2024": round(float(lush.loc[2024, "A"]), 1),
        "nDominanA2024": int((dom.kode_lapangan_usaha == "A").sum()),
        "cagrMax": {"nama": nm[cagr.idxmax()], "nilai": round(float(cagr.max()), 2)},
        "cagrMin": {"nama": nm[cagr.idxmin()], "nilai": round(float(cagr.min()), 2)},
        "pcaExplained12": round(float((ev[0] + ev[1]) / ev.sum() * 100), 1),
    }
    dump("facts.json", f)

    # Sumber dari Master Plan
    ws = openpyxl.load_workbook(MASTER, data_only=True)["Data Inventory"]
    src = []
    for r in range(5, 27):
        g_ = lambda c: ws.cell(r, c).value
        src.append({"id": g_(1), "data": g_(3), "judul": g_(9), "sumber": g_(10), "url": g_(11),
                    "tahun": str(g_(12) or ""), "akses": str(g_(13) or ""), "satuan": g_(7),
                    "catatan": g_(21)})
    src.append({"id": "D09b", "data": "Umur harapan hidup kab/kota (2020–2025)",
                "judul": "Umur Harapan Hidup Hasil Long Form SP2020 Menurut Kabupaten/Kota",
                "sumber": "BPS", "url": "", "tahun": "2020-2025", "akses": "", "satuan": "tahun",
                "catatan": "URL dan tanggal akses belum diisi"})
    dump("sources.json", src)
    shutil.copy(GEO / "jatim_kabkota.geojson", OUT / "d20_batas_kabkota_jatim.geojson")
    print(f"[06] JSON web -> {OUT} | klaster: {[c['n'] for c in clusters]} | pencilan PCA: {outliers}")


if __name__ == "__main__":
    main()
