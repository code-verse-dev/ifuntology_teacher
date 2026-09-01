import { DEFAULT_SAVINGS_RATE, type StudentBudgetInput } from "./studentBudgetData";

/** Unified draft for estimate (step 2) + student budget (step 3). */
const STORAGE_KEY = "funtology-business-builder-draft-v1";
/** Legacy key used when only estimate quantities were persisted. */
const LEGACY_ESTIMATE_KEY = "funtology-estimate-v4";

export type BusinessBuilderDraft = {
  itemQty?: Record<string, string>;
  budget?: StudentBudgetInput;
  savedAt?: string;
};

export function createEmptyBudgetInput(): StudentBudgetInput {
  return {
    annualSalary: "",
    maritalStatus: "single",
    children: "0",
    savingsRate: DEFAULT_SAVINGS_RATE,
    billSelections: {},
    childcareChildren: "0",
    clothing: "none",
    diningOut: "",
    selectedSubscriptions: [],
    selectedPets: [],
    selectedVacations: [],
    vacationTrips: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeBudget(raw: unknown): StudentBudgetInput | undefined {
  if (!isRecord(raw)) return undefined;
  const empty = createEmptyBudgetInput();
  return {
    annualSalary:
      typeof raw.annualSalary === "string" ? raw.annualSalary : empty.annualSalary,
    maritalStatus:
      typeof raw.maritalStatus === "string"
        ? raw.maritalStatus
        : empty.maritalStatus,
    children: typeof raw.children === "string" ? raw.children : empty.children,
    savingsRate:
      typeof raw.savingsRate === "string" ? raw.savingsRate : empty.savingsRate,
    billSelections: isRecord(raw.billSelections)
      ? Object.fromEntries(
          Object.entries(raw.billSelections).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string"
          )
        )
      : empty.billSelections,
    childcareChildren:
      typeof raw.childcareChildren === "string"
        ? raw.childcareChildren
        : empty.childcareChildren,
    clothing: typeof raw.clothing === "string" ? raw.clothing : empty.clothing,
    diningOut: typeof raw.diningOut === "string" ? raw.diningOut : empty.diningOut,
    selectedSubscriptions: Array.isArray(raw.selectedSubscriptions)
      ? raw.selectedSubscriptions.filter((v): v is string => typeof v === "string")
      : empty.selectedSubscriptions,
    selectedPets: Array.isArray(raw.selectedPets)
      ? raw.selectedPets.filter((v): v is string => typeof v === "string")
      : empty.selectedPets,
    selectedVacations: Array.isArray(raw.selectedVacations)
      ? raw.selectedVacations.filter((v): v is string => typeof v === "string")
      : empty.selectedVacations,
    vacationTrips: isRecord(raw.vacationTrips)
      ? Object.fromEntries(
          Object.entries(raw.vacationTrips).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string"
          )
        )
      : empty.vacationTrips,
  };
}

function normalizeDraft(raw: unknown): BusinessBuilderDraft | null {
  if (!isRecord(raw)) return null;
  const itemQty = isRecord(raw.itemQty)
    ? Object.fromEntries(
        Object.entries(raw.itemQty).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string"
        )
      )
    : undefined;
  const budget = normalizeBudget(raw.budget);
  if (!itemQty && !budget) return null;
  return {
    itemQty,
    budget,
    savedAt: typeof raw.savedAt === "string" ? raw.savedAt : undefined,
  };
}

function readLegacyEstimate(): BusinessBuilderDraft | null {
  try {
    const raw = localStorage.getItem(LEGACY_ESTIMATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !isRecord(parsed.itemQty)) return null;
    const itemQty = Object.fromEntries(
      Object.entries(parsed.itemQty).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    );
    return { itemQty };
  } catch {
    return null;
  }
}

function readStoredDraft(): BusinessBuilderDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeDraft(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** Load a previously saved draft. Only exists after the user clicks Save Estimate. */
export function loadBusinessBuilderDraft(): BusinessBuilderDraft | null {
  try {
    const existing = readStoredDraft();
    if (existing) return existing;

    const legacy = readLegacyEstimate();
    if (!legacy) return null;

    // One-time migrate so future loads use the unified key.
    const migrated: BusinessBuilderDraft = {
      ...legacy,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_ESTIMATE_KEY);
    return migrated;
  } catch {
    return null;
  }
}

/** Merge partial draft into storage. Does not write unless explicitly called (Save Estimate). */
export function saveBusinessBuilderDraft(
  partial: Pick<BusinessBuilderDraft, "itemQty" | "budget">
): void {
  const existing = readStoredDraft() ?? readLegacyEstimate() ?? {};
  const next: BusinessBuilderDraft = {
    itemQty: partial.itemQty ?? existing.itemQty,
    budget: partial.budget ?? existing.budget,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  localStorage.removeItem(LEGACY_ESTIMATE_KEY);
}

/** Clear saved draft after PDF export (with or without loan). */
export function clearBusinessBuilderDraft(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_ESTIMATE_KEY);
}
