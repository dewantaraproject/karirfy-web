import { KIPRAH_STORAGE_KEYS } from "./sessionCleanup";
import { emitStudyVaultDirty } from "./studyVaultSyncService";

export type CvCategory =
  | "ATS & Korporat"
  | "Tech & Data"
  | "BUMN & Publik"
  | "LPDP & Akademik"
  | "Kreatif & Dua Kolom";

export const CV_CATEGORIES: CvCategory[] = [
  "ATS & Korporat",
  "Tech & Data",
  "BUMN & Publik",
  "LPDP & Akademik",
  "Kreatif & Dua Kolom",
];

export const CV_TEMPLATES = {
  professional: {
    label: "Profesional ATS",
    category: "ATS & Korporat",
    description: "Nama di tengah dengan garis tegas dan pengalaman kerja berorientasi hasil.",
    color: "#104f91",
    photo: false,
    type: "Satu kolom",
    layout: "center",
  },
  consulting: {
    label: "Consulting ATS",
    category: "ATS & Korporat",
    description: "Format standar konsultan manajemen: padat angka, periode kanan, nol dekorasi berlebih.",
    color: "#141920",
    photo: false,
    type: "Satu kolom",
    layout: "consulting",
  },
  corporate_mt: {
    label: "Korporat & MT",
    category: "ATS & Korporat",
    description: "Foto formal di kiri atas dengan pendidikan dan pencapaian di bagian terdepan.",
    color: "#1a2838",
    photo: true,
    type: "Satu kolom",
    layout: "corporate_mt",
  },
  graduate: {
    label: "Lulusan Baru",
    category: "ATS & Korporat",
    description: "Hitam putih ATS bersih, menonjolkan pendidikan, magang, dan proyek unggulan.",
    color: "#191919",
    photo: false,
    type: "Satu kolom",
    layout: "plain",
  },
  executive: {
    label: "Eksekutif",
    category: "ATS & Korporat",
    description: "Header gelap dengan ringkasan dampak kepemimpinan di bagian paling atas.",
    color: "#233148",
    photo: false,
    type: "Satu kolom",
    layout: "band",
  },
  technical: {
    label: "Teknis ATS",
    category: "Tech & Data",
    description: "Stack teknis di awal, diikuti pengalaman rekayasa dan proyek terukur.",
    color: "#116160",
    photo: false,
    type: "Satu kolom",
    layout: "technical",
  },
  data_science: {
    label: "Analis & Data",
    category: "Tech & Data",
    description: "Tipografi serif klasik ATS yang menonjolkan pemodelan, SQL, dan dampak bisnis.",
    color: "#1b365d",
    photo: false,
    type: "Satu kolom",
    layout: "serif_ats",
  },
  tpm_product: {
    label: "Produk & TPM",
    category: "Tech & Data",
    description: "Struktur eksekusi lintas tim untuk Product Manager, Program Manager, dan Analis.",
    color: "#2d3a4b",
    photo: false,
    type: "Satu kolom",
    layout: "center",
  },
  bumn_akhlak: {
    label: "BUMN & ODP",
    category: "BUMN & Publik",
    description: "Tegas untuk Rekrutmen Bersama BUMN, ODP Perbankan, dan seleksi instansi.",
    color: "#133a63",
    photo: false,
    type: "Satu kolom",
    layout: "consulting",
  },
  classic: {
    label: "Klasik Berfoto",
    category: "BUMN & Publik",
    description: "Foto ringkas di kiri atas, ruang baca luas untuk pengalaman dan organisasi.",
    color: "#123d69",
    photo: true,
    type: "Satu kolom",
    layout: "portrait",
  },
  lpdp_scholar: {
    label: "Beasiswa LPDP",
    category: "LPDP & Akademik",
    description: "Khusus pelamar beasiswa S2/S3: memprioritaskan studi, riset, dan kontribusi sosial.",
    color: "#5f233b",
    photo: false,
    type: "Satu kolom",
    layout: "serif_ats",
  },
  academic: {
    label: "Akademik",
    category: "LPDP & Akademik",
    description: "Tata letak riset untuk asisten dosen, publikasi ilmiah, dan hibah studi.",
    color: "#b93674",
    photo: false,
    type: "Satu kolom",
    layout: "rose",
  },
  editorial: {
    label: "Editorial",
    category: "LPDP & Akademik",
    description: "Judul bergaya editorial dengan aksen hangat dan penanggalan di tepi kanan.",
    color: "#7c482e",
    photo: false,
    type: "Satu kolom",
    layout: "editorial",
  },
  modern: {
    label: "Modern Navy",
    category: "Kreatif & Dua Kolom",
    description: "Foto dan identitas di panel navy, dengan pengalaman di kolom utama.",
    color: "#152437",
    photo: true,
    type: "Dua kolom",
    layout: "navy",
  },
  creative: {
    label: "Kreatif Kuning",
    category: "Kreatif & Dua Kolom",
    description: "Foto membulat, panel abu muda seimbang, dan aksen garis kuning modern.",
    color: "#e5a900",
    photo: true,
    type: "Dua kolom",
    layout: "yellow",
  },
  portfolio: {
    label: "Portofolio",
    category: "Kreatif & Dua Kolom",
    description: "Proyek terpilih di kiri, dengan keahlian, sertifikasi, dan pendidikan di sisi kanan.",
    color: "#2a6550",
    photo: false,
    type: "Dua kolom",
    layout: "portfolio",
  },
} as const;

