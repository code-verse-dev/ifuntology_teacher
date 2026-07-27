import { jsPDF } from "jspdf";
import {
  FURNITURE_CATEGORIES,
  MATERIAL_CATEGORIES,
  formatCurrency,
  parseQty,
  sumLineItems,
  type EstimateLineItem,
} from "./estimateData";
import type { IntroFormData } from "./introFormData";
import type { LoanApplicationData } from "./loanApplicationData";
import {
  CATEGORY_PALETTES,
  PDF,
  addPageFooters,
  drawBrandedHeader,
  drawCategoryCardHeader,
  drawEmptyState,
  drawMetricCards,
  drawSectionHeader,
  drawSubtotalRow,
  drawTotalBanner,
  ensureSpace,
  loadLogoAsset,
} from "./pdfBrand";
import {
  drawBusinessProfileSection,
  drawLoanApplicationSection,
  hasIntroForPdf,
} from "./pdfSharedSections";

export type PdfEstimateInput = {
  itemQty: Record<string, string>;
  materialsTotal: number;
  furnitureTotal: number;
  grandTotal: number;
  intro?: IntroFormData | null;
  loan?: LoanApplicationData | null;
};

type Rgb = [number, number, number];

/** Column header row for estimate line tables. */
function drawColumnHeaderRow(pdf: jsPDF, y: number) {
  y = ensureSpace(pdf, y, 12);
  pdf.setFillColor(...PDF.colors.navySoft);
  pdf.roundedRect(PDF.marginX, y - 3.5, PDF.contentWidth, 6.5, 1, 1, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(...PDF.colors.navyMid);
  pdf.text("ITEM", PDF.marginX + 3, y);
  pdf.text("QTY", 118, y, { align: "right" });
  pdf.text("UNIT COST", 148, y, { align: "right" });
  pdf.text("LINE TOTAL", PDF.contentRight - 3, y, { align: "right" });
  return y + 7;
}

function addLineItemRows(
  pdf: jsPDF,
  items: EstimateLineItem[],
  qtyById: Record<string, string>,
  yStart: number,
  accent?: Rgb,
  continuation?: {
    title: string;
    palette: { accent: Rgb; soft: Rgb; header: Rgb };
  }
) {
  // Gap above column headers (kept with category title via parent ensureSpace)
  let y = drawColumnHeaderRow(pdf, yStart + 3);

  let rowIndex = 0;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);

  for (const item of items) {
    const qty = parseQty(qtyById[item.id] ?? "");
    if (qty <= 0) continue;

    const before = y;
    y = ensureSpace(pdf, y, 12);
    // Mid-section page break: keep heading + column headers with content
    if (y < before) {
      if (continuation) {
        y = drawCategoryCardHeader(
          pdf,
          `${continuation.title} (continued)`,
          y,
          continuation.palette
        );
        y = drawColumnHeaderRow(pdf, y + 2);
      } else {
        y = drawColumnHeaderRow(pdf, y + 2);
      }
    }

    if (rowIndex % 2 === 1) {
      pdf.setFillColor(...PDF.colors.rowAlt);
      pdf.roundedRect(PDF.marginX, y - 3.2, PDF.contentWidth, 6.8, 1, 1, "F");
    }

    const lineTotal = qty * item.unitCost;
    const label = item.unitHint ? `${item.name} (${item.unitHint})` : item.name;

    pdf.setTextColor(...PDF.colors.text);
    pdf.setFont("helvetica", "normal");
    pdf.text(label, PDF.marginX + 3, y, { maxWidth: 92 });
    pdf.setTextColor(...(accent ?? PDF.colors.navy));
    pdf.setFont("helvetica", "bold");
    pdf.text(String(qty), 118, y, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text(formatCurrency(item.unitCost), 148, y, { align: "right" });
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PDF.colors.navy);
    pdf.text(formatCurrency(lineTotal), PDF.contentRight - 3, y, {
      align: "right",
    });
    pdf.setFont("helvetica", "normal");

    y += 7;
    rowIndex += 1;
  }

  return y;
}

