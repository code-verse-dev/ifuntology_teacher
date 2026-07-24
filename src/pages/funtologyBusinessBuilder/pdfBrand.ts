import { jsPDF } from "jspdf";
import { ImageUrl } from "@/utils/Functions";

/** RGB helpers aligned with Business Builder UI (slate + violet/fuchsia + brand green). */
export const PDF = {
  marginX: 12,
  pageWidth: 210,
  pageHeight: 297,
  contentRight: 198,
  contentWidth: 186,
  colors: {
    brand: [128, 193, 31] as [number, number, number],
    brandDark: [90, 140, 18] as [number, number, number],
    brandSoft: [236, 252, 203] as [number, number, number],
    primary: [109, 40, 217] as [number, number, number], // violet-700
    primaryLight: [245, 243, 255] as [number, number, number], // violet-50
    violet: [139, 92, 246] as [number, number, number],
    fuchsia: [217, 70, 239] as [number, number, number],
    pink: [236, 72, 153] as [number, number, number],
    accent: [5, 150, 105] as [number, number, number], // emerald-600
    accentBg: [209, 250, 229] as [number, number, number],
    slate900: [15, 23, 42] as [number, number, number],
    slate800: [30, 41, 59] as [number, number, number],
    slate700: [51, 65, 85] as [number, number, number],
    text: [15, 23, 42] as [number, number, number],
    muted: [100, 116, 139] as [number, number, number],
    line: [226, 232, 240] as [number, number, number],
    rowAlt: [248, 250, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    cardBorder: [226, 232, 240] as [number, number, number],
    softPage: [250, 250, 252] as [number, number, number],
  },
};

type Rgb = [number, number, number];

type LogoAsset = {
  dataUrl: string;
  width: number;
  height: number;
};

let cachedLogo: LogoAsset | null | undefined;

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(from: Rgb, to: Rgb, t: number): Rgb {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

/** Approximate a horizontal gradient with thin vertical strips. */
export function fillHorizontalGradient(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  from: Rgb,
  to: Rgb,
  steps = 28
) {
  const stepW = w / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / Math.max(steps - 1, 1);
    pdf.setFillColor(...lerpRgb(from, to, t));
    pdf.rect(x + i * stepW, y, stepW + 0.15, h, "F");
  }
}

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
    // Soft page wash on continuation pages
    pdf.setFillColor(...PDF.colors.softPage);
    pdf.rect(0, 0, PDF.pageWidth, PDF.pageHeight, "F");
    return 18;
  }
  return y;
}

function drawAccentDot(pdf: jsPDF, x: number, y: number, color: Rgb) {
  pdf.setFillColor(...color);
  pdf.circle(x, y, 1.4, "F");
}

/** Full-bleed dark hero header matching the estimate summary card. */
export function drawBrandedHeader(
  pdf: jsPDF,
  opts: {
    logo?: LogoAsset | null;
    logoDataUrl?: string | null;
    title: string;
    subtitle: string;
  }
) {
  const { colors, pageWidth } = PDF;

  // Soft page background
  pdf.setFillColor(...colors.softPage);
  pdf.rect(0, 0, pageWidth, PDF.pageHeight, "F");

  // Top fuchsia → violet ribbon
  fillHorizontalGradient(
    pdf,
    0,
    0,
    pageWidth,
    4.5,
    colors.fuchsia,
    colors.violet,
    36
  );

  // Dark hero panel
  const heroH = 42;
  fillHorizontalGradient(
    pdf,
    0,
    4.5,
    pageWidth,
    heroH,
    colors.slate900,
    colors.slate800,
    40
  );

  // Decorative soft accent shapes (right side of hero)
  pdf.setFillColor(76, 29, 149); // violet-900-ish on dark
  pdf.circle(pageWidth - 16, 20, 14, "F");
  pdf.setFillColor(112, 26, 117);
  pdf.circle(pageWidth - 40, 40, 9, "F");
  pdf.setFillColor(...colors.slate800);
  pdf.circle(pageWidth - 16, 20, 10, "F");
  pdf.circle(pageWidth - 40, 40, 6, "F");

  let textX = PDF.marginX + 2;
  const logo = opts.logo;
  if (logo?.dataUrl) {
    try {
      const maxLogoW = 52;
      const maxLogoH = 14;
      const { width: logoW, height: logoH } = fitContain(
        logo.width,
        logo.height,
        maxLogoW,
        maxLogoH
      );
      // White pill behind logo for contrast on dark hero
      pdf.setFillColor(...colors.white);
      pdf.roundedRect(
        PDF.marginX,
        12,
        logoW + 6,
        logoH + 5,
        2,
        2,
        "F"
      );
      pdf.addImage(
        logo.dataUrl,
        "PNG",
        PDF.marginX + 3,
        14.5,
        logoW,
        logoH
      );
      textX = PDF.marginX + logoW + 12;
    } catch {
      // continue without logo
    }
  } else if (opts.logoDataUrl) {
    try {
      const logoW = 44;
      const logoH = 11;
      pdf.setFillColor(...colors.white);
      pdf.roundedRect(PDF.marginX, 12, logoW + 6, logoH + 5, 2, 2, "F");
      pdf.addImage(
        opts.logoDataUrl,
        "PNG",
        PDF.marginX + 3,
        14.5,
        logoW,
        logoH
      );
      textX = PDF.marginX + logoW + 12;
    } catch {
      // ignore
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...colors.fuchsia);
  pdf.text("IFUNTOLOGY  ·  BUSINESS BUILDER", textX, 16);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(...colors.white);
  pdf.text(opts.title, textX, 26);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(203, 213, 225);
  pdf.text(opts.subtitle, textX, 33, { maxWidth: 120 });

  // Date chip on the right
  const dateLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  pdf.setFillColor(...colors.slate700);
  const chipW = Math.max(28, dateLabel.length * 1.9 + 8);
  pdf.roundedRect(pageWidth - PDF.marginX - chipW, 18, chipW, 8, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.white);
  pdf.text(dateLabel, pageWidth - PDF.marginX - chipW / 2, 23.2, {
    align: "center",
  });

  // Bottom brand accent under hero
  fillHorizontalGradient(
    pdf,
    0,
    4.5 + heroH,
    pageWidth,
    2,
    colors.brand,
    colors.violet,
    24
  );

  return 4.5 + heroH + 10;
}

export function drawSectionHeader(
  pdf: jsPDF,
  title: string,
  y: number,
  opts?: { accent?: Rgb }
) {
  const accent = opts?.accent ?? PDF.colors.violet;
  y = ensureSpace(pdf, y, 16);

  // Soft lavender panel
  pdf.setFillColor(...PDF.colors.primaryLight);
  pdf.roundedRect(PDF.marginX, y - 4, PDF.contentWidth, 11, 2.5, 2.5, "F");

  // Left accent bar
  pdf.setFillColor(...accent);
  pdf.roundedRect(PDF.marginX, y - 4, 2.2, 11, 1, 1, "F");

  drawAccentDot(pdf, PDF.marginX + 7, y + 1.5, accent);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...PDF.colors.slate900);
  pdf.text(title, PDF.marginX + 11, y + 2.2);
  return y + 12;
}

