export type LoanApplicationData = {
  // Applicant
  fullName: string;
  dateOfBirth: string;
  currentAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  emailAddress: string;
  // Employment
  currentEmployer: string;
  occupation: string;
  employmentAddress: string;
  employmentCity: string;
  employmentState: string;
  employmentZipCode: string;
  workPhoneNumber: string;
  lengthOfEmployment: string;
  // Financial
  grossMonthlyIncome: string;
  otherMonthlyIncome: string;
  monthlyRentMortgage: string;
  outstandingDebts: string;
  creditCardsHeld: string;
  // Banking
  nameOfBank: string;
  accountType: string;
  accountNumber: string;
  lengthOfTimeWithBank: string;
  // References
  reference1Name: string;
  reference1Relationship: string;
  reference1Phone: string;
  reference1Address: string;
  reference2Name: string;
  reference2Relationship: string;
  reference2Phone: string;
  reference2Address: string;
  // Credit
  requestedCreditLimit: string;
  purposeOfCredit: string;
  // Agreement
  applicantSignature: string;
  agreementDate: string;
};

export function createEmptyLoanApplication(): LoanApplicationData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    fullName: "",
    dateOfBirth: "",
    currentAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    emailAddress: "",
    currentEmployer: "",
    occupation: "",
    employmentAddress: "",
    employmentCity: "",
    employmentState: "",
    employmentZipCode: "",
    workPhoneNumber: "",
    lengthOfEmployment: "",
    grossMonthlyIncome: "",
    otherMonthlyIncome: "",
    monthlyRentMortgage: "",
    outstandingDebts: "",
    creditCardsHeld: "",
    nameOfBank: "",
    accountType: "",
    accountNumber: "",
    lengthOfTimeWithBank: "",
    reference1Name: "",
    reference1Relationship: "",
    reference1Phone: "",
    reference1Address: "",
    reference2Name: "",
    reference2Relationship: "",
    reference2Phone: "",
    reference2Address: "",
    requestedCreditLimit: "",
    purposeOfCredit: "",
    applicantSignature: "",
    agreementDate: today,
  };
}

export function validateLoanApplication(
  data: LoanApplicationData
): string | null {
  if (!data.fullName.trim()) return "Please enter the applicant full name.";
  if (!data.dateOfBirth.trim()) return "Please enter the date of birth.";
  if (!data.currentAddress.trim()) return "Please enter the current address.";
  if (!data.city.trim()) return "Please enter the city.";
  if (!data.state.trim()) return "Please enter the state.";
  if (!data.zipCode.trim()) return "Please enter the ZIP code.";
  if (!data.phoneNumber.trim()) return "Please enter a phone number.";
  if (!data.emailAddress.trim()) return "Please enter an email address.";
  if (!data.currentEmployer.trim()) return "Please enter the current employer.";
  if (!data.occupation.trim()) return "Please enter the occupation.";
  if (!data.grossMonthlyIncome.trim()) {
    return "Please enter gross monthly income.";
  }
  if (!data.nameOfBank.trim()) return "Please enter the bank name.";
  if (!data.accountType.trim()) return "Please select an account type.";
  if (!data.requestedCreditLimit.trim()) {
    return "Please enter the requested credit limit.";
  }
  if (!data.purposeOfCredit.trim()) return "Please select the purpose of credit.";
  if (!data.applicantSignature.trim()) {
    return "Please enter the applicant signature.";
  }
  if (!data.agreementDate.trim()) return "Please enter the agreement date.";
  return null;
}

export const ACCOUNT_TYPE_OPTIONS = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "both", label: "Checking & Savings" },
  { value: "other", label: "Other" },
] as const;

export const CREDIT_PURPOSE_OPTIONS = [
  { value: "personal", label: "Personal" },
  { value: "business", label: "Business" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
] as const;
