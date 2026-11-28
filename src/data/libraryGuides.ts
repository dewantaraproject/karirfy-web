export interface LibraryGuide {
  id: string;
  topic: string;
  title: string;
  summary: string;
  sections: { title: string; text: string }[];
  checklist?: string[];
  exercise?: string;
}

export const cvLaunchChecklist = [
  "Nama, email, nomor telepon, dan tautan portofolio aktif serta akurat.",
  "Judul bagian baku (Pengalaman, Pendidikan, Keahlian) dan format tanggal konsisten.",
  "Keterampilan yang tercantum punya bukti nyata di pengalaman atau proyek.",
  "Setiap poin pengalaman menulis tindakan konkret, cakupan kerja, dan hasil terukur.",
  "Teks PDF satu kolom dapat disalin berurutan tanpa karakter acak.",
  "Nama file mengikuti instruksi lowongan (misalnya CV-NamaLengkap.pdf).",
];

export const portfolioGuide: LibraryGuide = {
  id: "portofolio",
  topic: "CV & Portofolio",
  title: "Susun portofolio proyek jadi studi kasus",
  summary: "Ubah proyek kerja, magang, kampus, atau organisasi menjadi bukti dampak yang ringkas.",
  sections: [
    { title: "Pilih bukti yang relevan", text: "Pilih satu sampai tiga pekerjaan terbaik yang paling cocok dengan peran incaran. Analis dapat menampilkan ringkasan data, desainer menyorot keputusan alur, dan pelamar beasiswa menonjolkan riset atau dampak komunitas." },
    { title: "Tulis konteks, peran, keputusan, dan hasil", text: "Jelaskan masalah dalam satu paragraf singkat. Sebutkan bagian yang kamu kerjakan sendiri, opsi yang dipertimbangkan, lalu jelaskan perubahan angka atau kualitas yang dicapai." },
    { title: "Contoh studi kasus singkat", text: "Waktu rekap antrean di proyek kelas mencapai tiga jam. Saya menyatukan format data dan mengotomatisasi ringkasan di Excel. Pada uji data simulasi, waktu rekap turun menjadi satu jam." },
    { title: "Siapkan tautan untuk pembaca", text: "Buka tautan lewat tab privat untuk memastikan izin akses terbuka. Samarkan nama klien atau data rahasia dengan data sintetis yang diberi keterangan jelas." },
  ],
};

