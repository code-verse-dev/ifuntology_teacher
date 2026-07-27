import { jsPDF } from "jspdf";
import { ImageUrl } from "@/utils/Functions";

type Rgb = [number, number, number];

/** Navy / gold salon-report palette matching the Business Builder PDF mockup. */
export const PDF = {
  marginX: 12,
  pageWidth: 210,
  pageHeight: 297,
  contentRight: 198,
  contentWidth: 186,
  footerH: 18,
  colors: {
    navy: [15, 32, 56] as Rgb,
    navyMid: [26, 48, 80] as Rgb,
    navySoft: [232, 238, 247] as Rgb,
    gold: [201, 162, 39] as Rgb,
    goldDark: [168, 130, 20] as Rgb,
    goldSoft: [252, 244, 214] as Rgb,
    teal: [15, 148, 136] as Rgb,
    tealSoft: [224, 247, 244] as Rgb,
    orange: [234, 120, 48] as Rgb,
    orangeSoft: [255, 237, 223] as Rgb,
    green: [34, 160, 90] as Rgb,
    greenSoft: [226, 247, 233] as Rgb,
    sky: [56, 140, 200] as Rgb,
    skySoft: [227, 241, 252] as Rgb,
    purple: [124, 92, 191] as Rgb,
    purpleSoft: [239, 233, 252] as Rgb,
    olive: [110, 140, 50] as Rgb,
    oliveSoft: [236, 244, 220] as Rgb,
    brand: [128, 193, 31] as Rgb,
    brandDark: [90, 140, 18] as Rgb,
    brandSoft: [236, 252, 203] as Rgb,
    // aliases used by shared helpers
    primary: [15, 32, 56] as Rgb,
    primaryLight: [232, 238, 247] as Rgb,
    violet: [26, 48, 80] as Rgb,
    fuchsia: [201, 162, 39] as Rgb,
    pink: [234, 120, 48] as Rgb,
    accent: [34, 160, 90] as Rgb,
    accentBg: [226, 247, 233] as Rgb,
    slate900: [15, 32, 56] as Rgb,
    slate800: [26, 48, 80] as Rgb,
    slate700: [51, 70, 100] as Rgb,
    text: [22, 35, 55] as Rgb,
    muted: [100, 116, 139] as Rgb,
    line: [214, 222, 234] as Rgb,
    rowAlt: [246, 248, 252] as Rgb,
    white: [255, 255, 255] as Rgb,
    cardBorder: [214, 222, 234] as Rgb,
    softPage: [248, 250, 253] as Rgb,
  },
};

/** Per-category accent colors for estimate cards. */
export const CATEGORY_PALETTES: Record<
  string,
  { accent: Rgb; soft: Rgb; header: Rgb }
> = {
  "Business Registration & Licensing": {
    accent: [79, 70, 229],
    soft: [238, 242, 255],
    header: [79, 70, 229],
  },
  "Building & Construction": {
    accent: [234, 120, 48],
    soft: [255, 237, 223],
    header: [234, 120, 48],
  },
  "Counters, Cabinets, Sinks & Storage": {
    accent: [15, 148, 136],
    soft: [224, 247, 244],
    header: [15, 148, 136],
  },
  "Reception Area": {
    accent: [56, 140, 200],
    soft: [227, 241, 252],
    header: [56, 140, 200],
  },
  "Salon Furniture": {
    accent: [225, 29, 72],
    soft: [255, 228, 230],
    header: [225, 29, 72],
  },
  "Barber Equipment": {
    accent: [71, 85, 105],
    soft: [241, 245, 249],
    header: [71, 85, 105],
  },
  "Cosmetology Tools": {
    accent: [219, 39, 119],
    soft: [252, 231, 243],
    header: [219, 39, 119],
  },
  "Nail Equipment": {
    accent: [192, 38, 211],
    soft: [250, 232, 255],
    header: [192, 38, 211],
  },
  "Skincare Equipment": {
    accent: [8, 145, 178],
    soft: [207, 250, 254],
    header: [8, 145, 178],
  },
  "Laundry & Cleaning": {
    accent: [37, 99, 235],
    soft: [219, 234, 254],
    header: [37, 99, 235],
  },
  "Safety & Sanitation": {
    accent: [101, 163, 13],
    soft: [236, 252, 203],
    header: [101, 163, 13],
  },
  Technology: {
    accent: [124, 58, 237],
    soft: [237, 233, 254],
    header: [124, 58, 237],
  },
  Marketing: {
    accent: [234, 88, 12],
    soft: [255, 237, 213],
    header: [234, 88, 12],
  },
  Insurance: {
    accent: [87, 83, 78],
    soft: [245, 245, 244],
    header: [87, 83, 78],
  },
  Utilities: {
    accent: [5, 150, 105],
    soft: [209, 250, 229],
    header: [5, 150, 105],
  },
  "Professional Services": {
    accent: [124, 92, 191],
    soft: [239, 233, 252],
    header: [124, 92, 191],
  },
};

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