export function drawSubHeader(pdf: jsPDF, title: string, y: number) {
  y = ensureSpace(pdf, y, 12);
  pdf.setFillColor(...PDF.colors.white);
  pdf.setDrawColor(...PDF.colors.cardBorder);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(PDF.marginX, y - 3.5, PDF.contentWidth, 8, 1.5, 1.5, "FD");

  pdf.setFillColor(...PDF.colors.fuchsia);
  pdf.roundedRect(PDF.marginX + 2, y - 1.5, 1.6, 4, 0.6, 0.6, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.primary);
  pdf.text(title, PDF.marginX + 7, y + 1.5);
  return y + 8;
}

export function drawTableHeader(
  pdf: jsPDF,
  columns: Array<{ label: string; x: number; align?: "left" | "right" }>,
  y: number
) {
  y = ensureSpace(pdf, y, 12);
  fillHorizontalGradient(
    pdf,
    PDF.marginX,
    y - 4,
    PDF.contentWidth,
    7.5,
    PDF.colors.slate800,
    PDF.colors.slate700,
    20
  );
  // Clip corners visually with white corners (approx)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(203, 213, 225);
  for (const col of columns) {
    pdf.text(col.label, col.x, y + 0.5, {
      align: col.align ?? "left",
    });
  }
  // Extra gap so the first data row does not sit flush under the header
  return y + 10;
}

export function drawKeyValueRow(
  pdf: jsPDF,
  label: string,
  value: string,
  y: number,
  opts?: { bold?: boolean; valueColor?: Rgb; alt?: boolean }
) {
  y = ensureSpace(pdf, y, 10);
  if (opts?.alt) {
    pdf.setFillColor(...PDF.colors.rowAlt);
    pdf.roundedRect(PDF.marginX, y - 3.2, PDF.contentWidth, 6.8, 1, 1, "F");
  }
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.muted);
  pdf.text(label, PDF.marginX + 3.5, y, { maxWidth: 118 });
  pdf.setFont("helvetica", opts?.bold ? "bold" : "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(...(opts?.valueColor ?? PDF.colors.text));
  pdf.text(value, PDF.contentRight - 3.5, y, { align: "right" });
  return y + 7;
}

