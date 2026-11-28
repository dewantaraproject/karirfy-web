import type {
  AssessmentCategory,
  AssessmentCategoryKey,
  ExerciseDomain,
  ExerciseDomainKey,
  PrototypeCardVariant,
} from "../types";

export const CARD_VARIANTS: PrototypeCardVariant[] = [
  "c-red",
  "c-navy",
  "c-pearl",
  "c-milk",
  "sf",
];

export function getCardVariant(index: number): PrototypeCardVariant {
  return CARD_VARIANTS[index % CARD_VARIANTS.length];
}

const EXERCISE_DOMAIN_VARIANT: Record<ExerciseDomainKey, PrototypeCardVariant> = {
  Civic_Knowledge: "c-red",
  Cognitive_Aptitude: "c-navy",
  LPDP_Scholastic: "c-navy",
  Banking_Monetary: "c-navy",
  English_Proficiency: "c-milk",
  Business_Economics: "c-milk",
  Psychometric: "c-pearl",
  General_Knowledge: "c-pearl",
};

const ASSESSMENT_CATEGORY_VARIANT: Record<AssessmentCategoryKey, PrototypeCardVariant> = {
  Government_BUMN: "c-red",
  Premium_Comprehensive: "c-red",
  LPDP_Scholastic: "c-navy",
  Bank_Indonesia: "c-navy",
  Cognitive_Screening: "c-navy",
  Comprehensive_Aptitude: "c-navy",
  English_Proficiency: "c-milk",
  Domain_Expertise: "c-milk",
  Applied_Reasoning: "c-milk",
  Psychometric_Behavioral: "c-pearl",
};

/**
 * Returns a deterministic semantic glass variant per domain/category.
 * Alternates odd cards with neutral frosted `.sf` when stacked in the same domain
 * so consecutive cards keep depth contrast while preserving domain color grammar.
 */
export function getExerciseDomainVariant(
  domainKey: ExerciseDomainKey,
  stackIndex = 0,
): PrototypeCardVariant {
  const base = EXERCISE_DOMAIN_VARIANT[domainKey] ?? "c-navy";
  return stackIndex % 2 === 1 ? "sf" : base;
}

export function getAssessmentCategoryVariant(
  categoryKey: AssessmentCategoryKey,
  stackIndex = 0,
): PrototypeCardVariant {
  const base = ASSESSMENT_CATEGORY_VARIANT[categoryKey] ?? "c-red";
  return stackIndex % 2 === 1 ? "sf" : base;
}

