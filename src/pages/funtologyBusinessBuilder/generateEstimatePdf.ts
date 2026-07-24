import { jsPDF } from "jspdf";
import {
  FURNITURE_CATEGORY,
  MATERIAL_CATEGORIES,
  formatCurrency,
  parseQty,
  sumLineItems,
  type EstimateLineItem,
} from "./estimateData";
import type { IntroFormData } from "./introFormData";
import type { LoanApplicationData } from "./loanApplicationData";
import {
  PDF,
  addPageFooters,
  drawBrandedHeader,
  drawEmptyState,
  drawMetricCards,
  drawSectionHeader,
  drawSubHeader,
  drawSubtotalRow,
  drawTableHeader,
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

function addLineItemRows(
  pdf: jsPDF,
  items: EstimateLineItem[],
  qtyById: Record<string, string>,
  yStart: number
) {
  let y = drawTableHeader(
    pdf,
    [
      { label: "ITEM", x: PDF.marginX + 3 },
      { label: "QTY", x: 118, align: "right" },
      { label: "UNIT COST", x: 148, align: "right" },
      { label: "LINE TOTAL", x: PDF.contentRight - 3, align: "right" },
    ],
    yStart
  );

  let rowIndex = 0;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  for (const item of items) {
    const qty = parseQty(qtyById[item.id] ?? "");
    if (qty <= 0) continue;

    y = ensureSpace(pdf, y, 10);
    if (rowIndex % 2 === 1) {
      pdf.setFillColor(...PDF.colors.rowAlt);
      pdf.roundedRect(PDF.marginX, y - 3.2, PDF.contentWidth, 6.8, 1, 1, "F");
    }

    const lineTotal = qty * item.unitCost;
    const label = item.unitHint ? `${item.name} (${item.unitHint})` : item.name;

    pdf.setTextColor(...PDF.colors.text);
    pdf.text(label, PDF.marginX + 3, y, { maxWidth: 92 });
    pdf.setTextColor(...PDF.colors.violet);
    pdf.setFont("helvetica", "bold");
    pdf.text(String(qty), 118, y, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text(formatCurrency(item.unitCost), 148, y, { align: "right" });
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PDF.colors.slate900);
    pdf.text(formatCurrency(lineTotal), PDF.contentRight - 3, y, {
      align: "right",
    });
    pdf.setFont("helvetica", "normal");

    y += 7;
    rowIndex += 1;
  }

  return y;
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

  y = drawMetricCards(
    pdf,
    [
      {
        label: "Grand Total",
        value: formatCurrency(input.grandTotal),
        tone: "fuchsia",
      },
      {
        label: "Materials",
        value: formatCurrency(input.materialsTotal),
        tone: "violet",
      },
      {
        label: "Furniture",
        value: formatCurrency(input.furnitureTotal),
        tone: "sky",
      },
      {
        label: "Line Items",
        value: String(filledItems),
        tone: "brand",
      },
    ],
    y
  );
  y += 2;

  if (input.intro && hasIntroForPdf(input.intro)) {
    y = drawBusinessProfileSection(pdf, input.intro, y);
  }

  y = drawSectionHeader(pdf, "Raw Materials to Build a Salon", y, {
    accent: PDF.colors.violet,
  });

  let materialsHadItems = false;
  for (const category of MATERIAL_CATEGORIES) {
    const hasItems = category.items.some(
      (item) => parseQty(input.itemQty[item.id] ?? "") > 0
    );
    if (!hasItems) continue;
    materialsHadItems = true;
    y = drawSubHeader(pdf, category.title, y);
    y = addLineItemRows(pdf, category.items, input.itemQty, y);
    const sectionTotal = sumLineItems(category.items, input.itemQty);
    y = drawSubtotalRow(
      pdf,
      "Subtotal",
      formatCurrency(sectionTotal),
      y + 1
    );
  }

  if (!materialsHadItems) {
    y = drawEmptyState(pdf, "No raw material items selected.", y);
  }

  y = drawSubtotalRow(
    pdf,
    "Materials Total",
    formatCurrency(input.materialsTotal),
    y + 2
  );
  y += 3;

  y = drawSectionHeader(pdf, FURNITURE_CATEGORY.title, y, {
    accent: PDF.colors.fuchsia,
  });
  if (
    !FURNITURE_CATEGORY.items.some(
      (item) => parseQty(input.itemQty[item.id] ?? "") > 0
    )
  ) {
    y = drawEmptyState(pdf, "No furniture or equipment items selected.", y);
  } else {
    y = addLineItemRows(pdf, FURNITURE_CATEGORY.items, input.itemQty, y);
  }

  y = drawSubtotalRow(
    pdf,
    "Furniture & Equipment Total",
    formatCurrency(input.furnitureTotal),
    y + 2
  );
  y += 5;

  y = drawTotalBanner(
    pdf,
    "Final Total Estimate",
    formatCurrency(input.grandTotal),
    y,
    {
      hint: `Materials share ${materialsShare}%  ·  All costs included`,
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
