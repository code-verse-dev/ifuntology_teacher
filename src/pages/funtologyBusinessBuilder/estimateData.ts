export type EstimateLineItem = {
  id: string;
  name: string;
  unitCost: number;
};

export type MonthlySelectableItem = {
  id: string;
  name: string;
  monthlyCost: number;
};

/** Unit costs = image line total ÷ quantity shown on the estimate sheet. */
export const CONSTRUCTION_ITEMS: EstimateLineItem[] = [
  { id: "flooring", name: "Flooring", unitCost: 875 / 5 },
  { id: "walls-paints", name: "Walls & Paints", unitCost: 2300 / 5 },
  { id: "ceiling", name: "Ceiling", unitCost: 700 / 2 },
  { id: "lighting", name: "Lighting", unitCost: 2500 / 3 },
  { id: "plumbing", name: "Plumbing", unitCost: 750 / 2 },
  { id: "electrical", name: "Electrical", unitCost: 1200 / 1 },
  { id: "hvac", name: "HVAC", unitCost: 1000 / 2 },
  { id: "salon-furniture", name: "Salon Furniture", unitCost: 3000 / 4 },
  { id: "cabinets-storage", name: "Cabinets & Storage", unitCost: 2000 / 5 },
];

export const ADDITIONAL_ITEMS: EstimateLineItem[] = [
  { id: "interior-doors", name: "Interior Doors", unitCost: 875 / 5 },
  { id: "glass-entry-door", name: "Glass Entry Door", unitCost: 2300 / 2 },
  { id: "window", name: "Window", unitCost: 700 / 2 },
  { id: "custom-cabinetry", name: "Custom Cabinetry", unitCost: 2500 / 5 },
  { id: "reception-desk", name: "Reception Desk Construction", unitCost: 750 / 1 },
  {
    id: "chemical-ventilation",
    name: "Chemical Ventilation System",
    unitCost: 1200 / 1,
  },
  {
    id: "wall-mirrors",
    name: "Wall-Mounted Salon Mirrors",
    unitCost: 1000 / 5,
  },
  {
    id: "glass-divider",
    name: "Glass Divider / Partition",
    unitCost: 3000 / 4,
  },
];

export const UTILITY_ITEMS: MonthlySelectableItem[] = [
  { id: "rent", name: "Rent / Lease / Mortgage", monthlyCost: 4000 },
  { id: "water", name: "Water and Sewer", monthlyCost: 220 },
  { id: "gas", name: "Natural Gas", monthlyCost: 150 },
  { id: "trash", name: "Trash Recycling", monthlyCost: 120 },
  { id: "internet", name: "Internet", monthlyCost: 110 },
  { id: "phone", name: "Phone Service", monthlyCost: 90 },
  { id: "maintenance", name: "Maintenance", monthlyCost: 250 },
  { id: "taxes", name: "Taxes", monthlyCost: 200 },
  { id: "insurance", name: "Insurance", monthlyCost: 180 },
  { id: "security", name: "Security System", monthlyCost: 100 },
];

export const EXPENSE_ITEMS: MonthlySelectableItem[] = [
  { id: "loan-replacement", name: "Loan Replacement Plan", monthlyCost: 3000 },
  { id: "marketing", name: "Marketing", monthlyCost: 500 },
  { id: "supplies", name: "Supplies", monthlyCost: 1000 },
  { id: "miscellaneous", name: "Miscellaneous", monthlyCost: 300 },
];

/** Defaults from the Business Builder Make Up Salon panel. */
export const MAKEUP_SALON_DEFAULTS = {
  staff: "",
  stations: "",
  boothRentalRate: "200",
};

/** Defaults from the Business Builder Receptionist panel. */
export const RECEPTIONIST_DEFAULTS = {
  payRate: "15",
  hoursPerWeek: "",
};

export const WEEKS_PER_MONTH = 4;

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function emptyQtyMap(items: EstimateLineItem[]) {
  return Object.fromEntries(items.map((item) => [item.id, ""])) as Record<
    string,
    string
  >;
}

export function parseQty(raw: string) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export function parseAmount(raw: string) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function sumLineItems(
  items: EstimateLineItem[],
  qtyById: Record<string, string>
) {
  return items.reduce((sum, item) => {
    const qty = parseQty(qtyById[item.id] ?? "");
    return sum + qty * item.unitCost;
  }, 0);
}

export function sumSelectedMonthlyItems(
  items: MonthlySelectableItem[],
  selectedIds: Set<string>
) {
  return items.reduce((sum, item) => {
    if (!selectedIds.has(item.id)) return sum;
    return sum + item.monthlyCost;
  }, 0);
}

/** Stations × booth rental rate × weeks/month (weekly schedule). */
export function calcMakeupSalonMonthly(input: {
  stations: string;
  boothRentalRate: string;
}) {
  const stations = parseQty(input.stations);
  const rate = parseAmount(input.boothRentalRate);
  return stations * rate * WEEKS_PER_MONTH;
}

/** Pay rate × hours/week × weeks/month. */
export function calcReceptionistMonthly(input: {
  payRate: string;
  hoursPerWeek: string;
}) {
  const payRate = parseAmount(input.payRate);
  const hours = parseAmount(input.hoursPerWeek);
  return payRate * hours * WEEKS_PER_MONTH;
}
