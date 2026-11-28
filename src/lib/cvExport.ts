import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { getCvColumns, type CvDocument, type CvFormat, type CvSection } from "./cv";
import { resolveCvPhotoDataUrl } from "./cvFiles";

function pdfDefinition(cv: CvDocument): TDocumentDefinitions {
  const navy = cv.layout === "navy";
  const yellow = cv.layout === "yellow";
  const portfolio = cv.layout === "portfolio";
  const band = cv.layout === "band";
  const technical = cv.layout === "technical";
  const editorial = cv.layout === "editorial";
  const consulting = cv.layout === "consulting";
  const corporateMt = cv.layout === "corporate_mt";
  const serifAts = cv.layout === "serif_ats";
  const largerBody = band || technical || portfolio || editorial;
  const compactDensity = consulting || serifAts || corporateMt;
  const split = navy || yellow || portfolio;
  const inverseHeader = navy || band;
  const portrait = cv.layout === "portrait" || corporateMt;
  const alignment = cv.layout === "center" || consulting || serifAts ? "center" : "left";
  const accent = yellow ? "#272727" : cv.color;
  const name = ["center", "plain", "portrait", "rose", "yellow", "consulting", "corporate_mt"].includes(cv.layout)
    ? cv.name.toLocaleUpperCase("id")
    : cv.name;
  const { sidebar, body } = getCvColumns(cv);
  const heading: Content[] = [{ text: name, fontSize: cv.layout === "plain" ? 21 : consulting ? 23 : 26, bold: true, italics: editorial, color: inverseHeader ? "#ffffff" : accent, alignment }];
  if (cv.headline) heading.push({ text: cv.headline, fontSize: 11, bold: split || consulting, color: inverseHeader ? "#ffffff" : "#202831", alignment, margin: [0, 3, 0, 0] });
  if (!split && cv.contact.length) heading.push({ text: cv.contact.join(cv.layout === "portrait" ? "\n" : " · "), color: band ? "#ffffff" : "#46515c", fontSize: 9,
    alignment, margin: [0, 5, 0, 0] });
  const rule = (width: number, muted = false): Content => ({
    canvas: [{ type: "line", x1: 0, y1: 0, x2: width, y2: 0, lineWidth: consulting ? 1.0 : 0.75, lineColor: muted ? "#a1adbd" : cv.color }],
    margin: muted ? [0, 0, 0, 4] : [0, 6, 0, 0],
  });
  const sections = (items: CvSection[], inverse = false, narrow = false): Content[] => items.flatMap(({ label, blocks, bullets }) => [
    { text: label.toLocaleUpperCase("id"), bold: true, color: inverse ? "#ffffff" : accent, fontSize: 10.5,
      characterSpacing: 0.55, margin: [0, 7, 0, 3], headlineLevel: 1 } as Content,
    ...(!split ? [rule(511, cv.layout !== "plain" && !portrait && !technical && !band && !consulting)] : []),
    ...blocks.flatMap(({ title, organization, period, lines }): Content[] => [
      ...(narrow && title ? [{ text: title, bold: true, margin: [0, 3, 0, 1] } as Content] : []),
      ...(!narrow && (title || period) ? [{ columns: [{ text: title || "", bold: true, width: "*", color: inverse ? "#ffffff" : "#202831" },
        ...(period ? [{ text: period, width: 92, alignment: "right" as const, fontSize: 8.2, color: editorial || consulting ? accent : inverse ? "#dce8f6" : "#46515c" }] : [])],
        columnGap: 4, margin: [0, 3, 0, 1] } as Content] : []),
      ...(organization || (narrow && period) ? [{ text: [organization, narrow ? period : undefined].filter(Boolean).join(" · "),
        color: inverse ? "#dce8f6" : "#46515c", fontSize: 8.9, margin: [0, 0, 0, 2] } as Content] : []),
      ...(bullets && lines.length && !narrow ? [{ ul: lines, margin: [0, 0, 0, 3] } as Content]
        : lines.map((line): Content => ({ text: line, color: inverse ? "#e0e8f2" : "#202831", margin: [0, 1, 0, 2] }))),
    ]),
  ]);
  let top = heading;
  if (portrait && cv.photo) top = [{ columns: [{ image: cv.photo, fit: [82, 84], width: 94 },
    { stack: heading, width: "*" }], columnGap: 10, margin: [0, 0, 0, 5] }];
  if (band) top = [{
    table: { widths: ["*"], body: [[{ stack: heading, fillColor: accent }]] },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 12, paddingRight: () => 12,
      paddingTop: () => 10, paddingBottom: () => 10 },
  }];
  if (technical) top = [rule(511), ...heading];
  const main = [...(navy ? [] : [...top, ...(!band && !technical && cv.layout !== "plain" ? [rule(split ? 310 : 511)] : [])]), ...sections(body)];
  const side: Content[] = [
    ...(cv.photo ? [{ image: cv.photo, fit: [132, 152], margin: [0, 0, 0, 10] } as Content] : []),
    ...(navy ? heading : []),
    ...(cv.contact.length ? [{ text: "KONTAK", color: navy ? "#fff" : "#272727", bold: true, fontSize: 10, margin: [0, 10, 0, 4] } as Content,
      ...cv.contact.map((text): Content => ({ text, color: navy ? "#e0e8f2" : "#333333", fontSize: 9, margin: [0, 0, 0, 3] }))] : []),
    ...sections(sidebar, navy, true),
  ];
  const mainColumn = { width: "*" as const, stack: main };
  const sideColumn = { width: 133, stack: side };
  return {
    pageSize: "A4",
    pageMargins: [42, portrait ? 30 : 34, 42, portrait ? 30 : 34],
    info: { title: `CV ${cv.name}` },
    defaultStyle: {
      font: "Roboto",
      fontSize: largerBody ? 10.5 : compactDensity ? 9.4 : 9.6,
      lineHeight: largerBody ? 1.16 : 1.09,
      color: "#202831",
    },
    background: split ? (_page, size) => ({
      canvas: [{ type: "rect", x: portfolio ? size.width - 200 : 0, y: 0, w: 200, h: size.height,
        color: navy ? cv.color : portfolio ? "#edf4ef" : "#f1f1f1" }],
    }) : undefined,
    content: split ? [{ columns: portfolio ? [mainColumn, sideColumn] : [sideColumn, mainColumn], columnGap: 35 }] : main,
    pageBreakBefore: (current, following) => Boolean(!split && current.headlineLevel && following.length === 0),
  };
}

