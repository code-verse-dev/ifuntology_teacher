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

function optionLabel(fieldId: string, value: string) {
  const field = BILL_FIELDS.find((f) => f.id === fieldId);
  return field?.options.find((o) => o.value === value)?.label ?? "—";
}

function sectionHeader(pdf: jsPDF, title: string, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(26, 77, 140);
  pdf.text(title, 14, y);
  pdf.setDrawColor(184, 207, 232);
  pdf.line(14, y + 2, 196, y + 2);
  return y + 9;
}

function ensureSpace(pdf: jsPDF, y: number, needed = 20) {
  if (y + needed > 285) {
    pdf.addPage();
    return 20;
  }
  return y;
}

function row(pdf: jsPDF, label: string, value: string, y: number) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  pdf.text(label, 14, y, { maxWidth: 130 });
  pdf.text(value, 196, y, { align: "right" });
  return y + 6.5;
}

export function generateStudentBudgetPdf(input: StudentBudgetInput) {
  const r = computeStudentBudget(input);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(26, 77, 140);
  pdf.text("Funtology Business Builder", 14, 18);
  pdf.setFontSize(12);
  pdf.text("Student Budget Summary", 14, 26);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated ${new Date().toLocaleString()}`, 14, 32);

  let y = 42;

  y = sectionHeader(pdf, "Income & Household", y);
  y = row(pdf, "Annual Salary", formatCurrency(r.totalAnnualIncome), y);
  y = row(
    pdf,
    "Marital Status",
    input.maritalStatus === "married" ? "Married" : "Single",
    y
  );
  y = row(pdf, "Children", input.children || "0", y);
  y = row(pdf, "Family Size", String(r.familySize), y);
  y += 3;

  y = ensureSpace(pdf, y);
  y = sectionHeader(pdf, "Savings & Taxes", y);
  y = row(pdf, "Total Annual Income", formatCurrency(r.totalAnnualIncome), y);
  y = row(
    pdf,
    "Average Monthly Income",
    formatCurrency(r.averageMonthlyIncome),
    y
  );
  y = row(pdf, "Tax Deductions", `- ${formatCurrency(r.taxDeductions)}`, y);
  y = row(pdf, "Remaining Income", formatCurrency(r.remainingIncome), y);
  y = row(
    pdf,
    "Total in Savings Account",
    formatCurrency(r.savingsAnnual),
    y
  );
  y = row(
    pdf,
    "Total Income After Savings",
    formatCurrency(r.totalIncomeAfterSavings),
    y
  );
  y += 3;

  y = ensureSpace(pdf, y);
  y = sectionHeader(pdf, "Bills (Annual)", y);
  for (const field of BILL_FIELDS) {
    const value = input.billSelections[field.id] ?? "";
    const monthly = optionCost(field.options, value);
    if (monthly <= 0) continue;
    y = ensureSpace(pdf, y, 10);
    y = row(
      pdf,
      `${field.name} (${optionLabel(field.id, value)})`,
      formatCurrency(monthly * 12),
      y
    );
  }
  const childcareChildren = parseQty(input.childcareChildren);
  if (childcareChildren > 0) {
    y = ensureSpace(pdf, y, 10);
    y = row(
      pdf,
      `Childcare (${childcareChildren} child/children)`,
      formatCurrency(r.childcareMonthly * 12),
      y
    );
  }
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(26, 77, 140);
  pdf.text(`Total Bills (Annual): ${formatCurrency(r.billsAnnual)}`, 14, y + 2);
  y += 12;

  y = ensureSpace(pdf, y);
  y = sectionHeader(pdf, "Expenses (Annual)", y);
  const clothingMonthly = optionCost(CLOTHING_OPTIONS, input.clothing);
  if (clothingMonthly > 0) {
    y = row(pdf, "Clothing", formatCurrency(clothingMonthly * 12), y);
  }
  if (r.diningMonthly > 0) {
    y = row(pdf, "Dining Out", formatCurrency(r.diningMonthly * 12), y);
  }
  const selectedSubs = new Set(input.selectedSubscriptions);
  for (const item of SUBSCRIPTION_ITEMS) {
    if (!selectedSubs.has(item.id)) continue;
    y = ensureSpace(pdf, y, 10);
    y = row(pdf, item.name, formatCurrency(item.monthlyCost * 12), y);
  }
  const selectedPets = new Set(input.selectedPets);
  for (const item of PET_ITEMS) {
    if (!selectedPets.has(item.id)) continue;
    y = ensureSpace(pdf, y, 10);
    y = row(pdf, `Pet — ${item.name}`, formatCurrency(item.monthlyCost * 12), y);
  }
  const selectedVacations = new Set(input.selectedVacations);
  for (const item of VACATION_ITEMS) {
    if (!selectedVacations.has(item.id)) continue;
    const trips = parseQty(input.vacationTrips[item.id] ?? "");
    if (trips <= 0) continue;
    y = ensureSpace(pdf, y, 10);
    y = row(
      pdf,
      `Vacation — ${item.name} (${trips} trip/trips)`,
      formatCurrency(trips * item.perTripCost),
      y
    );
  }
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(26, 77, 140);
  pdf.text(
    `Total Expenses (Annual): ${formatCurrency(r.expensesAnnual)}`,
    14,
    y + 2
  );
  y += 12;

  y = ensureSpace(pdf, y);
  y = sectionHeader(pdf, "Annual Net Pay", y);
  y = row(
    pdf,
    "Total Annual Takehome",
    formatCurrency(r.totalAnnualTakehome),
    y
  );
  y = row(pdf, "Bills", `- ${formatCurrency(r.billsAnnual)}`, y);
  y = row(pdf, "Expenses", `- ${formatCurrency(r.expensesAnnual)}`, y);
  y = row(
    pdf,
    "Remaining Annual Total",
    formatCurrency(r.remainingAnnualTotal),
    y
  );
  y = row(
    pdf,
    "Monthly Average",
    formatCurrency(r.remainingMonthlyAverage),
    y
  );
  y = row(
    pdf,
    "Remaining Total with Savings",
    formatCurrency(r.remainingTotalWithSavings),
    y
  );
  y += 4;

  y = ensureSpace(pdf, y, 24);
  pdf.setFillColor(232, 242, 252);
  pdf.roundedRect(14, y - 4, 182, 18, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(22, 101, 52);
  pdf.text(
    `Left for the Year: ${formatCurrency(r.remainingAnnualTotal)}`,
    20,
    y + 8
  );

  pdf.save("student-budget.pdf");
}
