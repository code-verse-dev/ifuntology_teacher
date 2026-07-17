import { formatCurrency, parseAmount, parseQty } from "./estimateData";

export { formatCurrency, parseAmount, parseQty };

export type CostOption = {
  value: string;
  label: string;
  monthlyCost: number;
};

export type SelectBillField = {
  id: string;
  name: string;
  placeholder: string;
  options: CostOption[];
};

export type MonthlyItem = {
  id: string;
  name: string;
  monthlyCost: number;
};

export type VacationItem = {
  id: string;
  name: string;
  perTripCost: number;
};

/** Flat income tax rate applied to total annual income. */
export const TAX_RATE = 0.15;

/** Monthly childcare cost per child. */
export const CHILDCARE_MONTHLY_PER_CHILD = 700;

export const DEFAULT_SAVINGS_RATE = "10";

export const MARITAL_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
] as const;

const HOUSING_OPTIONS: CostOption[] = [
  { value: "none", label: "None", monthlyCost: 0 },
  { value: "studio", label: "Studio Apartment", monthlyCost: 850 },
  { value: "1-bed", label: "1-Bedroom Apartment", monthlyCost: 1200 },
  { value: "2-bed", label: "2-Bedroom Apartment", monthlyCost: 1600 },
  { value: "house", label: "Single-Family House", monthlyCost: 2200 },
];

const UTILITIES_OPTIONS: CostOption[] = [
  { value: "none", label: "None", monthlyCost: 0 },
  { value: "basic", label: "Basic", monthlyCost: 200 },
  { value: "standard", label: "Standard", monthlyCost: 400 },
  { value: "premium", label: "Premium", monthlyCost: 650 },
];

const INTERNET_OPTIONS: CostOption[] = [
  { value: "none", label: "None", monthlyCost: 0 },
  { value: "basic", label: "Basic (50 Mbps)", monthlyCost: 40 },
  { value: "standard", label: "Standard (200 Mbps)", monthlyCost: 70 },
  { value: "premium", label: "Premium (1 Gbps)", monthlyCost: 110 },
];

const PHONE_OPTIONS: CostOption[] = [
  { value: "none", label: "None", monthlyCost: 0 },
  { value: "basic", label: "Basic Plan", monthlyCost: 35 },
  { value: "standard", label: "Standard Plan", monthlyCost: 65 },
  { value: "premium", label: "Unlimited Plan", monthlyCost: 100 },
];

const FOOD_OPTIONS: CostOption[] = [
  { value: "none", label: "None", monthlyCost: 0 },
  { value: "budget", label: "Budget", monthlyCost: 300 },
  { value: "moderate", label: "Moderate", monthlyCost: 550 },
  { value: "generous", label: "Generous", monthlyCost: 850 },
];

const TRANSPORT_OPTIONS: CostOption[] = [
  { value: "none", label: "None", monthlyCost: 0 },
  { value: "transit", label: "Public Transit", monthlyCost: 120 },
  { value: "economy", label: "Economy Car", monthlyCost: 350 },
  { value: "suv", label: "SUV", monthlyCost: 550 },
  { value: "luxury", label: "Luxury Car", monthlyCost: 850 },
];

export const CLOTHING_OPTIONS: CostOption[] = [
  { value: "none", label: "None", monthlyCost: 0 },
  { value: "budget", label: "Budget", monthlyCost: 50 },
  { value: "moderate", label: "Moderate", monthlyCost: 150 },
  { value: "premium", label: "Premium", monthlyCost: 400 },
];

export const BILL_FIELDS: SelectBillField[] = [
  {
    id: "housing",
    name: "Housing",
    placeholder: "Choose your home",
    options: HOUSING_OPTIONS,
  },
  {
    id: "houseSupplies",
    name: "House Supplies, Utilities, Furniture & Decor",
    placeholder: "Choose your utilities",
    options: UTILITIES_OPTIONS,
  },
  {
    id: "internet",
    name: "Internet",
    placeholder: "Choose your internet",
    options: INTERNET_OPTIONS,
  },
  {
    id: "phone",
    name: "Phone",
    placeholder: "Choose your phone plan",
    options: PHONE_OPTIONS,
  },
  {
    id: "food",
    name: "Food",
    placeholder: "Choose your food",
    options: FOOD_OPTIONS,
  },
  {
    id: "transportation",
    name: "Transportation",
    placeholder: "Choose your car",
    options: TRANSPORT_OPTIONS,
  },
];

export const SUBSCRIPTION_ITEMS: MonthlyItem[] = [
  { id: "netflix", name: "Netflix", monthlyCost: 15.49 },
  { id: "hulu", name: "Hulu", monthlyCost: 7.99 },
  { id: "disney", name: "Disney+", monthlyCost: 13.99 },
  { id: "paramount", name: "Paramount+", monthlyCost: 11.99 },
  { id: "cable", name: "Cable", monthlyCost: 80 },
  { id: "amazon", name: "Amazon Prime", monthlyCost: 14.99 },
  { id: "gym", name: "Gym Membership", monthlyCost: 40 },
];

