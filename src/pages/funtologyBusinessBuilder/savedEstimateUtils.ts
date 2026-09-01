import { createEmptyIntroForm, type IntroFormData } from "./introFormData";
import {
  FURNITURE_CATEGORIES,
  MATERIAL_CATEGORIES,
  sumLineItems,
} from "./estimateData";
import {
  computeStudentBudget,
  type StudentBudgetInput,
} from "./studentBudgetData";
import { createEmptyBudgetInput } from "./businessBuilderDraftStorage";
import type { SavedEstimate, SavedEstimatePayload } from "@/redux/services/apiSlices/businessBuilderSlice";

export function defaultSavedEstimateName(intro?: IntroFormData | null) {
  const business = intro?.businessName?.trim();
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return business ? `${business} · ${date}` : `Estimate · ${date}`;
}

export function computeSavedEstimateSnapshots(
  itemQty?: Record<string, string> | null,
  budget?: StudentBudgetInput | null
) {
  const qty = itemQty ?? {};
  const estimateMaterialsTotal = sumLineItems(
    MATERIAL_CATEGORIES.flatMap((c) => c.items),
    qty
  );
  const estimateFurnitureTotal = sumLineItems(
    FURNITURE_CATEGORIES.flatMap((c) => c.items),
    qty
  );
  const budgetRemainingAnnual = budget
    ? computeStudentBudget(budget).remainingAnnualTotal
    : 0;
  return {
    estimateMaterialsTotal,
    estimateFurnitureTotal,
    estimateGrandTotal: estimateMaterialsTotal + estimateFurnitureTotal,
    budgetRemainingAnnual,
  };
}

export function buildSavedEstimatePayload(args: {
  name: string;
  intro?: IntroFormData | null;
  itemQty?: Record<string, string> | null;
  budget?: StudentBudgetInput | null;
}): SavedEstimatePayload {
  const snapshots = computeSavedEstimateSnapshots(args.itemQty, args.budget);
  return {
    name: args.name.trim(),
    intro: args.intro ?? null,
    itemQty: args.itemQty ?? {},
    budget: args.budget ?? null,
    ...snapshots,
  };
}

export function formatSavedEstimateDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function introFromEstimate(
  intro?: Partial<IntroFormData> | null
): IntroFormData {
  const empty = createEmptyIntroForm();
  const pick = (value: unknown, fallback: string) =>
    typeof value === "string" ? value : fallback;
  return {
    date: pick(intro?.date, empty.date) || empty.date,
    name: pick(intro?.name, empty.name),
    businessName: pick(intro?.businessName, empty.businessName),
    businessType: pick(intro?.businessType, empty.businessType),
    budgetAmount: pick(intro?.budgetAmount, empty.budgetAmount),
    squareFootage: pick(intro?.squareFootage, empty.squareFootage),
  };
}

export function budgetFromEstimate(
  estimate: SavedEstimate | null | undefined
): StudentBudgetInput {
  const empty = createEmptyBudgetInput();
  const raw = estimate?.budget;
  if (!raw || typeof raw !== "object") return empty;
  return {
    ...empty,
    ...raw,
    billSelections: raw.billSelections ?? empty.billSelections,
    selectedSubscriptions: raw.selectedSubscriptions ?? [],
    selectedPets: raw.selectedPets ?? [],
    selectedVacations: raw.selectedVacations ?? [],
    vacationTrips: raw.vacationTrips ?? {},
  };
}
