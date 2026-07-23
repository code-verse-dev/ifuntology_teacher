import { jsPDF } from "jspdf";
import {
  FURNITURE_CATEGORY,
  MATERIAL_CATEGORIES,
  formatCurrency,
  parseQty,
  sumLineItems,
  type EstimateLineItem,
} from "./estimateData";
import {
  PDF,
  addPageFooters,
  drawBrandedHeader,
  drawEmptyState,
  drawSectionHeader,
  drawSubHeader,
  drawSubtotalRow,
  drawTableHeader,
  drawTotalBanner,
  ensureSpace,
  loadLogoAsset,
} from "./pdfBrand";

type PdfEstimateInput = {
  itemQty: Record<string, string>;
  materialsTotal: number;
  furnitureTotal: number;
  grandTotal: number;
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
      { label: "ITEM", x: PDF.marginX + 2 },
      { label: "QTY", x: 118, align: "right" },
      { label: "UNIT COST", x: 148, align: "right" },
      { label: "LINE TOTAL", x: PDF.contentRight - 2, align: "right" },
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
      pdf.rect(PDF.marginX, y - 3.5, PDF.contentWidth, 6.5, "F");
    }

    const lineTotal = qty * item.unitCost;
    const label = item.unitHint ? `${item.name} (${item.unitHint})` : item.name;

    pdf.setTextColor(...PDF.colors.text);
    pdf.text(label, PDF.marginX + 2, y, { maxWidth: 95 });
    pdf.text(String(qty), 118, y, { align: "right" });
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text(formatCurrency(item.unitCost), 148, y, { align: "right" });
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PDF.colors.text);
    pdf.text(formatCurrency(lineTotal), PDF.contentRight - 2, y, {
      align: "right",
    });
    pdf.setFont("helvetica", "normal");

    y += 6.5;
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
    subtitle: "Construction materials & salon equipment report",
  });

  y = drawSectionHeader(pdf, "Raw Materials to Build a Salon", y);

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
  y += 4;

  y = drawSectionHeader(pdf, FURNITURE_CATEGORY.title, y);
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
  y += 6;

  drawTotalBanner(
    pdf,
    "Final Total Estimate",
    formatCurrency(input.grandTotal),
    y
  );

  addPageFooters(pdf);
  pdf.save("funtology-business-estimate.pdf");
}
