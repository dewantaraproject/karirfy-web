import { deliverCvFile } from "./cvFiles";

export interface ScoreCardMetric {
  label: string;
  value: string;
}

export interface ScoreCardSubtestItem {
  label: string;
  value: string;
  passed?: boolean;
}

export interface ScoreCardSpec {
  eyebrow: string;
  title: string;
  scoreLabel: string;
  scoreValue: string;
  statusBadge: string;
  highlightTone: "crimson" | "navy";
  metrics: ScoreCardMetric[];
  subtests?: ScoreCardSubtestItem[];
  format?: "portrait" | "story";
  footerNote: string;
  filename: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.closePath();
}

export function renderScoreCardCanvas(spec: ScoreCardSpec): HTMLCanvasElement {
  const isStory = spec.format === "story";
  const W = 1080;
  const H = isStory ? 1920 : 1350;
  const padX = isStory ? 72 : 108;
  const panelInset = isStory ? 44 : 56;
  const topOffset = isStory ? 140 : 0;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0A0C12");
  bg.addColorStop(0.55, "#111622");
  bg.addColorStop(1, "#090B10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glowColor =
    spec.highlightTone === "crimson" ? "rgba(211, 24, 24, 0.30)" : "rgba(44, 71, 134, 0.34)";
  const glow = ctx.createRadialGradient(W * 0.78, H * 0.18, 20, W * 0.78, H * 0.18, 660);
  glow.addColorStop(0, glowColor);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  drawRoundedRect(ctx, panelInset, panelInset, W - panelInset * 2, H - panelInset * 2, 48);
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.stroke();

  if (isStory) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "700 28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("KARIRFY BY DEWANTARA PROJECT", padX, 132);
  }

  ctx.fillStyle = "rgba(243, 245, 248, 0.72)";
  ctx.font = "600 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.eyebrow.toUpperCase(), padX, 138 + topOffset);

  const heroY = 176 + topOffset;
  const heroH = isStory ? 500 : 470;
  const heroGrad = ctx.createLinearGradient(padX, heroY, W - padX, heroY + heroH);
  if (spec.highlightTone === "crimson") {
    heroGrad.addColorStop(0, "#D31818");
    heroGrad.addColorStop(1, "#8D0D0D");
  } else {
    heroGrad.addColorStop(0, "#2C4786");
    heroGrad.addColorStop(1, "#16264B");
  }
  drawRoundedRect(ctx, padX, heroY, W - padX * 2, heroH, 38);
  ctx.fillStyle = heroGrad;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.stroke();

  ctx.font = "600 24px -apple-system, BlinkMacSystemFont, sans-serif";
  drawRoundedRect(
    ctx,
    padX + 42,
    heroY + 44,
    Math.min(W - padX * 2 - 84, ctx.measureText(spec.statusBadge).width + 72),
    52,
    26,
  );
  ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(spec.statusBadge, padX + 74, heroY + 79);

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.font = "600 38px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.title.slice(0, 38), padX + 42, heroY + 160);

  ctx.fillStyle = "rgba(255, 255, 255, 0.74)";
  ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.scoreLabel, padX + 42, heroY + 230);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 138px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.scoreValue, padX + 38, heroY + 372);

  let nextSectionY = heroY + heroH + 40;

  if (isStory && spec.subtests?.length) {
    const subs = spec.subtests.slice(0, 3);
    const gap = 18;
    const subW = (W - padX * 2 - gap * (subs.length - 1)) / subs.length;
    subs.forEach((sub, idx) => {
      const sx = padX + idx * (subW + gap);
      drawRoundedRect(ctx, sx, nextSectionY, subW, 152, 28);
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle =
        sub.passed === false ? "rgba(248, 113, 113, 0.45)" : "rgba(255, 255, 255, 0.16)";
      ctx.stroke();

      ctx.fillStyle = "rgba(243, 245, 248, 0.68)";
      ctx.font = "600 22px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(sub.label.slice(0, 14), sx + 24, nextSectionY + 52);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(sub.value, sx + 24, nextSectionY + 110);
    });
    nextSectionY += 188;
  }

  const items = spec.metrics.slice(0, 4);
  const colW = (W - padX * 2 - 24) / 2;
  items.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = padX + col * (colW + 24);
    const y = nextSectionY + row * 196;

    drawRoundedRect(ctx, x, y, colW, 170, 28);
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.stroke();

    ctx.fillStyle = "rgba(243, 245, 248, 0.65)";
    ctx.font = "500 23px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(m.label, x + 30, y + 58);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 44px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(m.value, x + 30, y + 124);
  });

  if (isStory) {
    const ctaY = nextSectionY + 412;
    drawRoundedRect(ctx, padX, ctaY, W - padX * 2, 118, 32);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Siapkan CPNS 2026, BUMN & LPDP di App Store", padX + 34, ctaY + 54);

    ctx.fillStyle = "rgba(243, 245, 248, 0.72)";
    ctx.font = "500 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("karirfy-web.dewantaraproject-id.workers.dev", padX + 34, ctaY + 92);
  }

  const footerLineY = H - (isStory ? 210 : 196);
  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  ctx.fillRect(padX, footerLineY, W - padX * 2, 1.5);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 30px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Karirfy · Persiapan Seleksi Karier", padX, footerLineY + 62);

  ctx.fillStyle = "rgba(243, 245, 248, 0.64)";
  ctx.font = "500 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.footerNote, padX, footerLineY + 100);

  return canvas;
}

export async function shareScoreCardPng(
  spec: ScoreCardSpec,
  isCurrent: () => boolean = () => true,
): Promise<void> {
  const canvas = renderScoreCardCanvas(spec);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal merender gambar skor."))),
      "image/png",
      0.96,
    );
  });
  await deliverCvFile(blob, spec.filename, isCurrent);
}