export async function loadLogoDataUrl(): Promise<string | null> {
  const logo = await loadLogoAsset();
  return logo?.dataUrl ?? null;
}

export function ensureSpace(pdf: jsPDF, y: number, needed = 28) {
  if (y + needed > PDF.pageHeight - PDF.footerH - 8) {
    pdf.addPage();
    pdf.setFillColor(...PDF.colors.softPage);
    pdf.rect(0, 0, PDF.pageWidth, PDF.pageHeight, "F");
    return 16;
  }
  return y;
}

/** Draw a simple glyph inside a circle (used for KPI / section icons). */
function drawCircleIcon(
  pdf: jsPDF,
  cx: number,
  cy: number,
  r: number,
  fill: Rgb,
  kind: "dollar" | "cart" | "chair" | "list" | "user" | "calc" | "briefcase" | "wallet" | "check"
) {
  pdf.setFillColor(...fill);
  pdf.circle(cx, cy, r, "F");
  pdf.setDrawColor(...PDF.colors.white);
  pdf.setTextColor(...PDF.colors.white);
  pdf.setFont("helvetica", "bold");

  if (kind === "dollar") {
    pdf.setFontSize(r * 1.6);
    pdf.text("$", cx, cy + r * 0.35, { align: "center" });
  } else if (kind === "cart") {
    pdf.setLineWidth(0.55);
    pdf.setDrawColor(...PDF.colors.white);
    pdf.roundedRect(cx - r * 0.45, cy - r * 0.25, r * 0.9, r * 0.45, 0.4, 0.4, "D");
    pdf.circle(cx - r * 0.2, cy + r * 0.45, 0.55, "F");
    pdf.circle(cx + r * 0.25, cy + r * 0.45, 0.55, "F");
  } else if (kind === "chair") {
    pdf.setLineWidth(0.55);
    pdf.setDrawColor(...PDF.colors.white);
    pdf.line(cx - r * 0.35, cy - r * 0.15, cx + r * 0.35, cy - r * 0.15);
    pdf.line(cx - r * 0.35, cy - r * 0.15, cx - r * 0.35, cy + r * 0.4);
    pdf.line(cx + r * 0.35, cy - r * 0.15, cx + r * 0.35, cy + r * 0.4);
    pdf.line(cx - r * 0.15, cy - r * 0.15, cx - r * 0.15, cy - r * 0.45);
  } else if (kind === "list") {
    pdf.setFontSize(r * 1.1);
    pdf.text("≡", cx, cy + r * 0.3, { align: "center" });
  } else if (kind === "user") {
    pdf.setFillColor(...PDF.colors.white);
    pdf.circle(cx, cy - r * 0.2, r * 0.28, "F");
    pdf.ellipse(cx, cy + r * 0.35, r * 0.42, r * 0.28, "F");
  } else if (kind === "calc") {
    pdf.setFontSize(r * 1.3);
    pdf.text("#", cx, cy + r * 0.32, { align: "center" });
  } else if (kind === "briefcase") {
    pdf.setFillColor(...PDF.colors.white);
    pdf.roundedRect(cx - r * 0.45, cy - r * 0.15, r * 0.9, r * 0.55, 0.4, 0.4, "F");
    pdf.setDrawColor(...fill);
    pdf.setLineWidth(0.4);
    pdf.line(cx - r * 0.15, cy - r * 0.15, cx - r * 0.15, cy - r * 0.35);
    pdf.line(cx + r * 0.15, cy - r * 0.15, cx + r * 0.15, cy - r * 0.35);
    pdf.line(cx - r * 0.15, cy - r * 0.35, cx + r * 0.15, cy - r * 0.35);
  } else if (kind === "wallet") {
    pdf.setFontSize(r * 1.35);
    pdf.text("W", cx, cy + r * 0.32, { align: "center" });
  } else if (kind === "check") {
    pdf.setFontSize(r * 1.4);
    pdf.text("✓", cx, cy + r * 0.35, { align: "center" });
  }
}