function drawCategoryBlock(
  pdf: jsPDF,
  title: string,
  items: EstimateLineItem[],
  qtyById: Record<string, string>,
  y: number
) {
  const palette =
    CATEGORY_PALETTES[title] ?? {
      accent: PDF.colors.navy,
      soft: PDF.colors.navySoft,
      header: PDF.colors.navy,
    };

  // Keep category title + column headers + first data row (+ subtotal) together
  // (~12 header + 3 gap + 10 col header + 12 first row + 12 subtotal)
  y = ensureSpace(pdf, y, 52);

  y = drawCategoryCardHeader(pdf, title, y, palette);
  y = addLineItemRows(pdf, items, qtyById, y, palette.accent, {
    title,
    palette,
  });
  const sectionTotal = sumLineItems(items, qtyById);
  y = drawSubtotalRow(pdf, "Subtotal", formatCurrency(sectionTotal), y + 1, {
    color: palette.accent,
    soft: palette.soft,
  });

  return y + 4;
}

export async function generateEstimatePdf(input: PdfEstimateInput) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const logo = await loadLogoAsset();

  let y = drawBrandedHeader(pdf, {
    logo,
    title: "Salon Estimate Summary",
    subtitle: input.loan
      ? "Business profile, estimate & loan application"
      : "Business profile & construction estimate report",
  });

  const filledItems = Object.values(input.itemQty).filter(
    (q) => parseQty(q) > 0
  ).length;
  const materialsShare =
    input.grandTotal > 0
      ? ((input.materialsTotal / input.grandTotal) * 100).toFixed(1)
      : "0.0";

  const summaryCards = [
    {
      label: "Grand Total",
      value: formatCurrency(input.grandTotal),
      tone: "gold" as const,
    },
    {
      label: "Build & Setup",
      value: formatCurrency(input.materialsTotal),
      tone: "teal" as const,
    },
    {
      label: "Furniture & Ops",
      value: formatCurrency(input.furnitureTotal),
      tone: "orange" as const,
    },
    {
      label: "Line Items",
      value: String(filledItems),
      tone: "green" as const,
    },
  ];

  y = drawMetricCards(pdf, summaryCards, y);
  y += 2;

  if (input.intro && hasIntroForPdf(input.intro)) {
    y = drawBusinessProfileSection(pdf, input.intro, y);
  }

  y = drawSectionHeader(pdf, "Build & Setup Costs", y, {
    gold: true,
    icon: "briefcase",
  });
  y += 1;

  let buildHadItems = false;
  for (const category of MATERIAL_CATEGORIES) {
    const hasItems = category.items.some(
      (item) => parseQty(input.itemQty[item.id] ?? "") > 0
    );
    if (!hasItems) continue;
    buildHadItems = true;
    y = drawCategoryBlock(
      pdf,
      category.title,
      category.items,
      input.itemQty,
      y
    );
  }

  if (!buildHadItems) {
    y = drawEmptyState(pdf, "No build & setup items selected.", y);
  }

  y = drawSubtotalRow(
    pdf,
    "Build & Setup Total",
    formatCurrency(input.materialsTotal),
    y + 1,
    { color: PDF.colors.teal, soft: PDF.colors.tealSoft }
  );
  y += 4;

  y = drawSectionHeader(pdf, "Furniture, Equipment & Operations", y, {
    accent: PDF.colors.orange,
    icon: "chair",
  });
  y += 1;

  let opsHadItems = false;
  for (const category of FURNITURE_CATEGORIES) {
    const hasItems = category.items.some(
      (item) => parseQty(input.itemQty[item.id] ?? "") > 0
    );
    if (!hasItems) continue;
    opsHadItems = true;
    y = drawCategoryBlock(
      pdf,
      category.title,
      category.items,
      input.itemQty,
      y
    );
  }

  if (!opsHadItems) {
    y = drawEmptyState(
      pdf,
      "No furniture, equipment, or operations items selected.",
      y
    );
  }

  y = drawSubtotalRow(
    pdf,
    "Furniture & Ops Total",
    formatCurrency(input.furnitureTotal),
    y + 1,
    { color: PDF.colors.orange, soft: PDF.colors.orangeSoft }
  );
  y += 4;

  // Estimate Summary KPI repeat
  y = drawSectionHeader(pdf, "Estimate Summary", y, {
    icon: "calc",
  });
  y = drawMetricCards(pdf, summaryCards, y);
  y += 2;

  y = drawTotalBanner(
    pdf,
    "Final Total Estimate",
    formatCurrency(input.grandTotal),
    y,
    {
      hint: `Build & setup share ${materialsShare}%  ·  All costs included`,
    }
  );

  if (input.loan) {
    y += 4;
    drawLoanApplicationSection(pdf, input.loan, y);
  }

  addPageFooters(pdf);
  pdf.save(
    input.loan
      ? "funtology-estimate-with-loan.pdf"
      : "funtology-business-estimate.pdf"
  );
}
