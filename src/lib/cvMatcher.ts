import type { CvDraft } from "./cv";

export type CvMatchTarget =
  | "CPNS"
  | "BUMN"
  | "Bank Indonesia"
  | "PPPK"
  | "Kedinasan"
  | "Beasiswa LPDP"
  | "Tech & Data"
  | "Korporat & Consulting";

export const CV_MATCH_TARGETS: CvMatchTarget[] = [
  "CPNS",
  "BUMN",
  "Bank Indonesia",
  "PPPK",
  "Kedinasan",
  "Beasiswa LPDP",
  "Tech & Data",
  "Korporat & Consulting",
];

const TRACK_KEYWORDS: Record<CvMatchTarget, string[]> = {
  CPNS: [
    "kebijakan publik",
    "tata kelola",
    "regulasi",
    "pelayanan publik",
    "analisis data",
    "anggaran",
    "evaluasi program",
    "administrasi",
    "kepatuhan",
    "koordinasi lintas unit",
  ],
  BUMN: [
    "akhlak",
    "kolaborasi",
    "kpi",
    "efisiensi operasional",
    "analisis bisnis",
    "manajemen risiko",
    "transformasi digital",
    "tata kelola",
    "kepemimpinan",
    "proyek strategis",
  ],
  "Bank Indonesia": [
    "kebijakan moneter",
    "makroekonomi",
    "sistem pembayaran",
    "stabilitas keuangan",
    "riset ekonomi",
    "ekonometrika",
    "statistik",
    "analisis kebijakan",
    "kebanksentralan",
    "laporan kebijakan",
  ],
  PPPK: [
    "pelayanan masyarakat",
    "standar operasional",
    "manajemen mutu",
    "penyusunan laporan",
    "kepatuhan administrasi",
    "pendampingan",
    "koordinasi lapangan",
    "evaluasi layanan",
    "empati",
    "sosio kultural",
  ],
  Kedinasan: [
    "kedisiplinan",
    "kepemimpinan",
    "statistika",
    "analisis kuantitatif",
    "pemerintahan",
    "administrasi negara",
    "organisasi",
    "simulasi kebijakan",
    "pelaporan",
    "pengawasan",
  ],
  "Beasiswa LPDP": [
    "riset",
    "publikasi",
    "kepemimpinan",
    "kontribusi sosial",
    "dampak masyarakat",
    "hibah",
    "beasiswa",
    "kolaborasi akademik",
    "studi kasus",
    "inovasi",
  ],
  "Tech & Data": [
    "python",
    "sql",
    "typescript",
    "arsitektur sistem",
    "pipeline data",
    "otomasi",
    "pengujian",
    "latensi",
    "api",
    "visualisasi data",
  ],
  "Korporat & Consulting": [
    "strategi bisnis",
    "due diligence",
    "financial modeling",
    "optimasi biaya",
    "pemangku kepentingan",
    "presentasi eksekutif",
    "manajemen proyek",
    "roi",
    "pertumbuhan",
    "eksekusi lintas fungsi",
  ],
};

const ACTION_VERBS = [
  "memimpin",
  "merancang",
  "mengelola",
  "mengoptimalkan",
  "menganalisis",
  "mengembangkan",
  "menyusun",
  "mengaudit",
  "meningkatkan",
  "menurunkan",
  "memangkas",
  "mempercepat",
  "mengoordinasikan",
  "mengevaluasi",
  "mengimplementasikan",
  "membangun",
  "memvalidasi",
  "mengotomatiskan",
  "menyajikan",
  "melatih",
  "led",
  "designed",
  "built",
  "optimized",
  "managed",
  "launched",
  "reduced",
  "increased",
];

const STOPWORDS = new Set([
  "yang", "dan", "atau", "dengan", "untuk", "dalam", "pada", "dari", "ke", "di", "oleh", "sebagai",
  "adalah", "akan", "dapat", "harus", "memiliki", "kemampuan", "pengalaman", "minimal", "tahun",
  "kerja", "tim", "baik", "secara", "mampu", "serta", "tentang", "antara", "terhadap", "the", "and",
  "for", "with", "from", "that", "this", "have", "will", "your", "our", "into", "over", "role",
  "kandidat", "pelamar", "posisi", "lulusan", "sarjana", "bidang", "terkait", "tugas", "tanggung", "jawab",
]);

