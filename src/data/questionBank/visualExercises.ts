import type { QuestionItem, QuestionVisual } from "../../types";

export const ALGEBRA_TOPIC = "Aljabar";
export const VISUAL_ANALYSIS_TOPIC = "Analisis Visual";

function item(type: string, id: string, question: string, answer: string | number, distractors: (string | number)[],
  slot: number, discussion: string, visual?: QuestionVisual): QuestionItem {
  const choices = distractors.map(String);
  choices.splice(slot % (choices.length + 1), 0, String(answer));
  const options = choices.map((text, i) => ({ id: String.fromCharCode(97 + i), text }));
  return { type, id, question, options, correct: options.find(({ text }) => text === String(answer))!.id, discussion, visual };
}

const algebraOffsets = [[-4, -2, 1, 3], [-2, 1, 3, 5], [-3, -1, 2, 4], [-3, -2, -1, 2]];

function symbolAlgebra(i: number): QuestionItem {
  const a = 3 + i % 6;
  const b = 5 + i % 4;
  const c = 2 + i % 5;
  const factor = 2 + i % 2;
  const p = a + b;
  const q = a + b + c;
  const r = factor * a + b + c;
  const query = [1 + i % 3, 2 + i % 2, 1 + i % 2];
  const answer = query[0] * a + query[1] * b + query[2] * c;
  return item(ALGEBRA_TOPIC, `local-algebra-symbol-v1-${i}`,
    "Setiap bentuk punya nilai tetap. Berapa jumlah nilai bentuk pada kotak terakhir?",
    answer, algebraOffsets[i % 4].map((offset) => answer + offset), i,
    `1. Kurangi persamaan kedua dengan pertama: lingkaran dan segitiga habis, sehingga persegi = ${q} − ${p} = ${c}.\n2. Kurangi persamaan ketiga dengan kedua: ${factor - 1} lingkaran bernilai ${r - q}, jadi satu lingkaran bernilai ${a}.\n3. Dari persamaan pertama, segitiga = ${p} − ${a} = ${b}.\n4. Substitusikan ke kotak terakhir: ${query[0]} × ${a} + ${query[1]} × ${b} + ${query[2]} × ${c} = ${answer}.`, {
      kind: "algebra", symbols: ["circle", "triangle", "square"],
      equations: [{ terms: [1, 1, 0], result: p }, { terms: [1, 1, 1], result: q }, { terms: [factor, 1, 1], result: r }],
      query,
    });
}

function textAlgebra(i: number): QuestionItem {
  const x = 11 + i;
  const y = 3 + i % 5;
  const total = x + y;
  const difference = x - y;
  const answer = (i % 2 === 0) ? x : y;
  return item(ALGEBRA_TOPIC, `local-algebra-text-v1-${i}`,
    `Dua kotak berisi total ${total} kartu. Kotak pertama berisi ${difference} kartu lebih banyak daripada kotak kedua. Berapa jumlah kartu di kotak ${i % 2 === 0 ? "pertama" : "kedua"}?`,
    answer, algebraOffsets[(i + 1) % 4].map((offset) => answer + offset), i + 2,
    `1. Misalkan isi kotak kedua adalah y. Kotak pertama berisi y + ${difference}.\n2. Jumlahkan: 2y + ${difference} = ${total}, jadi y = ${y}.\n3. Kotak pertama berisi ${y} + ${difference} = ${x}. Jawaban yang diminta adalah ${answer} kartu.`);
}