export const EXERCISE_DOMAINS: ExerciseDomain[] = [
  {
    key: "LPDP_Scholastic",
    label: "TBS LPDP",
    shortLabel: "TBS LPDP",
    topics: [
      {
        type: "TBS Penalaran Verbal",
        title: "TBS Penalaran Verbal",
        desc: "Analogi akademik, logika analitis, dan critical reasoning wacana.",
        level: "Menengah",
        defaultQuestions: 23,
        defaultMinutes: 30,
      },
      {
        type: "TBS Penalaran Kuantitatif",
        title: "TBS Penalaran Kuantitatif",
        desc: "Kecukupan data (Data Sufficiency), P vs Q, aljabar, dan deret LPDP.",
        level: "Lanjut",
        defaultQuestions: 25,
        defaultMinutes: 40,
      },
      {
        type: "TBS Pemecahan Masalah",
        title: "TBS Pemecahan Masalah",
        desc: "Analisis kasus multidimensi berbasis grafik, tabel, dan data kuantitatif.",
        level: "Lanjut",
        defaultQuestions: 12,
        defaultMinutes: 20,
      },
    ],
  },
  {
    key: "Cognitive_Aptitude",
    label: "Cognitive Aptitude",
    shortLabel: "Kognitif",
    topics: [
      {
        type: "Verbal Reasoning",
        title: "Verbal Reasoning",
        desc: "Analisis verbal, analogi, dan pemahaman wacana.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Quantitative Reasoning",
        title: "Quantitative Reasoning",
        desc: "Kemampuan numerik, aritmatika, dan deret angka.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Logical Reasoning",
        title: "Logical Reasoning",
        desc: "Silogisme, penalaran induktif, dan penalaran analitis.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Abstract Reasoning",
        title: "Abstract Reasoning",
        desc: "Serial figural, analogi gambar, dan penalaran matriks.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Numerical Matrix",
        title: "Numerical Matrix",
        desc: "Matriks angka dan pola numerik kompleks.",
        level: "Lanjut",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Aljabar",
        title: "Aljabar",
        desc: "Persamaan, substitusi, dan sistem persamaan dengan simbol visual.",
        level: "Menengah",
        defaultQuestions: 12,
        defaultMinutes: 15,
      },
      {
        type: "Analisis Visual",
        title: "Analisis Visual",
        desc: "Cari slot jadwal, urutkan petunjuk, dan tarik kesimpulan dari grafik atau tabel.",
        level: "Menengah",
        defaultQuestions: 12,
        defaultMinutes: 15,
      },
    ],
  },
  {
    key: "Civic_Knowledge",
    label: "Civic Knowledge",
    shortLabel: "Kebangsaan",
    topics: [
      {
        type: "National Foundation",
        title: "National Foundation",
        desc: "Pancasila, UUD NRI 1945, dan pilar kebangsaan.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Government & Public Administration",
        title: "Government & Public Admin",
        desc: "Sistem pemerintahan dan tata kelola administrasi publik.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Indonesian History",
        title: "Indonesian History",
        desc: "Sejarah pergerakan nasional dan ketatanegaraan Indonesia.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Bahasa Indonesia",
        title: "TWK Bahasa Indonesia",
        desc: "Kebahasaan EYD, kalimat efektif, evaluasi, dan refleksi informasi teks kebangsaan.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
    ],
  },
  {
    key: "Psychometric",
    label: "Psychometric",
    shortLabel: "Psikometri",
    topics: [
      {
        type: "Situational Judgement",
        title: "Situational Judgement",
        desc: "Penilaian pengambilan keputusan dalam situasi kerja (SJT).",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Work Personality",
        title: "Work Personality",
        desc: "Profil kepribadian kerja dan orientasi pelayanan publik.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Attention to Detail",
        title: "Attention to Detail",
        desc: "Ketelitian simbol, angka, dan akurasi verifikasi data.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 10,
      },
      {
        type: "Behavioral Competencies",
        title: "Behavioral Competencies",
        desc: "Kompetensi perilaku profesional dan nilai inti organisasi.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
    ],
  },
  {
    key: "English_Proficiency",
    label: "English Proficiency",
    shortLabel: "Bahasa Inggris",
    topics: [
      {
        type: "Grammar & Structure",
        title: "Grammar & Structure",
        desc: "Tata bahasa Inggris dan struktur kalimat baku.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Vocabulary & Usage",
        title: "Vocabulary & Usage",
        desc: "Penguasaan kosakata akademik dan konteks penggunaannya.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 10,
      },
      {
        type: "Reading Comprehension",
        title: "Reading Comprehension",
        desc: "Pemahaman teks bacaan analitis berbahasa Inggris.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Writing & Expression",
        title: "Writing & Expression",
        desc: "Ekspresi tertulis, koherensi, dan komposisi kalimat.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Business English",
        title: "Business English",
        desc: "Bahasa Inggris dalam konteks komunikasi bisnis profesional.",
        level: "Lanjut",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
    ],
  },
  {
    key: "Banking_Monetary",
    label: "Banking & Monetary",
    shortLabel: "Kebanksentralan",
    topics: [
      {
        type: "BI Essential",
        title: "BI Essential",
        desc: "Pengetahuan esensial kebanksentralan dan mandat BI.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "BI Institutional Framework",
        title: "BI Institutional Framework",
        desc: "Kelembagaan, tata kelola, dan peran Bank Indonesia.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Monetary Policy",
        title: "Monetary Policy",
        desc: "Kebijakan moneter, inflasi, dan stabilitas nilai Rupiah.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Macroprudential Policy",
        title: "Macroprudential Policy",
        desc: "Stabilitas sistem keuangan dan intermediasi makroprudensial.",
        level: "Lanjut",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Payment Systems",
        title: "Payment Systems",
        desc: "Sistem pembayaran nasional, BI-FAST, QRIS, dan digitalisasi.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "BI Strategic Role",
        title: "BI Strategic Role",
        desc: "Peran strategis bank sentral dalam transformasi ekonomi.",
        level: "Lanjut",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
    ],
  },
  {
    key: "Business_Economics",
    label: "Business & Economics",
    shortLabel: "Ekonomi Bisnis",
    topics: [
      {
        type: "Fundamental Economics",
        title: "Fundamental Economics",
        desc: "Prinsip dasar ekonomi mikro dan ekonomi makro.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Accounting Principles",
        title: "Accounting Principles",
        desc: "Prinsip dasar akuntansi dan analisis pelaporan keuangan.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Corporate Governance",
        title: "Corporate Governance",
        desc: "Tata kelola perusahaan yang baik (GCG) dan etika bisnis.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Business Law",
        title: "Business Law",
        desc: "Hukum bisnis, perikatan, dan regulasi korporasi.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Contemporary Issues",
        title: "Contemporary Issues",
        desc: "Isu ekonomi, fiskal, dan dinamika bisnis terkini.",
        level: "Lanjut",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
    ],
  },
  {
    key: "General_Knowledge",
    label: "General Knowledge",
    shortLabel: "Wawasan Umum",
    topics: [
      {
        type: "Indonesian History",
        title: "Indonesian History",
        desc: "Sejarah, warisan budaya, dan dinamika bangsa Indonesia.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "World Geography & Events",
        title: "World Geography & Events",
        desc: "Geografi dunia, geopolitik, dan peristiwa internasional.",
        level: "Dasar",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Science & Technology Basics",
        title: "Science & Tech Basics",
        desc: "Dasar sains terapan dan perkembangan teknologi modern.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 12,
      },
      {
        type: "Problem Solving",
        title: "Problem Solving",
        desc: "Pemecahan masalah terstruktur dan pengambilan keputusan.",
        level: "Menengah",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
      {
        type: "Case Reasoning",
        title: "Case Reasoning",
        desc: "Analisis kasus manajerial dan penalaran kontekstual.",
        level: "Lanjut",
        defaultQuestions: 15,
        defaultMinutes: 15,
      },
    ],
  },
];

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    key: "LPDP_Scholastic",
    label: "Tes Bakat Skolastik LPDP",
    shortLabel: "TBS LPDP",
    description: "Simulasi resmi TBS Beasiswa LPDP (60 soal · 90 menit · skala 0–300).",
    batteries: [
      {
        type: "Simulasi Resmi TBS LPDP",
        title: "Simulasi Resmi TBS LPDP",
        desc: "Simulasi lengkap TBS LPDP mencakup Verbal (23), Kuantitatif (25), dan Pemecahan Masalah (12).",
        defaultQuestions: 60,
        defaultMinutes: 90,
        passingScore: 55,
        exerciseCategories: [
          "TBS Penalaran Verbal",
          "TBS Penalaran Kuantitatif",
          "TBS Pemecahan Masalah",
        ],
        categoryQuotas: {
          "TBS Penalaran Verbal": 23,
          "TBS Penalaran Kuantitatif": 25,
          "TBS Pemecahan Masalah": 12,
        },
      },
      {
        type: "TBS LPDP - Penalaran Verbal",
        title: "TBS Penalaran Verbal",
        desc: "Simulasi khusus subtes Penalaran Verbal LPDP (23 soal · 30 menit).",
        defaultQuestions: 23,
        defaultMinutes: 30,
        passingScore: 60,
        exerciseCategories: ["TBS Penalaran Verbal"],
      },
      {
        type: "TBS LPDP - Penalaran Kuantitatif",
        title: "TBS Penalaran Kuantitatif",
        desc: "Simulasi khusus Data Sufficiency, P vs Q, dan kuantitatif LPDP (25 soal · 40 menit).",
        defaultQuestions: 25,
        defaultMinutes: 40,
        passingScore: 60,
        exerciseCategories: ["TBS Penalaran Kuantitatif"],
      },
      {
        type: "TBS LPDP - Pemecahan Masalah",
        title: "TBS Pemecahan Masalah",
        desc: "Simulasi khusus studi kasus & analisis grafik TBS LPDP (12 soal · 20 menit).",
        defaultQuestions: 12,
        defaultMinutes: 20,
        passingScore: 60,
        exerciseCategories: ["TBS Pemecahan Masalah"],
      },
    ],
  },
  {
    key: "Government_BUMN",
    label: "Govt & BUMN",
    shortLabel: "CPNS & BUMN",
    description: "Simulasi standar CAT BKN (TWK, TIU, TKP) dan seleksi BUMN.",
    batteries: [
      {
        type: "Seleksi Kompetensi Dasar (SKD)",
        title: "SKD CPNS Simulation",
        desc: "Simulasi lengkap SKD CPNS mencakup TWK, Bahasa Indonesia, TIU, dan TKP.",
        defaultQuestions: 50,
        defaultMinutes: 45,
        passingScore: 70,
        exerciseCategories: [
          "National Foundation",
          "Government & Public Administration",
          "Indonesian History",
          "Bahasa Indonesia",
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Abstract Reasoning",
          "Work Personality",
        ],
      },
      {
        type: "SKD CPNS Resmi (110 Soal)",
        title: "SKD CPNS Resmi 110 Soal",
        desc: "Simulasi standar CAT BKN 2026: 30 TWK (termasuk Bahasa Indonesia) + 35 TIU + 45 TKP dalam 100 menit.",
        defaultQuestions: 110,
        defaultMinutes: 100,
        passingScore: 68,
        exerciseCategories: [
          "National Foundation",
          "Government & Public Administration",
          "Indonesian History",
          "Bahasa Indonesia",
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Abstract Reasoning",
          "Work Personality",
          "Behavioral Competencies",
          "Situational Judgement",
        ],
        categoryQuotas: {
          "National Foundation": 8,
          "Government & Public Administration": 8,
          "Indonesian History": 7,
          "Bahasa Indonesia": 7,
          "Verbal Reasoning": 10,
          "Quantitative Reasoning": 10,
          "Logical Reasoning": 8,
          "Abstract Reasoning": 7,
          "Work Personality": 15,
          "Behavioral Competencies": 15,
          "Situational Judgement": 15,
        },
      },
      {
        type: "BUMN Comprehensive Selection",
        title: "BUMN Comprehensive Test",
        desc: "Tes seleksi terpadu TKD BUMN, Core Values, dan ketelitian.",
        defaultQuestions: 45,
        defaultMinutes: 40,
        passingScore: 72,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "National Foundation",
          "Work Personality",
          "Attention to Detail",
        ],
      },
      {
        type: "Tes Wawasan Kebangsaan (TWK)",
        title: "TWK Deep Dive",
        desc: "Pendalaman materi pilar kebangsaan, UUD 1945, sejarah, dan Bahasa Indonesia.",
        defaultQuestions: 30,
        defaultMinutes: 25,
        passingScore: 65,
        exerciseCategories: [
          "National Foundation",
          "Government & Public Administration",
          "Indonesian History",
          "Bahasa Indonesia",
        ],
        categoryQuotas: {
          "National Foundation": 8,
          "Government & Public Administration": 8,
          "Indonesian History": 7,
          "Bahasa Indonesia": 7,
        },
      },
      {
        type: "Tes Intelegensia Umum (TIU)",
        title: "TIU Mastery Test",
        desc: "Penguasaan kemampuan verbal, numerik, logika, dan figural.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        passingScore: 70,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Abstract Reasoning",
          "Numerical Matrix",
        ],
      },
      {
        type: "Tes Karakteristik Pribadi (TKP)",
        title: "TKP Personality Profiling",
        desc: "Evaluasi pelayanan publik, jejaring kerja, dan profesionalisme.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        passingScore: 75,
        exerciseCategories: [
          "Work Personality",
          "Behavioral Competencies",
          "Situational Judgement",
        ],
      },
    ],
  },
  {
    key: "Bank_Indonesia",
    label: "PCPM Bank Indonesia",
    shortLabel: "PCPM BI",
    description: "Simulasi khusus seleksi PCPM Bank Indonesia.",
    batteries: [
      {
        type: "PCPM - Tes Potensi Dasar",
        title: "PCPM Tes Potensi Dasar",
        desc: "Simulasi TPD mencakup verbal, kuantitatif, dan penalaran logika.",
        defaultQuestions: 60,
        defaultMinutes: 50,
        passingScore: 75,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Abstract Reasoning",
        ],
      },
      {
        type: "PCPM - Kebanksentralan",
        title: "PCPM Kebanksentralan",
        desc: "Uji wawasan kebanksentralan, moneter, dan stabilitas keuangan.",
        defaultQuestions: 40,
        defaultMinutes: 40,
        passingScore: 72,
        exerciseCategories: [
          "BI Essential",
          "BI Institutional Framework",
          "Monetary Policy",
          "Macroprudential Policy",
          "Payment Systems",
          "Fundamental Economics",
        ],
      },
      {
        type: "PCPM - Bahasa Inggris",
        title: "PCPM Bahasa Inggris",
        desc: "Uji kemampuan bahasa Inggris setara standar rekrutmen BI.",
        defaultQuestions: 50,
        defaultMinutes: 45,
        passingScore: 75,
        exerciseCategories: [
          "Reading Comprehension",
          "Grammar & Structure",
          "Vocabulary & Usage",
        ],
      },
    ],
  },
  {
    key: "Cognitive_Screening",
    label: "Cognitive Screening",
    shortLabel: "Skrining",
    description: "Asesmen diagnostik cepat untuk memetakan baseline kognitif.",
    batteries: [
      {
        type: "Diagnostic Placement Test",
        title: "Diagnostic Placement Test",
        desc: "Tes penempatan awal untuk memetakan kekuatan kognitif.",
        defaultQuestions: 30,
        defaultMinutes: 25,
        passingScore: 70,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
        ],
      },
      {
        type: "Quick Aptitude Screen",
        title: "Quick Aptitude Screen",
        desc: "Skrining bakat cepat mencakup penalaran verbal dan kuantitatif.",
        defaultQuestions: 25,
        defaultMinutes: 20,
        passingScore: 70,
        exerciseCategories: ["Verbal Reasoning", "Quantitative Reasoning"],
      },
      {
        type: "Basic Competency Check",
        title: "Basic Competency Check",
        desc: "Cek kompetensi dasar pada aspek kuantitatif dan logika.",
        defaultQuestions: 25,
        defaultMinutes: 20,
        passingScore: 70,
        exerciseCategories: ["Quantitative Reasoning", "Logical Reasoning"],
      },
      {
        type: "Adaptive Diagnostic",
        title: "Adaptive Diagnostic",
        desc: "Diagnostik adaptif menyeluruh untuk tiga pilar penalaran.",
        defaultQuestions: 30,
        defaultMinutes: 25,
        passingScore: 72,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
        ],
      },
    ],
  },
  {
    key: "Comprehensive_Aptitude",
    label: "Comprehensive Aptitude",
    shortLabel: "Aptitude",
    description: "Baterai tes bakat kognitif dan penalaran tingkat lanjut.",
    batteries: [
      {
        type: "Cognitive Aptitude Battery",
        title: "Cognitive Aptitude Battery",
        desc: "Baterai tes kognitif lengkap lintas 5 domain penalaran.",
        defaultQuestions: 45,
        defaultMinutes: 40,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Abstract Reasoning",
          "Numerical Matrix",
        ],
      },
      {
        type: "Professional Aptitude Test",
        title: "Professional Aptitude Test",
        desc: "Tes bakat profesional dipadukan dengan SJT.",
        defaultQuestions: 40,
        defaultMinutes: 35,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Situational Judgement",
        ],
      },
      {
        type: "Graduate Aptitude Test",
        title: "Graduate Aptitude Test",
        desc: "Tes bakat standar lulusan sarjana dan program ODP/MT.",
        defaultQuestions: 40,
        defaultMinutes: 35,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Abstract Reasoning",
        ],
      },
      {
        type: "Executive Reasoning Assessment",
        title: "Executive Reasoning Assessment",
        desc: "Penilaian penalaran analitis dan pemecahan masalah eksekutif.",
        defaultQuestions: 40,
        defaultMinutes: 35,
        exerciseCategories: [
          "Logical Reasoning",
          "Problem Solving",
          "Case Reasoning",
          "Situational Judgement",
        ],
      },
      {
        type: "Advanced Cognitive Test",
        title: "Advanced Cognitive Test",
        desc: "Tes kognitif tingkat lanjut termasuk matriks numerik.",
        defaultQuestions: 45,
        defaultMinutes: 40,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Numerical Matrix",
          "Problem Solving",
        ],
      },
    ],
  },
  {
    key: "English_Proficiency",
    label: "English Proficiency",
    shortLabel: "English",
    description: "Evaluasi struktur, kosakata, dan pemahaman bacaan bahasa Inggris.",
    batteries: [
      {
        type: "Business English Test",
        title: "Business English Test",
        desc: "Tes bahasa Inggris profesional dan korespondensi bisnis.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        exerciseCategories: [
          "Business English",
          "Writing & Expression",
          "Reading Comprehension",
        ],
      },
      {
        type: "Academic English Assessment",
        title: "Academic English Assessment",
        desc: "Penilaian bahasa Inggris akademik dan struktur wacana.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        exerciseCategories: [
          "Reading Comprehension",
          "Grammar & Structure",
          "Writing & Expression",
        ],
      },
      {
        type: "Professional Communication Test",
        title: "Professional Comm Test",
        desc: "Komunikasi profesional bahasa Inggris di dunia kerja.",
        defaultQuestions: 30,
        defaultMinutes: 25,
        exerciseCategories: [
          "Writing & Expression",
          "Vocabulary & Usage",
          "Business English",
        ],
      },
      {
        type: "TOEFL-Style Practice",
        title: "TOEFL-Style Practice",
        desc: "Latihan komprehensif berformat tes TOEFL.",
        defaultQuestions: 45,
        defaultMinutes: 40,
        exerciseCategories: [
          "Reading Comprehension",
          "Grammar & Structure",
          "Writing & Expression",
          "Vocabulary & Usage",
        ],
      },
      {
        type: "IELTS-Style Practice",
        title: "IELTS-Style Practice",
        desc: "Latihan berformat IELTS Reading dan Academic Expression.",
        defaultQuestions: 40,
        defaultMinutes: 35,
        exerciseCategories: [
          "Reading Comprehension",
          "Writing & Expression",
          "Vocabulary & Usage",
        ],
      },
    ],
  },
  {
    key: "Domain_Expertise",
    label: "Domain Expertise",
    shortLabel: "Domain",
    description: "Asesmen spesialisasi bidang ekonomi, perbankan, dan publik.",
    batteries: [
      {
        type: "Business & Economics Comprehensive",
        title: "Business & Economics Comp",
        desc: "Komprehensif ilmu ekonomi, akuntansi, tata kelola, dan hukum bisnis.",
        defaultQuestions: 40,
        defaultMinutes: 35,
        exerciseCategories: [
          "Fundamental Economics",
          "Accounting Principles",
          "Corporate Governance",
          "Business Law",
          "Contemporary Issues",
        ],
      },
      {
        type: "Banking & Monetary Policy (PCPM BI)",
        title: "Banking & Monetary (PCPM)",
        desc: "Spesialisasi perbankan sentral dan kebijakan moneter.",
        defaultQuestions: 45,
        defaultMinutes: 40,
        exerciseCategories: [
          "BI Essential",
          "BI Institutional Framework",
          "Monetary Policy",
          "Macroprudential Policy",
          "Payment Systems",
          "BI Strategic Role",
          "Fundamental Economics",
        ],
      },
      {
        type: "Public Administration & Civic",
        title: "Public Admin & Civic",
        desc: "Administrasi pemerintahan, kenegaraan, dan studi kasus kebijakan.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        exerciseCategories: [
          "National Foundation",
          "Government & Public Administration",
          "Indonesian History",
          "Case Reasoning",
        ],
      },
      {
        type: "General Knowledge Mastery",
        title: "General Knowledge Mastery",
        desc: "Penguasaan pengetahuan umum nasional dan isu global.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        exerciseCategories: [
          "Indonesian History",
          "World Geography & Events",
          "Science & Technology Basics",
          "Contemporary Issues",
        ],
      },
      {
        type: "Integrated Domain Knowledge",
        title: "Integrated Domain Knowledge",
        desc: "Pengetahuan domain terintegrasi lintas ekonomi dan kebijakan publik.",
        defaultQuestions: 40,
        defaultMinutes: 35,
        exerciseCategories: [
          "Fundamental Economics",
          "BI Institutional Framework",
          "Government & Public Administration",
          "Indonesian History",
          "Reading Comprehension",
        ],
      },
    ],
  },
  {
    key: "Psychometric_Behavioral",
    label: "Psychometric & Behavioral",
    shortLabel: "Psikometri",
    description: "Asesmen kepribadian kerja, ketelitian, dan kepemimpinan.",
    batteries: [
      {
        type: "TKP - Professional Profile",
        title: "TKP Professional Profile",
        desc: "Profil karakteristik pribadi dan kompetensi perilaku kerja.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        exerciseCategories: ["Work Personality", "Behavioral Competencies"],
      },
      {
        type: "SJT - Workplace Scenarios",
        title: "SJT Workplace Scenarios",
        desc: "Penilaian situasi kerja dan dilema etika profesional.",
        defaultQuestions: 30,
        defaultMinutes: 25,
        exerciseCategories: ["Situational Judgement"],
      },
      {
        type: "Cognitive Processing Profile",
        title: "Cognitive Processing Profile",
        desc: "Ketelitian verifikasi dan pemrosesan pola abstrak.",
        defaultQuestions: 30,
        defaultMinutes: 25,
        exerciseCategories: ["Attention to Detail", "Abstract Reasoning"],
      },
      {
        type: "Comprehensive Psychometric Battery",
        title: "Comp. Psychometric Battery",
        desc: "Baterai psikometri lengkap mencakup kepribadian, SJT, dan detail.",
        defaultQuestions: 40,
        defaultMinutes: 35,
        exerciseCategories: [
          "Work Personality",
          "Situational Judgement",
          "Attention to Detail",
        ],
      },
      {
        type: "Leadership & Management Assessment",
        title: "Leadership Assessment",
        desc: "Penilaian kepemimpinan, kolaborasi tim, dan resolusi kasus.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        exerciseCategories: [
          "Situational Judgement",
          "Behavioral Competencies",
          "Case Reasoning",
        ],
      },
    ],
  },
  {
    key: "Applied_Reasoning",
    label: "Applied Reasoning",
    shortLabel: "Studi Kasus",
    description: "Penalaran terapan berbasis studi kasus dan kuantitatif bisnis.",
    batteries: [
      {
        type: "Business Case Analysis",
        title: "Business Case Analysis",
        desc: "Analisis kasus bisnis dan pengambilan keputusan berbasis data.",
        defaultQuestions: 35,
        defaultMinutes: 35,
        exerciseCategories: [
          "Case Reasoning",
          "Problem Solving",
          "Quantitative Reasoning",
        ],
      },
      {
        type: "Quantitative Business Mastery",
        title: "Quantitative Business Mastery",
        desc: "Penguasaan perhitungan kuantitatif untuk analisis bisnis.",
        defaultQuestions: 30,
        defaultMinutes: 30,
        exerciseCategories: ["Quantitative Reasoning"],
      },
      {
        type: "Strategic Problem Solving",
        title: "Strategic Problem Solving",
        desc: "Pemecahan masalah strategis dan penalaran logis terapan.",
        defaultQuestions: 35,
        defaultMinutes: 30,
        exerciseCategories: [
          "Problem Solving",
          "Logical Reasoning",
          "Case Reasoning",
        ],
      },
      {
        type: "Case-Based Reasoning Test",
        title: "Case-Based Reasoning",
        desc: "Tes penalaran berbasis kasus manajerial dan organisasi.",
        defaultQuestions: 30,
        defaultMinutes: 30,
        exerciseCategories: ["Case Reasoning"],
      },
      {
        type: "Integrated Business Reasoning",
        title: "Integrated Business Reasoning",
        desc: "Penalaran bisnis terintegrasi dengan bahasa Inggris profesional.",
        defaultQuestions: 40,
        defaultMinutes: 35,
        exerciseCategories: [
          "Quantitative Reasoning",
          "Case Reasoning",
          "Problem Solving",
          "Business English",
        ],
      },
    ],
  },
  {
    key: "Premium_Comprehensive",
    label: "Premium Comprehensive",
    shortLabel: "Master",
    description: "Baterai ujian spektrum penuh untuk kesiapan akhir.",
    batteries: [
      {
        type: "Full Spectrum Assessment (SKD+)",
        title: "Full Spectrum (SKD+)",
        desc: "Asesmen spektrum penuh SKD plus wawasan ekonomi dan bahasa.",
        defaultQuestions: 60,
        defaultMinutes: 55,
        exerciseCategories: [
          "National Foundation",
          "Government & Public Administration",
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Work Personality",
          "Fundamental Economics",
          "Reading Comprehension",
          "Indonesian History",
        ],
      },
      {
        type: "Executive Selection Battery",
        title: "Executive Selection Battery",
        desc: "Baterai seleksi eksekutif lintas penalaran, ekonomi, dan SJT.",
        defaultQuestions: 55,
        defaultMinutes: 50,
        exerciseCategories: [
          "Verbal Reasoning",
          "Logical Reasoning",
          "Fundamental Economics",
          "Contemporary Issues",
          "Case Reasoning",
          "Work Personality",
          "Situational Judgement",
          "Business English",
        ],
      },
      {
        type: "Professional Certification Test",
        title: "Professional Certification",
        desc: "Tes kesiapan sertifikasi profesional dan tata kelola publik.",
        defaultQuestions: 50,
        defaultMinutes: 45,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Government & Public Administration",
          "Writing & Expression",
          "Work Personality",
        ],
      },
      {
        type: "BUMN Executive Program",
        title: "BUMN Executive Program",
        desc: "Simulasi khusus jalur Management Trainee dan eksekutif BUMN.",
        defaultQuestions: 50,
        defaultMinutes: 45,
        exerciseCategories: [
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "National Foundation",
          "Contemporary Issues",
          "Work Personality",
          "Situational Judgement",
        ],
      },
      {
        type: "Master Comprehensive Assessment",
        title: "Master Comprehensive",
        desc: "Asesmen komprehensif tertinggi lintas 11 domain Karirfy.",
        defaultQuestions: 65,
        defaultMinutes: 60,
        exerciseCategories: [
          "National Foundation",
          "Verbal Reasoning",
          "Quantitative Reasoning",
          "Logical Reasoning",
          "Work Personality",
          "Fundamental Economics",
          "BI Essential",
          "BI Institutional Framework",
          "Indonesian History",
          "Reading Comprehension",
          "Case Reasoning",
        ],
      },
    ],
  },
];