export interface CvMatchResult {
  target: CvMatchTarget;
  overallScore: number;
  breakdown: {
    structure: number;
    metrics: number;
    actionVerbs: number;
    keywords: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export function resolveDefaultCvMatchTarget(careerGoal?: string): CvMatchTarget {
  const goal = (careerGoal || "").toLowerCase();
  if (goal.includes("lpdp") || goal.includes("beasiswa")) return "Beasiswa LPDP";
  if (goal.includes("bank indonesia") || goal.includes("pcpm") || goal === "bi") return "Bank Indonesia";
  if (goal.includes("bumn")) return "BUMN";
  if (goal.includes("pppk")) return "PPPK";
  if (goal.includes("kedinasan") || goal.includes("stan") || goal.includes("stis") || goal.includes("ipdn")) return "Kedinasan";
  if (goal.includes("tech") || goal.includes("data") || goal.includes("software")) return "Tech & Data";
  if (goal.includes("consult") || goal.includes("korporat") || goal.includes("produk")) return "Korporat & Consulting";
  return "CPNS";
}

function extractCustomKeywords(customJobText: string): string[] {
  const tokens = customJobText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w) && !/^\d+$/.test(w));

  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 8)
    .map(([word]) => word);
}

export function analyzeCvMatch(
  draft: CvDraft,
  target: CvMatchTarget,
  customJobText = "",
): CvMatchResult {
  const fullText = [
    draft.headline,
    draft.profile,
    ...draft.experience.map((e) => `${e.title} ${e.organization} ${e.details}`),
    ...draft.education.map((e) => `${e.title} ${e.organization} ${e.details}`),
    ...draft.projects.map((p) => `${p.title} ${p.organization} ${p.details}`),
    draft.skills,
    draft.certifications,
    draft.publications,
    draft.achievements,
  ]
    .join("\n")
    .toLowerCase();

  // 1. Structure readiness (7 checks)
  const structureChecks = [
    draft.name.trim().length > 2,
    draft.headline.trim().length > 3,
    draft.email.trim().length > 4 || draft.phone.trim().length > 5,
    draft.profile.trim().length >= 50,
    draft.experience.length > 0 || draft.projects.length > 0,
    draft.education.length > 0,
    draft.skills.trim().length >= 10,
  ];
  const structure = Math.round(
    (structureChecks.filter(Boolean).length / structureChecks.length) * 100,
  );

  // 2. Quantitative metrics density across bullets/achievements
  const bulletLines = [
    ...draft.experience.flatMap((e) => e.details.split(/\r?\n/)),
    ...draft.projects.flatMap((p) => p.details.split(/\r?\n/)),
    ...draft.achievements.split(/\r?\n/),
  ]
    .map((l) => l.trim())
    .filter(Boolean);

  const metricRegex =
    /(\d+(?:[.,]\d+)?\s*(?:%|persen|juta|miliar|ribu|kali|x|jam|hari|minggu|bulan|tahun|detik|ms|peserta|anggota|klien|cabang|dokumen|transaksi|pengguna|laporan|sks|ipk)|\brp\s*\d+)/i;
  const metricMatches = bulletLines.filter((line) => metricRegex.test(line)).length;
  const targetMetrics = Math.max(4, Math.min(8, Math.ceil(bulletLines.length * 0.5)));
  const metrics = bulletLines.length
    ? Math.min(100, Math.round((metricMatches / targetMetrics) * 100))
    : 0;

  // 3. Action verb diversity
  const verbHits = ACTION_VERBS.filter((verb) => new RegExp(`\\b${verb}\\b`, "i").test(fullText));
  const actionVerbs = Math.min(100, Math.round((verbHits.length / 6) * 100));

  // 4. Keyword match (track baseline + optional pasted formasi text)
  const customTerms = extractCustomKeywords(customJobText);
  const targetPool = Array.from(new Set([...TRACK_KEYWORDS[target], ...customTerms]));
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of targetPool) {
    if (fullText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }
  const keywords = targetPool.length
    ? Math.round((matchedKeywords.length / targetPool.length) * 100)
    : 100;

  const overallScore = Math.round(
    structure * 0.25 + metrics * 0.25 + actionVerbs * 0.2 + keywords * 0.3,
  );

  const suggestions: string[] = [];
  if (structure < 100) {
    if (draft.profile.trim().length < 50) {
      suggestions.push("Perkaya ringkasan profil menjadi 2 hingga 3 kalimat bernilai jual utama.");
    }
    if (!draft.skills.trim()) {
      suggestions.push("Lengkapi bagian Keahlian agar lolos pemindaian kata kunci ATS.");
    }
  }
  if (metrics < 70) {
    suggestions.push("Tambahkan angka terukur (%, jumlah peserta, waktu, atau efisiensi biaya) di poin pengalaman.");
  }
  if (actionVerbs < 70) {
    suggestions.push("Awali setiap poin dengan kata kerja aktif seperti Merancang, Mengaudit, atau Meningkatkan.");
  }
  if (missingKeywords.length > 0) {
    const sampleMissing = missingKeywords.slice(0, 3).join(", ");
    suggestions.push(`Selipkan istilah relevan ${target} bila sesuai pengalaman nyata Anda: ${sampleMissing}.`);
  }

  return {
    target,
    overallScore,
    breakdown: { structure, metrics, actionVerbs, keywords },
    matchedKeywords,
    missingKeywords,
    suggestions: suggestions.slice(0, 4),
  };
}