export const libraryGuides: LibraryGuide[] = [
  {
    id: "cek-cv-ats",
    topic: "CV & Portofolio",
    title: "Cek CV ATS sebelum kirim lamaran",
    summary: "Audit cepat struktur, kata kunci, poin terukur, dan keterbacaan mesin sebelum unggah.",
    checklist: cvLaunchChecklist,
    sections: [
      { title: "Gunakan struktur satu kolom untuk ATS ketat", text: "Portal rekrutmen korporat, BUMN, dan multinasional memindai teks dari atas ke bawah. Gunakan template satu kolom (Profesional ATS, Consulting ATS, Lulusan Baru, atau Teknis ATS) bila mengirim ke portal otomatis." },
      { title: "Formula poin pencapaian (Action + Context + Result)", text: "Hindari menulis daftar tugas pasif seperti 'Bertanggung jawab atas laporan'. Ubah menjadi 'Menyatukan 4 laporan unit menjadi panel mingguan sehingga waktu rekap turun dari 6 jam menjadi 2 jam'." },
      { title: "Verifikasi urutan baca PDF", text: "Setelah mengunduh PDF dari Galeri CV, buka tab Urutan Teks atau salin teks PDF untuk memastikan tidak ada kata terpotong." },
    ],
  },
  portfolioGuide,
  {
    id: "wawancara",
    topic: "Wawancara",
    title: "Susun jawaban wawancara dengan STAR",
    summary: "Siapkan cerita singkat tentang tindakanmu dan hasil yang bisa dijelaskan.",
    sections: [
      { title: "Situasi dan tugas", text: "Mulai dengan konteks seperlunya. Jelaskan masalah, batas waktu, dan tanggung jawabmu. Pilih satu kejadian yang bisa kamu ceritakan dengan rinci." },
      { title: "Tindakan dan hasil", text: "Jelaskan langkah yang kamu ambil dan alasannya. Jika hasilnya bisa diukur, sebutkan angka yang bisa kamu pertanggungjawabkan. Kalau tidak ada angkanya, jelaskan perubahan yang bisa diamati." },
      { title: "Contoh", text: "Dua hari sebelum laporan dikirim, data dari tiga anggota tim belum konsisten. Saya menyatukan format, menandai data yang meragukan, lalu meminta tiap anggota memeriksa bagiannya. Tim mengirim laporan tepat waktu dan memakai format yang sama pada periode berikutnya." },
    ],
  },
  {
    id: "strategi-cat",
    topic: "Strategi Tes",
    title: "Manajemen waktu dan trik skip soal CAT",
    summary: "Atur batas detik per soal agar skor aman melampaui ambang batas tiap subtes.",
    exercise: "Quantitative Reasoning",
    sections: [
      { title: "Tetapkan batas waktu keras per soal", text: "Pada SKD CAT BKN (110 soal dalam 100 menit), rata-rata ideal adalah sekitar 54 detik per soal. Bila satu soal hitungan belum menemukan jalur solusi dalam 45 detik, tandai ragu-ragu lalu lanjutkan." },
      { title: "Urutan pengerjaan yang hemat energi kognitif", text: "Kerjakan subtes yang paling cepat menghasilkan poin aman terlebih dahulu, baru selesaikan soal hitungan panjang dan analisis wacana di putaran kedua." },
      { title: "Cek audit waktu salah di Statistik", text: "Setelah selesai simulasi, periksa panel Audit Waktu Soal Meleset di halaman hasil untuk melacak berapa menit yang terbuang di soal salah." },
    ],
  },
  {
    id: "persentase",
    topic: "Matematika Dasar",
    title: "Persentase dan perubahan berturut-turut",
    summary: "Pakailah nilai awal yang tepat saat menghitung diskon, pertumbuhan, dan perbandingan.",
    exercise: "Quantitative Reasoning",
    sections: [
      { title: "Tentukan pembanding", text: "Untuk mencari perubahan persentase, bagi selisih dengan nilai awal, lalu kalikan 100%. Dari 80 menjadi 100, selisihnya 20, sehingga kenaikannya 25%." },
      { title: "Kalikan tiap faktor perubahan", text: "Jika Rp200.000 didiskon 20%, harganya Rp160.000. Diskon tambahan 10% dihitung dari Rp160.000, sehingga harga menjadi Rp144.000. Total diskonnya 28%." },
      { title: "Coba sendiri", text: "Nilai 100 naik 10%, lalu turun 10%. Hasil akhirnya 99 karena 10% kedua dihitung dari 110." },
    ],
  },
  {
    id: "silogisme",
    topic: "Silogisme",
    title: "Uji kesimpulan dari dua premis",
    summary: "Bedakan apa yang pasti benar dari apa yang mungkin benar.",
    exercise: "Logical Reasoning",
    sections: [
      { title: "Perhatikan arah hubungan", text: "Jika semua A adalah B, setiap anggota A masuk kelompok B. Anggota B bisa berasal dari kelompok lain, sehingga arah hubungan tidak bisa langsung dibalik." },
      { title: "Contoh kesimpulan yang sah", text: "Semua analis memeriksa data. Semua orang yang memeriksa data mengikuti prosedur. Dari dua premis ini, semua analis mengikuti prosedur." },
      { title: "Coba cari pengecualian", text: "Semua analis memeriksa data. Sebagian orang yang memeriksa data bekerja jarak jauh. Premis ini masih memungkinkan semua analis bekerja di kantor. Jadi kita belum bisa menyimpulkan ada analis yang bekerja jarak jauh." },
    ],
  },
  {
    id: "istilah-kerja",
    topic: "Istilah Dunia Kerja",
    title: "Istilah yang sering muncul di lowongan",
    summary: "Kenali arti ATS, KPI, onboarding, dan istilah yang sering dipakai tim.",
    sections: [
      { title: "ATS dan onboarding", text: "ATS adalah sistem yang membantu perusahaan mengelola lamaran. Onboarding adalah proses orientasi saat orang mulai bekerja, seperti mengenal tim, alat, aturan, dan tugas awal." },
      { title: "KPI dan deliverable", text: "KPI adalah indikator untuk menilai kinerja, misalnya persentase tiket yang selesai tepat waktu. Deliverable adalah hasil yang disepakati, misalnya laporan bulanan atau panduan kerja." },
      { title: "Stakeholder dan handover", text: "Stakeholder adalah orang atau kelompok yang berkepentingan pada hasil kerja. Handover adalah pemindahan tanggung jawab beserta informasi yang dibutuhkan untuk melanjutkan pekerjaan." },
    ],
  },
  {
    id: "arah-karier",
    topic: "Karier",
    title: "Pilih peran dan siapkan bukti kemampuan",
    summary: "Ubah deskripsi lowongan menjadi daftar bukti yang bisa masuk CV dan wawancara.",
    sections: [
      { title: "Cari pola dari beberapa lowongan", text: "Pilih tiga contoh lowongan untuk peran yang sama. Tandai tanggung jawab dan kemampuan yang berulang. Catat kata yang penting dan cocok dengan pengalamanmu." },
      { title: "Hubungkan dengan pengalaman", text: "Untuk tiap keterampilan, tulis satu contoh dari kerja, magang, kuliah, proyek, atau organisasi. Jelaskan peranmu, apa yang kamu kerjakan, dan hasilnya." },
      { title: "Isi satu celah prioritas", text: "Pilih satu kemampuan yang sering diminta dan belum punya bukti. Buat proyek kecil dengan hasil yang bisa ditunjukkan, misalnya analisis data publik yang dilengkapi ringkasan keputusan." },
    ],
  },
  {
    id: "lpdp",
    topic: "Pendidikan & LPDP",
    title: "Petakan alasan studi dan rencana kontribusi",
    summary: "Hubungkan masalah, pilihan program studi, dan langkah setelah lulus.",
    sections: [
      { title: "Mulai dari masalah yang kamu kenal", text: "Jelaskan siapa yang terdampak dan kenapa masalah ini penting. Pakai satu pengalaman nyata untuk menunjukkan apa yang sudah kamu pelajari dan apa yang masih perlu kamu kuasai." },
      { title: "Pilih bagian program yang relevan", text: "Hubungkan mata kuliah, metode riset, atau proyek dengan kemampuan yang kamu butuhkan. Tunjukkan bagaimana kamu akan memakai kemampuan itu dalam praktik." },
      { title: "Uraikan langkah setelah studi", text: "Pilih kontribusi yang bisa dimulai dalam tahun pertama dan sebutkan pihak yang mungkin diajak bekerja sama. Gunakan tab Agenda di Progres untuk mencatat jadwal serta syarat dokumen." },
    ],
  },
];
