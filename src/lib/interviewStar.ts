import type { CvDraft } from "./cv";
import { KIPRAH_STORAGE_KEYS } from "./sessionCleanup";
import { emitStudyVaultDirty } from "./studyVaultSyncService";
import type { StudyTrack } from "../types";

export interface StarStoryDraft {
  id: string;
  sourceTitle: string;
  sourceOrg: string;
  question: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface EssayOutlineSection {
  id: string;
  heading: string;
  prompt: string;
  draft: string;
}

export interface StarStudioSavedState {
  stories: Record<string, StarStoryDraft>;
  essaySections: Record<string, string>;
  rubricChecks: string[];
}

export const STAR_PROMPTS_BY_TRACK: Record<StudyTrack, string[]> = {
  CPNS: [
    "Ceritakan pengalaman menyelesaikan kendala pelayanan publik atau administrasi di bawah tenggat ketat.",
    "Bagaimana Anda menjaga integritas saat menghadapi tekanan atau perbedaan kepentingan di tim?",
  ],
  BUMN: [
    "Ceritakan proyek kolaborasi lintas fungsi yang mencerminkan nilai AKHLAK dan menghasilkan perbaikan terukur.",
    "Bagaimana Anda merespons perubahan target atau krisis operasional dengan solusi inovatif?",
  ],
  "Bank Indonesia": [
    "Jelaskan analisis kebijakan atau pengambilan keputusan berbasis data yang paling menantang bagi Anda.",
    "Ceritakan momen ketika Anda harus meyakinkan pemangku kepentingan dengan argumen kuantitatif yang tajam.",
  ],
  PPPK: [
    "Ceritakan situasi ketika Anda mendampingi masyarakat atau rekan kerja dengan empati meski sumber daya terbatas.",
    "Bagaimana Anda memastikan prosedur pelayanan tetap berjalan tertib dan akuntabel?",
  ],
  Kedinasan: [
    "Ceritakan tanggung jawab kepemimpinan organisasi atau proyek yang menuntut disiplin tinggi.",
    "Bagaimana Anda bangkit dari kegagalan teknis atau kesalahpahaman dalam koordinasi tim?",
  ],
  "Beasiswa LPDP": [
    "Apa masalah paling mendesak di sektor Anda, dan bukti konkret apa yang sudah Anda kerjakan dari pengalaman sebelumnya?",
    "Bagaimana studi lanjut dan rencana 5 tahun Anda akan memberi dampak langsung bagi Indonesia?",
  ],
};

export const ESSAY_RUBRIC_CRITERIA = [
  "Masalah spesifik dan didukung bukti lapangan atau data yang jelas",
  "Rekam jejak nyata selaras dengan pengalaman atau proyek di CV",
  "Alasan memilih kampus, program studi, atau instansi sangat terarah",
  "Rencana kontribusi pascastudi punya target waktu dan indikator dampak",
];

function splitDetailBullets(details: string): string[] {
  return details
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

export function buildStarStoriesFromCv(
  draft: CvDraft | null | undefined,
  track: StudyTrack,
): StarStoryDraft[] {
  const prompts = STAR_PROMPTS_BY_TRACK[track] ?? STAR_PROMPTS_BY_TRACK.CPNS;
  const candidates = [
    ...(draft?.experience ?? []).map((entry, idx) => ({
      id: `exp-${idx}`,
      ...entry,
    })),
    ...(draft?.projects ?? []).map((entry, idx) => ({
      id: `proj-${idx}`,
      ...entry,
    })),
  ].filter((entry) => entry.title.trim() || entry.details.trim());

  if (!candidates.length) {
    return [
      {
        id: "template-1",
        sourceTitle: "Contoh Pengalaman Kerja / Organisasi",
        sourceOrg: `Konteks ${track}`,
        question: prompts[0],
        situation: "Tim menghadapi antrean laporan atau proses manual yang melambat saat beban puncak.",
        task: "Saya ditugaskan menata ulang alur kerja agar penyelesaian lebih cepat dan tetap akurat.",
        action: "Saya memetakan titik hambat, membuat templat pengecekan terstandar, dan mengoordinasikan uji coba dua minggu bersama tim.",
        result: "Waktu penyelesaian turun 30% dan tingkat ketepatan laporan meningkat menjadi 96%. (Isi CV Anda di Galeri CV untuk menarik pengalaman asli secara otomatis.)",
      },
    ];
  }

  return candidates.slice(0, 4).map((entry, index) => {
    const bullets = splitDetailBullets(entry.details);
    const title = entry.title.trim() || `Pengalaman ${index + 1}`;
    const org = entry.organization.trim() || "Instansi / Organisasi";
    const period = entry.period.trim();
    const orgLabel = period ? `${org} (${period})` : org;

    const situation = bullets[0]
      ? `Saat bertugas sebagai ${title} di ${orgLabel}, tantangan utamanya berkaitan dengan ${bullets[0].charAt(0).toLowerCase() + bullets[0].slice(1)}`
      : `Saat berperan sebagai ${title} di ${orgLabel}, dibutuhkan eksekusi terukur untuk menjaga kualitas output tim.`;

    const task = `Saya bertanggung jawab merumuskan solusi dan memastikan target ${title.toLowerCase()} tercapai sesuai jadwal.`;

    const action = bullets.length > 1
      ? bullets.slice(0, -1).join(". ") + "."
      : bullets[0] || "Mengidentifikasi prioritas masalah, menyusun langkah perbaikan terukur, dan menyelaraskan koordinasi tim.";

    const lastBullet = bullets[bullets.length - 1];
    const hasMetric = lastBullet && /\d/.test(lastBullet);
    const result = hasMetric
      ? lastBullet
      : `${lastBullet ? `${lastBullet}. ` : ""}Dampak terukur: efisiensi proses meningkat dan pemangku kepentingan menerima laporan tepat waktu.`;

    return {
      id: entry.id,
      sourceTitle: title,
      sourceOrg: orgLabel,
      question: prompts[index % prompts.length],
      situation,
      task,
      action,
      result,
    };
  });
}

export function buildContributionEssayOutline(
  draft: CvDraft | null | undefined,
  track: StudyTrack,
): EssayOutlineSection[] {
  const headline = draft?.headline?.trim() || `Kandidat jalur ${track}`;
  const expSummary = [
    ...(draft?.experience ?? []).map((e) => `${e.title}${e.organization ? ` di ${e.organization}` : ""}`),
    ...(draft?.projects ?? []).map((p) => p.title),
  ]
    .filter(Boolean)
    .slice(0, 3)
    .join("; ");
  const achievements = splitDetailBullets(draft?.achievements ?? "").slice(0, 2).join("; ");

  return [
    {
      id: "problem",
      heading: "1. Masalah Nyata & Urgensi",
      prompt: `Rumuskan satu tantangan konkret di sektor ${track} yang pernah Anda temui langsung beserta datanya.`,
      draft: `Berangkat dari latar belakang sebagai ${headline}, isu krusial yang perlu dibenahi adalah kesenjangan eksekusi layanan berbasis bukti dan tata kelola data yang terfragmentasi.`,
    },
    {
      id: "track-record",
      heading: "2. Bukti Rekam Jejak dari CV",
      prompt: "Hubungkan komitmen Anda dengan bukti nyata yang sudah pernah Anda kerjakan.",
      draft: expSummary
        ? `Melalui pengalaman di ${expSummary}${achievements ? ` serta capaian (${achievements})` : ""}, saya telah membuktikan kapasitas eksekusi dan kolaborasi lintas tim dengan hasil terukur.`
        : "Isi bagian Pengalaman dan Proyek di Galeri CV agar daftar rekam jejak Anda otomatis dirangkai di paragraf ini.",
    },
    {
      id: "study-plan",
      heading: "3. Rencana Penguatan Kompetensi",
      prompt: track === "Beasiswa LPDP"
        ? "Sebutkan program studi, mata kuliah inti, atau topik riset tesis dan kaitannya dengan solusi."
        : `Jelaskan kompetensi inti yang akan Anda bawa sejak hari pertama berkontribusi di ${track}.`,
      draft: track === "Beasiswa LPDP"
        ? "Program studi tujuan dipilih karena kurikulum analitik kebijakan/teknologi dan kelompok riset terapan yang relevan langsung untuk memecahkan akar persoalan di atas."
        : `Fokus penguatan saya mencakup perancangan standar analisis, otomasi pelaporan, dan pengendalian mutu pada penugasan di ${track}.`,
    },
    {
      id: "contribution",
      heading: "4. Rencana Kontribusi 5 Tahun",
      prompt: "Tulis proyeksi jangka pendek (1-2 tahun) dan menengah (3-5 tahun) dengan indikator dampak jelas.",
      draft: "Tahun ke-1 hingga ke-2 berfokus pada implementasi pilot project dan perbaikan proses operasional; tahun ke-3 hingga ke-5 mendorong replikasi model solusi berskala nasional/regional.",
    },
  ];
}

export function loadStarStudioState(): StarStudioSavedState {
  try {
    const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.starStudio);
    if (!raw) return { stories: {}, essaySections: {}, rubricChecks: [] };
    const parsed = JSON.parse(raw) as Partial<StarStudioSavedState>;
    return {
      stories: parsed.stories && typeof parsed.stories === "object" ? parsed.stories : {},
      essaySections: parsed.essaySections && typeof parsed.essaySections === "object" ? parsed.essaySections : {},
      rubricChecks: Array.isArray(parsed.rubricChecks) ? parsed.rubricChecks : [],
    };
  } catch {
    return { stories: {}, essaySections: {}, rubricChecks: [] };
  }
}

export function saveStarStudioState(state: StarStudioSavedState): void {
  try {
    localStorage.setItem(KIPRAH_STORAGE_KEYS.starStudio, JSON.stringify(state));
    emitStudyVaultDirty();
  } catch {
    // non-fatal storage full or private mode
  }
}
