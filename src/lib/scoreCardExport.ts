import { deliverCvFile } from "./cvFiles";

export interface ScoreCardMetric {
  label: string;
  value: string;
}

export interface ScoreCardSpec {
  eyebrow: string;
  title: string;
  scoreLabel: string;
  scoreValue: string;
  statusBadge: string;
  highlightTone: "crimson" | "navy";
  metrics: ScoreCardMetric[];
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
  const W = 1080;
  const H = 1350;
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
    spec.highlightTone === "crimson" ? "rgba(211, 24, 24, 0.28)" : "rgba(44, 71, 134, 0.32)";
  const glow = ctx.createRadialGradient(W * 0.78, H * 0.16, 20, W * 0.78, H * 0.16, 620);
  glow.addColorStop(0, glowColor);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  drawRoundedRect(ctx, 56, 56, W - 112, H - 112, 48);
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.stroke();

  ctx.fillStyle = "rgba(243, 245, 248, 0.72)";
  ctx.font = "600 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.eyebrow.toUpperCase(), 108, 138);

  const heroGrad = ctx.createLinearGradient(108, 176, W - 108, 660);
  if (spec.highlightTone === "crimson") {
    heroGrad.addColorStop(0, "#D31818");
    heroGrad.addColorStop(1, "#9B0E0E");
  } else {
    heroGrad.addColorStop(0, "#2C4786");
    heroGrad.addColorStop(1, "#18284E");
  }
  drawRoundedRect(ctx, 108, 176, W - 216, 470, 38);
  ctx.fillStyle = heroGrad;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.stroke();

  drawRoundedRect(ctx, 150, 220, Math.min(720, ctx.measureText(spec.statusBadge).width + 120), 52, 26);
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.statusBadge, 182, 255);

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "600 38px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.title.slice(0, 44), 150, 336);

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.scoreLabel, 150, 405);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 132px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.scoreValue, 146, 545);

  const items = spec.metrics.slice(0, 4);
  const colW = (W - 216 - 24) / 2;
  const startY = 690;
  items.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 108 + col * (colW + 24);
    const y = startY + row * 196;

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

  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  ctx.fillRect(108, H - 196, W - 216, 1.5);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 30px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Karirfy · Persiapan Seleksi Karier", 108, H - 134);

  ctx.fillStyle = "rgba(243, 245, 248, 0.64)";
  ctx.font = "500 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(spec.footerNote, 108, H - 96);

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
