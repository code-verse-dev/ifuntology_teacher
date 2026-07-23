import { jsPDF } from "jspdf";
import { ImageUrl } from "@/utils/Functions";

export const PDF = {
  marginX: 14,
  pageWidth: 210,
  pageHeight: 297,
  contentRight: 196,
  contentWidth: 182,
  colors: {
    primary: [26, 77, 140] as [number, number, number],
    primaryLight: [232, 242, 252] as [number, number, number],
    accent: [22, 101, 52] as [number, number, number],
    accentBg: [220, 252, 231] as [number, number, number],
    text: [30, 41, 59] as [number, number, number],
    muted: [100, 116, 139] as [number, number, number],
    line: [203, 213, 225] as [number, number, number],
    rowAlt: [248, 250, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    headerBar: [15, 55, 110] as [number, number, number],
  },
};

type LogoAsset = {
  dataUrl: string;
  width: number;
  height: number;
};

let cachedLogo: LogoAsset | null | undefined;

function getImageNaturalSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** Fit image into a box while preserving aspect ratio. */
export function fitContain(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const ratio = naturalWidth / Math.max(naturalHeight, 1);
  let width = maxWidth;
  let height = width / ratio;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }
  return { width, height };
}

export async function loadLogoAsset(): Promise<LogoAsset | null> {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    const res = await fetch(ImageUrl("logo.png"));
    if (!res.ok) {
      cachedLogo = null;
      return null;
    }
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const size = await getImageNaturalSize(dataUrl);
    cachedLogo = { dataUrl, ...size };
    return cachedLogo;
  } catch {
    cachedLogo = null;
    return null;
  }
}

/** @deprecated Prefer loadLogoAsset for correct sizing. */
export async function loadLogoDataUrl(): Promise<string | null> {
  const logo = await loadLogoAsset();
  return logo?.dataUrl ?? null;
}

export function ensureSpace(pdf: jsPDF, y: number, needed = 28) {
  if (y + needed > PDF.pageHeight - 22) {
    pdf.addPage();
    return 20;
  }
  return y;
}

/** Branded header with logo + title. Returns Y after header. */
export function drawBrandedHeader(
  pdf: jsPDF,
  opts: {
    logo?: LogoAsset | null;
    /** @deprecated use logo */
    logoDataUrl?: string | null;
    title: string;
    subtitle: string;
  }
) {
  const { colors, marginX, contentWidth, pageWidth } = PDF;

  // Top accent bar
  pdf.setFillColor(...colors.headerBar);
  pdf.rect(0, 0, pageWidth, 8, "F");

  // Soft header panel — taller to fit wide logo comfortably
  const panelTop = 12;
  const panelHeight = 36;
  pdf.setFillColor(...colors.primaryLight);
  pdf.roundedRect(marginX, panelTop, contentWidth, panelHeight, 3, 3, "F");

  let textX = marginX + 6;
  const logo = opts.logo;
  if (logo?.dataUrl) {
    try {
      // Wide logo: constrain height, keep natural aspect ratio
      const maxLogoW = 58;
      const maxLogoH = 16;
      const { width: logoW, height: logoH } = fitContain(
        logo.width,
        logo.height,
        maxLogoW,
        maxLogoH
      );
      const logoX = marginX + 5;
      const logoY = panelTop + (panelHeight - logoH) / 2;
      pdf.addImage(logo.dataUrl, "PNG", logoX, logoY, logoW, logoH);
      textX = logoX + logoW + 6;
    } catch {
      // logo optional — continue without it
    }
  } else if (opts.logoDataUrl) {
    // Fallback if only data URL is passed (avoid square stretch: use wide box)
    try {
      const logoW = 48;
      const logoH = 12;
      pdf.addImage(
        opts.logoDataUrl,
        "PNG",
        marginX + 5,
        panelTop + (panelHeight - logoH) / 2,
        logoW,
        logoH
      );
      textX = marginX + 5 + logoW + 6;
    } catch {
      // ignore
    }
  }

  const textBaseline = panelTop + 12;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...colors.primary);
  pdf.text("iFuntology", textX, textBaseline);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...colors.muted);
  pdf.text("Business Builder", textX, textBaseline + 6);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...colors.text);
  pdf.text(opts.title, textX, textBaseline + 14);

  // Meta line under header
  const metaY = panelTop + panelHeight + 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.muted);
  pdf.text(opts.subtitle, marginX, metaY);
  pdf.text(
    `Generated ${new Date().toLocaleString()}`,
    PDF.contentRight,
    metaY,
    { align: "right" }
  );

  pdf.setDrawColor(...colors.line);
  pdf.setLineWidth(0.3);
  pdf.line(marginX, metaY + 3, PDF.contentRight, metaY + 3);

  return metaY + 10;
}