export function getOrderedExerciseDomains(careerGoal?: string): ExerciseDomain[] {
  const goal = (careerGoal || "CPNS").toLowerCase();
  let priorityOrder: ExerciseDomainKey[] = [
    "Cognitive_Aptitude",
    "Civic_Knowledge",
    "Psychometric",
    "English_Proficiency",
    "Banking_Monetary",
    "Business_Economics",
    "General_Knowledge",
    "LPDP_Scholastic",
  ];

  if (goal.includes("bi") || goal.includes("bank indonesia")) {
    priorityOrder = [
      "Banking_Monetary",
      "Cognitive_Aptitude",
      "English_Proficiency",
      "Business_Economics",
      "Psychometric",
      "Civic_Knowledge",
      "General_Knowledge",
      "LPDP_Scholastic",
    ];
  } else if (goal.includes("bumn")) {
    priorityOrder = [
      "Cognitive_Aptitude",
      "Psychometric",
      "Business_Economics",
      "English_Proficiency",
      "Civic_Knowledge",
      "General_Knowledge",
      "Banking_Monetary",
      "LPDP_Scholastic",
    ];
  } else if (goal.includes("lpdp") || goal.includes("beasiswa")) {
    priorityOrder = [
      "LPDP_Scholastic",
      "English_Proficiency",
      "Cognitive_Aptitude",
      "General_Knowledge",
      "Psychometric",
      "Business_Economics",
      "Civic_Knowledge",
      "Banking_Monetary",
    ];
  }

  return priorityOrder
    .map((key) => EXERCISE_DOMAINS.find((d) => d.key === key))
    .filter((d): d is ExerciseDomain => Boolean(d));
}

