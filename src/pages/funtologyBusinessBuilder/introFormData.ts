export const BUSINESS_TYPES = [
  { value: "hair-salon", label: "Hair Salon" },
  { value: "nail-salon", label: "Nail Salon" },
  { value: "spa", label: "Spa" },
  { value: "barber-shop", label: "Barber Shop" },
  { value: "beauty-salon", label: "Beauty Salon" },
  { value: "other", label: "Other" },
] as const;

export type BusinessTypeValue = (typeof BUSINESS_TYPES)[number]["value"];

export type IntroFormData = {
  date: string;
  name: string;
  businessName: string;
  businessType: string;
  budgetAmount: string;
  squareFootage: string;
};

export function createEmptyIntroForm(): IntroFormData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    name: "",
    businessName: "",
    businessType: "",
    budgetAmount: "",
    squareFootage: "",
  };
}

export function getBusinessTypeLabel(value: string) {
  return BUSINESS_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function validateIntroForm(data: IntroFormData): string | null {
  if (!data.date.trim()) return "Please enter a date.";
  if (!data.name.trim()) return "Please enter your name.";
  if (!data.businessName.trim()) return "Please enter a business name.";
  if (!data.businessType.trim()) return "Please select a business type.";
  if (!data.budgetAmount.trim() || Number(data.budgetAmount) < 0) {
    return "Please enter a valid budget amount.";
  }
  if (!data.squareFootage.trim() || Number(data.squareFootage) <= 0) {
    return "Please enter a valid square footage.";
  }
  return null;
}
