const palette = {
  dark: {
    "#18181b": "#edf2fc", "#0f172a": "#f2f5ff", "#475569": "#c0cce0",
    "#e4e4e7": "#53627a", "#d4d4d8": "#697890", "#cbd5e1": "#61718b",
    "#ffffff": "#303b50", "#f8fafc": "#35435c", "#f1f5f9": "#34415a", "#e2e8f0": "#596984",
    "#1e3a8a": "#9cbeff", "#1d4ed8": "#7faaff", "#b91c1c": "#ff8d91",
    "#0f766e": "#74cebe", "#6d28d9": "#c6a5ff", "#a16207": "#f4c581",
  },
  light: { "#ffffff": "#f1f5fb", "#f8fafc": "#e7edf6" },
} satisfies Record<string, Record<string, string>>;

/** Theme known inline SVGs as image URLs. Other images keep their original rendering. */
export function themeQuestionSvg(source: string, theme: keyof typeof palette): string {
  const inline = source.match(/^data:image\/svg\+xml(?:;utf8|;charset=utf-8)?,(.*)$/is);
  if (!inline) return source;
  try {
    let svg = decodeURIComponent(inline[1].replace(/%(?![0-9a-f]{2})/gi, "%25"));
    if (!/^\s*<svg\b/i.test(svg)) return source;
    svg = svg.replace(/^(\s*<svg\b[^>]*>)\s*(<rect\b[^>]*\/>)/i, (match, root: string, rect: string) => {
      const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}=['"]([^'"]+)['"]`, "i"))?.[1];
      const white = ["#ffffff", "#fff", "white"].includes(attr(rect, "fill")?.toLowerCase() ?? "");
      const viewBox = attr(root, "viewBox")?.split(/[\s,]+/);
      const full = attr(rect, "width") === (viewBox?.[2] ?? attr(root, "width"))
        && attr(rect, "height") === (viewBox?.[3] ?? attr(root, "height"));
      return white && full && Number(attr(rect, "x") ?? 0) === 0 && Number(attr(rect, "y") ?? 0) === 0 ? root : match;
    }).replace(/\bbackground(?:-color)?\s*:\s*(?:#ffffff|#fff|white)\s*;?/gi, "");
    const colors: Record<string, string> = palette[theme];
    svg = svg.replace(/#[0-9a-f]{6}\b/gi, (color) => colors[color.toLowerCase()] ?? color);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch {
    return source;
  }
}