export function getOrderedAssessmentCategories(
  careerGoal?: string,
): AssessmentCategory[] {
  const goal = (careerGoal || "CPNS").toLowerCase();
  let priorityOrder: AssessmentCategoryKey[] = [
    "Government_BUMN",
    "Cognitive_Screening",
    "Comprehensive_Aptitude",
    "Psychometric_Behavioral",
    "Bank_Indonesia",
    "English_Proficiency",
    "LPDP_Scholastic",
    "Domain_Expertise",
    "Applied_Reasoning",
    "Premium_Comprehensive",
  ];

  if (goal.includes("bi") || goal.includes("bank indonesia")) {
    priorityOrder = [
      "Bank_Indonesia",
      "Cognitive_Screening",
      "Domain_Expertise",
      "English_Proficiency",
      "Comprehensive_Aptitude",
      "Psychometric_Behavioral",
      "Applied_Reasoning",
      "LPDP_Scholastic",
      "Government_BUMN",
      "Premium_Comprehensive",
    ];
  } else if (goal.includes("bumn")) {
    priorityOrder = [
      "Government_BUMN",
      "Psychometric_Behavioral",
      "Applied_Reasoning",
      "Comprehensive_Aptitude",
      "English_Proficiency",
      "Domain_Expertise",
      "Cognitive_Screening",
      "Bank_Indonesia",
      "LPDP_Scholastic",
      "Premium_Comprehensive",
    ];
  } else if (goal.includes("lpdp") || goal.includes("beasiswa")) {
    priorityOrder = [
      "LPDP_Scholastic",
      "English_Proficiency",
      "Cognitive_Screening",
      "Comprehensive_Aptitude",
      "Applied_Reasoning",
      "Domain_Expertise",
      "Psychometric_Behavioral",
      "Government_BUMN",
      "Bank_Indonesia",
      "Premium_Comprehensive",
    ];
  }

  return priorityOrder
    .map((key) => ASSESSMENT_CATEGORIES.find((c) => c.key === key))
    .filter((c): c is AssessmentCategory => Boolean(c));
}

export function getFeaturedAssessmentForGoal(careerGoal?: string) {
  const goal = (careerGoal || "CPNS").toLowerCase();
  if (goal.includes("bi") || goal.includes("bank indonesia")) {
    return ASSESSMENT_CATEGORIES.find((c) => c.key === "Bank_Indonesia")!
      .batteries[0];
  }
  if (goal.includes("bumn")) {
    const govtBumn = ASSESSMENT_CATEGORIES.find((c) => c.key === "Government_BUMN")!;
    return (
      govtBumn.batteries.find((b) => b.type.includes("BUMN")) ||
      govtBumn.batteries[1]
    );
  }
  if (goal.includes("lpdp") || goal.includes("beasiswa")) {
    return ASSESSMENT_CATEGORIES.find((c) => c.key === "LPDP_Scholastic")!
      .batteries[0];
  }
  return ASSESSMENT_CATEGORIES.find((c) => c.key === "Government_BUMN")!
    .batteries[0];
}