export type CvTemplate = keyof typeof CV_TEMPLATES;
export const CV_TEMPLATE_COUNT = Object.keys(CV_TEMPLATES).length;
export type CvFormat = "pdf" | "docx";
export interface CvEntry { title: string; organization: string; period: string; details: string }
export interface CvDraft {
  template: CvTemplate;
  name: string;
  headline: string;
  email: string;
  phone: string;
  city: string;
  link: string;
  profile: string;
  photo: string;
  experience: CvEntry[];
  education: CvEntry[];
  projects: CvEntry[];
  skills: string;
  certifications: string;
  publications: string;
  achievements: string;
  languages: string;
  interests: string;
}

export const EMPTY_CV_ENTRY: CvEntry = { title: "", organization: "", period: "", details: "" };
export const EMPTY_CV: CvDraft = {
  template: "professional", name: "", headline: "", email: "", phone: "", city: "", link: "",
  profile: "", photo: "", experience: [], education: [], projects: [], skills: "", certifications: "", publications: "", achievements: "", languages: "", interests: "",
};

const lines = (text: string) => text.trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

export interface CvBlock { title?: string; organization?: string; period?: string; lines: string[] }
export interface CvSection { label: string; blocks: CvBlock[]; bullets?: boolean }

function mappedEntries(entries: CvEntry[]): CvBlock[] {
  return entries.map((entry) => ({
    title: entry.title.trim(),
    organization: entry.organization.trim(),
    period: entry.period.trim(),
    lines: lines(entry.details),
  })).filter((entry) => entry.title || entry.organization || entry.period || entry.lines.length);
}

export function getCvDocument(draft: CvDraft) {
  const textSection = (label: string, text: string): CvSection => {
    const content = lines(text);
    return { label, blocks: content.length ? [{ lines: content }] : [] };
  };
  const experience = { label: "Pengalaman", blocks: mappedEntries(draft.experience), bullets: true };
  const education = { label: "Pendidikan", blocks: mappedEntries(draft.education), bullets: true };
  const projects = { label: "Proyek & Kegiatan", blocks: mappedEntries(draft.projects), bullets: true };
  const publications = textSection("Publikasi", draft.publications);
  const skills = textSection("Keahlian", draft.skills);
  const achievements = textSection("Pencapaian", draft.achievements);

  const eduFirst = draft.template === "academic" || draft.template === "lpdp_scholar";
  const ordered = eduFirst
    ? [education, publications, projects, experience]
    : draft.template === "graduate" || draft.template === "corporate_mt"
      ? [education, experience, projects, publications]
      : draft.template === "portfolio"
        ? [projects, experience, education, publications]
        : [experience, education, projects, publications];

  const skillsFirst = draft.template === "technical" || draft.template === "data_science";
  const sections = [
    textSection("Profil", draft.profile),
    ...(skillsFirst ? [skills] : []),
    ...(draft.template === "executive" ? [achievements] : []),
    ...ordered,
    ...(!skillsFirst ? [skills] : []),
    textSection("Sertifikasi", draft.certifications),
    ...(draft.template !== "executive" ? [achievements] : []),
    textSection("Bahasa", draft.languages),
    textSection("Minat", draft.interests),
  ];

  const tpl = CV_TEMPLATES[draft.template];
  return {
    template: draft.template,
    layout: tpl.layout,
    color: tpl.color,
    name: draft.name.trim(),
    headline: draft.headline.trim(),
    contact: [draft.city, draft.email, draft.phone, draft.link].map((field) => field.trim()).filter(Boolean),
    photo: tpl.photo ? draft.photo : "",
    sections: sections.filter(({ blocks }) => blocks.length),
  };
}
export type CvDocument = ReturnType<typeof getCvDocument>;