/** KPI / snapshot cards — similar to student budget + estimate stats. */
export function drawMetricCards(
  pdf: jsPDF,
  cards: Array<{
    label: string;
    value: string;
    tone?: "violet" | "emerald" | "fuchsia" | "sky" | "brand";
  }>,
  y: number
) {
  const gap = 4;
  const n = Math.max(cards.length, 1);
  const cardW = (PDF.contentWidth - gap * (n - 1)) / n;
  const cardH = 22;
  y = ensureSpace(pdf, y, cardH + 6);

  const tones: Record<string, { bg: Rgb; accent: Rgb; value: Rgb }> = {
    violet: {
      bg: [245, 243, 255],
      accent: PDF.colors.violet,
      value: PDF.colors.primary,
    },
    emerald: {
      bg: [236, 253, 245],
      accent: PDF.colors.accent,
      value: PDF.colors.accent,
    },
    fuchsia: {
      bg: [253, 244, 255],
      accent: PDF.colors.fuchsia,
      value: [162, 28, 175],
    },
    sky: {
      bg: [240, 249, 255],
      accent: [14, 165, 233],
      value: [3, 105, 161],
    },
    brand: {
      bg: PDF.colors.brandSoft,
      accent: PDF.colors.brand,
      value: PDF.colors.brandDark,
    },
  };

  cards.forEach((card, i) => {
    const tone = tones[card.tone ?? "violet"];
    const x = PDF.marginX + i * (cardW + gap);
    pdf.setFillColor(...tone.bg);
    pdf.roundedRect(x, y - 3, cardW, cardH, 3, 3, "F");
    pdf.setFillColor(...tone.accent);
    pdf.roundedRect(x, y - 3, 2.2, cardH, 1, 1, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text(card.label.toUpperCase(), x + 6, y + 3);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...tone.value);
    pdf.text(card.value, x + 6, y + 13, { maxWidth: cardW - 10 });
  });

  return y + cardH + 4;
}

/** Dark grand-total banner like the UI slate/fuchsia card. */
export function drawTotalBanner(
  pdf: jsPDF,
  label: string,
  value: string,
  y: number,
  opts?: { hint?: string }
) {
  y = ensureSpace(pdf, y, 30);
  const h = opts?.hint ? 24 : 20;

  fillHorizontalGradient(
    pdf,
    PDF.marginX,
    y - 3,
    PDF.contentWidth,
    h,
    PDF.colors.slate900,
    PDF.colors.slate800,
    32
  );

  // Fuchsia accent strip on left
  fillHorizontalGradient(
    pdf,
    PDF.marginX,
    y - 3,
    3,
    h,
    PDF.colors.fuchsia,
    PDF.colors.violet,
    6
  );

  // Accent pill
  pdf.setFillColor(...PDF.colors.fuchsia);
  pdf.roundedRect(PDF.marginX + 8, y + 1, 4, 4, 1, 1, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(244, 114, 182); // pink-400
  pdf.text(label.toUpperCase(), PDF.marginX + 16, y + 4);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...PDF.colors.white);
  pdf.text(value, PDF.contentRight - 6, y + (opts?.hint ? 8 : 10), {
    align: "right",
  });

  if (opts?.hint) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text(opts.hint, PDF.marginX + 16, y + 14);
  }

  return y + h + 6;
}

export function drawSubtotalRow(
  pdf: jsPDF,
  label: string,
  value: string,
  y: number
) {
  y = ensureSpace(pdf, y, 10);
  pdf.setFillColor(...PDF.colors.primaryLight);
  pdf.roundedRect(PDF.marginX, y - 3.2, PDF.contentWidth, 8, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.primary);
  pdf.text(label, PDF.marginX + 4, y + 1.5);
  pdf.text(value, PDF.contentRight - 4, y + 1.5, { align: "right" });
  return y + 10;
}

export function drawEmptyState(pdf: jsPDF, message: string, y: number) {
  y = ensureSpace(pdf, y, 12);
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(PDF.marginX, y - 3, PDF.contentWidth, 10, 2, 2, "F");
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.muted);
  pdf.text(message, PDF.marginX + 4, y + 2.5);
  return y + 12;
}

/** Soft bordered card for grouping key/value rows (returns y for first row). */
export function beginInfoCard(pdf: jsPDF, y: number, estimatedHeight: number) {
  y = ensureSpace(pdf, y, Math.min(estimatedHeight, 40));
  return y;
}

export function drawBlockTitle(pdf: jsPDF, title: string, y: number) {
  y = ensureSpace(pdf, y, 12);
  pdf.setFillColor(...PDF.colors.white);
  pdf.setDrawColor(...PDF.colors.cardBorder);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(PDF.marginX, y - 3, PDF.contentWidth, 9, 2, 2, "FD");
  pdf.setFillColor(...PDF.colors.violet);
  pdf.circle(PDF.marginX + 6, y + 1.5, 1.5, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.slate800);
  pdf.text(title, PDF.marginX + 11, y + 2.2);
  return y + 9;
}

export function addPageFooters(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    // Accent footer line
    fillHorizontalGradient(
      pdf,
      PDF.marginX,
      PDF.pageHeight - 15,
      PDF.contentWidth,
      0.7,
      PDF.colors.violet,
      PDF.colors.fuchsia,
      20
    );
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...PDF.colors.violet);
    pdf.text("iFuntology", PDF.marginX, PDF.pageHeight - 9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text("  Business Builder Report", PDF.marginX + 16, PDF.pageHeight - 9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PDF.colors.slate700);
    pdf.text(`Page ${i} of ${pageCount}`, PDF.contentRight, PDF.pageHeight - 9, {
      align: "right",
    });
  }
}
