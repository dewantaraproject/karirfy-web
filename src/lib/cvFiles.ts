function readDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function resolveCvPhotoDataUrl(photo: string): Promise<string> {
  if (!photo) return "";
  if (photo.startsWith("data:image/")) return photo;
  if (typeof window === "undefined" || typeof fetch !== "function") return "";
  try {
    const response = await fetch(photo);
    if (!response.ok) return "";
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return "";
    return await readDataUrl(blob);
  } catch {
    return "";
  }
}

function normalizeMimeBlob(blob: Blob, filename: string): Blob {
  if (blob.type) return blob;
  const lower = filename.toLowerCase();
  const type = lower.endsWith(".pdf")
    ? "application/pdf"
    : lower.endsWith(".docx")
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : lower.endsWith(".png")
        ? "image/png"
        : "application/octet-stream";
  return new Blob([blob], { type });
}

export async function deliverCvFile(
  blob: Blob,
  filename: string,
  isCurrent: () => boolean = () => true,
): Promise<void> {
  if (!isCurrent()) return;
  const normalizedBlob = normalizeMimeBlob(blob, filename);
  const url = URL.createObjectURL(normalizedBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function clearCvExportCache(): Promise<void> {
  // No native filesystem cache on web
}

export async function prepareCvPhoto(file: File): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(file.type) ||
    file.size > 15_000_000
  ) {
    throw new Error("Pilih gambar berukuran maksimal 15 MB.");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 384;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Foto tidak dapat dibuka.");
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 384, 384);
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      384,
      384,
    );
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