async function exportWord(cv: CvDocument): Promise<Blob> {
  const {
    AlignmentType, BorderStyle, Document, HeadingLevel, ImageRun, Packer, Paragraph, Table, TableCell,
    TableRow, TextRun, WidthType, ShadingType, Tab, TabStopType,
  } = await import("docx");
  const pageWidth = 11906;
  const sideMargin = 840;
  const navy = cv.layout === "navy";
  const yellow = cv.layout === "yellow";
  const portfolio = cv.layout === "portfolio";
  const band = cv.layout === "band";
  const technical = cv.layout === "technical";
  const editorial = cv.layout === "editorial";
  const consulting = cv.layout === "consulting";
  const corporateMt = cv.layout === "corporate_mt";
  const serifAts = cv.layout === "serif_ats";
  const largerBody = band || technical || portfolio || editorial;
  const serifFont = editorial || serifAts;
  const rightTabPeriod = editorial || consulting || serifAts;
  const split = navy || yellow || portfolio;
  const inverseHeader = navy || band;
  const portrait = cv.layout === "portrait" || corporateMt;
  const accent = yellow ? "272727" : cv.color.slice(1);
  const align = cv.layout === "center" || consulting || serifAts ? AlignmentType.CENTER : AlignmentType.LEFT;
  const name = ["center", "plain", "portrait", "rose", "yellow", "consulting", "corporate_mt"].includes(cv.layout)
    ? cv.name.toLocaleUpperCase("id")
    : cv.name;
  const { sidebar, body } = getCvColumns(cv);
  const header = [
    new Paragraph({ alignment: align, spacing: { after: 60 },
      border: technical ? { top: { style: BorderStyle.SINGLE, size: 14, color: accent, space: 6 } } : undefined,
      children: [new TextRun({ text: name, bold: true, size: navy ? 42 : cv.layout === "plain" ? 40 : consulting ? 46 : 52,
        font: serifFont ? "Georgia" : undefined, color: inverseHeader ? "FFFFFF" : accent })] }),
  ];
  if (cv.headline) header.push(new Paragraph({
    alignment: align, spacing: { after: 48 }, children: [new TextRun({ text: cv.headline, size: 22, bold: split || consulting, color: inverseHeader ? "FFFFFF" : "202831" })],
  }));
  if (!split && cv.contact.length) header.push(...(cv.layout === "portrait" ? cv.contact : [cv.contact.join(" · ")]).map((text) => new Paragraph({
    alignment: align, spacing: { after: 46 }, children: [new TextRun({ text, size: 18, color: band ? "FFFFFF" : "46515C" })],
  })));

  const paragraphs = (items: CvSection[], inverse = false) => items.flatMap(({ label, blocks, bullets }) => [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: largerBody ? 200 : 175, after: 46 },
      keepNext: true,
      border: { bottom: { style: BorderStyle.SINGLE, size: consulting ? 8 : 4, color: inverse ? "9CACC1" : accent, space: 3 } },
      children: [new TextRun({ text: label.toLocaleUpperCase("id"), color: inverse ? "FFFFFF" : accent, size: 21, bold: true })],
    }),
    ...blocks.flatMap(({ title, organization, period, lines }) => [
      ...(title ? [new Paragraph({ spacing: { before: 65 }, keepNext: Boolean(organization || period || lines.length),
        tabStops: rightTabPeriod ? [{ type: TabStopType.RIGHT, position: pageWidth - 2 * sideMargin }] : undefined,
        children: [new TextRun({ text: title, bold: true, color: inverse ? "FFFFFF" : "202831" }),
          ...(rightTabPeriod && period ? [new TextRun({ children: [new Tab(), period], size: 18, color: editorial ? accent : "46515C" })] : [])] })] : []),
      ...(organization || (period && (!rightTabPeriod || !title)) ? [new Paragraph({ spacing: { after: 48 }, keepNext: Boolean(lines.length),
        children: [new TextRun({ text: [organization, rightTabPeriod && title ? undefined : period].filter(Boolean).join(" · "), size: 18, color: inverse ? "E0E8F2" : "46515C" })] })] : []),
      ...lines.map((text) => new Paragraph({ children: [new TextRun({ text, color: inverse ? "E0E8F2" : "202831" })],
        bullet: bullets ? { level: 0 } : undefined, spacing: { after: 43, line: largerBody ? 269 : 246 } })),
    ]),
  ]);
  const none = { style: BorderStyle.NONE };
  const borders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
  const photoBase64 = cv.photo.includes(",") ? cv.photo.split(",")[1] : "";
  const photo = (size: number) => new Paragraph({ spacing: { after: 120 }, children: [new ImageRun({
    type: cv.photo.startsWith("data:image/png") ? "png" : "jpg",
    data: Uint8Array.from(atob(photoBase64), (char) => char.charCodeAt(0)),
    transformation: { width: size, height: size },
  })] });
  const photoHeader = portrait && photoBase64 ? new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders,
    rows: [new TableRow({ children: [new TableCell({ width: { size: 21, type: WidthType.PERCENTAGE }, children: [photo(108)] }),
      new TableCell({ width: { size: 79, type: WidthType.PERCENTAGE }, children: header })] })],
  }) : undefined;
  const bandHeader = band ? new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders,
    rows: [new TableRow({ children: [new TableCell({ shading: { type: ShadingType.CLEAR, fill: accent },
      margins: { top: 170, bottom: 170, left: 240, right: 240 }, children: header })] })],
  }) : undefined;
  const customHeader = photoHeader ?? bandHeader;
  const content = [...(navy ? [] : customHeader ? [customHeader] : header), ...paragraphs(body)];
  const side = [
    ...(photoBase64 ? [photo(138)] : []),
    ...(navy ? header : []),
    ...paragraphs(cv.contact.length ? [{ label: "Kontak", blocks: [{ lines: cv.contact }] }, ...sidebar] : sidebar, navy),
  ];
  let columns: InstanceType<typeof Table> | undefined;
  if (split) {
    const sideCell = new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: navy ? accent : portfolio ? "EDF4EF" : "F1F1F1" },
      margins: { top: 270, bottom: 240, left: 240, right: 240 }, children: side.length ? side : [new Paragraph("")] });
    const mainCell = new TableCell({ width: { size: 67, type: WidthType.PERCENTAGE },
      margins: { top: 170, left: portfolio ? 55 : 300, right: portfolio ? 300 : 55 }, children: content });
    columns = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders,
      rows: [new TableRow({ children: portfolio ? [mainCell, sideCell] : [sideCell, mainCell] })] });
  }
  const wordBlob = await Packer.toBlob(new Document({
    title: `CV ${cv.name}`,
    styles: { default: { document: { run: { font: serifFont ? "Georgia" : "Calibri", size: largerBody ? 22 : 20, color: "202831" } } } },
    sections: [{
      properties: { page: { size: { width: pageWidth, height: 16838 }, margin: { top: 800, right: sideMargin, bottom: 800, left: sideMargin } } },
      children: columns ? [columns] : content,
    }],
  }));
  return wordBlob.type
    ? wordBlob
    : new Blob([wordBlob], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

async function exportPdf(cv: CvDocument): Promise<Blob> {
  const [{ default: pdfmake }, { default: fonts }] = await Promise.all([
    import("pdfmake/build/pdfmake.js"), import("pdfmake/build/vfs_fonts.js"),
  ]);
  const pdf = pdfmake.createPdf(pdfDefinition(cv), {}, { Roboto: {
    normal: "Roboto-Regular.ttf", bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf", bolditalics: "Roboto-MediumItalic.ttf",
  } }, fonts);
  if (typeof window !== "undefined" && typeof document !== "undefined" && typeof pdf.getBlob === "function") {
    return new Promise<Blob>((resolve, reject) => {
      try {
        pdf.getBlob((blob: Blob) => {
          resolve(blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" }));
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  return new Promise((resolve, reject) => {
    const stream = pdf.getStream();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    stream.on("data", (chunk: Uint8Array) => { chunks.push(new Uint8Array(chunk)); });
    stream.on("error", reject);
    stream.on("end", () => resolve(new Blob(chunks, { type: "application/pdf" })));
    stream.end();
  });
}

export async function exportCv(cv: CvDocument, format: CvFormat): Promise<Blob> {
  const resolvedPhoto = cv.photo ? await resolveCvPhotoDataUrl(cv.photo) : "";
  let documentCv: CvDocument = { ...cv, photo: resolvedPhoto };
  if (documentCv.layout === "yellow" && documentCv.photo && typeof document !== "undefined") {
    try {
      const image = new Image();
      image.src = documentCv.photo;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 384;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(384, 0);
        ctx.lineTo(384, 192);
        ctx.arc(192, 192, 192, 0, Math.PI);
        ctx.closePath();
        ctx.clip();
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        ctx.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 384, 384);
        documentCv = { ...documentCv, photo: canvas.toDataURL("image/png") };
      }
    } catch {
      documentCv = { ...documentCv, photo: "" };
    }
  }
  return format === "pdf" ? exportPdf(documentCv) : exportWord(documentCv);
}