/** Full-bleed navy header with logo, title, gold date badge, gold diagonal accent. */
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

  pdf.setFillColor(...colors.softPage);
  pdf.rect(0, 0, pageWidth, PDF.pageHeight, "F");

  const heroH = 48;

  // Navy hero
  pdf.setFillColor(...colors.navy);
  pdf.rect(0, 0, pageWidth, heroH, "F");

  // Gold diagonal accent (right side)
  pdf.setFillColor(...colors.gold);
  pdf.triangle(
    pageWidth - 42,
    0,
    pageWidth,
    0,
    pageWidth,
    28,
    "F"
  );
  pdf.setFillColor(...colors.goldDark);
  pdf.triangle(
    pageWidth - 28,
    0,
    pageWidth,
    0,
    pageWidth,
    16,
    "F"
  );

  // Thin gold underline
  pdf.setFillColor(...colors.gold);
  pdf.rect(0, heroH, pageWidth, 2.2, "F");

  // Logo on white rounded panel
  let textX = PDF.marginX + 2;
  const logo = opts.logo;
  if (logo?.dataUrl) {
    try {
      const maxLogoW = 48;
      const maxLogoH = 13;
      const { width: logoW, height: logoH } = fitContain(
        logo.width,
        logo.height,
        maxLogoW,
        maxLogoH
      );
      pdf.setFillColor(...colors.white);
      pdf.roundedRect(PDF.marginX, 10, logoW + 7, logoH + 6, 2.5, 2.5, "F");
      pdf.addImage(logo.dataUrl, "PNG", PDF.marginX + 3.5, 13, logoW, logoH);
      textX = PDF.marginX + logoW + 14;
    } catch {
      // continue without logo
    }
  } else if (opts.logoDataUrl) {
    try {
      const logoW = 42;
      const logoH = 11;
      pdf.setFillColor(...colors.white);
      pdf.roundedRect(PDF.marginX, 10, logoW + 7, logoH + 6, 2.5, 2.5, "F");
      pdf.addImage(opts.logoDataUrl, "PNG", PDF.marginX + 3.5, 13, logoW, logoH);
      textX = PDF.marginX + logoW + 14;
    } catch {
      // ignore
    }
  } else {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...colors.gold);
    pdf.text("iFuntology", PDF.marginX, 18);
    textX = PDF.marginX + 38;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...colors.white);
  pdf.text(opts.title, textX, 20);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(186, 200, 220);
  pdf.text(opts.subtitle, textX, 28, { maxWidth: 95 });

  // Date badge (gold-bordered navy pill)
  const dateLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const chipW = Math.max(34, dateLabel.length * 2.15 + 16);
  const chipX = pageWidth - PDF.marginX - chipW - 4;
  pdf.setFillColor(...colors.navyMid);
  pdf.setDrawColor(...colors.gold);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(chipX, 16, chipW, 10, 3, 3, "FD");
  // Mini calendar glyph
  pdf.setFillColor(...colors.gold);
  pdf.roundedRect(chipX + 3.5, 18.2, 4.2, 5.2, 0.6, 0.6, "F");
  pdf.setFillColor(...colors.navy);
  pdf.rect(chipX + 3.5, 18.2, 4.2, 1.4, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.white);
  pdf.text(dateLabel, chipX + 10.5, 22.5);

  return heroH + 10;
}