export const PET_ITEMS: MonthlyItem[] = [
  { id: "dog", name: "Dog", monthlyCost: 100 },
  { id: "cat", name: "Cat", monthlyCost: 60 },
  { id: "other-pet", name: "Other", monthlyCost: 40 },
];

export const VACATION_ITEMS: VacationItem[] = [
  { id: "cruise", name: "Cruise", perTripCost: 2000 },
  { id: "theme-park", name: "Theme Park", perTripCost: 800 },
  { id: "resort", name: "Resort", perTripCost: 1500 },
  { id: "plane-trip", name: "Plane Trip", perTripCost: 600 },
];

export function optionCost(options: CostOption[], value: string) {
  return options.find((o) => o.value === value)?.monthlyCost ?? 0;
}

function clampFraction(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

export type StudentBudgetInput = {
  annualSalary: string;
  maritalStatus: string;
  children: string;
  savingsRate: string;
  billSelections: Record<string, string>;
  childcareChildren: string;
  clothing: string;
  diningOut: string;
  selectedSubscriptions: string[];
  selectedPets: string[];
  selectedVacations: string[];
  vacationTrips: Record<string, string>;
};

export type StudentBudgetResult = ReturnType<typeof computeStudentBudget>;

export function computeStudentBudget(input: StudentBudgetInput) {
  const totalAnnualIncome = parseAmount(input.annualSalary);
  const averageMonthlyIncome = totalAnnualIncome / 12;
  const taxDeductions = totalAnnualIncome * TAX_RATE;
  const remainingIncome = totalAnnualIncome - taxDeductions;

  const savingsRateFrac = clampFraction(parseAmount(input.savingsRate) / 100);
  const savingsAnnual = remainingIncome * savingsRateFrac;
  const totalIncomeAfterSavings = remainingIncome - savingsAnnual;

  // Bills (monthly)
  const childcareMonthly =
    parseQty(input.childcareChildren) * CHILDCARE_MONTHLY_PER_CHILD;
  const billsMonthly =
    BILL_FIELDS.reduce(
      (sum, field) =>
        sum + optionCost(field.options, input.billSelections[field.id] ?? ""),
      0
    ) + childcareMonthly;
  const billsAnnual = billsMonthly * 12;

  // Expenses
  const clothingMonthly = optionCost(CLOTHING_OPTIONS, input.clothing);
  const diningMonthly = parseAmount(input.diningOut);
  const selectedSubs = new Set(input.selectedSubscriptions);
  const subscriptionsMonthly = SUBSCRIPTION_ITEMS.reduce(
    (sum, item) => (selectedSubs.has(item.id) ? sum + item.monthlyCost : sum),
    0
  );
  const selectedPetSet = new Set(input.selectedPets);
  const petsMonthly = PET_ITEMS.reduce(
    (sum, item) => (selectedPetSet.has(item.id) ? sum + item.monthlyCost : sum),
    0
  );
  const expensesMonthlyRecurring =
    clothingMonthly + diningMonthly + subscriptionsMonthly + petsMonthly;

  const selectedVacationSet = new Set(input.selectedVacations);
  const vacationsAnnual = VACATION_ITEMS.reduce((sum, item) => {
    if (!selectedVacationSet.has(item.id)) return sum;
    const trips = parseQty(input.vacationTrips[item.id] ?? "");
    return sum + trips * item.perTripCost;
  }, 0);

  const expensesAnnual = expensesMonthlyRecurring * 12 + vacationsAnnual;
  const expensesMonthlyAvg = expensesAnnual / 12;

  // Net pay
  const totalAnnualTakehome = totalIncomeAfterSavings;
  const remainingAnnualTotal =
    totalAnnualTakehome - billsAnnual - expensesAnnual;
  const remainingMonthlyAverage = remainingAnnualTotal / 12;
  const remainingTotalWithSavings = remainingAnnualTotal + savingsAnnual;
  const remainingWithSavingsMonthly = remainingTotalWithSavings / 12;

  const budgetSpent = billsAnnual + expensesAnnual;
  const personalChecking =
    remainingTotalWithSavings > 0 ? remainingTotalWithSavings * 0.7 : 0;
  const businessChecking =
    remainingTotalWithSavings > 0 ? remainingTotalWithSavings * 0.3 : 0;

  const familySize =
    (input.maritalStatus === "married" ? 2 : 1) + parseQty(input.children);

  return {
    totalAnnualIncome,
    averageMonthlyIncome,
    taxDeductions,
    remainingIncome,
    savingsAnnual,
    totalIncomeAfterSavings,
    billsMonthly,
    billsAnnual,
    childcareMonthly,
    clothingMonthly,
    diningMonthly,
    subscriptionsMonthly,
    petsMonthly,
    vacationsAnnual,
    expensesMonthlyAvg,
    expensesAnnual,
    totalAnnualTakehome,
    remainingAnnualTotal,
    remainingMonthlyAverage,
    remainingTotalWithSavings,
    remainingWithSavingsMonthly,
    budgetSpent,
    personalChecking,
    businessChecking,
    familySize,
  };
}
