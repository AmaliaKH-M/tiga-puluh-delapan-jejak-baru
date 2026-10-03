/**
 * SELURUH TEKS NARASI ADA DI SINI — edit tanpa menyentuh komponen.
 *
 * Token {{...}} diisi otomatis dari public/data/facts.json (dihitung pipeline Python),
 * sehingga angka di narasi selalu sama dengan data. Format: {{kunci}}, {{kunci|pct}},
 * {{kunci|int}}, {{kunci|compact}}, {{kunci|x}}. Teks **tebal** didukung.
 *
 * Prinsip penulisan: "data menunjukkan…", tanpa klaim sebab-akibat, tanpa menyalahkan pihak mana pun.
 */

export const titleOptions = [
  { title: "Tiga Puluh Delapan Jejak", nuance: "Puitis; langsung menyiratkan bahwa Jawa Timur bukan satu angka." },
  { title: "Palimpsest Jawa Timur", nuance: "Lapisan cerita yang saling menimpa; akademik dan kuat." },
  { title: "Jawa Timur dalam Lapisan Angka", nuance: "Ringkas dan editorial." },
  { title: "Di Balik Satu Angka", nuance: "Paling mudah dipahami pembaca awam." },
  { title: "Jejak yang Tidak Seragam", nuance: "Menyuarakan temuan utama: turun bersama, jarak melebar." },
  { title: "Peta yang Bergeser", nuance: "Menekankan sisi atlas dan perubahan." },
];

export const site = {
  title: "Tiga Puluh Delapan Jejak",
  subtitle: "Membaca daya beli, kehidupan, dan pergeseran ekonomi Jawa Timur melalui data BPS",
  hook: "Satu angka bisa merangkum sebuah provinsi. Tetapi tidak ada seorang pun yang hidup di dalam rata-rata.",
  scrollHint: "Gulir untuk mulai membaca",
  author: "Amalia Khoirum Mazidah · 222312964 · 3SD1", 
  repoUrl: "https://github.com/AmaliaKH-M/tiga-puluh-delapan-jejak", 
  appUrl: "https://tiga-puluh-delapan-jejak.vercel.app/", 
};

export const intro = {
  eyebrow: "Prolog",
  title: "Di balik setiap angka, ada ruang yang ditempati manusia",
  body: [
    "Angka kemiskinan sering hadir sebagai satu baris dalam laporan: sekian persen, naik sekian, turun sekian. Ia ringkas, dan justru karena ringkas, ia mudah dilupakan.",
    "Padahal di balik satu desimal ada pagi yang dimulai lebih awal, ongkos yang dihitung ulang, sekolah yang terasa dekat atau jauh, dan pekerjaan yang datang atau pergi.",
    "Jawa Timur dihuni sekitar **{{pendudukJatim2025|compact}} jiwa** yang tersebar di **{{nWilayah}} kabupaten dan kota**. Mereka tidak pernah benar-benar tinggal dalam satu angka.",
    "Tulisan ini tidak mencari siapa yang salah. Ia mencoba membaca jejak: dari kemiskinan, daya beli, pendidikan, pekerjaan, hingga mesin ekonomi tiap wilayah, dan melihat apa yang hanya tampak ketika semuanya dibaca bersama.",
  ],
};

export type ChapterText = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  lede: string;
  body: string[];
  question?: string;
};

