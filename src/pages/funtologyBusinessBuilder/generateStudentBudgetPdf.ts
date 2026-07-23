import { jsPDF } from "jspdf";
import {
  BILL_FIELDS,
  CLOTHING_OPTIONS,
  PET_ITEMS,
  SUBSCRIPTION_ITEMS,
  VACATION_ITEMS,
  computeStudentBudget,
  formatCurrency,
  optionCost,
  parseQty,
  type StudentBudgetInput,
} from "./studentBudgetData";
import {
  PDF,
  addPageFooters,
  drawBrandedHeader,
  drawKeyValueRow,
  drawSectionHeader,
  drawSubtotalRow,
  drawTotalBanner,
  ensureSpace,
  loadLogoAsset,
} from "./pdfBrand";

function optionLabel(fieldId: string, value: string) {
  const field = BILL_FIELDS.find((f) => f.id === fieldId);
  return field?.options.find((o) => o.value === value)?.label ?? "—";
}

export async function generateStudentBudgetPdf(input: StudentBudgetInput) {
  const r = computeStudentBudget(input);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const logo = await loadLogoAsset();

  let y = drawBrandedHeader(pdf, {
    logo,
    title: "Student Budget Summary",
    subtitle: "Income, bills, expenses & annual net overview",
  });

  // Snapshot cards
  y = ensureSpace(pdf, y, 28);
  const cardW = (PDF.contentWidth - 6) / 2;
  const cardH = 18;
  const cards = [
    {
      label: "Left for the Year",
      value: formatCurrency(r.remainingAnnualTotal),
      x: PDF.marginX,
    },
    {
      label: "Per Month",
      value: formatCurrency(r.remainingMonthlyAverage),
      x: PDF.marginX + cardW + 6,
    },
  ];
  for (const card of cards) {
    pdf.setFillColor(...PDF.colors.primaryLight);
    pdf.roundedRect(card.x, y - 4, cardW, cardH, 2.5, 2.5, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text(card.label, card.x + 4, y + 2);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...PDF.colors.primary);
    pdf.text(card.value, card.x + 4, y + 10);
  }
  y += cardH + 6;

  y = drawSectionHeader(pdf, "Income & Household", y);
  let alt = false;
  y = drawKeyValueRow(pdf, "Annual Salary", formatCurrency(r.totalAnnualIncome), y, { alt: (alt = !alt) });
  y = drawKeyValueRow(
    pdf,
    "Marital Status",
    input.maritalStatus === "married" ? "Married" : "Single",
    y,
    { alt: (alt = !alt) }
  );
  y = drawKeyValueRow(pdf, "Children", input.children || "0", y, { alt: (alt = !alt) });
  y = drawKeyValueRow(pdf, "Family Size", String(r.familySize), y, { alt: (alt = !alt) });
  y += 4;

  y = drawSectionHeader(pdf, "Savings & Taxes", y);
  alt = false;
  y = drawKeyValueRow(pdf, "Total Annual Income", formatCurrency(r.totalAnnualIncome), y, { alt: (alt = !alt) });
  y = drawKeyValueRow(
    pdf,
    "Average Monthly Income",
    formatCurrency(r.averageMonthlyIncome),
    y,
    { alt: (alt = !alt) }
  );
  y = drawKeyValueRow(
    pdf,
    "Tax Deductions",
    `- ${formatCurrency(r.taxDeductions)}`,
    y,
    { alt: (alt = !alt), valueColor: [185, 28, 28] }
  );
  y = drawKeyValueRow(pdf, "Remaining Income", formatCurrency(r.remainingIncome), y, { alt: (alt = !alt) });
  y = drawKeyValueRow(
    pdf,
    "Total in Savings Account",
    formatCurrency(r.savingsAnnual),
    y,
    { alt: (alt = !alt), valueColor: PDF.colors.accent }
  );
  y = drawKeyValueRow(
    pdf,
    "Total Income After Savings",
    formatCurrency(r.totalIncomeAfterSavings),
    y,
    { alt: (alt = !alt), bold: true }
  );
  y += 4;

  y = drawSectionHeader(pdf, "Bills (Annual)", y);
  alt = false;
  let billsListed = false;
  for (const field of BILL_FIELDS) {
    const value = input.billSelections[field.id] ?? "";
    const monthly = optionCost(field.options, value);
    if (monthly <= 0) continue;
    billsListed = true;
    y = drawKeyValueRow(
      pdf,
      `${field.name} (${optionLabel(field.id, value)})`,
      formatCurrency(monthly * 12),
      y,
      { alt: (alt = !alt) }
    );
  }
  const childcareChildren = parseQty(input.childcareChildren);
  if (childcareChildren > 0) {
    billsListed = true;
    y = drawKeyValueRow(
      pdf,
      `Childcare (${childcareChildren} child/children)`,
      formatCurrency(r.childcareMonthly * 12),
      y,
      { alt: (alt = !alt) }
    );
  }
  if (!billsListed) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text("No bills selected.", PDF.marginX + 2, y);
    y += 8;
  }
  y = drawSubtotalRow(pdf, "Total Bills (Annual)", formatCurrency(r.billsAnnual), y + 1);
  y += 4;

  y = drawSectionHeader(pdf, "Expenses (Annual)", y);
  alt = false;
  let expensesListed = false;
  const clothingMonthly = optionCost(CLOTHING_OPTIONS, input.clothing);
  if (clothingMonthly > 0) {
    expensesListed = true;
    y = drawKeyValueRow(pdf, "Clothing", formatCurrency(clothingMonthly * 12), y, {
      alt: (alt = !alt),
    });
  }
  if (r.diningMonthly > 0) {
    expensesListed = true;
    y = drawKeyValueRow(pdf, "Dining Out", formatCurrency(r.diningMonthly * 12), y, {
      alt: (alt = !alt),
    });
  }
  const selectedSubs = new Set(input.selectedSubscriptions);
  for (const item of SUBSCRIPTION_ITEMS) {
    if (!selectedSubs.has(item.id)) continue;
    expensesListed = true;
    y = drawKeyValueRow(pdf, item.name, formatCurrency(item.monthlyCost * 12), y, {
      alt: (alt = !alt),
    });
  }
  const selectedPets = new Set(input.selectedPets);
  for (const item of PET_ITEMS) {
    if (!selectedPets.has(item.id)) continue;
    expensesListed = true;
    y = drawKeyValueRow(
      pdf,
      `Pet — ${item.name}`,
      formatCurrency(item.monthlyCost * 12),
      y,
      { alt: (alt = !alt) }
    );
  }
  const selectedVacations = new Set(input.selectedVacations);
  for (const item of VACATION_ITEMS) {
    if (!selectedVacations.has(item.id)) continue;
    const trips = parseQty(input.vacationTrips[item.id] ?? "");
    if (trips <= 0) continue;
    expensesListed = true;
    y = drawKeyValueRow(
      pdf,
      `Vacation — ${item.name} (${trips} trip/trips)`,
      formatCurrency(trips * item.perTripCost),
      y,
      { alt: (alt = !alt) }
    );
  }
  if (!expensesListed) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(...PDF.colors.muted);
    pdf.text("No expenses selected.", PDF.marginX + 2, y);
    y += 8;
  }
  y = drawSubtotalRow(
    pdf,
    "Total Expenses (Annual)",
    formatCurrency(r.expensesAnnual),
    y + 1
  );
  y += 4;

  y = drawSectionHeader(pdf, "Annual Net Pay", y);
  alt = false;
  y = drawKeyValueRow(
    pdf,
    "Total Annual Takehome",
    formatCurrency(r.totalAnnualTakehome),
    y,
    { alt: (alt = !alt) }
  );
  y = drawKeyValueRow(pdf, "Bills", `- ${formatCurrency(r.billsAnnual)}`, y, {
    alt: (alt = !alt),
    valueColor: [185, 28, 28],
  });
  y = drawKeyValueRow(pdf, "Expenses", `- ${formatCurrency(r.expensesAnnual)}`, y, {
    alt: (alt = !alt),
    valueColor: [185, 28, 28],
  });
  y = drawKeyValueRow(
    pdf,
    "Remaining Annual Total",
    formatCurrency(r.remainingAnnualTotal),
    y,
    { alt: (alt = !alt), bold: true }
  );
  y = drawKeyValueRow(
    pdf,
    "Monthly Average",
    formatCurrency(r.remainingMonthlyAverage),
    y,
    { alt: (alt = !alt) }
  );
  y = drawKeyValueRow(
    pdf,
    "Remaining Total with Savings",
    formatCurrency(r.remainingTotalWithSavings),
    y,
    { alt: (alt = !alt), valueColor: PDF.colors.accent, bold: true }
  );
  y += 6;

  drawTotalBanner(
    pdf,
    "Left for the Year",
    formatCurrency(r.remainingAnnualTotal),
    y
  );

  addPageFooters(pdf);
  pdf.save("student-budget.pdf");
}
