import { jsPDF } from "jspdf";
import {
  ADDITIONAL_ITEMS,
  CONSTRUCTION_ITEMS,
  EXPENSE_ITEMS,
  UTILITY_ITEMS,
  formatCurrency,
  parseQty,
  type EstimateLineItem,
  type MonthlySelectableItem,
} from "./estimateData";

type PdfEstimateInput = {
  constructionQty: Record<string, string>;
  additionalQty: Record<string, string>;
  selectedUtilityIds: string[];
  selectedExpenseIds: string[];
  makeupSalon: {
    staff: string;
    stations: string;
    boothRentalRate: string;
    weeklyTotal: number;
    monthlyTotal: number;
  };
  receptionist: {
    payRate: string;
    hoursPerWeek: string;
    weeklyGross: number;
    monthlyTotal: number;
  };
  constructionTotal: number;
  additionalTotal: number;
  utilitiesTotal: number;
  expensesTotal: number;
  makeupSalonTotal: number;
  receptionistTotal: number;
  grandTotal: number;
};

function addSectionHeader(pdf: jsPDF, title: string, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(26, 77, 140);
  pdf.text(title, 14, y);
  pdf.setDrawColor(184, 207, 232);
  pdf.line(14, y + 2, 196, y + 2);
  return y + 10;
}

function ensureSpace(pdf: jsPDF, y: number, needed = 30) {
  if (y + needed > 280) {
    pdf.addPage();
    return 20;
  }
  return y;
}

function addLineItemRows(
  pdf: jsPDF,
  items: EstimateLineItem[],
  qtyById: Record<string, string>,
  yStart: number
) {
  let y = yStart;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Item", 14, y);
  pdf.text("Qty", 110, y);
  pdf.text("Unit Cost", 130, y);
  pdf.text("Line Total", 165, y);
  y += 6;
  pdf.setFont("helvetica", "normal");

  for (const item of items) {
    const qty = parseQty(qtyById[item.id] ?? "");
    if (qty <= 0) continue;
    y = ensureSpace(pdf, y, 12);
    const lineTotal = qty * item.unitCost;
    pdf.text(item.name, 14, y, { maxWidth: 90 });
    pdf.text(String(qty), 110, y);
    pdf.text(formatCurrency(item.unitCost), 130, y);
    pdf.text(formatCurrency(lineTotal), 165, y);
    y += 7;
  }

  return y;
}

function addSelectableRows(
  pdf: jsPDF,
  label: string,
  items: MonthlySelectableItem[],
  selectedIds: Set<string>,
  yStart: number
) {
  let y = yStart;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  pdf.text(label, 14, y);
  pdf.text("Monthly Cost", 165, y);
  y += 6;
  pdf.setFont("helvetica", "normal");

  for (const item of items) {
    if (!selectedIds.has(item.id)) continue;
    y = ensureSpace(pdf, y, 12);
    pdf.text(item.name, 14, y, { maxWidth: 140 });
    pdf.text(formatCurrency(item.monthlyCost), 165, y);
    y += 7;
  }

  return y;
}

export function generateEstimatePdf(input: PdfEstimateInput) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const selectedUtilities = new Set(input.selectedUtilityIds);
  const selectedExpenses = new Set(input.selectedExpenseIds);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(26, 77, 140);
  pdf.text("Funtology Business Builder", 14, 18);
  pdf.setFontSize(12);
  pdf.text("Estimate Summary", 14, 26);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated ${new Date().toLocaleString()}`, 14, 32);

  let y = 42;

  y = addSectionHeader(pdf, "Estimated Construction Material Cost", y);
  if (
    !CONSTRUCTION_ITEMS.some(
      (item) => parseQty(input.constructionQty[item.id] ?? "") > 0
    )
  ) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text("No construction items selected.", 14, y);
    y += 8;
  } else {
    y = addLineItemRows(pdf, CONSTRUCTION_ITEMS, input.constructionQty, y);
  }
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(26, 77, 140);
  pdf.text(
    `Construction Total: ${formatCurrency(input.constructionTotal)}`,
    14,
    y + 2
  );
  y = ensureSpace(pdf, y + 14);

  y = addSectionHeader(pdf, "Additional Material & Equipment", y);
  if (
    !ADDITIONAL_ITEMS.some(
      (item) => parseQty(input.additionalQty[item.id] ?? "") > 0
    )
  ) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text("No additional items selected.", 14, y);
    y += 8;
  } else {
    y = addLineItemRows(pdf, ADDITIONAL_ITEMS, input.additionalQty, y);
  }
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(26, 77, 140);
  pdf.text(
    `Additional Total: ${formatCurrency(input.additionalTotal)}`,
    14,
    y + 2
  );
  y = ensureSpace(pdf, y + 14);

  y = addSectionHeader(pdf, "Utilities (Per Month)", y);
  if (selectedUtilities.size === 0) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text("No utilities selected.", 14, y);
    y += 8;
  } else {
    y = addSelectableRows(pdf, "Utility", UTILITY_ITEMS, selectedUtilities, y);
  }
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(26, 77, 140);
  pdf.text(
    `Utilities Total: ${formatCurrency(input.utilitiesTotal)}`,
    14,
    y + 2
  );
  y = ensureSpace(pdf, y + 14);

  y = addSectionHeader(pdf, "Expenses (Monthly)", y);
  if (selectedExpenses.size === 0) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text("No expenses selected.", 14, y);
    y += 8;
  } else {
    y = addSelectableRows(pdf, "Expense", EXPENSE_ITEMS, selectedExpenses, y);
  }
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(26, 77, 140);
  pdf.text(
    `Expenses Total: ${formatCurrency(input.expensesTotal)}`,
    14,
    y + 2
  );
  y = ensureSpace(pdf, y + 14);

  y = addSectionHeader(pdf, "Make Up Salon Cost", y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  pdf.text(`Staff: ${input.makeupSalon.staff || "0"}`, 14, y);
  y += 6;
  pdf.text(`Stations: ${input.makeupSalon.stations || "0"}`, 14, y);
  y += 6;
  pdf.text(
    `Booth Rental Rate: ${formatCurrency(Number(input.makeupSalon.boothRentalRate) || 0)}`,
    14,
    y
  );
  y += 6;
  pdf.text(
    `Weekly Total: ${formatCurrency(input.makeupSalon.weeklyTotal)}`,
    14,
    y
  );
  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(26, 77, 140);
  pdf.text(
    `Monthly Total: ${formatCurrency(input.makeupSalonTotal)}`,
    14,
    y
  );
  y = ensureSpace(pdf, y + 14);

  y = addSectionHeader(pdf, "Receptionist", y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  pdf.text(
    `Pay Rate: ${formatCurrency(Number(input.receptionist.payRate) || 0)} / hr`,
    14,
    y
  );
  y += 6;
  pdf.text(
    `Hours per Week: ${input.receptionist.hoursPerWeek || "0"}`,
    14,
    y
  );
  y += 6;
  pdf.text(
    `Weekly Gross: ${formatCurrency(input.receptionist.weeklyGross)}`,
    14,
    y
  );
  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(26, 77, 140);
  pdf.text(
    `Monthly Total: ${formatCurrency(input.receptionistTotal)}`,
    14,
    y
  );
  y = ensureSpace(pdf, y + 16, 30);

  pdf.setFillColor(232, 242, 252);
  pdf.roundedRect(14, y - 4, 182, 18, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(22, 101, 52);
  pdf.text(
    `Final Total Estimate: ${formatCurrency(input.grandTotal)}`,
    20,
    y + 8
  );

  pdf.save("funtology-business-estimate.pdf");
}