export function getCvColumns(cv: CvDocument) {
  const labels = cv.layout === "navy"
    ? ["Bahasa", "Keahlian", "Sertifikasi"]
    : cv.layout === "yellow"
      ? ["Pendidikan", "Sertifikasi", "Bahasa"]
      : cv.layout === "portfolio"
        ? ["Keahlian", "Sertifikasi", "Bahasa", "Pendidikan"]
        : [];
  const sidebar = labels.flatMap((label) => cv.sections.filter((section) => section.label === label));
  return { sidebar, body: cv.sections.filter((section) => !sidebar.includes(section)) };
}

export function getCvReadingOrder(cv: CvDocument): string {
  return [cv.name, cv.headline, cv.contact.join(" · "), ...cv.sections.flatMap(({ label, blocks }) => [
    label,
    ...blocks.map(({ title, organization, period, lines }) => [title, organization, period, ...lines].filter(Boolean).join("\n")),
  ])].filter(Boolean).join("\n\n");
}

export function getCvFilename(name: string, format: CvFormat): string {
  const slug = name.normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return `CV-${Array.from(slug).slice(0, 70).join("") || "Karirfy"}.${format}`;
}

export function loadCvDraft(): CvDraft | undefined {
  try {
    const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.cvDraft);
    if (!raw) return undefined;
    const saved = JSON.parse(raw) as CvDraft;
    if (!Object.prototype.hasOwnProperty.call(CV_TEMPLATES, saved.template)) return undefined;
    return { ...EMPTY_CV, ...saved };
  } catch {
    return undefined;
  }
}

