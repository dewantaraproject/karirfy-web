import { supabase, withTimeout } from "../lib/supabase";
import { KIPRAH_STORAGE_KEYS } from "../lib/sessionCleanup";
import type { ArtifactItem } from "../types";

export const DEFAULT_ARTIFACTS: ArtifactItem[] = [
  {
    id: 1,
    title: "Animal Farm dan Cermin Kekuasaan yang Tak Pernah Usai",
    summary:
      "Esai ini mengulas alegori politik George Orwell dalam Animal Farm sebagai siklus kekuasaan yang berulang dari revolusi ke tirani, serta relevansinya di era digital dan populisme kontemporer.",
    categories: ["Indie"],
    readTime: 14,
    depth: "reflektif",
    contentBlocks: [
      {
        type: "heading",
        level: 2,
        text: "Siklus Kekuasaan dari Revolusi Menuju Tirani",
      },
      {
        type: "paragraph",
        text: "Alegori George Orwell memperlihatkan bagaimana bahasa, propaganda, dan ketakutan kolektif dapat membelokkan cita-cita kesetaraan menjadi dominasi baru.",
      },
    ],
  },
  {
    id: 2,
    title: "Bayesian Reasoning: Memperbarui Keyakinan",
    summary:
      "Esai ini mengupas Penalaran Bayesian sebagai kerangka berpikir rasional untuk merevisi keyakinan di tengah ketidakpastian berdasarkan bukti baru secara sistematis.",
    categories: ["Cognitive Tools", "Mindset"],
    readTime: 9,
    depth: "analitis",
    contentBlocks: [
      {
        type: "heading",
        level: 2,
        text: "Dari Keyakinan Awal Menuju Pembaruan Objektif",
      },
      {
        type: "paragraph",
        text: "Penalaran Bayesian mengajak kita memisahkan seberapa yakin kita di awal (prior) dan seberapa kuat bukti empiris baru (likelihood) mengubah kesimpulan (posterior).",
      },
    ],
  },
  {
    id: 3,
    title: "Behavioral Economics: Batas Rasionalitas Manusia",
    summary:
      "Eksplorasi tentang bagaimana bias psikologis membentuk perilaku ekonomi nyata, menantang asumsi rasionalitas sempurna, dan memandu desain kebijakan publik.",
    categories: ["Ekonomi", "Psikologi"],
    readTime: 10,
    depth: "reflektif",
    contentBlocks: [
      {
        type: "heading",
        level: 2,
        text: "Heuristik, Bias, dan Desain Pilihan Kebijakan",
      },
      {
        type: "paragraph",
        text: "Keputusan manusia di dunia nyata sering dipengaruhi pembingkaian (framing), keengganan merugi (loss aversion), serta keterbatasan perhatian kognitif.",
      },
    ],
  },
  {
    id: 4,
    title: "Bijak Kelola Keuangan: Dari Survival ke Sustainability",
    summary:
      "Membingkai ulang manajemen keuangan pribadi, beralih dari mentalitas bertahan hidup yang reaktif menuju ekosistem finansial yang berkelanjutan.",
    categories: ["Fundamental", "Mindset", "Ekonomi"],
    readTime: 8,
    depth: "analitis",
    contentBlocks: [
      {
        type: "heading",
        level: 2,
        text: "Arsitektur Keuangan Pribadi Jangka Panjang",
      },
      {
        type: "paragraph",
        text: "Ketahanan finansial tidak hanya soal menambah pemasukan, melainkan merancang arus kas, dana darurat, dan proteksi risiko agar keputusan hidup tetap merdeka.",
      },
    ],
  },
  {
    id: 5,
    title: "Cognitive Load Management: Mengatur Beban Mental dalam Ujian",
    summary:
      "Panduan ilmiah untuk memahami dan mengelola beban kognitif agar performa berpikir tetap tajam di bawah tekanan waktu dan kompleksitas soal.",
    categories: ["Strategi Tes", "Cognitive Tools"],
    readTime: 9,
    depth: "analitis",
    contentBlocks: [
      {
        type: "heading",
        level: 2,
        text: "Menjaga Memori Kerja Tetap Efisien di Ruang Ujian",
      },
      {
        type: "paragraph",
        text: "Dengan memecah informasi rumit menjadi potongan terstruktur dan menghindari pengulangan pembacaan soal tanpa fokus, kapasitas memori kerja dapat dihemat.",
      },
    ],
  },
];

function normalizeSupabaseArtifact(row: any): ArtifactItem {
  return {
    id: row.id,
    title: String(row.title ?? "Bacaan Konseptual"),
    summary: String(row.summary ?? ""),
    image: row.image || undefined,
    categories: Array.isArray(row.categories) ? row.categories : [],
    readTime: Number(row.read_time ?? row.readTime) || 5,
    depth: String(row.depth ?? "analitis"),
    contentBlocks: Array.isArray(row.content_blocks ?? row.contentBlocks)
      ? (row.content_blocks ?? row.contentBlocks)
      : [],
  };
}

export function loadLocalReadArtifactIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.readArtifacts);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function saveLocalReadArtifactId(artifactId: string | number): string[] {
  const existing = new Set(loadLocalReadArtifactIds());
  existing.add(String(artifactId));
  const list = Array.from(existing);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KIPRAH_STORAGE_KEYS.readArtifacts, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  }
  return list;
}

export async function fetchArtifactsCatalog(userId?: string | null): Promise<{
  artifacts: ArtifactItem[];
  readIds: string[];
}> {
  let artifacts = DEFAULT_ARTIFACTS;
  let readIds = loadLocalReadArtifactIds();
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { artifacts, readIds };

  try {
    const { data, error } = await withTimeout(
      supabase.from("artifacts").select("*").order("id", { ascending: true }),
      3000,
    );
    if (!error && data && data.length > 0) {
      artifacts = data.map(normalizeSupabaseArtifact);
    }

    if (userId && userId !== "guest") {
      const { data: readRows } = await withTimeout(
        supabase
          .from("user_read_artifacts")
          .select("artifact_id")
          .eq("user_id", userId),
        3000,
      );
      if (readRows && readRows.length > 0) {
        const merged = new Set([
          ...readIds,
          ...readRows.map((r: { artifact_id: string | number }) =>
            String(r.artifact_id),
          ),
        ]);
        readIds = Array.from(merged);
      }
    }
  } catch {
    // fallback gracefully to local defaults
  }

  return { artifacts, readIds };
}

export async function markArtifactAsRead(
  artifactId: string | number,
  userId?: string | null,
): Promise<string[]> {
  const updated = saveLocalReadArtifactId(artifactId);
  if (userId && userId !== "guest") {
    try {
      await supabase
        .from("user_read_artifacts")
        .upsert(
          { user_id: userId, artifact_id: artifactId },
          { onConflict: "user_id,artifact_id" },
        );
    } catch {
      // ignore remote sync error when offline
    }
  }
  return updated;
}