export function drawSectionHeader(pdf: jsPDF, title: string, y: number) {
  y = ensureSpace(pdf, y, 18);
  pdf.setFillColor(...colorsPrimary());
  pdf.roundedRect(PDF.marginX, y - 5, PDF.contentWidth, 9, 1.5, 1.5, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...PDF.colors.white);
  pdf.text(title, PDF.marginX + 4, y + 1.2);
  return y + 10;
}

function colorsPrimary() {
  return PDF.colors.primary;
}

export function drawSubHeader(pdf: jsPDF, title: string, y: number) {
  y = ensureSpace(pdf, y, 12);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...PDF.colors.primary);
  pdf.text(title, PDF.marginX, y);
  pdf.setDrawColor(...PDF.colors.line);
  pdf.setLineWidth(0.2);
  pdf.line(PDF.marginX, y + 1.5, PDF.contentRight, y + 1.5);
  return y + 7;
}

export function drawTableHeader(
  pdf: jsPDF,
  columns: Array<{ label: string; x: number; align?: "left" | "right" }>,
  y: number
) {
  y = ensureSpace(pdf, y, 12);
  pdf.setFillColor(...PDF.colors.rowAlt);
  pdf.roundedRect(PDF.marginX, y - 4, PDF.contentWidth, 7, 1, 1, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...PDF.colors.muted);
  for (const col of columns) {
    pdf.text(col.label, col.x, y, {
      align: col.align ?? "left",
    });
  }
  return y + 5;
}

export function drawKeyValueRow(
  pdf: jsPDF,
  label: string,
  value: string,
  y: number,
  opts?: { bold?: boolean; valueColor?: [number, number, number]; alt?: boolean }
) {
  y = ensureSpace(pdf, y, 10);
  if (opts?.alt) {
    pdf.setFillColor(...PDF.colors.rowAlt);
    pdf.rect(PDF.marginX, y - 3.5, PDF.contentWidth, 6.5, "F");
  }
  pdf.setFont("helvetica", opts?.bold ? "bold" : "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(...PDF.colors.text);
  pdf.text(label, PDF.marginX + 2, y, { maxWidth: 130 });
  pdf.setTextColor(...(opts?.valueColor ?? PDF.colors.text));
  pdf.text(value, PDF.contentRight - 2, y, { align: "right" });
  return y + 6.5;
}

export function drawTotalBanner(
  pdf: jsPDF,
  label: string,
  value: string,
  y: number
) {
  y = ensureSpace(pdf, y, 24);
  pdf.setFillColor(...PDF.colors.accentBg);
  pdf.roundedRect(PDF.marginX, y - 4, PDF.contentWidth, 16, 3, 3, "F");
  pdf.setDrawColor(...PDF.colors.accent);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(PDF.marginX, y - 4, PDF.contentWidth, 16, 3, 3, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...PDF.colors.accent);
  pdf.text(label, PDF.marginX + 6, y + 6);
  pdf.setFontSize(13);
  pdf.text(value, PDF.contentRight - 6, y + 6, { align: "right" });
  return y + 18;
}

export function drawSubtotalRow(pdf: jsPDF, label: string, value: string, y: number) {
  y = ensureSpace(pdf, y, 10);
  pdf.setFillColor(...PDF.colors.primaryLight);
  pdf.roundedRect(PDF.marginX, y - 3.5, PDF.contentWidth, 7, 1, 1, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.primary);
  pdf.text(label, PDF.marginX + 3, y + 1);
  pdf.text(value, PDF.contentRight - 3, y + 1, { align: "right" });
  return y + 9;
}

export function drawEmptyState(pdf: jsPDF, message: string, y: number) {
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.muted);
  pdf.text(message, PDF.marginX + 2, y);
  return y + 8;
}

export function addPageFooters(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setDrawColor(...PDF.colors.line);
    pdf.setLineWidth(0.2);
    pdf.line(PDF.marginX, PDF.pageHeight - 14, PDF.contentRight, PDF.pageHeight - 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text("iFuntology Business Builder", PDF.marginX, PDF.pageHeight - 8);
    pdf.text(`Page ${i} of ${pageCount}`, PDF.contentRight, PDF.pageHeight - 8, {
      align: "right",
    });
  }
}