export function saveCvDraft(draft: CvDraft): boolean {
  try {
    localStorage.setItem(KIPRAH_STORAGE_KEYS.cvDraft, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export const MAX_CV_VERSIONS = 8;

export interface SavedCvVersion {
  id: string;
  title: string;
  targetTrack?: string;
  updatedAt: string;
  draft: CvDraft;
}

export interface CvCollectionState {
  activeId: string;
  items: SavedCvVersion[];
}

function defaultVersionTitle(draft: CvDraft, targetTrack?: string): string {
  const headline = draft.headline?.trim();
  if (headline) return headline.slice(0, 60);
  const label = CV_TEMPLATES[draft.template]?.label || "CV Saya";
  return targetTrack ? `${label} (${targetTrack})`.slice(0, 60) : label;
}

function cloneCvDraft(draft: CvDraft): CvDraft {
  return {
    ...EMPTY_CV,
    ...draft,
    experience: (draft.experience ?? []).map((entry) => ({ ...entry })),
    education: (draft.education ?? []).map((entry) => ({ ...entry })),
    projects: (draft.projects ?? []).map((entry) => ({ ...entry })),
  };
}

function makeCvVersionId(existing: SavedCvVersion[]): string {
  const used = new Set(existing.map((item) => item.id));
  let seq = existing.length + 1;
  const stamp = Date.now().toString(36);
  let candidate = `cv-${stamp}-${seq}`;
  while (used.has(candidate)) {
    seq += 1;
    candidate = `cv-${stamp}-${seq}`;
  }
  return candidate;
}

function isValidDraftCandidate(value: unknown): value is CvDraft {
  if (!value || typeof value !== "object") return false;
  const tpl = (value as { template?: unknown }).template;
  return typeof tpl === "string" && Object.prototype.hasOwnProperty.call(CV_TEMPLATES, tpl);
}

export function loadCvCollection(): CvCollectionState {
  try {
    const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.cvCollection);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CvCollectionState>;
      const items = Array.isArray(parsed.items)
        ? parsed.items
            .filter(
              (item): item is SavedCvVersion =>
                Boolean(item && typeof item.id === "string" && isValidDraftCandidate(item.draft)),
            )
            .slice(0, MAX_CV_VERSIONS)
            .map((item) => ({
              id: item.id,
              title: String(item.title || "").trim().slice(0, 80) || defaultVersionTitle(item.draft, item.targetTrack),
              targetTrack: typeof item.targetTrack === "string" && item.targetTrack.trim()
                ? item.targetTrack.trim().slice(0, 60)
                : undefined,
              updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
              draft: cloneCvDraft(item.draft),
            }))
        : [];
      if (items.length > 0) {
        const activeId = items.some((item) => item.id === parsed.activeId)
          ? (parsed.activeId as string)
          : items[0].id;
        return { activeId, items };
      }
      // Explicit empty collection (e.g. user deleted the last version): do not resurrect old cvDraft unless absent
      return { activeId: "", items: [] };
    }
  } catch {
    // Fall back to legacy draft migration below
  }

  const legacy = loadCvDraft();
  if (legacy) {
    return {
      activeId: "cv-default",
      items: [
        {
          id: "cv-default",
          title: defaultVersionTitle(legacy),
          updatedAt: new Date().toISOString(),
          draft: cloneCvDraft(legacy),
        },
      ],
    };
  }

  return { activeId: "", items: [] };
}

export function saveCvCollection(collection: CvCollectionState): boolean {
  const items = collection.items.slice(0, MAX_CV_VERSIONS);
  const active = items.find((item) => item.id === collection.activeId) ?? items[0];
  const normalized: CvCollectionState = {
    activeId: active?.id ?? "",
    items,
  };
  try {
    localStorage.setItem(KIPRAH_STORAGE_KEYS.cvCollection, JSON.stringify(normalized));
    if (active) {
      localStorage.setItem(KIPRAH_STORAGE_KEYS.cvDraft, JSON.stringify(active.draft));
    } else {
      localStorage.removeItem(KIPRAH_STORAGE_KEYS.cvDraft);
    }
    emitStudyVaultDirty();
    return true;
  } catch {
    return false;
  }
}

export function getActiveCvVersion(collection: CvCollectionState): SavedCvVersion | undefined {
  return collection.items.find((item) => item.id === collection.activeId) ?? collection.items[0];
}

export function createCvVersion(
  collection: CvCollectionState,
  params: { title?: string; targetTrack?: string; draft: CvDraft },
): CvCollectionState {
  if (collection.items.length >= MAX_CV_VERSIONS) return collection;
  const id = makeCvVersionId(collection.items);
  const cloned = cloneCvDraft(params.draft);
  const cleanTrack = params.targetTrack?.trim().slice(0, 60) || undefined;
  const title = params.title?.trim().slice(0, 80) || defaultVersionTitle(cloned, cleanTrack);
  const entry: SavedCvVersion = {
    id,
    title,
    targetTrack: cleanTrack,
    updatedAt: new Date().toISOString(),
    draft: cloned,
  };
  return {
    activeId: id,
    items: [...collection.items, entry],
  };
}

export function duplicateCvVersion(
  collection: CvCollectionState,
  sourceId?: string,
): CvCollectionState {
  if (collection.items.length >= MAX_CV_VERSIONS) return collection;
  const source =
    collection.items.find((item) => item.id === (sourceId ?? collection.activeId)) ?? collection.items[0];
  if (!source) return collection;
  return createCvVersion(collection, {
    title: `${source.title.slice(0, 68)} (Salinan)`,
    targetTrack: source.targetTrack,
    draft: cloneCvDraft(source.draft),
  });
}

export function renameCvVersion(
  collection: CvCollectionState,
  id: string,
  rawTitle: string,
): CvCollectionState {
  const title = rawTitle.replace(/\u2014/g, "-").trim().slice(0, 80);
  if (!title) return collection;
  const now = new Date().toISOString();
  return {
    ...collection,
    items: collection.items.map((item) =>
      item.id === id ? { ...item, title, updatedAt: now } : item,
    ),
  };
}

export function deleteCvVersion(
  collection: CvCollectionState,
  id: string,
): CvCollectionState {
  const nextItems = collection.items.filter((item) => item.id !== id);
  const activeStillExists = nextItems.some((item) => item.id === collection.activeId);
  return {
    activeId: activeStillExists ? collection.activeId : (nextItems[0]?.id ?? ""),
    items: nextItems,
  };
}

export function selectActiveCvVersion(
  collection: CvCollectionState,
  id: string,
): CvCollectionState {
  if (!collection.items.some((item) => item.id === id)) return collection;
  return {
    ...collection,
    activeId: id,
  };
}

export function updateActiveCvDraft(
  collection: CvCollectionState,
  draft: CvDraft,
  targetTrack?: string,
  fallbackTitle?: string,
): CvCollectionState {
  const active = getActiveCvVersion(collection);
  if (!active) {
    return createCvVersion(collection, {
      title: fallbackTitle || defaultVersionTitle(draft, targetTrack),
      targetTrack,
      draft,
    });
  }
  const now = new Date().toISOString();
  const cloned = cloneCvDraft(draft);
  return {
    activeId: active.id,
    items: collection.items.map((item) =>
      item.id === active.id
        ? { ...item, draft: cloned, updatedAt: now }
        : item,
    ),
  };
}