/** Navy section bar with optional icon kind. */
export function drawSectionHeader(
  pdf: jsPDF,
  title: string,
  y: number,
  opts?: {
    accent?: Rgb;
    icon?:
      | "user"
      | "calc"
      | "briefcase"
      | "wallet"
      | "check"
      | "list"
      | "dollar"
      | "chair"
      | "cart";
    gold?: boolean;
  }
) {
  y = ensureSpace(pdf, y, 16);
  const h = 10;
  if (opts?.gold) {
    pdf.setFillColor(...PDF.colors.gold);
  } else {
    pdf.setFillColor(...(opts?.accent ?? PDF.colors.navy));
  }
  pdf.roundedRect(PDF.marginX, y - 3, PDF.contentWidth, h, 2, 2, "F");

  if (opts?.icon) {
    const iconFill = opts.gold ? PDF.colors.navy : PDF.colors.gold;
    drawCircleIcon(pdf, PDF.marginX + 7, y + 2, 3.2, iconFill, opts.icon);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...(opts.gold ? PDF.colors.navy : PDF.colors.white));
    pdf.text(title.toUpperCase(), PDF.marginX + 14, y + 3.2);
  } else {
    pdf.setFillColor(...(opts?.gold ? PDF.colors.navy : PDF.colors.gold));
    pdf.circle(PDF.marginX + 6, y + 2, 1.4, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...(opts?.gold ? PDF.colors.navy : PDF.colors.white));
    pdf.text(title.toUpperCase(), PDF.marginX + 11, y + 3.2);
  }
  return y + 11;
}

export function drawSubHeader(pdf: jsPDF, title: string, y: number) {
  y = ensureSpace(pdf, y, 12);
  pdf.setFillColor(...PDF.colors.navySoft);
  pdf.roundedRect(PDF.marginX, y - 3.5, PDF.contentWidth, 8, 1.5, 1.5, "F");
  pdf.setFillColor(...PDF.colors.gold);
  pdf.roundedRect(PDF.marginX, y - 3.5, 2.2, 8, 1, 1, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.navy);
  pdf.text(title, PDF.marginX + 7, y + 1.5);
  return y + 8;
}

