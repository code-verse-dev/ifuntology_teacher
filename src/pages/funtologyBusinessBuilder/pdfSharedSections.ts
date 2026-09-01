import { jsPDF } from "jspdf";
import {
  getBusinessTypeLabel,
  type IntroFormData,
} from "./introFormData";
import {
  ACCOUNT_TYPE_OPTIONS,
  CREDIT_PURPOSE_OPTIONS,
  type LoanApplicationData,
} from "./loanApplicationData";
import {
  PDF,
  drawBlockTitle,
  drawKeyValueRow,
  drawProfileGrid,
  drawSectionHeader,
  ensureSpace,
} from "./pdfBrand";
import { formatCurrency } from "./estimateData";

function moneyOrDash(raw: string) {
  const n = Number(raw);
  if (!raw.trim() || !Number.isFinite(n)) return "—";
  return formatCurrency(n);
}

function labelFromOptions(
  options: readonly { value: string; label: string }[],
  value: string
) {
  return options.find((o) => o.value === value)?.label ?? (value || "—");
}

/** Returns true when the intro form has enough data to show on a PDF. */
export function hasIntroForPdf(intro?: IntroFormData | null) {
  if (!intro) return false;
  return Boolean(
    intro.businessName.trim() ||
      intro.name.trim() ||
      intro.businessType.trim()
  );
}

export function drawBusinessProfileSection(
  pdf: jsPDF,
  intro: IntroFormData,
  yStart: number
) {
  let y = drawSectionHeader(pdf, "Business Profile", yStart, {
    icon: "user",
  });
  const rows: Array<[string, string]> = [
    ["Date", intro.date || "—"],
    ["Budget Amount", moneyOrDash(intro.budgetAmount)],
    ["Owner / Applicant", intro.name || "—"],
    [
      "Square Footage",
      intro.squareFootage.trim()
        ? `${intro.squareFootage.trim()} sq ft`
        : "—",
    ],
    ["Business Name", intro.businessName || "—"],
    ["Business Type", getBusinessTypeLabel(intro.businessType) || "—"],
  ];
  y = drawProfileGrid(pdf, rows, y);
  return y + 2;
}

export function drawLoanApplicationSection(
  pdf: jsPDF,
  loan: LoanApplicationData,
  yStart: number
) {
  let y = drawSectionHeader(pdf, "Loan Application", yStart, {
    accent: PDF.colors.navy,
    icon: "check",
  });
  let alt = false;

  const blocks: Array<{ title: string; rows: Array<[string, string]> }> = [
    {
      title: "Applicant",
      rows: [
        ["Full Name", loan.fullName || "—"],
        ["Date of Birth", loan.dateOfBirth || "—"],
        ["Address", loan.currentAddress || "—"],
        [
          "City / State / ZIP",
          [loan.city, loan.state, loan.zipCode].filter(Boolean).join(", ") ||
            "—",
        ],
        ["Phone", loan.phoneNumber || "—"],
        ["Email", loan.emailAddress || "—"],
      ],
    },
    {
      title: "Employment",
      rows: [
        ["Employer", loan.currentEmployer || "—"],
        ["Occupation", loan.occupation || "—"],
        ["Work Address", loan.employmentAddress || "—"],
        [
          "City / State / ZIP",
          [
            loan.employmentCity,
            loan.employmentState,
            loan.employmentZipCode,
          ]
            .filter(Boolean)
            .join(", ") || "—",
        ],
        ["Work Phone", loan.workPhoneNumber || "—"],
        ["Length of Employment", loan.lengthOfEmployment || "—"],
      ],
    },
    {
      title: "Financial",
      rows: [
        ["Gross Monthly Income", moneyOrDash(loan.grossMonthlyIncome)],
        ["Other Monthly Income", moneyOrDash(loan.otherMonthlyIncome)],
        ["Monthly Rent / Mortgage", moneyOrDash(loan.monthlyRentMortgage)],
        ["Outstanding Debts", moneyOrDash(loan.outstandingDebts)],
        ["Credit Cards Held", loan.creditCardsHeld || "—"],
      ],
    },
    {
      title: "Banking",
      rows: [
        ["Bank Name", loan.nameOfBank || "—"],
        [
          "Account Type",
          labelFromOptions(ACCOUNT_TYPE_OPTIONS, loan.accountType),
        ],
        ["Account Number", loan.accountNumber || "—"],
        ["Time with Bank", loan.lengthOfTimeWithBank || "—"],
      ],
    },
    {
      title: "References",
      rows: [
        ["Reference 1", loan.reference1Name || "—"],
        ["Relationship", loan.reference1Relationship || "—"],
        ["Phone", loan.reference1Phone || "—"],
        ["Address", loan.reference1Address || "—"],
        ["Reference 2", loan.reference2Name || "—"],
        ["Relationship", loan.reference2Relationship || "—"],
        ["Phone", loan.reference2Phone || "—"],
        ["Address", loan.reference2Address || "—"],
      ],
    },
    {
      title: "Credit Request",
      rows: [
        ["Requested Credit Limit", moneyOrDash(loan.requestedCreditLimit)],
        [
          "Purpose of Credit",
          labelFromOptions(CREDIT_PURPOSE_OPTIONS, loan.purposeOfCredit),
        ],
        ["Applicant Signature", loan.applicantSignature || "—"],
        ["Agreement Date", loan.agreementDate || "—"],
      ],
    },
  ];

  for (const block of blocks) {
    // Keep block title with at least the first key/value row on the same page
    y = ensureSpace(pdf, y, 28);
    y = drawBlockTitle(pdf, block.title, y);
    for (const [label, value] of block.rows) {
      y = drawKeyValueRow(pdf, label, value, y, { alt: (alt = !alt) });
    }
    y += 3;
  }

  return y;
}