export const chapters: Record<string, ChapterText> = {
  context: {
    id: "bab-1", number: "01", eyebrow: "Tiga puluh delapan konteks",
    title: "Jawa Timur bukan satu angka",
    lede: "{{nKabupaten}} kabupaten dan {{nKota}} kota. Setiap wilayah membawa kepadatan, jarak, dan ritme hidupnya sendiri.",
    body: [
      "**{{pendudukMax2025.nama}}** dihuni {{pendudukMax2025.nilai|compact}} jiwa dengan kepadatan sekitar **{{kepadatanMax2025.nilai|int}} jiwa per km²**. Di ujung lain, {{kepadatanMin2025.nama}} hanya sekitar {{kepadatanMin2025.nilai|int}} jiwa per km².",
      "Selisih sebesar itu bukan sekadar statistik. Ia mengubah cara orang bergerak, bekerja, dan menjangkau layanan.",
      "Arahkan kursor ke peta, atau pilih satu wilayah. Pilihanmu akan mengikuti sepanjang cerita.",
    ],
  },
  poverty: {
    id: "bab-2", number: "02", eyebrow: "Jejak kemiskinan",
    title: "Turun bersama, tetapi tidak pernah seragam",
    lede: "Persentase penduduk miskin Jawa Timur turun dari {{miskinJatim2010|pct}} (2010) menjadi {{miskinJatim2025|pct}} (2025).",
    question: "Apakah semua wilayah bergerak ke arah yang sama?",
    body: [
      "Garis provinsi terlihat menurun dengan tenang, sampai pandemi. Antara 2019 dan 2021, persentase penduduk miskin naik di **{{nNaik2019_2021}} dari {{nWilayah}}** kabupaten/kota. Tidak ada satu pun wilayah yang luput.",
      "Pada 2025, angka tertinggi tercatat di **{{miskinMax2025.nama}} ({{miskinMax2025.nilai|pct}})** dan terendah di **{{miskinMin2025.nama}} ({{miskinMin2025.nilai|pct}})**. Rasio tertinggi terhadap terendah justru bergeser dari {{rasioMiskin2010|x}} pada 2010 menjadi {{rasioMiskin2025|x}} pada 2025.",
      "Persentase dan jumlah bercerita berbeda. Wilayah dengan **jumlah** penduduk miskin terbanyak pada 2025 adalah **{{jumlahMiskinMax2025.nama}}** ({{jumlahMiskinMax2025.nilai}} ribu jiwa), bukan wilayah dengan persentase tertinggi. Karena itu peta warna memakai persentase, sedangkan lingkaran memakai jumlah.",
    ],
  },
  purchasing: {
    id: "bab-3", number: "03", eyebrow: "Daya beli",
    title: "Ketika daya beli tidak hanya dibaca dari pendapatan",
    lede: "Pengeluaran per kapita disesuaikan adalah komponen standar hidup layak dalam IPM, sebuah proxy daya beli, bukan ukuran kelas menengah.",
    question: "Seberapa jauh jarak daya beli antarwilayah?",
    body: [
      "Pada 2025, pengeluaran per kapita disesuaikan tertinggi ada di **{{ppkMax2025.nama}}** (Rp{{ppkMax2025.nilai|int}} ribu per orang per tahun), sekitar **{{rasioPpk2025|x}}** dibanding **{{ppkMin2025.nama}}**.",
      "Wilayah dengan pengeluaran lebih tinggi cenderung memiliki persentase penduduk miskin lebih rendah. Pola ini menunjukkan keterkaitan, bukan sebab-akibat.",
      "Komposisi belanja juga bercerita: porsi pengeluaran bukan makanan cenderung lebih besar di wilayah perkotaan.",
    ],
  },
  multivariate: {
    id: "bab-4", number: "04", eyebrow: "Membaca bersama",
    title: "Tidak semua wilayah bergerak bersama",
    lede: "Sepuluh indikator 2025 diringkas dengan analisis komponen utama (PCA). Dua komponen pertama menjelaskan {{pcaExplained12}}% variasi.",
    question: "Kelompok dan pencilan apa yang muncul ketika banyak indikator dibaca sekaligus?",
    body: [
      "Komponen pertama memisahkan wilayah dengan pengeluaran, pendidikan, dan kepadatan lebih tinggi dari wilayah dengan kemiskinan lebih tinggi. Kota-kota besar berada di satu ujung; sejumlah kabupaten di Madura berada di ujung lain.",
      "Klaster hierarkis (Ward) membagi wilayah menjadi beberapa kelompok. **{{pdrbKapMax2025.nama}}** berdiri sendiri: PDRB per kapitanya sekitar {{pdrbKapMax2025.rasioMedian|x}} median wilayah lain, sementara pertumbuhannya rendah. Ini pencilan yang sah, bukan kesalahan data.",
      "Klik satu titik, atau sapukan (brush) rentang nilai pada sumbu parallel coordinates. Semua tampilan, termasuk peta, akan menyorot wilayah yang sama.",
    ],
  },
  atlas: {
    id: "bab-5", number: "05", eyebrow: "Atlas",
    title: "Peta ketimpangan ruang",
    lede: "Pilih indikator dan tahun. Warna selalu menampilkan rasio; lingkaran menampilkan angka absolut.",
    question: "Di mana pola-pola itu mengelompok?",
    body: [
      "Metode klasifikasi kuantil membagi 38 wilayah ke lima kelas yang terisi seimbang, sehingga perbedaan di tengah distribusi tetap terlihat. Pilihan interval sama tersedia untuk melihat jarak nilai yang sebenarnya.",
      "Periode setiap indikator mengikuti ketersediaan data. Misalnya, kepadatan hanya ditampilkan untuk tahun dengan luas acuan yang konsisten.",
    ],
  },
  economy: {
    id: "bab-6", number: "06", eyebrow: "Mesin ekonomi",
    title: "Dari wilayah ke mesin ekonomi",
    lede: "Struktur PDRB 38 kabupaten/kota menurut 17 lapangan usaha, 2020–2024.",
    question: "Ekonomi tiap wilayah bertumpu pada apa?",
    body: [
      "Secara agregat, lapangan usaha terbesar pada 2024 adalah industri pengolahan ({{luTerbesar2024.share}}% PDRB). Namun pertanian masih menjadi lapangan usaha terbesar di **{{nDominanA2024}} dari {{nWilayah}}** kabupaten/kota.",
      "Porsi sektor primer turun dari {{sektor2020.Primer}}% (2020) menjadi {{sektor2024.Primer}}% (2024), sementara tersier naik dari {{sektor2020.Tersier}}% menjadi {{sektor2024.Tersier}}%.",
      "Pertumbuhan riil 2020–2024 tidak seragam: tertinggi di **{{cagrMax.nama}}** ({{cagrMax.nilai}}% per tahun) dan terendah di **{{cagrMin.nama}}** ({{cagrMin.nilai}}% per tahun).",
    ],
  },
  change: {
    id: "bab-7", number: "07", eyebrow: "Perubahan",
    title: "Apa yang berubah?",
    lede: "Awal dan akhir periode dibandingkan hanya untuk indikator yang metodenya konsisten. Periode berbeda per indikator dan selalu ditulis.",
    question: "Siapa yang bergerak paling jauh?",
    body: [
      "Sebagian wilayah dengan kemiskinan tinggi pada 2010 turun paling tajam, tetapi tetap berada di urutan atas pada 2025. Bergerak jauh tidak selalu berarti telah tiba.",
      "Nilai Kota Probolinggo 2010–2011 masih ditandai perlu verifikasi; garisnya digambar putus-putus dan tidak dijadikan kesimpulan.",
    ],
  },
};