export function drawTableHeader(
  pdf: jsPDF,
  columns: Array<{ label: string; x: number; align?: "left" | "right" }>,
  y: number,
  opts?: { color?: Rgb }
) {
  y = ensureSpace(pdf, y, 12);
  const bg = opts?.color ?? PDF.colors.navyMid;
  pdf.setFillColor(...bg);
  pdf.roundedRect(PDF.marginX, y - 4, PDF.contentWidth, 7.5, 1.5, 1.5, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(220, 230, 245);
  for (const col of columns) {
    pdf.text(col.label, col.x, y + 0.5, { align: col.align ?? "left" });
  }
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

/** KPI cards with circular colored icons — matches the mockup row. */
export function drawMetricCards(
  pdf: jsPDF,
  cards: Array<{
    label: string;
    value: string;
    tone?: "gold" | "teal" | "orange" | "green" | "violet" | "emerald" | "fuchsia" | "sky" | "brand";
  }>,
  y: number
) {
  const gap = 4;
  const n = Math.max(cards.length, 1);
  const cardW = (PDF.contentWidth - gap * (n - 1)) / n;
  const cardH = 26;
  y = ensureSpace(pdf, y, cardH + 6);

  const tones: Record<
    string,
    { accent: Rgb; soft: Rgb; value: Rgb; icon: "dollar" | "cart" | "chair" | "list" | "wallet" | "check" }
  > = {
    gold: { accent: PDF.colors.gold, soft: PDF.colors.goldSoft, value: PDF.colors.goldDark, icon: "dollar" },
    fuchsia: { accent: PDF.colors.gold, soft: PDF.colors.goldSoft, value: PDF.colors.goldDark, icon: "dollar" },
    teal: { accent: PDF.colors.teal, soft: PDF.colors.tealSoft, value: PDF.colors.teal, icon: "cart" },
    violet: { accent: PDF.colors.teal, soft: PDF.colors.tealSoft, value: PDF.colors.teal, icon: "cart" },
    orange: { accent: PDF.colors.orange, soft: PDF.colors.orangeSoft, value: PDF.colors.orange, icon: "chair" },
    sky: { accent: PDF.colors.orange, soft: PDF.colors.orangeSoft, value: PDF.colors.orange, icon: "chair" },
    green: { accent: PDF.colors.green, soft: PDF.colors.greenSoft, value: PDF.colors.green, icon: "list" },
    emerald: { accent: PDF.colors.green, soft: PDF.colors.greenSoft, value: PDF.colors.green, icon: "wallet" },
    brand: { accent: PDF.colors.brand, soft: PDF.colors.brandSoft, value: PDF.colors.brandDark, icon: "check" },
  };

  cards.forEach((card, i) => {
    const tone = tones[card.tone ?? "gold"] ?? tones.gold;
    const x = PDF.marginX + i * (cardW + gap);

    pdf.setFillColor(...PDF.colors.white);
    pdf.setDrawColor(...PDF.colors.cardBorder);
    pdf.setLineWidth(0.35);
    pdf.roundedRect(x, y - 3, cardW, cardH, 3.5, 3.5, "FD");

    drawCircleIcon(pdf, x + 9, y + 9.5, 5.2, tone.accent, tone.icon);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text(card.label.toUpperCase(), x + 17, y + 4.5, {
      maxWidth: cardW - 20,
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...tone.value);
    pdf.text(card.value, x + 17, y + 15, { maxWidth: cardW - 20 });
  });

  return y + cardH + 5;
}

/** Dark navy grand-total banner with gold accent. */
export function drawTotalBanner(
  pdf: jsPDF,
  label: string,
  value: string,
  y: number,
  opts?: { hint?: string }
) {
  y = ensureSpace(pdf, y, 30);
  const h = opts?.hint ? 24 : 20;

  pdf.setFillColor(...PDF.colors.navy);
  pdf.roundedRect(PDF.marginX, y - 3, PDF.contentWidth, h, 3, 3, "F");
  pdf.setFillColor(...PDF.colors.gold);
  pdf.roundedRect(PDF.marginX, y - 3, 3.5, h, 1.5, 1.5, "F");

  drawCircleIcon(pdf, PDF.marginX + 12, y + (opts?.hint ? 6 : 7), 4, PDF.colors.gold, "dollar");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...PDF.colors.gold);
  pdf.text(label.toUpperCase(), PDF.marginX + 20, y + 4);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...PDF.colors.white);
  pdf.text(value, PDF.contentRight - 6, y + (opts?.hint ? 8 : 10), {
    align: "right",
  });

  if (opts?.hint) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(170, 185, 210);
    pdf.text(opts.hint, PDF.marginX + 20, y + 14);
  }

  return y + h + 6;
}

export function drawSubtotalRow(
  pdf: jsPDF,
  label: string,
  value: string,
  y: number,
  opts?: { color?: Rgb; soft?: Rgb }
) {
  y = ensureSpace(pdf, y, 10);
  const soft = opts?.soft ?? PDF.colors.goldSoft;
  const accent = opts?.color ?? PDF.colors.goldDark;
  pdf.setFillColor(...soft);
  pdf.roundedRect(PDF.marginX, y - 3.2, PDF.contentWidth, 8, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...accent);
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
  pdf.setFillColor(...PDF.colors.gold);
  pdf.circle(PDF.marginX + 6, y + 1.5, 1.5, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...PDF.colors.navy);
  pdf.text(title, PDF.marginX + 11, y + 2.2);
  return y + 12;
}

