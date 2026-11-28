// src/learning/data/questionBank/fallbackQuestions.ts
// Bank soal darurat (offline/safety fallback) jika query Supabase lambat, timeout, atau offline.

import { Question } from "./index";
import generatedNumerik from "./NumericalMatrix";
import { CPNS_2026_QUESTIONS } from "./cpns2026Questions";

interface RawFallback {
  id: string;
  type: string;
  category: string;
  question: string;
  imageUrl?: string;
  options: { id: string; text: string }[];
  correct: string;
  discussion: string;
  scores?: Record<string, number>;
}

export const FALLBACK_QUESTIONS: RawFallback[] = [
  // --- VERBAL REASONING ---
  {
    id: "fb_v1",
    type: "Verbal Reasoning",
    category: "Verbal - Sinonim",
    question: "Pilih padanan kata (sinonim) yang paling tepat untuk 'KONTEMPORER':",
    options: [
      { id: "a", text: "Kuno" },
      { id: "b", text: "Modern / Masa kini" },
      { id: "c", text: "Abadi" },
      { id: "d", text: "Tradisional" },
      { id: "e", text: "Lampau" },
    ],
    correct: "b",
    discussion: "Kontemporer bermakna pada waktu yang sama, semasa, sewaktu, atau masa kini (modern).",
  },
  {
    id: "fb_v2",
    type: "Verbal Reasoning",
    category: "Verbal - Antonim",
    question: "Pilih lawan kata (antonim) yang paling tepat untuk 'PROMINEN':",
    options: [
      { id: "a", text: "Terkemuka" },
      { id: "b", text: "Menonjol" },
      { id: "c", text: "Biasa / Tidak mencolok" },
      { id: "d", text: "Utama" },
      { id: "e", text: "Superior" },
    ],
    correct: "c",
    discussion: "Prominen berarti terkemuka, menonjol, atau kondang. Lawan katanya adalah biasa atau tidak mencolok.",
  },
  {
    id: "fb_v3",
    type: "Verbal Reasoning",
    category: "Verbal - Analogi",
    question: "IKAN : INSANG = ... : ...",
    options: [
      { id: "a", text: "Manusia : Paru-paru" },
      { id: "b", text: "Burung : Sayap" },
      { id: "c", text: "Cacing : Tanah" },
      { id: "d", text: "Katak : Ekor" },
      { id: "e", text: "Kuda : Pelana" },
    ],
    correct: "a",
    discussion: "Ikan bernapas menggunakan insang. Hubungan analogi alat pernapasan: Manusia bernapas menggunakan paru-paru.",
  },
  {
    id: "fb_v4",
    type: "Verbal Reasoning",
    category: "Verbal - Analogi",
    question: "API : BAKAR : PANAS = ... : ... : ...",
    options: [
      { id: "a", text: "Es : Beku : Dingin" },
      { id: "b", text: "Air : Basah : Sungai" },
      { id: "c", text: "Udara : Bersih : Angin" },
      { id: "d", text: "Lampu : Listrik : Saklar" },
      { id: "e", text: "Pohon : Daun : Hijau" },
    ],
    correct: "a",
    discussion: "Api memiliki sifat membakar dan berhawa panas. Es memiliki sifat membekukan dan bersuhu dingin.",
  },

  // --- QUANTITATIVE REASONING ---
  {
    id: "fb_q1",
    type: "Quantitative Reasoning",
    category: "Deret Angka",
    question: "Tentukan angka selanjutnya dari barisan berikut: 3, 6, 12, 24, 48, ...",
    options: [
      { id: "a", text: "72" },
      { id: "b", text: "84" },
      { id: "c", text: "96" },
      { id: "d", text: "108" },
      { id: "e", text: "120" },
    ],
    correct: "c",
    discussion: "1. Bandingkan dua suku bertetangga: 6 ÷ 3 = 2, 12 ÷ 6 = 2, dan 48 ÷ 24 = 2.\n2. Lanjutkan rasio yang sama: 48 × 2 = 96.\n\nKenapa bukan 72? Menambah selisih terakhir (24) sekali lagi mengabaikan bahwa selisih sebelumnya berubah dari 3 ke 6, lalu ke 12 dan 24.",
  },
  {
    id: "fb_q2",
    type: "Quantitative Reasoning",
    category: "Aritmatika Sosial",
    question: "Sebuah barang dibeli seharga Rp200.000 kemudian dijual dengan keuntungan 15%. Berapakah harga jual barang tersebut?",
    options: [
      { id: "a", text: "Rp215.000" },
      { id: "b", text: "Rp220.000" },
      { id: "c", text: "Rp230.000" },
      { id: "d", text: "Rp235.000" },
      { id: "e", text: "Rp240.000" },
    ],
    correct: "c",
    discussion: "1. Hitung 15% dari harga beli: 0,15 × Rp200.000 = Rp30.000.\n2. Tambahkan ke modal: Rp200.000 + Rp30.000 = Rp230.000.\n\nKenapa bukan Rp215.000? Angka 15 menunjukkan persentase dari modal. Keuntungannya baru diketahui setelah 15% dikalikan dengan harga beli.",
  },
  {
    id: "fb_q3",
    type: "Quantitative Reasoning",
    category: "Aljabar",
    question: "Jika 3x + 7 = 22, maka nilai dari 2x - 3 adalah:",
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "7" },
      { id: "c", text: "9" },
      { id: "d", text: "11" },
      { id: "e", text: "13" },
    ],
    correct: "b",
    discussion: "1. Kurangi kedua ruas dengan 7: 3x = 15.\n2. Bagi kedua ruas dengan 3: x = 5.\n3. Masukkan nilai x ke yang ditanya: 2(5) − 3 = 7.\n\nPilihan 5 adalah nilai x. Soal meminta nilai 2x − 3.",
  },

  // --- LOGICAL REASONING ---
  {
    id: "fb_l1",
    type: "Logical Reasoning",
    category: "Silogisme",
    question: "Semua anggota dewan wajib mengikuti rapat pleno. Beberapa ekonom adalah anggota dewan. Kesimpulan yang valid:",
    options: [
      { id: "a", text: "Semua ekonom wajib mengikuti rapat pleno." },
      { id: "b", text: "Beberapa ekonom wajib mengikuti rapat pleno." },
      { id: "c", text: "Tidak ada ekonom yang mengikuti rapat pleno." },
      { id: "d", text: "Hanya ekonom yang mengikuti rapat pleno." },
      { id: "e", text: "Semua yang mengikuti rapat pleno adalah ekonom." },
    ],
    correct: "b",
    discussion: "1. Semua anggota dewan wajib mengikuti rapat pleno.\n2. Beberapa ekonom termasuk anggota dewan. Mereka ikut memenuhi kewajiban itu.\n\nKenapa bukan semua ekonom? Premis kedua hanya menjamin kewajiban untuk ekonom yang juga anggota dewan. Status ekonom lain tidak diketahui.",
  },
  {
    id: "fb_l2",
    type: "Logical Reasoning",
    category: "Modus Tollens",
    question: "Jika inflasi terkendali, maka daya beli masyarakat akan terjaga. Daya beli masyarakat tidak terjaga. Kesimpulan:",
    options: [
      { id: "a", text: "Inflasi terkendali." },
      { id: "b", text: "Inflasi tidak terkendali." },
      { id: "c", text: "Inflasi dan daya beli seimbang." },
      { id: "d", text: "Tidak dapat ditarik kesimpulan." },
      { id: "e", text: "Kebijakan moneter diperketat." },
    ],
    correct: "b",
    discussion: "1. Misalkan P berarti inflasi terkendali, dan Q berarti daya beli terjaga. Premisnya adalah jika P, maka Q.\n2. Daya beli tidak terjaga, jadi Q salah. Agar premis tetap benar, P juga harus salah. Ini disebut modus tollens.\n\nPilihan “tidak dapat ditarik kesimpulan” keliru karena penyangkalan Q memberi kesimpulan langsung tentang P.",
  },

  // --- ABSTRACT REASONING ---
  {
    id: "fb_a1",
    type: "Abstract Reasoning",
    category: "Pola Spasial",
    question: "Dalam pola rotasi bangun geometris searah jarum jam sebesar 90 derajat tiap langkah, posisi bayangan pada langkah ke-4 akan:",
    options: [
      { id: "a", text: "Kembali ke posisi semula (langkah ke-1)" },
      { id: "b", text: "Berada tepat berlawanan dengan langkah ke-1 (180 derajat)" },
      { id: "c", text: "Berada pada rotasi 270 derajat dari langkah ke-1" },
      { id: "d", text: "Berada pada rotasi 45 derajat" },
      { id: "e", text: "Menghilang" },
    ],
    correct: "c",
    discussion: "Langkah 1 = 0°, Langkah 2 = 90°, Langkah 3 = 180°, Langkah 4 = 270° (berotasi 270 derajat dari langkah pertama).",
  },

  // --- ENGLISH PROFICIENCY ---
  {
    id: "fb_e1",
    type: "Grammar & Structure",
    category: "English - Subject-Verb Agreement",
    question: "Neither the manager nor the board members _____ satisfied with the preliminary quarterly results.",
    options: [
      { id: "a", text: "was" },
      { id: "b", text: "were" },
      { id: "c", text: "is" },
      { id: "d", text: "are being" },
      { id: "e", text: "has" },
    ],
    correct: "b",
    discussion: "In 'Neither... nor...', the verb agrees with the closer subject. 'The board members' is plural, so 'were' is correct.",
  },
  {
    id: "fb_e2",
    type: "Vocabulary & Usage",
    category: "English - Vocabulary",
    question: "The central bank decided to implement a stringent policy to _____ escalating market volatility.",
    options: [
      { id: "a", text: "aggravate" },
      { id: "b", text: "mitigate" },
      { id: "c", text: "instigate" },
      { id: "d", text: "deteriorate" },
      { id: "e", text: "prolong" },
    ],
    correct: "b",
    discussion: "'Mitigate' means to make less severe or serious, suitable for reducing market volatility.",
  },

  // --- BUSINESS & ECONOMICS ---
  {
    id: "fb_be1",
    type: "Fundamental Economics",
    category: "Ekonomi Makro",
    question: "Kebijakan moneter ekspansif yang dilakukan bank sentral umumnya bertujuan untuk:",
    options: [
      { id: "a", text: "Menurunkan jumlah uang beredar guna meredam inflasi" },
      { id: "b", text: "Menaikkan suku bunga acuan secara agresif" },
      { id: "c", text: "Mendorong likuiditas dan memacu pertumbuhan ekonomi" },
      { id: "d", text: "Membatasi pemberian kredit perbankan komersial" },
      { id: "e", text: "Menaikkan rasio cadangan wajib minimum perbankan" },
    ],
    correct: "c",
    discussion: "Kebijakan ekspansif (loose monetary policy) melonggarkan likuiditas untuk merangsang investasi dan konsumsi nasional.",
  },
  {
    id: "fb_be2",
    type: "Accounting Principles",
    category: "Prinsip Akuntansi",
    question: "Dalam persamaan dasar akuntansi, transaksi pembelian inventaris secara tunai akan mengakibatkan:",
    options: [
      { id: "a", text: "Total aset meningkat dan liabilitas meningkat" },
      { id: "b", text: "Total aset tidak berubah karena komposisi aset bertukar" },
      { id: "c", text: "Ekuitas pemilik menurun secara signifikan" },
      { id: "d", text: "Liabilitas perusahaan meningkat seketika" },
      { id: "e", text: "Pendapatan periode berjalan langsung diakui" },
    ],
    correct: "b",
    discussion: "Kas (aset) berkurang dan inventaris (aset) bertambah dengan nilai yang sama. Total aset tetap sama (asset permutation).",
  },

  // --- CIVIC & GOVERNMENT ---
  {
    id: "fb_cv1",
    type: "National Foundation",
    category: "Pilar Kebangsaan",
    question: "Pancasila sebagai dasar negara berkedudukan sebagai sumber dari segala sumber hukum negara, hal ini ditegaskan dalam:",
    options: [
      { id: "a", text: "Pasal 33 UUD NRI 1945" },
      { id: "b", text: "Pembukaan UUD NRI 1945 alinea ke-4 dan UU No. 12 Tahun 2011" },
      { id: "c", text: "Dekrit Presiden 5 Juli 1959" },
      { id: "d", text: "Piagam Jakarta tanggal 22 Juni 1945" },
      { id: "e", text: "Ketetapan MPR No. II/MPR/1978" },
    ],
    correct: "b",
    discussion: "Pancasila sebagai staatsfundamentalnorm tercantum dalam Pembukaan UUD 1945 alinea ke-4 dan ditegaskan dalam Pasal 2 UU No. 12 Tahun 2011.",
  },

  // --- BANKING & MONETARY ---
  {
    id: "fb_bm1",
    type: "BI Essential",
    category: "Kebanksentralan",
    question: "Tujuan tunggal Bank Indonesia sebagaimana diamanatkan dalam undang-undang kebanksentralan adalah:",
    options: [
      { id: "a", text: "Menjamin seluruh simpanan nasabah di bank umum" },
      { id: "b", text: "Mencapai dan memelihara kestabilan nilai Rupiah" },
      { id: "c", text: "Menghimpun dana masyarakat dalam bentuk giro dan deposito" },
      { id: "d", text: "Menyalurkan kredit produktif kepada pelaku UMKM" },
      { id: "e", text: "Mengawasi operasional harian bursa efek Indonesia" },
    ],
    correct: "b",
    discussion: "Pasal 7 UU Bank Indonesia menetapkan tujuan tunggal BI adalah mencapai dan memelihara kestabilan nilai Rupiah (terhadap barang/jasa dan mata uang asing).",
  },
  {
    id: "fb_bm2",
    type: "Monetary Policy",
    category: "Kebijakan Moneter",
    question: "Instrumen operasi pasar terbuka yang digunakan Bank Indonesia untuk menyerap likuiditas rupiah adalah:",
    options: [
      { id: "a", text: "Penerbitan Surat Berharga Negara (SBN) oleh Kemenkeu" },
      { id: "b", text: "Penerbitan Sekuritas Rupiah Bank Indonesia (SRBI)" },
      { id: "c", text: "Penurunan Giro Wajib Minimum (GWM)" },
      { id: "d", text: "Pemberian Fasilitas Likuiditas Intrahari (FLI)" },
      { id: "e", text: "Pelunasan pinjaman luar negeri secara sepihak" },
    ],
    correct: "b",
    discussion: "SRBI merupakan instrumen moneter pro-market yang diterbitkan Bank Indonesia untuk pengelolaan likuiditas dan pendalaman pasar uang.",
  },

  // --- SITUATIONAL JUDGEMENT (SJT / TKP) ---
  {
    id: "fb_sjt1",
    type: "Situational Judgement",
    category: "Integritas & Profesionalisme",
    question: "Anda menemukan adanya ketidaksesuaian laporan data analitik yang disusun oleh rekan kerja senior Anda sesaat sebelum dipresentasikan kepada pimpinan. Sikap Anda:",
    options: [
      { id: "a", text: "Menyampaikan temuan ketidaksesuaian secara santun dan privat kepada rekan tersebut beserta data koreksinya sebelum presentasi dimulai." },
      { id: "b", text: "Membiarkan saja karena bukan tanggung jawab langsung pekerjaan Anda." },
      { id: "c", text: "Menyela di tengah presentasi pimpinan untuk memperlihatkan kesalahan rekan tersebut." },
      { id: "d", text: "Melaporkan secara anonim ke pimpinan setelah presentasi selesai." },
      { id: "e", text: "Membicarakan kesalahan rekan tersebut kepada rekan-rekan kerja yang lain." },
    ],
    correct: "a",
    discussion: "Tindakan proaktif, profesional, dan menjaga etika kerja tim adalah mengklarifikasi secara langsung dan konstruktif sebelum dampak meluas.",
    scores: { a: 5, d: 4, b: 3, c: 2, e: 1 },
  },
  {
    id: "fb_sjt2",
    type: "Work Personality",
    category: "Pelayanan Publik",
    question: "Ketika jam pelayanan publik hampir berakhir, datang seorang warga lansia yang menempuh perjalanan jauh dan memerlukan asistensi segera. Tindakan Anda:",
    options: [
      { id: "a", text: "Tetap melayani warga tersebut dengan ramah hingga tuntas meskipun harus sedikit melebihi jam kerja." },
      { id: "b", text: "Meminta warga tersebut kembali besok pagi karena sistem administrasi sudah ditutup." },
      { id: "c", text: "Menyerahkan penanganan kepada petugas keamanan kantor." },
      { id: "d", text: "Melayani dengan terburu-buru dan menunjukkan rasa keberatan." },
      { id: "e", text: "Mengabaikan warga tersebut karena sudah waktunya pulang." },
    ],
    correct: "a",
    discussion: "Dedikasi pelayanan publik yang prima mengutamakan empati dan solusi bagi masyarakat yang membutuhkan bantuan darurat.",
    scores: { a: 5, b: 4, c: 3, d: 2, e: 1 },
  },

  // --- TBS LPDP (PENALARAN VERBAL, KUANTITATIF, PEMECAHAN MASALAH) ---
  {
    id: "fb_tbs_v1",
    type: "TBS Penalaran Verbal",
    category: "TBS Verbal - Penalaran Analitis",
    question:
      "Lima kandidat beasiswa LPDP—Ayu, Bagas, Citra, Dimas, dan Eka—mengikuti wawancara sesi 1 sampai 5 secara berurutan dengan ketentuan:\n- Dimas dijadwalkan pada sesi 1.\n- Bagas tepat sebelum Citra.\n- Ayu tidak boleh berada pada sesi 1 atau sesi 5.\n- Eka diwawancarai setelah Ayu.\n\nJika Citra berada pada sesi 4, siapakah yang berada pada sesi 2 dan sesi 5 berturut-turut?",
    options: [
      { id: "a", text: "Bagas dan Eka" },
      { id: "b", text: "Ayu dan Bagas" },
      { id: "c", text: "Ayu dan Eka" },
      { id: "d", text: "Eka dan Ayu" },
      { id: "e", text: "Citra dan Ayu" },
    ],
    correct: "c",
    discussion:
      "Dimas = sesi 1. Karena Citra = sesi 4 dan Bagas tepat sebelum Citra, maka Bagas = sesi 3. Sisa slot adalah sesi 2 dan sesi 5 untuk Ayu dan Eka. Karena Eka harus setelah Ayu (serta Ayu dilarang di sesi 5), maka Ayu = sesi 2 dan Eka = sesi 5.",
  },
  {
    id: "fb_tbs_v2",
    type: "TBS Penalaran Verbal",
    category: "TBS Verbal - Critical Reasoning",
    question:
      "Riset di 12 kota menunjukkan daerah yang menerapkan program wajib belajar malam bagi siswa SMA mengalami kenaikan skor literasi 11% dalam dua tahun. Peneliti menyimpulkan bahwa kebijakan wajib belajar malam secara langsung meningkatkan kemampuan literasi siswa.\n\nManakah pernyataan berikut yang PALING MELEMAHKAN kesimpulan peneliti tersebut?",
    options: [
      { id: "a", text: "Sebagian siswa di 12 kota tersebut memiliki akses internet di rumah." },
      { id: "b", text: "Pada dua tahun yang sama, ke-12 kota tersebut menerima program pelatihan guru dan pembaruan koleksi buku teks nasional." },
      { id: "c", text: "Kota di luar penelitian memiliki rasio sekolah kejuruan lebih besar." },
      { id: "d", text: "Durasi belajar malam di tiap kota berkisar antara 90 hingga 120 menit." },
      { id: "e", text: "Mayoritas komite sekolah mendukung berlanjutnya program tersebut." },
    ],
    correct: "b",
    discussion:
      "Program pelatihan guru dan pembaruan buku teks nasional pada periode dan wilayah yang sama merupakan variabel pengganggu (confounding variable) yang menjelaskan kenaikan literasi tanpa membuktikan efektivitas wajib belajar malam.",
  },
  {
    id: "fb_tbs_v3",
    type: "TBS Penalaran Verbal",
    category: "TBS Verbal - Analogi Akademik",
    question: "HIPOTESIS : EKSPERIMEN = ... : ...",
    options: [
      { id: "a", text: "Undang-undang : Konstitusi" },
      { id: "b", text: "Tesis : Plagiarisme" },
      { id: "c", text: "Rancangan : Uji Coba" },
      { id: "d", text: "Simpulan : Masalah" },
      { id: "e", text: "Data : Kuesioner" },
    ],
    correct: "c",
    discussion:
      "Hipotesis diuji validitasnya melalui eksperimen, sebagaimana sebuah rancangan diuji kelaikannya melalui uji coba.",
  },
  {
    id: "fb_tbs_q1",
    type: "TBS Penalaran Kuantitatif",
    category: "TBS Kuantitatif - Kecukupan Data",
    question:
      "Berapakah nilai bilangan bulat positif x?\nPutuskan apakah pernyataan (1) dan (2) cukup untuk menjawab pertanyaan tersebut.\n(1) x² − 5x + 6 = 0\n(2) x merupakan bilangan prima genap.",
    options: [
      { id: "a", text: "Pernyataan (1) SAJA cukup, tetapi pernyataan (2) SAJA tidak cukup." },
      { id: "b", text: "Pernyataan (2) SAJA cukup, tetapi pernyataan (1) SAJA tidak cukup." },
      { id: "c", text: "DUA pernyataan BERSAMA-SAMA cukup, tetapi SATU pernyataan SAJA tidak cukup." },
      { id: "d", text: "Pernyataan (1) SAJA cukup dan pernyataan (2) SAJA cukup." },
      { id: "e", text: "Pernyataan (1) dan (2) tidak cukup untuk menjawab pertanyaan." },
    ],
    correct: "b",
    discussion:
      "1. Uji (1) sendiri: (x − 2)(x − 3) = 0 memberi x = 2 atau x = 3. Dua nilai masih memenuhi syarat.\n2. Uji (2) sendiri: satu-satunya bilangan prima genap adalah 2, sehingga x sudah pasti 2.\n\nPilihan C mensyaratkan kedua pernyataan. Di soal ini, pernyataan (2) saja sudah cukup.",
  },
  {
    id: "fb_tbs_q2",
    type: "TBS Penalaran Kuantitatif",
    category: "TBS Kuantitatif - Perbandingan Kuantitatif",
    question:
      "Diketahui 0 < a < 1.\nKuantitas P = a²\nKuantitas Q = √a\n\nHubungan yang benar antara kuantitas P dan Q adalah:",
    options: [
      { id: "a", text: "P > Q" },
      { id: "b", text: "Q > P" },
      { id: "c", text: "P = Q" },
      { id: "d", text: "P = 2Q" },
      { id: "e", text: "Informasi tidak cukup untuk menentukan hubungan P dan Q" },
    ],
    correct: "b",
    discussion:
      "1. Karena 0 < a < 1, mengalikan a dengan a memperkecil nilainya. Jadi a² < a.\n2. Karena a² < a dan keduanya positif, akarnya juga terurut: a < √a.\n3. Gabungkan: P = a² < a < √a = Q.\n\nMencoba a = ¼ membantu memeriksa intuisi. Urutan di atas membuktikan hasilnya untuk setiap nilai a yang memenuhi syarat.",
  },
  {
    id: "fb_tbs_q3",
    type: "TBS Penalaran Kuantitatif",
    category: "TBS Kuantitatif - Kombinatorika",
    question:
      "Sebuah panel reviewer riset beranggotakan 3 orang akan dipilih dari 5 dosen pria dan 4 dosen wanita. Berapa banyak susunan panel yang dapat dibentuk jika minimal terdapat 1 dosen wanita?",
    options: [
      { id: "a", text: "60" },
      { id: "b", text: "64" },
      { id: "c", text: "74" },
      { id: "d", text: "80" },
      { id: "e", text: "84" },
    ],
    correct: "c",
    discussion:
      "1. Hitung semua panel tanpa memperhatikan urutan: C(9,3) = 84.\n2. Panel yang tidak memenuhi syarat hanya berisi pria: C(5,3) = 10.\n3. Kurangi panel tersebut dari total: 84 − 10 = 74.\n\nPilihan 84 masih memasukkan panel tanpa wanita. Syarat minimal satu wanita juga mengizinkan dua atau tiga wanita.",
  },
  {
    id: "fb_tbs_p1",
    type: "TBS Pemecahan Masalah",
    category: "TBS Masalah - Grafik & Rasio Riset",
    question:
      "Grafik berikut menampilkan alokasi dana riset tahun 2025 (dalam Rp miliar) serta jumlah publikasi terindeks Q1 pada empat klaster riset tahun 2023–2025. Klaster manakah yang memiliki biaya per publikasi terendah di tahun 2025 sekaligus selalu meningkat jumlah publikasinya setiap tahun?",
    imageUrl:
      "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 240' width='640' height='240' style='background:%23ffffff;font-family:system-ui,-apple-system,sans-serif'%3E%3Crect width='640' height='240' rx='14' fill='%23ffffff'/%3E%3Ctext x='28' y='28' font-size='13' font-weight='700' fill='%230f172a'%3EPublikasi Q1 (2023–2025) &amp; Dana 2025%3C/text%3E%3Crect x='30' y='52' width='132' height='158' rx='10' fill='%23f8fafc' stroke='%23cbd5e1' stroke-width='1.5'/%3E%3Ctext x='96' y='74' text-anchor='middle' font-size='13' font-weight='700' fill='%230f172a'%3EEnergi%3C/text%3E%3Ctext x='96' y='92' text-anchor='middle' font-size='11' fill='%23475569'%3EDana: Rp12M%3C/text%3E%3Crect x='50' y='152' width='20' height='36' fill='%2394a3b8'/%3E%3Crect x='86' y='134' width='20' height='54' fill='%23475569'/%3E%3Crect x='122' y='116' width='20' height='72' fill='%230f172a'/%3E%3Ctext x='60' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E4%3C/text%3E%3Ctext x='96' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E6%3C/text%3E%3Ctext x='132' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E8%3C/text%3E%3Crect x='178' y='52' width='132' height='158' rx='10' fill='%23f8fafc' stroke='%23cbd5e1' stroke-width='1.5'/%3E%3Ctext x='244' y='74' text-anchor='middle' font-size='13' font-weight='700' fill='%230f172a'%3EPangan%3C/text%3E%3Ctext x='244' y='92' text-anchor='middle' font-size='11' fill='%23475569'%3EDana: Rp10M%3C/text%3E%3Crect x='198' y='143' width='20' height='45' fill='%2394a3b8'/%3E%3Crect x='234' y='125' width='20' height='63' fill='%23475569'/%3E%3Crect x='270' y='98' width='20' height='90' fill='%230f172a'/%3E%3Ctext x='208' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E5%3C/text%3E%3Ctext x='244' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E7%3C/text%3E%3Ctext x='280' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E10%3C/text%3E%3Crect x='326' y='52' width='132' height='158' rx='10' fill='%23f8fafc' stroke='%23cbd5e1' stroke-width='1.5'/%3E%3Ctext x='392' y='74' text-anchor='middle' font-size='13' font-weight='700' fill='%230f172a'%3EKesehatan%3C/text%3E%3Ctext x='392' y='92' text-anchor='middle' font-size='11' fill='%23475569'%3EDana: Rp18M%3C/text%3E%3Crect x='346' y='134' width='20' height='54' fill='%2394a3b8'/%3E%3Crect x='382' y='143' width='20' height='45' fill='%23475569'/%3E%3Crect x='418' y='107' width='20' height='81' fill='%230f172a'/%3E%3Ctext x='356' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E6%3C/text%3E%3Ctext x='392' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E5%3C/text%3E%3Ctext x='428' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E9%3C/text%3E%3Crect x='474' y='52' width='132' height='158' rx='10' fill='%23f8fafc' stroke='%23cbd5e1' stroke-width='1.5'/%3E%3Ctext x='540' y='74' text-anchor='middle' font-size='13' font-weight='700' fill='%230f172a'%3EDigital%3C/text%3E%3Ctext x='540' y='92' text-anchor='middle' font-size='11' fill='%23475569'%3EDana: Rp9M%3C/text%3E%3Crect x='494' y='152' width='20' height='36' fill='%2394a3b8'/%3E%3Crect x='530' y='134' width='20' height='54' fill='%23475569'/%3E%3Crect x='566' y='134' width='20' height='54' fill='%230f172a'/%3E%3Ctext x='504' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E4%3C/text%3E%3Ctext x='540' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E6%3C/text%3E%3Ctext x='576' y='202' text-anchor='middle' font-size='10' fill='%230f172a'%3E6%3C/text%3E%3Ctext x='320' y='228' text-anchor='middle' font-size='10.5' fill='%23475569'%3EUrutan batang per klaster: 2023 (terang) · 2024 (sedang) · 2025 (gelap)%3C/text%3E%3C/svg%3E",
    options: [
      { id: "a", text: "Energi" },
      { id: "b", text: "Pangan" },
      { id: "c", text: "Kesehatan" },
      { id: "d", text: "Digital" },
      { id: "e", text: "Energi dan Digital sama-sama memenuhi syarat" },
    ],
    correct: "b",
    discussion:
      "Klaster Kesehatan turun pada 2024 (6→5), sementara Digital stagnan pada 2024–2025 (6→6). Yang naik konsisten tiap tahun hanyalah Energi (4→6→8; biaya/publikasi Rp1,5M) dan Pangan (5→7→10; biaya/publikasi Rp1,0M). Biaya terendah dengan kenaikan konsisten dimiliki klaster Pangan.",
  },
  {
    id: "fb_tbs_p2",
    type: "TBS Pemecahan Masalah",
    category: "TBS Masalah - Alokasi Anggaran Riset",
    question:
      "Sebuah laboratorium memiliki dana hibah Rp180 juta untuk membeli paket sensor (Rp15 juta/unit) dan lisensi analitik (Rp10 juta/unit). Syarat hibah mewajibkan minimal 6 paket sensor dan minimal 4 lisensi analitik. Berapa total unit maksimum (sensor + lisensi) yang dapat dibeli?",
    options: [
      { id: "a", text: "13 unit" },
      { id: "b", text: "14 unit" },
      { id: "c", text: "15 unit" },
      { id: "d", text: "16 unit" },
      { id: "e", text: "17 unit" },
    ],
    correct: "c",
    discussion:
      "Untuk memaksimalkan total unit, belilah barang termurah (lisensi Rp10 juta) sebanyak mungkin setelah memenuhi batas minimum barang lebih mahal: 6 paket sensor = 6 × 15 = Rp90 juta. Sisa dana Rp90 juta membeli 90 / 10 = 9 lisensi (>= minimum 4). Total maksimum = 6 + 9 = 15 unit.",
  },
  {
    id: "fb_tbs_p3",
    type: "TBS Pemecahan Masalah",
    category: "TBS Masalah - Evaluasi Kebijakan",
    question:
      "Sebuah universitas mensyaratkan skor IELTS minimal 6,5 atau TOEFL iBT 80 bagi calon mahasiswa S2. Dari 200 pelamar tahun ini, 120 memenuhi IELTS >= 6,5, 95 memenuhi TOEFL iBT >= 80, dan 30 pelamar tidak memenuhi keduanya. Berapa persen pelamar yang memenuhi KEDUA syarat sekaligus?",
    options: [
      { id: "a", text: "15,0%" },
      { id: "b", text: "17,5%" },
      { id: "c", text: "20,0%" },
      { id: "d", text: "22,5%" },
      { id: "e", text: "25,0%" },
    ],
    correct: "d",
    discussion:
      "Pelamar yang memenuhi minimal satu syarat = 200 − 30 = 170. Menggunakan prinsip inklusi-eksklusi: memenuhi keduanya = 120 + 95 − 170 = 45 orang. Persentase = (45 / 200) × 100% = 22,5%.",
  },
  ...CPNS_2026_QUESTIONS,
];