export const closing = {
  eyebrow: "Epilog",
  title: "Angka tidak pernah benar-benar diam",
  body: [
    "Di balik perubahan satu desimal, ada wilayah yang berubah. Ada pekerjaan yang bergeser, sekolah yang terasa semakin dekat bagi sebagian orang, dan rumah tangga yang menata ulang cara membelanjakan penghasilannya.",
    "Data ini tidak bisa menceritakan semuanya. Ia tidak mengenal nama, tidak mendengar suara, dan hanya mencatat apa yang dapat diukur. Tetapi dibaca dengan sabar, ia memperlihatkan bahwa Jawa Timur bukan satu cerita.",
    "Mungkin membaca angka dengan lebih dekat adalah cara pertama untuk melihat manusia yang selama ini berdiri di belakangnya.",
  ],
  limitations: [
    "“Daya beli” dioperasionalkan melalui proxy (pengeluaran per kapita disesuaikan, kemiskinan, PDRB per kapita).",
    "PDRB menurut lapangan usaha hanya tersedia 2020–2024; 2023 sementara, 2024 sangat sementara.",
    "Patahan metodologis: UHH dan IPM (2019→2020), jumlah penduduk (2020, 2024), kepadatan (sebelum 2022).",
    "Hubungan antarindikator bersifat asosiatif; visualisasi ini tidak menguji sebab-akibat.",
  ],
  aiDeclaration:
    "Alat bantu AI digunakan untuk membantu perencanaan proyek, audit dan pengolahan awal data, serta penulisan dan pengembangan kode. Seluruh keputusan analitis, verifikasi data dan angka, interpretasi hasil, serta isi akhir proyek menjadi tanggung jawab penulis.", 
};