/** Colored category card header used in estimate line-item sections. */
export function drawCategoryCardHeader(
  pdf: jsPDF,
  title: string,
  y: number,
  palette: { accent: Rgb; soft: Rgb; header: Rgb }
) {
  y = ensureSpace(pdf, y, 14);
  pdf.setFillColor(...palette.header);
  pdf.roundedRect(PDF.marginX, y - 3, PDF.contentWidth, 9.5, 2, 2, "F");
  pdf.setFillColor(...PDF.colors.white);
  pdf.circle(PDF.marginX + 7, y + 1.8, 2.6, "F");
  pdf.setFillColor(...palette.accent);
  pdf.circle(PDF.marginX + 7, y + 1.8, 1.5, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...PDF.colors.white);
  pdf.text(title.toUpperCase(), PDF.marginX + 13, y + 3);
  return y + 10;
}

/** Two-column profile grid inside a bordered card. */
export function drawProfileGrid(
  pdf: jsPDF,
  rows: Array<[string, string]>,
  y: number
) {
  const mid = PDF.marginX + PDF.contentWidth / 2;
  const left = rows.filter((_, i) => i % 2 === 0);
  const right = rows.filter((_, i) => i % 2 === 1);
  const count = Math.max(left.length, right.length);
  const rowH = 8;
  const cardH = count * rowH + 6;
  y = ensureSpace(pdf, y, cardH + 4);

  pdf.setFillColor(...PDF.colors.white);
  pdf.setDrawColor(...PDF.colors.cardBorder);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(PDF.marginX, y - 2, PDF.contentWidth, cardH, 2.5, 2.5, "FD");

  for (let i = 0; i < count; i++) {
    const yy = y + 4 + i * rowH;
    if (i % 2 === 1) {
      pdf.setFillColor(...PDF.colors.rowAlt);
      pdf.rect(PDF.marginX + 1, yy - 3.5, PDF.contentWidth - 2, rowH, "F");
    }
    if (left[i]) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...PDF.colors.muted);
      pdf.text(left[i][0], PDF.marginX + 4, yy);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...PDF.colors.navy);
      pdf.text(left[i][1], PDF.marginX + 4, yy + 4, { maxWidth: mid - PDF.marginX - 10 });
    }
    if (right[i]) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...PDF.colors.muted);
      pdf.text(right[i][0], mid + 4, yy);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...PDF.colors.navy);
      pdf.text(right[i][1], mid + 4, yy + 4, {
        maxWidth: PDF.contentRight - mid - 8,
      });
    }
  }

  return y + cardH + 4;
}

export function addPageFooters(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages();
  const { colors, pageWidth, pageHeight, marginX, contentRight } = PDF;

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Page label above footer
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...colors.muted);
    pdf.text(
      `iFuntology Business Builder Report  |  Page ${i} of ${pageCount}`,
      marginX,
      pageHeight - 20
    );

    // Navy footer bar
    pdf.setFillColor(...colors.navy);
    pdf.rect(0, pageHeight - 16, pageWidth, 16, "F");
    pdf.setFillColor(...colors.gold);
    pdf.rect(0, pageHeight - 16, pageWidth, 1.4, "F");

    const midY = pageHeight - 8;
    const col1 = marginX + 4;
    const col2 = pageWidth / 2;
    const col3 = contentRight - 4;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(210, 220, 235);
    pdf.setFillColor(...colors.gold);
    pdf.circle(col1, midY - 1, 1.3, "F");
    pdf.text("www.ifuntology.com", col1 + 4, midY);

    pdf.setFillColor(...colors.gold);
    pdf.circle(col2 - 28, midY - 1, 1.3, "F");
    pdf.text("info@ifuntology.com", col2 - 24, midY);

    pdf.setFillColor(...colors.gold);
    pdf.circle(col3 - 38, midY - 1, 1.3, "F");
    pdf.text("(123) 456-7890", col3 - 34, midY);
  }
}