function formatSlot(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}.${String(minutes % 60).padStart(2, "0")}`;
}

function schedule(i: number): QuestionItem {
  const start = i >= 6 ? 13 * 60 : 8 * 60;
  const slots = Array.from({ length: 8 }, (_, j) => formatSlot(start + 30 * j));
  const target = 1 + (i * 5) % 6;
  const names = [["Nisa", "Adit", "Rani"], ["Sita", "Fikri", "Dewi"], ["Bima", "Tari", "Eka"]][i % 3];
  const rows = names.map((label, person) => ({
    label,
    free: slots.map((_, slot) => slot === target || slot === target + 1 || (slot + i) % 3 !== person),
  }));
  const distractors = Array.from({ length: 7 }, (_, j) => j).filter((slot) => slot !== target)
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target)).slice(0, 4).map((slot) => slots[slot]);
  return item(VISUAL_ANALYSIS_TOPIC, `local-visual-schedule-v1-${i}`,
    "Setiap kolom mewakili 30 menit. Pukul berapa rapat 60 menit bisa dimulai ketika semua orang tersedia?",
    slots[target], distractors, i,
    `1. Cari kolom yang seluruh barisnya bertanda tersedia.\n2. Hanya slot ${slots[target]} dan ${slots[target + 1]} yang kosong untuk ketiga orang.\n3. Karena perlu dua slot berturut-turut, rapat dimulai pukul ${slots[target]} dan berakhir pukul ${formatSlot(start + 30 * (target + 2))}.`,
    { kind: "schedule", slots, rows });
}

function ranking(i: number): QuestionItem {
  const letters = ["Ayu", "Bagas", "Citra", "Dimas", "Evi"];
  const possibleOrders = [[0, 3, 1, 4, 2], [3, 2, 4, 0, 1], [4, 1, 2, 3, 0], [2, 0, 3, 1, 4]];
  const order = possibleOrders[i % possibleOrders.length].map((index) => letters[index]);
  const [first, second, third, fourth, last] = order;
  const position = 2 + Math.floor(i / possibleOrders.length);
  return item(VISUAL_ANALYSIS_TOPIC, `local-visual-order-v1-${i}`,
    `Lima anggota tim mempresentasikan laporan satu per satu. Siapa yang tampil pada urutan ke-${position}?`,
    order[position - 1], letters.filter((name) => name !== order[position - 1]), i,
    `1. ${second} tepat setelah ${first}, sehingga keduanya menjadi satu pasangan.\n2. ${third} tampil setelah pasangan itu dan sebelum ${fourth}.\n3. ${last} tampil paling akhir. Urutannya ${order.join(" → ")}, jadi posisi ke-${position} adalah ${order[position - 1]}.`, {
      kind: "table", caption: "Petunjuk urutan presentasi", headings: ["Anggota", "Petunjuk"],
      rows: [[last, "Tampil paling akhir"], [third, `Setelah ${second} dan sebelum ${fourth}`], [second, `Tepat setelah ${first}`]],
    });
}

function charts(i: number): QuestionItem {
  const target = 22 + i;
  const values = [target * 2, target, target * 5, target * 2];
  const entries = ["Senin", "Selasa", "Rabu", "Kamis"].map((label, j) => ({
    label, value: values[(j + i) % 4],
  }));
  const selected = entries[Math.floor(i / 3)];
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  const answer = 100 * selected.value / total;
  return item(VISUAL_ANALYSIS_TOPIC, `local-visual-chart-v1-${i}`,
    `Berapa persen pesanan tercatat pada hari ${selected.label} dari total empat hari?`,
    `${answer}%`, [5, 10, 15, 20, 25, 40, 50].filter((value) => value !== answer)
      .sort((a, b) => Math.abs(a - answer) - Math.abs(b - answer)).slice(0, 4).map((value) => `${value}%`), i + 2,
    `1. Jumlah seluruh batang: ${entries.map(({ value }) => value).join(" + ")} = ${total} pesanan.\n2. Hari ${selected.label} mencatat ${selected.value} pesanan.\n3. Bagi jumlah pada hari itu dengan total: ${selected.value} ÷ ${total} × 100% = ${answer}%.`,
    { kind: "bars", caption: "Pesanan yang masuk", unit: "pesanan", entries });
}

function growthTable(i: number): QuestionItem {
  const branches = ["Aruna", "Bela", "Cipta", "Daya"];
  const target = (i + 1) % branches.length;
  const baseline = [100 + 20 * i, 200 + 20 * i, 300 + 20 * i, 400 + 20 * i];
  const rates = [10, 5, 15, 10];
  rates[target] = 20;
  const rows = branches.map((branch, j) => [branch, baseline[j], baseline[j] * (1 + rates[j] / 100)].map((value) =>
    typeof value === "number" ? Math.round(value) : value));
  return item(VISUAL_ANALYSIS_TOPIC, `local-visual-table-v1-${i}`,
    "Cabang mana yang mengalami kenaikan persentase penjualan tertinggi dari periode pertama ke periode kedua?",
    branches[target], branches.filter((branch) => branch !== branches[target]), i + 1,
    `1. Hitung persentase kenaikan setiap cabang: (periode kedua − periode pertama) ÷ periode pertama × 100%.\n2. Hasilnya ${branches.map((branch, j) => `${branch} ${rates[j]}%`).join(", ")}.\n3. Kenaikan tertinggi terjadi di ${branches[target]}. Gunakan persentase karena penjualan awal tiap cabang berbeda.`,
    { kind: "table", caption: "Penjualan per cabang (unit)", headings: ["Cabang", "Periode 1", "Periode 2"], rows });
}

export const visualExerciseBank: Record<string, QuestionItem[]> = {
  [ALGEBRA_TOPIC]: Array.from({ length: 12 }, (_, i) => [symbolAlgebra(i), textAlgebra(i)]).flat(),
  [VISUAL_ANALYSIS_TOPIC]: Array.from({ length: 12 }, (_, i) => [schedule(i), ranking(i), charts(i), growthTable(i)]).flat(),
};