/** Mengambil contoh lokal yang relevan dengan kategori. */
export function getFallbackQuestions(category: string, count: number): Question[] {
  const normCat = category.toLowerCase().trim();
  if (!normCat) return [];

  // 1. Jika numerik, ambil dari NumericalMatrix lokal
  if (normCat.includes("numerical matrix") || normCat === "numerik") {
    const shuffled = [...generatedNumerik].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    return selected.map((q: any) => ({
      id: q.id || `fb_nm_${Math.random()}`,
      question: q.question,
      options: Array.isArray(q.options)
        ? q.options
        : Object.entries(q.options || {}).map(([key, val]) => ({
            id: key.toLowerCase(),
            text: String(val),
          })),
      correct: String(q.correctAnswer ?? q.correct ?? "a").toLowerCase(),
      discussion: q.explanation || "Pembahasan matriks pola angka.",
      category: "Numerical Matrix",
      type: "Numerical Matrix",
      matrixData: q.matrixData,
    }));
  }

  // 2. Filter dari FALLBACK_QUESTIONS berdasarkan relevansi kategori
  const matching = FALLBACK_QUESTIONS.filter((q) => {
    const qType = q.type.toLowerCase();
    const qCat = q.category.toLowerCase();
    return (
      qType.includes(normCat) ||
      normCat.includes(qType) ||
      qCat.includes(normCat) ||
      normCat.includes(qCat)
    );
  });

  // Acak urutan
  const shuffled = [...matching].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, count);
}
