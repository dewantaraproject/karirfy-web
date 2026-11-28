import type { QuestionItem } from "../../types";

interface Correction {
  revision: string;
  options: string[];
  discussion: string;
  question?: string;
}

// Keep the original option IDs and scores, and skip rows that have since been edited.
const reviewed: Record<string, Correction> = {
  arch_attentiontodetail_007: {
    revision: "d4b2ce7f/b",
    options: ["X-79B-K/L-00V4-MPN", "X-79B-K/L-00V4-MNP", "X-79B-K/I-00V4-MNP", "X-79B-K/L-O0V4-MNP", "X-79B-K/L-00V4-NMP"],
    discussion: "Bandingkan per bagian: X, 79B, K/L, 00V4, lalu MNP. Pilihan B sama di setiap bagian. A menukar N dan P, C mengganti L dengan I, D mengganti 0 dengan O, dan E menukar M dengan N.",
  },
  cur_accounting_038: {
    revision: "c5a287c4/b",
    options: ["Penurunan nilai piutang diakui lebih dulu secara komersial", "Penyusutan fiskal lebih cepat daripada penyusutan komersial", "Denda pajak diakui sebagai beban yang tidak bisa dikurangkan", "Pajak penghasilan dibayar lebih awal sebelum jatuh tempo", "Biaya garansi baru boleh dikurangkan saat klaim dibayar"],
    discussion: "Penyusutan fiskal yang lebih cepat menurunkan dasar pengenaan pajak aset lebih awal daripada nilai tercatatnya. Selisih tersebut adalah perbedaan temporer kena pajak. Denda yang tidak bisa dikurangkan biasanya merupakan perbedaan permanen.",
  },
  cur_bizlaw_023: {
    revision: "11af55f4/c",
    question: "Ke lembaga mana penyedia jasa keuangan menyampaikan Laporan Transaksi Keuangan Mencurigakan?",
    options: ["OJK", "BPK", "PPATK", "DJP", "Polri"],
    discussion: "Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK) menerima Laporan Transaksi Keuangan Mencurigakan dari penyedia jasa keuangan, sesuai Pasal 23 UU Nomor 8 Tahun 2010.",
  },
  cur_bizlaw_026: {
    revision: "ee7e22c2/e",
    question: "Skenario mana yang paling jelas menggambarkan penggelapan pajak?",
    options: ["Memilih metode penyusutan yang diizinkan aturan", "Mengajukan pengurangan pajak dengan bukti yang sah", "Meminta penjelasan tertulis atas surat ketetapan pajak", "Menggunakan insentif dengan mengungkap transaksi secara benar", "Menyembunyikan omzet melalui pembukuan yang dipalsukan"],
    discussion: "Menyembunyikan omzet dengan pembukuan palsu adalah tindakan untuk mengurangi kewajiban pajak secara melawan hukum. Pilihan lain menggambarkan prosedur atau pemanfaatan ketentuan dengan informasi yang benar.",
  },
  cur_geo_004: {
    revision: "26cf69d3/c",
    options: ["BIS dan ADB", "OECD dan ADB", "IMF dan IBRD", "WTO dan IMF", "ILO dan IBRD"],
    discussion: "Kesepakatan Bretton Woods melahirkan IMF dan IBRD. IMF berfokus pada kerja sama dan stabilitas moneter, sementara IBRD mendukung rekonstruksi dan pembangunan. IBRD menjadi bagian dari Bank Dunia.",
  },
  ext_case_reasoning_145: {
    revision: "8654f3bc/b",
    question: "Lingkungan pengujian aplikasi memakai salinan data pelanggan produksi dan mengalami kebocoran. Untuk pengujian berikutnya, langkah mana yang langsung mengurangi paparan data pelanggan asli?",
    options: ["Mengenkripsi cadangan data uji setiap malam", "Mengganti data asli dengan dataset pengujian sintetis", "Membatasi akses jaringan pengujian ke alamat internal", "Memantau log akses lingkungan uji secara berkala", "Mengatur rotasi kredensial lingkungan uji lebih sering"],
    discussion: "Dataset sintetis memungkinkan pengujian tanpa menaruh data pelanggan asli di lingkungan uji. Pilihan lain memperkuat pengamanan, tetapi data asli masih berada di lingkungan tersebut.",
  },
  cur_geo_006: {
    revision: "307e9bec/e",
    question: "Di Kepulauan Nusa Tenggara, Garis Wallace melewati selat yang memisahkan dua pulau mana?",
    options: ["Lombok dan Sumbawa", "Sumbawa dan Flores", "Bali dan Jawa", "Flores dan Lembata", "Bali dan Lombok"],
    discussion: "Di bagian selatan Indonesia, Garis Wallace melewati Selat Lombok, di antara Bali di barat dan Lombok di timur. Garis ini menandai peralihan besar dalam persebaran fauna.",
  },
  arch_kebijakanpublik_044: {
    revision: "fca29324/a",
    question: "Dalam menilai kebijakan transisi energi, kriteria mana yang paling mencerminkan tujuan kemakmuran rakyat dalam Pasal 33 UUD 1945?",
    options: ["Akses listrik terjangkau dan manfaat yang merata", "Kecepatan pencairan anggaran pembangunan pembangkit", "Jumlah perusahaan yang lolos prakualifikasi tender", "Besarnya volume ekspor komponen pembangkit", "Peningkatan nilai kontrak pengadaan dalam setahun"],
    discussion: "Pasal 33 mengarahkan pengelolaan sumber daya untuk sebesar-besar kemakmuran rakyat. Akses listrik terjangkau dan manfaat yang merata mengukur hasil kebijakan bagi masyarakat secara lebih langsung.",
  },
  cur_gcg_017: {
    revision: "1cbe1e51/c",
    question: "Tujuan utama pengungkapan pemilik manfaat dalam tata kelola korporasi adalah untuk mengetahui siapa?",
    options: ["Pemegang saham yang paling sering mengikuti rapat", "Pejabat perusahaan yang menandatangani laporan keuangan", "Orang yang mengendalikan atau benar-benar menerima manfaat", "Notaris yang membuat akta pendirian dan perubahannya", "Kreditur dengan nilai pinjaman terbesar kepada perusahaan"],
    discussion: "Pengungkapan pemilik manfaat menelusuri individu yang pada akhirnya mengendalikan atau menerima manfaat dari korporasi, termasuk melalui struktur kepemilikan berlapis. Pemegang jabatan atau pihak yang tercantum dalam dokumen belum tentu orang tersebut.",
  },
  cur_scitech_013: {
    revision: "439009f7/a",
    question: "Apa arti label proses seperti 5 nm atau 3 nm pada prosesor modern?",
    options: ["Nama generasi proses pembuatan semikonduktor", "Lebar fisik setiap transistor pada prosesor", "Jarak tetap antargerbang pada semua jenis chip", "Panjang gelombang yang dipakai prosesor untuk berkomunikasi", "Ukuran paket fisik prosesor pada papan sirkuit"],
    discussion: "Nama node menandai generasi teknologi fabrikasi. Penamaan modern tidak menunjukkan satu ukuran fisik transistor yang berlaku umum atau bisa dibandingkan langsung antarprodusen.",
  },
  ext_world_geography_events_049: {
    revision: "a9fdfb6e/b",
    options: ["Gelembung saham teknologi", "Krisis keuangan global", "Krisis minyak OPEC", "Krisis finansial Asia", "Krisis utang zona euro"],
    discussion: "Kebangkrutan Lehman Brothers pada September 2008 adalah salah satu peristiwa utama krisis keuangan global. Krisis bermula dari gangguan pasar hipotek berisiko di Amerika Serikat dan menyebar ke sistem keuangan yang lebih luas.",
  },
  arch_tkp_044: {
    revision: "c64c2291/b",
    options: ["Berhenti hadir dan minta rekan mengirim hasil rapat.", "Siapkan agenda, lalu sepakati tindak lanjut, penanggung jawab, dan tenggat.", "Usulkan pengurangan jumlah rapat kepada atasan.", "Dengarkan pembahasan dan tunggu arahan setelah rapat.", "Catat pembahasan untuk rujukan pribadi setelah rapat."],
    discussion: "B mendapat skor tertinggi karena menghasilkan keputusan dan langkah yang bisa ditagih setelah rapat. C bisa mengurangi jumlah rapat, tetapi belum memperbaiki tindak lanjut. D dan E memberi dokumentasi atau perhatian tanpa komitmen bersama.",
  },
  arch_tkp_006: {
    revision: "d7395673/c",
    options: ["Abaikan komplain karena masuk melalui kanal tidak resmi.", "Tanggapi untuk membela unit dan menolak tuduhan di ruang publik.", "Akui keluhan, arahkan ke kanal aman, lalu tindak lanjuti perbaikannya.", "Minta unggahan dihapus sebelum menawarkan bantuan kepada warga.", "Arahkan warga ke kanal resmi tanpa menanggapi pokok keluhannya."],
    discussion: "C memperoleh 5 poin karena menanggapi warga sekaligus menyiapkan penyelesaian. E menjaga prosedur, tetapi belum menunjukkan tindak lanjut. B, A, dan D berisiko memperburuk komunikasi atau menghambat penanganan keluhan.",
  },
  cur_nat_foundation_040: {
    revision: "c3bab50c/a",
    question: "Menurut Pasal 28J ayat (2) UUD NRI Tahun 1945, tujuan mana yang dapat mendasari pembatasan pelaksanaan hak dengan undang-undang?",
    options: ["Melindungi hak orang lain dan menjaga ketertiban umum", "Menyeragamkan pandangan politik dalam lembaga publik", "Menjaga reputasi pejabat dari kritik warga di ruang publik", "Mengurangi pengawasan masyarakat terhadap pemerintah", "Mewajibkan semua warga mengikuti satu pilihan keyakinan"],
    discussion: "Pasal 28J ayat (2) memungkinkan pembatasan melalui undang-undang demi menghormati hak dan kebebasan orang lain serta memenuhi tuntutan yang adil. Pertimbangannya mencakup moral, nilai agama, keamanan, dan ketertiban umum dalam masyarakat demokratis.",
  },
  cur_macroprud_013: {
    revision: "f4bc752c/d",
    question: "Sebuah bank mendanai aset jangka panjang dalam rupiah dengan utang dolar berjangka pendek. Risiko apa yang menjadi perhatian pengelolaan posisi devisa neto dan pendanaan luar negeri jangka pendek?",
    options: ["Konsentrasi kredit pada satu sektor usaha", "Penurunan kualitas jaminan kredit dalam negeri", "Penurunan pendapatan komisi transaksi perbankan", "Ketidaksesuaian mata uang dan jatuh tempo pendanaan", "Kenaikan biaya operasional jaringan kantor cabang"],
    discussion: "Bank harus menyediakan dolar untuk membayar utangnya meski asetnya berdenominasi rupiah. Utang juga jatuh tempo sebelum dana dari aset kembali. Kombinasi ini menimbulkan risiko nilai tukar dan risiko likuiditas ketika pendanaan sulit diperpanjang.",
  },
  cur_macroprud_005: {
    revision: "4250aee6/e",
    question: "Kelompok mana yang menjadi sasaran langsung perluasan akses dalam kebijakan Rasio Pembiayaan Inklusif Makroprudensial (RPIM) Bank Indonesia?",
    options: ["Eksportir besar, importir besar, dan pedagang valas", "Bank umum, bank kustodian, dan perusahaan efek", "BUMN besar, emiten, dan pengelola dana pensiun", "Korporasi asing, perusahaan induk, dan kantor perwakilan", "UMKM, korporasi UMKM, dan perorangan berpenghasilan rendah"],
    discussion: "RPIM mendorong pembiayaan inklusif untuk UMKM, korporasi UMKM, dan perorangan berpenghasilan rendah. Bank dapat memenuhi ketentuan melalui beberapa jalur pembiayaan sesuai aturan, sehingga sasaran pembiayaan dan lembaga penyalurnya perlu dibedakan.",
  },
  cur_gcg_010: {
    revision: "a7c6824e/d",
    question: "Seorang pemegang saham mewakili sedikitnya sepersepuluh saham dengan hak suara. Langkah mana yang menunjukkan gugatan derivatif atas kelalaian anggota direksi yang merugikan perseroan?",
    options: ["Menuntut ganti rugi untuk dirinya atas penurunan harga saham", "Meminta RUPS memutuskan penggantian anggota direksi", "Melaporkan perubahan pengurus kepada notaris perseroan", "Menggugat anggota direksi di pengadilan atas nama perseroan", "Meminta ganti rugi dari perseroan atas dividen yang tertunda"],
    discussion: "Pasal 97 ayat (6) UU Perseroan Terbatas mengatur gugatan melalui pengadilan negeri atas nama perseroan terhadap anggota direksi yang kesalahan atau kelalaiannya merugikan perseroan. Kepentingan yang diperjuangkan adalah kepentingan perseroan.",
  },
  cur_biinst_005: {
    revision: "f9e6cf05/c",
    question: "Dalam penanganan krisis sistem keuangan yang membahayakan perekonomian nasional, tindakan terkait SBN mana yang termasuk kewenangan Bank Indonesia?",
    options: ["Menerbitkan SBN negara atas keputusan dewan gubernur", "Menetapkan kupon semua SBN tanpa keputusan pemerintah", "Membeli SBN berjangka panjang di pasar perdana", "Menghapus kewajiban penerbit atas SBN yang jatuh tempo", "Memindahkan pembayaran kupon SBN ke bank umum"],
    discussion: "Kerangka penanganan krisis memberi Bank Indonesia kewenangan membeli SBN berjangka panjang di pasar perdana untuk menangani permasalahan sistem keuangan yang membahayakan perekonomian nasional. Kewenangan ini berbeda dari penerbitan SBN dan pembiayaan rutin pemerintah.",
  },
  arch_sjt_025: {
    revision: "1748a101/c",
    options: ["Hubungi HR secara anonim untuk meminta saran sebelum membahasnya dengan atasan.", "Bicarakan kesulitan dengan rekan dan minta mereka menyampaikan keluhan tim.", "Temui atasan empat mata, tunjukkan dampaknya, dan usulkan uji coba otonomi.", "Kurangi komunikasi tentang kemajuan pekerjaan supaya tim lebih leluasa bekerja.", "Sampaikan di depan tim bahwa cara atasan mengawasi pekerjaan menghambat hasil."],
    discussion: "C mendapat skor tertinggi karena membahas perilaku dan dampaknya dengan contoh yang bisa diperiksa, lalu menawarkan langkah yang bisa diuji. A bisa memberi saran awal, tetapi masalahnya tetap perlu dibicarakan melalui jalur yang sesuai.",
  },
  ext_problem_solving_125: {
    revision: "93dfbc1e/c",
    options: ["Setujui semua permohonan dengan cepat, lalu periksa sebagian dokumen setelah pencairan.", "Lakukan verifikasi manual yang sama untuk semua permohonan sebelum persetujuan.", "Verifikasi otomatis permohonan berisiko rendah dan gunakan pemeriksaan tambahan untuk sisanya.", "Percepat persetujuan bagi semua nasabah baru dan pertahankan proses lama bagi nasabah lama.", "Kurangi jumlah kolom pengajuan dan pertahankan antrean pemeriksaan manual yang ada."],
    discussion: "Verifikasi berjenjang menyesuaikan pemeriksaan dengan risiko permohonan. Permohonan berisiko rendah bisa diproses dengan cepat, sementara pemeriksaan tambahan tetap tersedia saat risiko lebih besar. Mengurangi kolom saja belum mempercepat tahap persetujuan.",
  },
  arch_tkp_010: {
    revision: "c1422420/b",
    options: ["Alihkan perhatian ke pekerjaan rutin sambil menunggu tim IT menilai sistem.", "Laporkan bukti lewat kanal resmi ke tim IT dan atasan, lalu usulkan mitigasi sementara.", "Peringatkan rekan sekitar agar membatasi penggunaan sistem untuk sementara.", "Coba perbaiki sistem sendiri sebelum memberi kabar kepada pengelola sistem.", "Catat masalah untuk rapat anggaran berikutnya sebelum membuat laporan resmi."],
    discussion: "B mendapat skor tertinggi karena tim yang berwenang bisa menilai temuan dengan segera dan atasan bisa membantu koordinasi. Simpan detail sensitif di kanal yang tepat. Peringatan informal atau tindakan tanpa wewenang tidak cukup untuk mengelola risiko.",
  },
  cur_gcg_007: {
    revision: "6b4add65/e",
    question: "Direksi sudah bertindak hati-hati dan beritikad baik untuk perseroan. Kerugian bukan akibat kesalahan atau kelalaiannya, dan tidak ada benturan kepentingan. Tindakan apa yang juga perlu dibuktikan menurut Pasal 97 ayat (5) UU Perseroan Terbatas?",
    options: ["Memperoleh persetujuan auditor atas laporan keuangan tahunan", "Menerbitkan keputusan baru setelah pergantian anggota direksi", "Memastikan perseroan sudah membagikan dividen tahun sebelumnya", "Menyerahkan pengelolaan risiko berikutnya kepada pemegang saham", "Mengambil langkah untuk mencegah timbul atau berlanjutnya kerugian"],
    discussion: "Pasal 97 ayat (5) menetapkan beberapa syarat yang harus dibuktikan bersama. Selain syarat dalam pertanyaan, direksi perlu mengambil langkah untuk mencegah kerugian timbul atau berlanjut. Hasil usaha yang rugi dengan sendirinya belum menentukan tanggung jawab pribadi direksi.",
  },
  arch_tkp_008: {
    revision: "473705f2/c",
    options: ["Bantah penilaian di rapat dan uraikan faktor eksternal sebelum pembahasan berlanjut.", "Dengarkan kritik saat rapat dan tunggu atasan meminta penjelasan lebih lanjut.", "Catat kritik, lalu bahas konteks berdasarkan data dan rencana perbaikan secara terpisah.", "Sebutkan faktor eksternal secara singkat di rapat dan lanjutkan agenda evaluasi.", "Terima masukan di rapat dan janjikan perbaikan tanpa membahas faktor eksternal."],
    discussion: "C mendapat skor tertinggi karena menjaga forum evaluasi, membuka kesempatan untuk klarifikasi berbasis data, dan menutupnya dengan rencana perbaikan. D memberi konteks awal, sedangkan E menunjukkan tanggung jawab, tetapi keduanya belum menggabungkan klarifikasi dan tindak lanjut.",
  },
};

function textRevision(question: QuestionItem): string {
  const source = JSON.stringify([question.question, question.options.map(({ id, text }) => [id, text])]);
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return `${(hash >>> 0).toString(16)}/${question.correct}`;
}

export function applyReviewedQuestion(question: QuestionItem): QuestionItem {
  const update = reviewed[question.id];
  if (!update || update.revision !== textRevision(question) || update.options.length !== question.options.length) return question;
  return {
    ...question,
    question: update.question ?? question.question,
    options: question.options.map((option, i) => ({ ...option, text: update.options[i] })),
    discussion: update.discussion,
  };
}
