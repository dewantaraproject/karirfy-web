import type { StudyTrack } from "../types";

export const PREPARATION_GUIDES = {
  CPNS: {
    source: "SSCASN & PermenPANRB 18/2026",
    url: "https://sscasn.bkn.go.id/",
    checklist: [
      "Pastikan batas usia (18-35 thn, maks 40 thn jabatan tertentu) dan akreditasi saat lulus (Cum Laude wajib PT serta Prodi A/Unggul; JF Guru wajib Serdik Kepdirjen GTK 59/2026; Disabilitas wajib surat dokter dan video aktivitas).",
      "Putuskan strategi nilai SKD: pakai ulang nilai SKD TA 2024 (jika NIK & jenjang sama dan lolos PG 2026) atau ikut ujian SKD 2026.",
      "Cek skema SKB instansi tujuan: Pusat maks 3 tes tambahan (bobot <=50%, wawancara <=10%), Daerah wajib CAT >=60% tanpa wawancara.",
      "Cermati masa sanggah 3 hari, sanksi mundur setelah lulus/NIP (blacklist 2 tahun), dan larangan pindah instansi minimal 5 tahun.",
    ],
    title: "Persiapan SKB",
    field: "Formasi atau jabatan tujuan",
    scenarios: [
      { title: "Kasus teknis jabatan", prompt: "Ada dua pekerjaan prioritas dengan tenggat yang sama. Jelaskan data yang kamu butuhkan, urutan tindakan, dan cara menilai hasilnya.", rubric: ["Menyebut tugas jabatan yang relevan.", "Menjelaskan alasan memilih urutan tindakan.", "Menetapkan hasil yang bisa diperiksa."] },
      { title: "Pelayanan publik", prompt: "Seorang warga mengeluh karena proses layanan terlambat. Bagaimana kamu mengecek penyebab, merespons keluhan, dan mencegah masalah berulang?", rubric: ["Menggali fakta sebelum mengambil kesimpulan.", "Menjelaskan tindakan dan komunikasi kepada warga.", "Memberi cara mencegah masalah berulang."] },
      { title: "Transformasi & integritas ASN", prompt: "Unit kerjamu beralih ke sistem layanan digital, namun sebagian pegawai menolak dan muncul isu hoaks yang memecah belah tim. Langkah apa yang kamu ambil?", rubric: ["Menunjukkan adaptasi TIK dan pendampingan rekan kerja.", "Menjaga netralitas serta sikap anti-radikalisme berbasis fakta.", "Memastikan pelayanan warga tetap berjalan tanpa diskriminasi."] },
    ],
  },
  BUMN: {
    source: "FHCI",
    url: "https://fhcibumn.com/program/rekrutmen-bersama-bumn-rbb-vPteSd",
    checklist: ["Pilih perusahaan dan posisi yang ingin dipantau.", "Cocokkan profil serta dokumen dengan syarat posisi.", "Cek jadwal tes dan instruksi perangkat dari penyelenggara."],
    title: "Wawancara dan studi kasus BUMN",
    field: "Perusahaan atau posisi tujuan",
    scenarios: [
      { title: "Pengalaman bekerja sama", prompt: "Ceritakan saat kamu harus menyelesaikan perbedaan pendapat di tim. Apa peranmu dan bagaimana hasilnya?", rubric: ["Menjelaskan situasi dan tanggung jawab pribadi.", "Memberi contoh tindakan yang spesifik.", "Menjelaskan hasil serta pelajaran yang bisa diterapkan."] },
      { title: "Perbaikan layanan", prompt: "Keluhan pelanggan meningkat sementara jumlah staf tetap. Usulkan perbaikan yang bisa diuji dalam dua minggu.", rubric: ["Memilih masalah yang paling berdampak.", "Mengusulkan langkah yang bisa diuji.", "Menjelaskan ukuran keberhasilan."] },
    ],
  },
  "Bank Indonesia": {
    source: "Karier Bank Indonesia",
    url: "https://www.bi.go.id/id/karier/default.aspx",
    checklist: ["Tentukan jalur rekrutmen yang ingin dipantau.", "Cocokkan persyaratan pendidikan dan dokumen dengan pengumuman.", "Simpan jadwal asesmen dan instruksi dari panitia."],
    title: "Studi kasus dan wawancara BI",
    field: "Jalur rekrutmen tujuan",
    scenarios: [
      { title: "Inflasi dan daya beli", prompt: "Dalam kasus fiktif, harga pangan naik tetapi permintaan melemah. Data apa yang kamu cari dan bagaimana kamu menjelaskan dua kemungkinan penyebabnya?", rubric: ["Membedakan faktor pasokan dan permintaan.", "Menyebut data yang relevan untuk tiap hipotesis.", "Menjelaskan keterbatasan kesimpulannya."] },
      { title: "Sistem pembayaran", prompt: "Penggunaan pembayaran digital naik, tetapi pedagang kecil masih kesulitan mengadopsinya. Usulkan satu langkah dan cara mengukur dampaknya.", rubric: ["Mengidentifikasi hambatan dari sisi pedagang.", "Mengusulkan tindakan yang sesuai hambatan.", "Menjelaskan indikator inklusi dan risiko."] },
    ],
  },
  PPPK: {
    source: "SSCASN PPPK (PermenPANRB 18/2026)",
    url: "https://sscasn.bkn.go.id/",
    checklist: [
      "Pahami alur 2 tahap PermenPANRB 18/2026: Seleksi Administrasi dan Seleksi Kompetensi CAT BKN (Teknis, Manajerial, Sosial Kultural, serta Wawancara).",
      "Siapkan surat pengalaman kerja relevan, ijazah, serta dokumen administrasi berstempel sesuai syarat jabatan fungsional.",
      "Cermati masa perjanjian kerja PPPK (1 hingga 5 tahun) dan latih integritas sosial kultural pada soal berbasis situasi.",
    ],
    title: "Kompetensi Teknis & Wawancara PPPK",
    field: "Jabatan fungsional atau unit tujuan",
    scenarios: [
      { title: "Dilema etika birokrasi", prompt: "Rekan kerja meminta percepatan layanan di luar antrean resmi karena alasan kekerabatan. Bagaimana sikapmu dan langkah komunikasinya?", rubric: ["Menolak penyimpangan prosedur secara tegas dan santun.", "Menjelaskan aturan yang berlaku dengan bukti objektif.", "Menawarkan jalur layanan resmi yang paling efisien."] },
      { title: "Kolaborasi lintas unit", prompt: "Data dari dua unit layanan berbeda sehingga laporan kinerja tertunda. Bagaimana kamu menanganinya?", rubric: ["Memverifikasi sumber data bersama kedua unit.", "Menetapkan format pencatatan seragam.", "Memastikan tenggat pelaporan tetap terpenuhi."] },
    ],
  },
  Kedinasan: {
    source: "DIKDIN BKN",
    url: "https://dikdin.bkn.go.id/",
    checklist: ["Periksa batas usia, nilai rapor/ijazah, serta syarat fisik tiap sekolah kedinasan.", "Latih kecepatan TIU figural dan aritmatika di bawah batas waktu ketat CAT.", "Siapkan jadwal tes kesamaptaan, psikotes, dan wawancara lanjutan."],
    title: "Seleksi Lanjutan Sekolah Kedinasan",
    field: "Sekolah kedinasan atau prodi tujuan",
    scenarios: [
      { title: "Motivasi ikatan dinas", prompt: "Mengapa kamu memilih pendidikan ikatan dinas dan siap ditempatkan di seluruh wilayah Indonesia?", rubric: ["Menunjukkan pemahaman tugas instansi tujuan.", "Memberi bukti kesiapan mental dan adaptasi lintas daerah.", "Menjelaskan rencana kontribusi setelah lulus."] },
      { title: "Disiplin & manajemen tekanan", prompt: "Jadwal kuliah kedinasan dan pembinaan fisik berjalan padat setiap hari. Bagaimana caramu menjaga performa akademik?", rubric: ["Menyusun prioritas harian secara konkret.", "Menjaga konsistensi evaluasi diri.", "Menjelaskan strategi pemulihan fokus di bawah tekanan."] },
    ],
  },
  "Beasiswa LPDP": {
    source: "Kebijakan LPDP",
    url: "https://lpdp.kemenkeu.go.id/beasiswa/kebijakan-umum/",
    checklist: ["Baca panduan skema beasiswa yang kamu pilih.", "Periksa syarat program studi, dokumen, serta LoA jika diperlukan.", "Cek jadwal dan ketentuan Seleksi Substansi untuk skemamu."],
    title: "Latihan Seleksi Substansi",
    field: "Skema atau program studi tujuan",
    scenarios: [
      { title: "Alasan studi dan kontribusi", prompt: "Mengapa program studi pilihanmu sesuai dengan masalah yang ingin kamu selesaikan di Indonesia? Jelaskan rencana yang realistis setelah lulus.", rubric: ["Menghubungkan program studi dengan masalah konkret.", "Memberi bukti pengalaman yang mendukung.", "Menjelaskan rencana kontribusi dan indikatornya."] },
      { title: "Rencana saat gagal", prompt: "Proyek yang kamu rencanakan kehilangan mitra utama. Apa yang akan kamu ubah dan bagaimana kamu melanjutkan kontribusi?", rubric: ["Menjelaskan peranmu dan hambatan yang muncul.", "Menyebut alternatif tindakan yang realistis.", "Menunjukkan cara mengukur hasil setelah penyesuaian."] },
    ],
  },
} satisfies Record<StudyTrack, {
  source: string; url: string; checklist: string[]; title: string; field: string;
  scenarios: { title: string; prompt: string; rubric: string[] }[];
}>;
