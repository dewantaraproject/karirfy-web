import { EMPTY_CV, type CvDraft, type CvTemplate } from "../lib/cv";

export const cvSamples: Record<CvTemplate, CvDraft> = {
  professional: {
    ...EMPTY_CV,
    template: "professional",
    name: "Sri Theodore",
    headline: "Senior Business & Operations Analyst",
    city: "Jakarta Selatan",
    email: "sri.theodore@example.com",
    phone: "+62 812 8890 4412",
    link: "linkedin.com/in/sritheodore",
    profile:
      "Analis bisnis dan operasional dengan pengalaman 5 tahun mengoptimalkan alur layanan, merancang panel pelaporan eksekutif, serta menyederhanakan koordinasi lintas unit. Terbiasa menggabungkan audit data operasional dengan perbaikan proses kerja yang dapat diukur dampaknya secara mingguan.",
    experience: [
      {
        title: "Senior Operations Analyst",
        organization: "PT Nusantara Arus Niaga, Jakarta",
        period: "Jul 2023 – Sekarang",
        details:
          "Menyatukan laporan kinerja dari empat unit distribusi ke satu panel mingguan sehingga waktu rekap turun dari enam jam menjadi dua jam.\nMenelusuri 180 transaksi tertunda dan menerapkan verifikasi berjenjang yang menurunkan pengulangan kerja sebesar 24%.\nMemimpin tinjauan KPI bulanan bersama tim produk, logistik, dan layanan pelanggan untuk memangkas waktu tunggu pengiriman 15%.",
      },
      {
        title: "Business Process Associate",
        organization: "PT Lentera Solusi Digital, Jakarta",
        period: "Agu 2021 – Jun 2023",
        details:
          "Memetakan delapan alur persetujuan pengadaan dan menetapkan batas SLA baru yang mempercepat siklus persetujuan 32%.\nMerancang aturan validasi otomatis pada lembar rekonsiliasi sehingga tim mendeteksi 98% anomali sebelum penutupan buku.\nMenyusun buku panduan standar operasi yang digunakan oleh 45 anggota staf operasional di tiga wilayah.",
      },
      {
        title: "Operations Data Intern",
        organization: "Pusat Layanan Rona Arus, Bandung",
        period: "Jan – Jul 2021",
        details:
          "Mengelompokkan 420 tiket pengaduan pelanggan untuk memisahkan gangguan sistem berulang dari kendala insidental.\nMelatih enam petugas layanan dalam penerapan taksonomi tiket sehingga konsistensi pelaporan naik menjadi 94%.",
      },
    ],
    education: [
      {
        title: "S1 Sistem Informasi",
        organization: "Institut Teknologi Harapan Nusantara, Bandung",
        period: "2017 – 2021",
        details:
          "IPK 3,81/4,00 (Cum Laude). Tugas akhir memodelkan kapasitas antrean layanan publik dengan simulasi Monte Carlo.",
      },
    ],
    projects: [
      {
        title: "Audit Waktu Respons Layanan Regional",
        organization: "Inisiatif Lintas Divisi",
        period: "2024",
        details:
          "Menganalisis 12.000 catatan layanan menggunakan SQL dan Power BI untuk mengidentifikasi kemacetan di cabang bervolume tinggi.\nMenghasilkan rekomendasi penjadwalan ulang giliran kerja yang menurunkan keterlambatan respons hingga 19%.",
      },
    ],
    skills:
      "Analisis Data: SQL (PostgreSQL), Microsoft Excel Lanjut, Power BI, Python (Pandas), Validasi Data\nOperasional & Tata Kelola: Pemetaan Proses BPMN, Analisis Akar Masalah, Pengelolaan SLA, Fasilitasi Lintas Tim",
    certifications:
      "Certified Business Analysis Professional Prep · Akademi Sumbu, 2024\nLean Six Sigma Green Belt · Pusat Mutu Kerja, 2023",
    achievements:
      "Juara 1 Inovasi Efisiensi Proses Triwulanan · PT Nusantara Arus Niaga, 2025\nPembicara Forum Praktisi Data Operasional Indonesia, 2024",
    languages: "Bahasa Indonesia · Fasih (Ibu)\nBahasa Inggris · Profesional (IELTS 7.5)",
  },

  consulting: {
    ...EMPTY_CV,
    template: "consulting",
    name: "Wisanggeni Niskala",
    headline: "Senior Management Consultant & Corporate Strategy",
    city: "Jakarta Metropolitan Area",
    email: "wisanggeni.niskala@example.com",
    phone: "+62 813 4421 9087",
    link: "linkedin.com/in/wisanggeniniskala",
    profile:
      "Konsultan strategi dan transformasi bisnis yang menangani portofolio jasa keuangan, energi terbarukan, dan rantai pasok nasional. Berpengalaman memimpin tim analis dari perumusan hipotesis, pemodelan finansial, hingga implementasi platform intelijen bisnis bagi jajaran direksi.",
    experience: [
      {
        title: "Senior Associate Consultant",
        organization: "Karsa Advisory Partners, Jakarta",
        period: "Jan 2024 – Sekarang",
        details:
          "Membimbing tim beranggotakan tiga konsultan dan delapan analis magang sehingga tingkat penyelesaian proyek tepat waktu naik 25%.\nMengelola portofolio tujuh klien korporat pada sektor perbankan, kesehatan, dan transisi energi.\nMerancang platform intelijen bisnis eksekutif yang berkontribusi pada pertumbuhan pendapatan lini klien sebesar 12%.\nMemperluas basis akun strategis sebesar 20% melalui riset peluang pasar dan penyusunan proposal komersial terukur.",
      },
      {
        title: "Associate Consultant",
        organization: "Karsa Advisory Partners, Jakarta",
        period: "Jul 2022 – Des 2023",
        details:
          "Memimpin tiga analis menuntaskan delapan proyek restrukturisasi proses sesuai anggaran dan dua minggu lebih cepat dari jadwal.\nMengorkestrasi peluncuran aplikasi perbankan ritel bagi klien telekomunikasi-keuangan dengan adopsi 310 ribu pengguna awal.\nMenaikkan akuisisi nasabah 15% melalui segmentasi berbasis data transaksi dan uji eksperimen kampanye kanal digital.",
      },
      {
        title: "Business Strategy Analyst",
        organization: "Mandala Strategic Group, Jakarta",
        period: "Jan – Jun 2022",
        details:
          "Menyusun kajian komprehensif pasar energi surya komersial beserta model penetapan harga wilayah Jawa-Bali.\nMembangun model proyeksi permintaan yang mendorong kenaikan penjualan panel komersial sebesar 22% pada kuartal berikutnya.",
      },
    ],
    education: [
      {
        title: "S1 Teknik Infrastruktur Lingkungan",
        organization: "Institut Teknologi Bandung",
        period: "Agu 2017 – Okt 2021",
        details:
          "IPK 3,79/4,00 (Cum Laude, Dean's List 3 semester). Aktif di himpunan mahasiswa sebagai Ketua Panitia Wisuda dan Kepala Logistik.",
      },
    ],
    projects: [
      {
        title: "Ketua Pelaksana Perayaan Wisuda Oktober KMIL",
        organization: "Kepemimpinan Organisasi Kampus, Bandung",
        period: "Sep – Okt 2019",
        details:
          "Memimpin 64 panitia lintas divisi untuk menyelenggarakan rangkaian malam apresiasi, arak-arakan, dan upacara resmi untuk 1.200 peserta.\nMenjaga serapan anggaran 9% di bawah pagu dengan negosiasi vendor terpadu.",
      },
    ],
    achievements:
      "Top 2 IPK Tertinggi Angkatan Semester II · FTSL ITB, 2021\nDean's List Prestasi Akademik Berkelanjutan · FTSL ITB, 2019 & 2020\nMedali Emas Olimpiade Matematika Tingkat Kabupaten · Karawang, 2016",
    certifications:
      "CFA Level I Passed · CFA Institute, Agu 2023\nWakil Manajer Investasi (WMI) · TICMI, Nov 2021",
    skills:
      "Keuangan & Strategi: Financial Modelling, Valuasi DCF & Komparatif, Optimalisasi Portofolio Markowitz, Due Diligence Komersial\nPerangkat Analitik: Excel (VBA & Macro), SQL, Power BI, Tableau, Python Dasar",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional (IELTS 7.5)\nBahasa Jerman · Dasar (A2)",
  },

  corporate_mt: {
    ...EMPTY_CV,
    template: "corporate_mt",
    name: "Wisanggeni Niskala",
    headline: "Management Trainee · Finance & Commercial Operations",
    city: "Jakarta Selatan",
    email: "wisanggeni.niskala@example.com",
    phone: "+62 813 4421 9087",
    link: "linkedin.com/in/wisanggeniniskala",
    profile:
      "Profesional jalur akselerasi kepemimpinan dengan latar belakang rotasi menyeluruh di fungsi pemasaran, kredit, operasional, dan analisis pasar. Berpengalaman menjembatani kebutuhan mitra komersial dengan ketepatan tata kelola risiko di industri pembiayaan dan niaga digital.",
    education: [
      {
        title: "S1 Teknik Infrastruktur & Manajemen Rekayasa",
        organization: "Institut Teknologi Bandung",
        period: "Agu 2017 – Okt 2021",
        details:
          "IPK 3,69/4,00 (Cum Laude, Dean's List). Penerima penghargaan mahasiswa berprestasi akademik tingkat fakultas tiga semester berturut-turut.",
      },
      {
        title: "Sertifikasi Wakil Manajer Investasi (WMI)",
        organization: "The Indonesia Capital Market Institute (TICMI)",
        period: "Nov 2021",
        details:
          "Lulus lisensi resmi pasar modal mencakup analisis instrumen ekuitas, pendapatan tetap, dan manajemen risiko portofolio.",
      },
    ],
    experience: [
      {
        title: "Professional Development Program (Management Trainee)",
        organization: "PT Bank Sentral Pembiayaan Nusantara",
        period: "Mar 2022 – Sekarang",
        details:
          "Menjalani rotasi intensif pada unit Pemasaran Korporat, Operasi Kredit, Penagihan, dan Fungsi Pendukung Strategis.\nMenyusun proyek perbaikan proses persetujuan kredit ritel yang memangkas waktu verifikasi berkas dari 48 jam menjadi 18 jam.\nMempresentasikan evaluasi portofolio pembiayaan kuartalan di hadapan komite eksekutif dengan tingkat akurasi proyeksi 96%.",
      },
      {
        title: "Merchandiser & Commercial Operations Intern",
        organization: "PT Global Niaga Digital (Blibli)",
        period: "Mei – Nov 2021",
        details:
          "Membantu proses onboarding lebih dari 30 mitra UMKM ke dalam katalog resmi kanal niaga elektronik.\nMengelola pengunggahan serta kurasi 12.000+ SKU produk kategori hobi dan elektronik beserta optimasi kata kunci pencarian.\nBerkoordinasi langsung dengan VP Commercial untuk menyelaraskan jadwal kampanye promosi bulanan.",
      },
      {
        title: "Asisten Dosen & Magang Teknik Lapangan",
        organization: "ITB & PT Pulauintan Konstruksi",
        period: "Jul – Des 2020",
        details:
          "Membimbing 55 mahasiswa pada dua mata kuliah keahlian serta menyusun modul evaluasi praktikum mingguan.\nMengevaluasi kesesuaian desain teknis proyek rumah sakit di Karawang bersama tim quantity surveyor.",
      },
    ],
    projects: [
      {
        title: "Program Pengabdian Penyediaan Air Bersih Desa Cigalontang",
        organization: "ENVRZ Social Engineering, Tasikmalaya",
        period: "Des 2020",
        details:
          "Merancang sistem distribusi transisi untuk meningkatkan kapasitas pasokan air bersih bagi 140 kepala keluarga.",
      },
    ],
    skills:
      "Analisis Keuangan: Pemodelan Arus Kas, Penilaian Risiko Kredit, Manajemen Portofolio, Akuntansi Dasar\nPerangkat & Bisnis: Microsoft Excel Spesialisasi Bisnis, Power BI, SQL, Komunikasi Eksekutif, Copywriting Bisnis",
    certifications:
      "Excel Skills for Business Specialization · Macquarie University\nUnderstanding Financial Markets · University of Geneva",
    achievements:
      "Lulusan Terbaik Program Akselerasi Bakat Batch 2022 · PT Bank Sentral Pembiayaan Nusantara",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional (C1)",
  },

  graduate: {
    ...EMPTY_CV,
    template: "graduate",
    name: "Wisanggeni Niskala",
    headline: "Lulusan Statistika & Analis Data Pemula",
    city: "Semarang",
    email: "wisanggeni.niskala@example.com",
    phone: "+62 813 4421 9087",
    link: "github.com/wisanggeniniskala",
    profile:
      "Lulusan statistika yang fokus pada pengolahan data survei, pemodelan prediktif, dan visualisasi temuan untuk pengambilan keputusan layanan publik. Terbiasa menyusun pipeline pembersihan data yang dapat direproduksi serta menuliskan ringkasan eksekutif bagi pemangku kepentingan nonteknis.",
    education: [
      {
        title: "S1 Statistika",
        organization: "Universitas Diponegoro Nusantara, Semarang",
        period: "2022 – 2026",
        details:
          "IPK 3,78 dari 4,00. Mata kuliah utama: Analisis Regresi Terapan, Metode Survei Sampel, Statistika Komputasi, dan Rancangan Eksperimen.\nTugas akhir membandingkan metode regresi logistik dan gradient boosting untuk memperkirakan keterlambatan antrean layanan publik pada 18.000 baris data.",
      },
    ],
    experience: [
      {
        title: "Magang Riset & Analisis Layanan",
        organization: "Laboratorium Kebijakan Jejak Kota",
        period: "Feb – Jun 2025",
        details:
          "Mengaudit 320 respons survei rumah tangga, menyaring duplikasi isian, dan membangun skrip validasi otomatis di R.\nMenyusun grafik interaktif untuk enam indikator kepuasan layanan yang dipresentasikan ke dinas tata kota.\nMenulis dokumentasi metode pembersihan data sehingga anggota tim lain dapat mereplikasi analisis tanpa perubahan temuan.",
      },
      {
        title: "Asisten Praktikum Statistika Dasar",
        organization: "Fakultas Sains & Matematika, Semarang",
        period: "Agu – Des 2024",
        details:
          "Memandu enam sesi praktikum uji hipotesis serta mendampingi 26 mahasiswa dalam menyusun laporan interpretasi tabel ANOVA.\nMenyusun bank latihan berisi 40 studi kasus sintetis agar mahasiswa terbiasa membaca output RStudio dan Python.",
      },
    ],
    projects: [
      {
        title: "Dasbor Simulasi Antrean Fasilitas Kesehatan",
        organization: "Proyek Riset Independen",
        period: "2025",
        details:
          "Membangun panel pemantauan waktu tunggu dengan data simulasi dan menguji tiga skenario penambahan loket layanan.\nMenyajikan ringkasan satu halaman berisi perbandingan biaya dan efisiensi waktu tunggu bagi manajemen puskesmas.",
      },
      {
        title: "Koordinator Kelas Pengantar Pemrograman R",
        organization: "Komunitas Data Kampus",
        period: "2024",
        details:
          "Menyiapkan kurikulum empat pertemuan serta membimbing 18 peserta menuntaskan proyek visualisasi data kependudukan.\nMengevaluasi kesalahan kode paling umum dan menyusun lembar panduan debugging ringkas.",
      },
    ],
    skills:
      "Bahasa & Alat: R (Tidyverse, ggplot2), Python (Pandas, Scikit-learn), SQL Dasar, Microsoft Excel Pivot & Power Query\nMetodologi: Pembersihan Data, Uji Hipotesis, Visualisasi Data, Penyusunan Laporan Riset",
    achievements:
      "Finalis Terbaik Kompetisi Analitik Data Nasional · Pekan Statistika Indonesia, 2025\nPenerima Beasiswa Prestasi Akademik Semester V-VII",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Menengah Atas (TOEFL ITP 567)",
  },

  executive: {
    ...EMPTY_CV,
    template: "executive",
    name: "Wisanggeni Niskala",
    headline: "Head of Regional Operations & Supply Chain",
    city: "Semarang",
    email: "wisanggeni.niskala@example.com",
    phone: "+62 813 4421 9087",
    link: "linkedin.com/in/wisanggeniniskala",
    profile:
      "Pemimpin operasional dengan rekam jejak delapan tahun mengelola jaringan distribusi multi-cabang, akurasi inventori, dan efisiensi biaya armada. Berpengalaman menerjemahkan target margin korporat menjadi rencana kerja mingguan yang terukur di tingkat supervisor hingga kepala gudang.",
    achievements:
      "Ketepatan waktu pengiriman lintas enam cabang meningkat dari 87% menjadi 96% dalam empat kuartal.\nBiaya pemenuhan per pesanan turun 14% melalui penataan ulang zona pengambilan barang dan rute armada.\nEmpat supervisor binaan berhasil dipromosikan ke posisi Manajer Cabang lewat program mentoring terstruktur.",
    experience: [
      {
        title: "Kepala Operasional Regional",
        organization: "PT Lintas Reka Distribusi",
        period: "2022 – Sekarang",
        details:
          "Memimpin enam titik distribusi dengan 140 anggota tim serta menyepakati target layanan mingguan bersama divisi komersial.\nMelakukan audit kapasitas, selisih stok, dan biaya lembur bulanan untuk mengarahkan belanja perbaikan tiap cabang.\nMenyusun protokol respons gangguan sistem dan cuaca ekstrem guna menjaga kesinambungan pengiriman harian.",
      },
      {
        title: "Manajer Pemenuhan & Gudang",
        organization: "PT Arus Loka Niaga",
        period: "2019 – 2022",
        details:
          "Menata ulang tata letak rak berdasarkan frekuensi perputaran SKU dan memangkas waktu pemrosesan pesanan sebesar 18%.\nMenginisiasi forum mingguan lintas unit layanan pelanggan dan gudang yang menekan tingkat retur kesalahan kirim hingga 31%.",
      },
      {
        title: "Supervisor Operasi Logistik",
        organization: "Simpul Bumi Logistik",
        period: "2016 – 2019",
        details:
          "Mengatur jadwal giliran kerja tiga shift dan merancang audit siklus stok harian untuk barang bernilai tinggi.\nMelatih 32 karyawan baru menggunakan daftar periksa standar penerimaan, penyortiran, dan serah terima muatan.",
      },
    ],
    education: [
      {
        title: "S1 Manajemen Operasi & Rantai Pasok",
        organization: "Universitas Diponegoro Nusantara",
        period: "2012 – 2016",
        details:
          "IPK 3,68/4,00. Tugas akhir menganalisis dampak penjadwalan kedatangan armada terhadap waktu tunggu bongkar muat.",
      },
    ],
    skills:
      "Kepemimpinan Operasi: Perencanaan Kapasitas S&OP, Manajemen Biaya Armada, Pengendalian Inventori, Pengembangan Tim\nAnalitik & Sistem: WMS/ERP, Power BI, Lean Warehousing, Analisis Akar Masalah",
    certifications:
      "Supply Chain Management Professional · Akademi Simpul Mutu, 2024\nK3 Logistik & Keselamatan Gudang · Kemenaker RI, 2022",
  },

  technical: {
    ...EMPTY_CV,
    template: "technical",
    name: "Wisanggeni Niskala",
    headline: "Senior Backend Engineer · Distributed Systems",
    city: "Yogyakarta",
    email: "wisanggeni.niskala@example.com",
    phone: "+62 813 4421 9087",
    link: "github.com/wisanggeniniskala",
    profile:
      "Backend engineer yang merancang layanan transaksi berkeandalan tinggi, API berlatensi rendah, dan pipeline pemrosesan antrean terdistribusi. Berpengalaman melakukan profiling kueri basis data, merancang kunci idempotensi pembayaran, serta membangun sistem observabilitas produksi.",
    skills:
      "Bahasa & Runtime: TypeScript (Node.js), Go, SQL, Bash\nData & Infrastruktur: PostgreSQL, Redis, Kafka, REST & gRPC, Docker, Kubernetes Dasar\nRekayasa Keandalan: GitHub Actions CI/CD, OpenTelemetry, Pengujian Integrasi & Kontrak, Manajemen Insiden",
    experience: [
      {
        title: "Backend Engineer",
        organization: "PT Ruang Niaga Digital, Yogyakarta",
        period: "2023 – Sekarang",
        details:
          "Mengoptimalkan indeks komposit dan strategi caching kueri laporan sehingga latensi p95 turun dari 820 ms menjadi 310 ms.\nMenerapkan kunci idempotensi pada gerbang pembayaran untuk mencegah pencatatan transaksi ganda saat jaringan klien tidak stabil.\nMembangun dasbor metrik galat berbasis OpenTelemetry serta buku panduan respons insiden untuk empat layanan inti.",
      },
      {
        title: "Software Engineer",
        organization: "PT Kanal Reka Sistem, Jakarta",
        period: "2021 – 2023",
        details:
          "Mengembangkan API katalog bertrafik 1,8 juta permintaan harian serta menulis suite pengujian kontrak bersama tim seluler.\nMemindahkan proses ekspor laporan berukuran besar ke antrean pekerja asinkron sehingga waktu tunggu API utama tetap di bawah 120 ms.\nMenambahkan validasi migrasi skema basis data otomatis di alur CI sebelum rilis produksi.",
      },
    ],
    education: [
      {
        title: "S1 Teknik Informatika",
        organization: "Universitas Gadjah Mada Nusantara, Yogyakarta",
        period: "2017 – 2021",
        details:
          "IPK 3,84/4,00. Tugas akhir mengenai pemantauan latensi layanan mikro dengan skema beban lonjakan terukur.",
      },
    ],
    projects: [
      {
        title: "Idempotent Queue Worker & Dead-Letter Monitor",
        organization: "Proyek Sumber Terbuka",
        period: "2025",
        details:
          "Membangun layanan demo pekerja antrean dengan strategi exponential backoff dan pemulihan otomatis saat worker terhenti.\nMenyediakan tolok ukur perbandingan throughput pada tiga ukuran konkurensi beserta dokumentasi pengujian beban.",
      },
    ],
    certifications:
      "Observability & Distributed Tracing · Kelas Reka Sistem, 2024\nPostgreSQL Performance Tuning · Akademi Data Terbuka, 2023",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional",
  },

  data_science: {
    ...EMPTY_CV,
    template: "data_science",
    name: "Sri Theodore",
    headline: "Data Scientist & Quantitative Risk Analyst",
    city: "Jakarta Selatan",
    email: "sri.theodore@example.com",
    phone: "+62 812 8890 4412",
    link: "github.com/sritheodore",
    profile:
      "Data scientist dengan keahlian pemodelan prediktif, eksperimen kausal A/B, dan analitik risiko pelanggan pada produk finansial digital. Berpengalaman mengubah data mentah berskala jutaan baris menjadi fitur pembelajaran mesin yang meningkatkan ketepatan segmentasi serta efisiensi biaya akuisisi.",
    skills:
      "Pemrograman & ML: Python (Scikit-learn, XGBoost, PyTorch Dasar), R, SQL Lanjut (Window Functions, CTE)\nAnalitik & Eksperimen: Pengujian A/B, Uplift Modelling, Time-Series Forecasting, Looker Studio, BigQuery\nRekayasa Data: dbt, Airflow Dasar, Git, Docker untuk Reproduksibilitas Model",
    experience: [
      {
        title: "Data Scientist",
        organization: "PT Cakrawala FinTech Indonesia, Jakarta",
        period: "Mar 2023 – Sekarang",
        details:
          "Membangun model propensity churn dengan XGBoost pada 640.000 pengguna aktif sehingga kampanye retensi menekan angka berhenti langganan 16%.\nMerancang sistem evaluasi eksperimen A/B berbasis pengujian sequential untuk menguji empat perubahan alur pendaftaran secara paralel.\nMengotomatisasi pipeline fitur harian di BigQuery dan dbt yang menghemat waktu persiapan data tim analis hingga 8 jam per minggu.",
      },
      {
        title: "Junior Data Analyst",
        organization: "PT Loka Dagang Digital, Bandung",
        period: "Jul 2021 – Feb 2023",
        details:
          "Menyusun model segmentasi RFM untuk mengelompokkan 120.000 pelanggan dan menaikkan tingkat konversi email promosi sebesar 4,2 poin persentase.\nMembangun dasbor pemantauan anomali transaksi harian yang membantu tim risiko memblokir 88% pola penyalahgunaan voucher.",
      },
    ],
    education: [
      {
        title: "S1 Matematika & Sains Data",
        organization: "Institut Teknologi Bandung",
        period: "2017 – 2021",
        details:
          "IPK 3,87/4,00 (Cum Laude). Fokus riset pada optimasi model peramalan deret waktu untuk permintaan ritel.",
      },
    ],
    projects: [
      {
        title: "Mesin Rekomendasi Skor Kelayakan Belajar Adaptif",
        organization: "Proyek Portofolio Riset",
        period: "2024",
        details:
          "Menerapkan algoritma pembobotan pengulangan berjarak (spaced repetition) berbasis data akurasi dan kecepatan respons per topik.\nMenghasilkan simulasi peningkatan retensi materi sebesar 27% dibanding urutan latihan acak.",
      },
    ],
    certifications:
      "Google Professional Data Analytics Certificate · 2024\nMachine Learning Specialization · DeepLearning.AI, 2023",
    achievements:
      "Juara 2 Hackathon Analitik Risiko Kredit Nasional · 2024",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional (IELTS 7.5)",
  },

  tpm_product: {
    ...EMPTY_CV,
    template: "tpm_product",
    name: "Wisanggeni Niskala",
    headline: "Technical Program Manager · Core Platform & Delivery",
    city: "Jakarta Pusat",
    email: "wisanggeni.niskala@example.com",
    phone: "+62 813 4421 9087",
    link: "linkedin.com/in/wisanggeniniskala",
    profile:
      "Technical Program Manager yang mengorkestrasi peluncuran inisiatif multi-tim antara rekayasa perangkat lunak, produk, kepatuhan, dan operasi. Berpengalaman menyelaraskan peta jalan kuartalan, mengurai ketergantungan teknis layanan inti, serta mempercepat siklus rilis tanpa mengorbankan reliabilitas.",
    experience: [
      {
        title: "Technical Program Manager",
        organization: "PT Sentra Ekosistem Digital, Jakarta",
        period: "Feb 2023 – Sekarang",
        details:
          "Memimpin eksekusi lintas tujuh tim rekayasa (42 engineer dan desainer) untuk meluncurkan modul dompet korporat tepat pada tenggat.\nMengintegrasikan sistem pelacakan ketergantungan lintas tim sehingga risiko keterlambatan rilis antar-sprint berkurang 28%.\nMenyelaraskan metrik performa teknis dan target bisnis bersama VP Product serta memangkas biaya infrastruktur awan 22% lewat konsolidasi layanan.",
      },
      {
        title: "Associate Product Operations Manager",
        organization: "PT Mitra Niaga Terpadu, Jakarta",
        period: "Agu 2020 – Jan 2023",
        details:
          "Mengelola program peremajaan sistem pelacakan insiden internal bagi 125 staf operasional dan merilis 18 fitur alur kerja baru.\nMenyusun standar triase laporan bug dan dokumentasi pasca-insiden yang mempercepat resolusi kendala prioritas tinggi sebesar 34%.\nMemfasilitasi uji kesiapan pengguna bersama lima departemen sebelum setiap peluncuran fitur besar.",
      },
    ],
    education: [
      {
        title: "S1 Teknik Industri",
        organization: "Universitas Indonesia, Depok",
        period: "2016 – 2020",
        details:
          "IPK 3,76/4,00. Fokus riset pada perancangan sistem manajemen proyek gesit (Agile) pada organisasi perangkat lunak skala menengah.",
      },
    ],
    projects: [
      {
        title: "Modernisasi Arsitektur Layanan Pembayaran Terpadu",
        organization: "Inisiatif Strategis Lintas Departemen",
        period: "2024",
        details:
          "Mengkoordinasikan migrasi empat layanan lawas ke arsitektur berantrean tanpa waktu henti selama jam transaksi puncak.\nMencapai ketersediaan layanan 99,96% selama periode kampanye belanja tahunan.",
      },
    ],
    skills:
      "Manajemen Program: Agile & Scrum Scaling, Pemetaan Ketergantungan Teknis, Manajemen Risiko Rilis, OKR & KPI Produk\nTeknis & Alat: SQL Analitik, API Architecture Basics, Jira/Linear Automation, Figma, Looker Studio",
    certifications:
      "Project Management Professional (PMP) · PMI, 2024\nCertified Scrum Product Owner (CSPO) · Scrum Alliance, 2022",
    achievements:
      "Promosi Akselerasi 12 Bulan Lebih Cepat atas dampak peluncuran platform korporat · 2024",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional",
  },

  bumn_akhlak: {
    ...EMPTY_CV,
    template: "bumn_akhlak",
    name: "Sri Theodore",
    headline: "Officer Development Program · Corporate Banking & Strategy",
    city: "Jakarta Pusat",
    email: "sri.theodore@example.com",
    phone: "+62 812 8890 4412",
    link: "linkedin.com/in/sritheodore",
    profile:
      "Kandidat profesional jalur kepemimpinan BUMN dengan rekam jejak analisis keuangan korporat, pengawasan tata kelola risiko, dan kolaborasi lintas unit berlandaskan nilai AKHLAK. Terbiasa menyusun kajian kelayakan pembiayaan infrastruktur, mengevaluasi laporan keuangan, serta memimpin proyek perbaikan layanan nasabah.",
    experience: [
      {
        title: "Corporate Credit & Risk Analyst",
        organization: "PT Bank Pembangunan Nasional Tbk, Jakarta",
        period: "Mei 2023 – Sekarang",
        details:
          "Menyusun memorandum analisis kredit untuk 14 debitur korporat sektor energi dan manufaktur dengan total portofolio Rp1,4 triliun.\nMelakukan uji ketahanan arus kas (stress testing) terhadap fluktuasi suku bunga serta menjaga rasio kredit bermasalah di bawah 1,1%.\nMengembangkan templat penilaian rasio keuangan otomatis yang mempercepat penyusunan nota analisa komite hingga 30%.",
      },
      {
        title: "Commercial Operations Intern",
        organization: "PT Energi Nusantara Holding (BUMN), Jakarta",
        period: "Sep 2022 – Feb 2023",
        details:
          "Membantu tim perencanaan strategis menyusun ringkasan kinerja 12 anak perusahaan pada papan pantau bulanan direksi.\nMengaudit kelengkapan dokumen kepatuhan tata kelola perusahaan yang baik (GCG) dan pelaporan risiko proyek strategis.",
      },
    ],
    education: [
      {
        title: "S1 Ilmu Ekonomi & Keuangan",
        organization: "Universitas Gadjah Mada, Yogyakarta",
        period: "2018 – 2022",
        details:
          "IPK 3,86/4,00 (Cum Laude). Penerima Beasiswa Karya Salemba Empat; Ketua Divisi Riset Himpunan Mahasiswa Ilmu Ekonomi.",
      },
    ],
    projects: [
      {
        title: "Digitalisasi Monitoring Proyek Inklusi Keuangan Daerah",
        organization: "Inisiatif Gugus Tugas AKHLAK Muda",
        period: "2024",
        details:
          "Merancang alur pelaporan capaian penyaluran kredit usaha rakyat (KUR) di 18 kantor cabang wilayah Jawa Tengah.\nMeningkatkan ketepatan waktu pelaporan cabang dari 74% menjadi 95% dalam dua kuartal.",
      },
    ],
    achievements:
      "Finalis Terbaik Kompetisi Analisis Bisnis BUMN · Forum FHCI Muda, 2024\nLulusan Terbaik Program Akselerasi Analis Kredit Junior · 2023",
    certifications:
      "Sertifikasi Manajemen Risiko Perbankan Jenjang 4 · LSPP, 2024\nBloomberg Market Concepts & Financial Modeling · 2022",
    skills:
      "Analisis Keuangan & Risiko: Analisis Laporan Keuangan, Stress Testing Arus Kas, Valuasi Proyek, Tata Kelola GCG\nKompetensi Kerja: Implementasi Nilai AKHLAK, Komunikasi Komite Eksekutif, Excel Lanjut, Power BI",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional (IELTS 7.5)",
  },

  classic: {
    ...EMPTY_CV,
    template: "classic",
    name: "Sri Theodore",
    headline: "Spesialis Pemasaran Digital & Pertumbuhan",
    city: "Surabaya",
    email: "sri.theodore@example.com",
    phone: "+62 812 8890 4412",
    link: "linkedin.com/in/sritheodore",
    profile:
      "Spesialis pemasaran digital dengan enam tahun pengalaman di optimasi mesin pencari (SEO), konten edukatif, dan periklanan terukur. Terbiasa menyusun hipotesis eksperimen kampanye, menurunkan biaya akuisisi prospek, serta berkolaborasi dengan tim produk dan penjualan untuk mendongkrak retensi pelanggan.",
    experience: [
      {
        title: "Digital Growth Specialist",
        organization: "PT Langit Temu Media, Surabaya",
        period: "Apr 2023 – Sekarang",
        details:
          "Membangun arsitektur SEO dan konten edukasi untuk 34 halaman produk hingga menaikkan kunjungan organik sebesar 42% dalam dua kuartal.\nMengelola eksperimen halaman tujuan dan iklan berbayar yang menaikkan tingkat konversi dari 2,8% menjadi 3,7%.\nMenyusun laporan atribusi mingguan untuk mengoptimalkan alokasi anggaran kampanye dan memangkas biaya per prospek 19%.",
      },
      {
        title: "Content & Campaign Coordinator",
        organization: "Arunika Ritel Nusantara, Malang",
        period: "Feb 2021 – Mar 2023",
        details:
          "Menyusun kalender editorial bulanan untuk tiga lini produk serta membimbing enam kontributor menulis sesuai intensi pencarian.\nMenguji variasi subjek kampanye email dan segmentasi pelanggan yang meningkatkan rasio klik dari 2,1% menjadi 3,1%.",
      },
      {
        title: "Marketing Operations Assistant",
        organization: "Ruang Tumbuh Studio, Surabaya",
        period: "Jun 2019 – Jan 2021",
        details:
          "Mengaudit data kinerja 15 kanal kampanye dan membangun pustaka aset terstandar yang mempercepat koordinasi tim kreatif.",
      },
    ],
    education: [
      {
        title: "S1 Ilmu Komunikasi Pemasaran",
        organization: "Universitas Airlangga Nusantara, Surabaya",
        period: "2015 – 2019",
        details:
          "IPK 3,74/4,00. Tugas akhir meneliti efektivitas pembingkaian pesan edukatif terhadap tingkat pendaftaran layanan digital.",
      },
      {
        title: "Sertifikasi Analitik Pemasaran Terapan",
        organization: "Akademi Titik Pasar, Jakarta",
        period: "2020",
        details:
          "Menyelesaikan proyek panel atribusi multi-sentuh di Looker Studio untuk membandingkan kontribusi kanal berbayar dan organik.",
      },
    ],
    projects: [
      {
        title: "Peluncuran Kampanye Edukasi Karier Nasional",
        organization: "Kolaborasi Lintas Kanal",
        period: "2024",
        details:
          "Mengorkestrasi peluncuran kampanye 30 hari yang menjangkau 180.000 pembaca unik dengan biaya akuisisi 23% di bawah target.",
      },
    ],
    skills:
      "Pemasaran & Analitik: SEO Teknis, Google Ads, Meta Ads, GA4, Looker Studio, Eksperimen A/B, Riset Kata Kunci\nKolaborasi: Perencanaan Kampanye, Penulisan Salinan Konversi, Manajemen Kontributor",
    certifications:
      "Google Analytics 4 & Search Ads Certified · 2024\nPerformance Marketing Strategy · Akademi Titik Pasar, 2023",
    achievements:
      "Pembicara Tamu Forum Eksperimen Pertumbuhan Produk · Surabaya, 2025",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional",
  },

  lpdp_scholar: {
    ...EMPTY_CV,
    template: "lpdp_scholar",
    name: "Sri Theodore",
    headline: "Calon Mahasiswa Magister Kebijakan Publik · Pelamar LPDP",
    city: "Jakarta Pusat",
    email: "sri.theodore@example.com",
    phone: "+62 812 8890 4412",
    link: "orcid.org/0000-0002-1845-9201",
    profile:
      "Peneliti dan analis kebijakan publik dengan fokus 4 tahun pada akses layanan kesehatan primer dan ketahanan pangan daerah tertinggal. Memiliki dua publikasi terindeks, pengalaman lapangan di 14 kabupaten, serta komitmen kontribusi merancang kerangka evaluasi program gizi daerah setelah menyelesaikan studi Magister.",
    education: [
      {
        title: "S1 Ilmu Administrasi & Kebijakan Publik",
        organization: "Universitas Indonesia, Depok",
        period: "2018 – 2022",
        details:
          "IPK 3,89/4,00 (Cum Laude, Lulusan Terbaik Departemen). Tugas akhir mengenai efektivitas tata kelola dana desa untuk layanan posyandu.",
      },
    ],
    publications:
      "Theodore, S., & Prakoso, D. (2025). Evaluasi Akses Layanan Kesehatan Primer di Wilayah Kepulauan Indonesia Timur. Jurnal Kebijakan Publik Nusantara, 12(2), 45-63.\nTheodore, S. (2024). Digitalisasi Pencatatan Gizi Daerah: Peluang dan Hambatan Implementasi. Prosiding Simposium Tata Kelola Daerah.",
    projects: [
      {
        title: "Pendampingan Sistem Informasi Posyandu Terpadu (SIP-Desa)",
        organization: "Koalisi Kesehatan Ibu & Anak Nusantara, NTT & Maluku",
        period: "2023 – 2025",
        details:
          "Melatih 86 kader kesehatan desa menggunakan formulir pemantauan pertumbuhan balita yang terhubung dengan puskesmas kecamatan.\nBerhasil mempercepat pelaporan kasus gizi rentan dari 18 hari menjadi 3 hari kerja.",
      },
    ],
    experience: [
      {
        title: "Analis Kebijakan Muda",
        organization: "Pusat Kajian Tata Kelola Publik Indonesia, Jakarta",
        period: "Jan 2023 – Sekarang",
        details:
          "Menyusun delapan naskah ringkas kebijakan (policy brief) terkait alokasi anggaran kesehatan daerah untuk mitra kementerian.\nMemimpin survei lapangan dan wawancara mendalam bersama 65 kepala puskesmas serta pemangku kepentingan pemerintah kabupaten.\nMengelola kolaborasi riset lintas disiplin antara ekonom kesehatan, ahli statistik, dan pemerintah daerah.",
      },
      {
        title: "Asisten Riset Kebijakan Sosial",
        organization: "Laboratorium Kebijakan Universitas Indonesia",
        period: "Jul 2021 – Des 2022",
        details:
          "Mengolah data Susenas BPS dan menyusun tabulasi silang indikator kemiskinan serta akses jaminan kesehatan nasional.\nMembantu penulisan draf bab metodologi dan tinjauan literatur untuk tiga laporan hibah penelitian nasional.",
      },
    ],
    skills:
      "Riset & Kebijakan: Analisis Kuantitatif (Stata, R), Desain Survei Lapangan, Wawancara Mendalam, Penyusunan Policy Brief\nKepemimpinan & Advokasi: Fasilitasi Forum Daerah, Manajemen Proyek Hibah Sosial, Penulisan Ilmiah Bahasa Inggris",
    certifications:
      "Evaluating Social Programs · J-PAL Executive Course, 2024\nIELTS Academic Band 7.5 (Writing 7.5) · British Council, 2025",
    achievements:
      "Penulis Policy Brief Terbaik Forum Kebijakan Daerah · 2024\nPenerima Hibah Pengabdian Masyarakat Berdampak · 2023",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Akademik Profesional (IELTS 7.5)",
  },

  academic: {
    ...EMPTY_CV,
    template: "academic",
    name: "Sri Theodore",
    headline: "Asisten Riset & Perencanaan Kota Berkelanjutan",
    city: "Surabaya",
    email: "sri.theodore@example.com",
    phone: "+62 812 8890 4412",
    link: "scholar.example.com/sritheodore",
    profile:
      "Peneliti muda bidang perencanaan wilayah dan mobilitas perkotaan inklusif. Berpengalaman menyusun protokol observasi lapangan, mengolah basis data geospasial (QGIS/PostGIS), serta mempublikasikan temuan empiris mengenai konektivitas jalur pejalan kaki menuju transportasi umum.",
    education: [
      {
        title: "S1 Perencanaan Wilayah dan Kota",
        organization: "Institut Teknologi Sepuluh Nopember Nusantara, Surabaya",
        period: "2020 – 2024",
        details:
          "IPK 3,84/4,00 (Cum Laude). Tugas akhir memetakan indeks keterjangkauan pejalan kaki ke koridor bus kota di 14 kelurahan.\nMerancang instrumen audit kualitas trotoar dan mengintegrasikan data lapangan ke peta jaringan jalan berbasis QGIS.",
      },
    ],
    publications:
      "Theodore, S. (2025). Protokol Pengukuran Aksesibilitas Halte Transit Ramah Disabilitas. Seri Metode Kota Reka, 4(1), 12-28.\nTheodore, S., & Tim Peta Laju (2024). Membaca Konektivitas Rute Pejalan Kaki pada Koridor Padat. Prosiding Forum Kota Indonesia.",
    projects: [
      {
        title: "Pemetaan Akses Fasilitas Publik Berbasis GIS",
        organization: "Kelompok Riset Mobilitas Kota Laju",
        period: "2024 – 2025",
        details:
          "Mengembangkan panduan digitalisasi titik koordinat lapangan serta menstandarkan 240 catatan observasi untuk analisis isokron.\nMenerbitkan atlas analisis aksesibilitas beserta ringkasan rekomendasi desain ruang publik bagi dinas perhubungan.",
      },
    ],
    experience: [
      {
        title: "Asisten Pengantar Sistem Informasi Geografis (SIG)",
        organization: "Departemen Perencanaan Wilayah dan Kota, Surabaya",
        period: "Sep 2023 – Jun 2024",
        details:
          "Memandu empat sesi praktikum QGIS dan pemeriksaan topologi geometri untuk 28 mahasiswa tingkat sarjana.\nMenyusun buku kerja verifikasi kualitas data spasial yang diadopsi pada kurikulum semester berikutnya.",
      },
      {
        title: "Relawan Pemetaan Partisipatif Kampung",
        organization: "Forum Kota Inklusif Surabaya",
        period: "Feb – Agu 2023",
        details:
          "Memfasilitasi enam lokakarya pemetaan warga dan mengolah masukan aksesibilitas menjadi peta prioritas perbaikan jalur aman sekolah.",
      },
    ],
    skills:
      "Analisis Spasial & Riset: QGIS, PostGIS Dasar, Metode Survei Lapangan, Analisis Statistik Deskriptif, Penulisan Akademik\nPublikasi & Bahasa: Manajemen Sitasi Zotero, Penyusunan Manuskrip Jurnal, Presentasi Ilmiah",
    certifications:
      "Spatial Data Science & Urban Analytics · Akademi Meridian, 2025\nAcademic Writing for International Journals · 2024",
    achievements:
      "Presentasi Makalah Terpilih · Simposium Perencanaan Kota Nasional, 2025",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Akademik Profesional",
  },

  editorial: {
    ...EMPTY_CV,
    template: "editorial",
    name: "Wisanggeni Niskala",
    headline: "Managing Editor & Penulis Feature Kebijakan",
    city: "Surakarta",
    email: "wisanggeni.niskala@example.com",
    phone: "+62 813 4421 9087",
    link: "wisanggeni.example.com",
    profile:
      "Editor dan jurnalis analitis yang mengembangkan liputan mendalam mengenai kota, birokrasi, ekonomi daerah, dan transformasi layanan publik. Terbiasa mengawal standar verifikasi fakta, membimbing delapan penulis kontributor, serta menyunting naskah berbasis data agar jernih dibaca publik luas.",
    experience: [
      {
        title: "Managing Editor Rubrik Kota & Kebijakan",
        organization: "Redaksi Sela Kota, Surakarta",
        period: "2023 – Sekarang",
        details:
          "Mengelola alur redaksi mingguan dari rapat usulan liputan hingga publikasi dan menyunting 50+ naskah panjang per tahun.\nMenyusun protokol verifikasi kutipan, data statistik BPS, dan pemeriksaan keberimbangan narasumber bagi delapan kontributor.\nMemimpin seri liputan investigasi akses air bersih serta transportasi antarkota bersama tim periset data.",
      },
      {
        title: "Penulis Staf",
        organization: "Jurnal Lintas Nusantara, Yogyakarta",
        period: "2020 – 2023",
        details:
          "Menulis 36 laporan mendalam berdasarkan wawancara dan observasi lapangan di enam kota di Jawa dan Sumatra.\nMengembangkan edisi khusus tahunan tentang dinamika pekerja muda dan industri kreatif daerah.",
      },
      {
        title: "Asisten Redaksi & Pemeriksa Fakta",
        organization: "Ruang Bacaan Pagi, Surakarta",
        period: "2018 – 2020",
        details:
          "Memeriksa akurasi kutipan, menata arsip referensi riset, serta menyusun pedoman gaya bahasa redaksi.",
      },
    ],
    education: [
      {
        title: "S1 Sastra Indonesia & Kajian Budaya",
        organization: "Universitas Sebelas Maret Nusantara, Surakarta",
        period: "2014 – 2018",
        details:
          "IPK 3,79/4,00. Tugas akhir menganalisis struktur naratif dan penggunaan data empiris dalam jurnalisme sastra Indonesia.",
      },
    ],
    publications:
      "Membaca Wajah Kota dari Halte Terakhir · Edisi Khusus Sela Kota, 2025\nRuang Publik Setelah Pukul Lima Sore · Redaksi Sela Kota, 2024\nPeta Kerja Generasi Baru Daerah · Jurnal Lintas Nusantara, 2022",
    skills:
      "Redaksi & Editorial: Penyuntingan Substantif, Verifikasi Fakta Data Publik, Wawancara Mendalam, Perencanaan Liputan\nKomunikasi Digital: Manajemen CMS Editorial, Analisis Retensi Pembaca, Penyusunan Pedoman Gaya Penulisan",
    certifications:
      "Verifikasi Sumber Digital & Jurnalisme Data · Aliansi Jurnalis Tera, 2024",
    achievements:
      "Penghargaan Liputan Layanan Publik Terbaik · Forum Media Independen, 2024",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional",
  },

  modern: {
    ...EMPTY_CV,
    template: "modern",
    name: "Wisanggeni Niskala",
    headline: "Senior Product Designer · Design Systems",
    city: "Yogyakarta",
    email: "wisanggeni.niskala@example.com",
    phone: "+62 813 4421 9087",
    link: "wisanggeni.design",
    profile:
      "Desainer produk yang berfokus pada alur layanan mandiri, arsitektur informasi seluler, dan sistem desain lintas platform. Terbiasa menggabungkan riset kegunaan kualitatif dengan analisis data konversi untuk memprioritaskan penyederhanaan antarmuka.",
    experience: [
      {
        title: "Senior Product Designer",
        organization: "PT Teras Bentuk Digital, Yogyakarta",
        period: "Mei 2023 – Sekarang",
        details:
          "Merancang ulang alur pengajuan akun dari tujuh langkah menjadi empat langkah setelah mengamati 12 sesi uji kegunaan sehingga tingkat selesai naik 26%.\nMembangun pustaka komponen terstandar lengkap dengan spesifikasi keadaan kosong, galat, dan pemuatan bagi tiga produk inti.\nMenyelaraskan token warna aksesibel (WCAG AA) antara Figma dan implementasi kode bersama tim frontend.",
      },
      {
        title: "Product Designer",
        organization: "Kolektif Reka Laman, Bandung",
        period: "Agu 2021 – Apr 2023",
        details:
          "Menyiapkan prototipe interaktif seluler untuk pengujian konsep dan mempercepat serah terima spesifikasi desain ke tim pengembang.\nMemetakan perjalanan pengguna untuk menemukan titik putus dari halaman pencarian hingga konfirmasi pembayaran.",
      },
      {
        title: "UX Research & Design Intern",
        organization: "Studio Rancang Hilir, Yogyakarta",
        period: "Feb – Jul 2021",
        details:
          "Merangkum 14 wawancara pengguna menjadi peta kebutuhan prioritas dan menyusun panduan pertanyaan riset validasi konsep.",
      },
    ],
    education: [
      {
        title: "S1 Desain Komunikasi Visual",
        organization: "Institut Seni Indonesia Nusantara, Yogyakarta",
        period: "2017 – 2021",
        details:
          "IPK 3,82/4,00. Tugas akhir meneliti pola pemindaian visual pengguna saat membandingkan paket layanan pada layar ponsel.",
      },
      {
        title: "Sertifikasi Desain Interaksi & Aksesibilitas",
        organization: "Akademi Tata Rupa Digital",
        period: "2022",
        details:
          "Evaluasi heuristik antarmuka, audit kontras WCAG 2.2, dan pengujian keterbacaan pada layar berukuran sempit.",
      },
    ],
    projects: [
      {
        title: "Rancang Ulang Antarmuka Pemesanan Jadwal Seleksi",
        organization: "Studi Kasus Terpublikasi",
        period: "2024",
        details:
          "Menguji dua pola navigasi jadwal pada 18 responden dan memangkas waktu pencarian agenda hingga 40%.",
      },
    ],
    skills:
      "Riset Pengguna & Uji Kegunaan\nArsitektur Informasi & Wireframing\nFigma Auto-Layout & Token Sistem Desain\nAudit Aksesibilitas WCAG AA\nPrototipe Interaktif & Micro-interaction",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional",
    certifications:
      "Audit Aksesibilitas Antarmuka · Akademi Tata Rupa, 2025\nFoundations of UX Design · 2023",
    interests: "Tipografi editorial, layanan publik digital, dan desain antarmuka ramah aksesibilitas.",
  },

  creative: {
    ...EMPTY_CV,
    template: "creative",
    name: "Sri Theodore",
    headline: "Creative Producer & Visual Brand Strategist",
    city: "Bandung",
    email: "sri.theodore@example.com",
    phone: "+62 812 8890 4412",
    link: "sritheodore.studio",
    profile:
      "Produser kreatif dan perancang kampanye visual yang memproduksi serial video pendek, identitas kampanye musiman, serta narasi merek untuk perusahaan rintisan dan usaha lokal. Terbiasa memimpin proses dari perumusan naskah, pengarahan visual, hingga evaluasi kinerja retensi audiens.",
    experience: [
      {
        title: "Creative Producer & Lead Strategist",
        organization: "Kolektif Pagi Layar, Bandung",
        period: "2023 – Sekarang",
        details:
          "Memproduksi 28 kampanye video pendek untuk empat merek konsumen nasional mulai dari konsep naskah hingga finalisasi multi-kanal.\nMenguji variasi tiga detik pembuka video dan meningkatkan rata-rata retensi tonton dari 33% menjadi 48% pada seri unggulan.\nMenyusun ringkasan analisis performa kreatif bulanan sebagai acuan arah produksi klien.",
      },
      {
        title: "Visual Designer",
        organization: "Studio Rona Gerak, Jakarta",
        period: "2021 – 2023",
        details:
          "Merancang sistem templat kampanye modular agar tim pemasaran internal klien dapat memproduksi aset turunan secara mandiri.\nMengkoordinasikan jadwal pemotretan produk bersama fotografer dan pengarah gaya untuk tiga lini peluncuran produk.",
      },
    ],
    education: [
      {
        title: "S1 Desain & Produksi Media",
        organization: "Institut Teknologi Harapan Nusantara, Bandung",
        period: "2017 – 2021",
        details:
          "IPK 3,77/4,00. Proyek akhir berupa serial dokumenter pendek mengenai regenerasi pelaku kriya lokal.",
      },
      {
        title: "Program Penulisan Naskah & Narasi Visual",
        organization: "Akademi Adegan, Jakarta",
        period: "2022",
        details:
          "Lokakarya intensif struktur penceritaan 60 detik, pencahayaan studio ringkas, dan tata warna digital.",
      },
    ],
    projects: [
      {
        title: "Serial Dokumenter Pendek Cerita dari Pasar",
        organization: "Proyek Kreatif Independen",
        period: "2024",
        details:
          "Memproduksi lima episode profil pengrajin pangan serta mencatat 420.000 penayangan organik dengan rasio simpan 9,4%.",
      },
      {
        title: "Paket Identitas Peluncuran Katalog Musiman",
        organization: "Rona Gerak x Pagi Layar",
        period: "2025",
        details:
          "Merancang 12 variasi materi iklan sosial dan panduan estetika untuk tim internal klien.",
      },
    ],
    skills:
      "Premiere Pro\nAfter Effects\nIllustrator\nFigma\nFotografi Produk\nPenulisan Naskah\nAnalisis Retensi Konten\nPengarahan Seni",
    certifications:
      "Commercial Video Storytelling · Akademi Adegan, 2024",
    achievements:
      "Karya Pilihan Juri · Festival Konten Kreatif Bandung, 2025",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional",
    interests: "Dokumenter pendek · Fotografi jalanan · Tipografi editorial",
  },

  portfolio: {
    ...EMPTY_CV,
    template: "portfolio",
    name: "Sri Theodore",
    headline: "Brand Identity & Packaging System Designer",
    city: "Bandung",
    email: "sri.theodore@example.com",
    phone: "+62 812 8890 4412",
    link: "sritheodore.studio",
    profile:
      "Desainer identitas merek dan sistem kemasan yang menjembatani riset konsumen, tipografi terukur, dan kesiapan produksi cetak. Terbiasa mendampingi tim merek mulai dari wawancara pembeli, perumusan sistem visual multi-varian, hingga pendampingan uji warna di percetakan.",
    projects: [
      {
        title: "Identitas & Sistem Kemasan 4 Varian Seri Panen",
        organization: "Kebun Pucuk Reka, Bandung",
        period: "2025",
        details:
          "Mewawancarai 22 pembeli ritel untuk menentukan pembedaan warna dan ikon yang langsung terbaca dari jarak dua meter pada rak toko.\nMenguji dua substrat bahan label bersama mitra percetakan serta menyerahkan berkas siap produksi tanpa revisi pracetak.",
      },
      {
        title: "Sistem Visual & Papan Arah Pekan Karya Nasional",
        organization: "Forum Rupa Warga, Jakarta",
        period: "2024",
        details:
          "Merancang sistem penanda lokasi pameran, buku program 48 halaman, serta templat aset media sosial yang dipakai 16 anggota panitia.\nMenjaga konsistensi jarak tipografi dan grid di lebih dari 80 materi publikasi.",
      },
      {
        title: "Katalog Koleksi & Panduan Tekstil Ruang Tenun",
        organization: "Kolektif Corak Loka, Surakarta",
        period: "2023",
        details:
          "Mengarahkan sesi foto studio untuk 32 produk kriya dan menyusun indeks bahan perawatan agar pembeli mudah membandingkan spesifikasi.",
      },
    ],
    experience: [
      {
        title: "Brand Identity Designer",
        organization: "Studio Rona Petak, Bandung",
        period: "2022 – Sekarang",
        details:
          "Memimpin eksekusi 14 proyek identitas merek konsumen dari tahap riset posisi merek hingga penyusunan buku panduan pemakaian aset.",
      },
      {
        title: "Junior Brand Designer",
        organization: "Ruang Bentuk Riset",
        period: "2020 – 2022",
        details:
          "Mengaudit konsistensi aset merek klien, menyusun mockup kemasan 3D, dan memverifikasi pemisahan warna CMYK/Pantone sebelum produksi.",
      },
    ],
    education: [
      {
        title: "S1 Desain Komunikasi Visual",
        organization: "Institut Seni & Desain Meranti, Bandung",
        period: "2016 – 2020",
        details:
          "IPK 3,80/4,00. Tugas akhir merancang sistem penanda aksesibel untuk kawasan ruang publik terpadu.",
      },
    ],
    skills:
      "Identitas Merek & Panduan Visual\nDesain Kemasan & Pracetak CMYK\nTipografi & Grid Editorial\nAdobe Illustrator & InDesign\nFigma & Mockup Presentasi\nPengarahan Sesi Foto Produk",
    certifications:
      "Industrial Packaging Pre-Press · Kelas Garis Rupa, 2023\nColor Calibration & Print Production · 2022",
    languages: "Bahasa Indonesia · Fasih\nBahasa Inggris · Profesional",
  },
};
