import {
  AirVent,
  Armchair,
  Bath,
  DoorOpen,
  Droplets,
  Frame,
  Grid2x2,
  HardHat,
  LayoutGrid,
  PaintRoller,
  PanelTop,
  Ruler,
  Warehouse,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type EstimateLineItem = {
  id: string;
  name: string;
  unitCost: number;
  unitHint?: string;
  icon?: LucideIcon;
};

export type EstimateCategory = {
  id: string;
  title: string;
  subtitle: string;
  headerGradient: string;
  headerIcon: LucideIcon;
  items: EstimateLineItem[];
};

export type MonthlySelectableItem = {
  id: string;
  name: string;
  monthlyCost: number;
};

const gradients = {
  violet: "bg-gradient-to-r from-violet-600 to-fuchsia-600",
  sky: "bg-gradient-to-r from-sky-500 to-blue-600",
  emerald: "bg-gradient-to-r from-emerald-500 to-teal-600",
  amber: "bg-gradient-to-r from-amber-500 to-orange-600",
  rose: "bg-gradient-to-r from-rose-500 to-pink-600",
  indigo: "bg-gradient-to-r from-indigo-500 to-blue-700",
  slate: "bg-gradient-to-r from-slate-600 to-slate-800",
  cyan: "bg-gradient-to-r from-cyan-500 to-sky-700",
} as const;

/** Raw materials + furniture categories for the Salon Estimate step. */
export const ESTIMATE_CATEGORIES: EstimateCategory[] = [
  {
    id: "framing",
    title: "Framing & Structural Materials",
    subtitle: "Per item · Qty × unit cost",
    headerGradient: gradients.violet,
    headerIcon: HardHat,
    items: [
      { id: "framing-wood-studs", name: "Wood studs", unitCost: 4 },
      { id: "framing-metal-studs", name: "Metal studs", unitCost: 8 },
      { id: "framing-drywall", name: "Drywall", unitCost: 12 },
      { id: "framing-sheetrock", name: "Sheetrock", unitCost: 20 },
      { id: "framing-joint-compound", name: "Joint compound", unitCost: 10 },
      { id: "framing-tape", name: "Tape", unitCost: 25 },
      { id: "framing-plywood", name: "Plywood", unitCost: 30 },
      {
        id: "framing-subfloor",
        name: "Subfloor or Partitions",
        unitCost: 60,
      },
      { id: "framing-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "flooring",
    title: "Flooring",
    subtitle: "Per item · Qty × unit cost",
    headerGradient: gradients.sky,
    headerIcon: Grid2x2,
    items: [
      { id: "floor-vinyl-planks", name: "Vinyl planks", unitCost: 2 },
      { id: "floor-flooring", name: "Flooring", unitCost: 4 },
      { id: "floor-ceramic", name: "Ceramic Tiles", unitCost: 3 },
      { id: "floor-porcelain", name: "Porcelain tiles", unitCost: 6 },
      { id: "floor-grout", name: "Grout", unitCost: 0.5 },
      { id: "floor-underlayment", name: "Underlayment", unitCost: 1 },
      { id: "floor-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "paint",
    title: "Paint & Wall Finishes",
    subtitle: "Per gallon / roll · Qty × unit cost",
    headerGradient: gradients.emerald,
    headerIcon: PaintRoller,
    items: [
      {
        id: "paint-primer",
        name: "Primer",
        unitCost: 20,
        unitHint: "per gallon",
      },
      {
        id: "paint-oil",
        name: "Oil Paint",
        unitCost: 30,
        unitHint: "per gallon",
      },
      {
        id: "paint-interior",
        name: "Interior paint",
        unitCost: 30,
        unitHint: "per gallon",
      },
      {
        id: "paint-salon-grade",
        name: "Salon-Grade Paint",
        unitCost: 50,
        unitHint: "per gallon",
      },
      {
        id: "paint-wallpaper",
        name: "Accent wallpaper",
        unitCost: 50,
        unitHint: "per roll",
      },
      {
        id: "paint-exterior",
        name: "Exterior Paint",
        unitCost: 40,
        unitHint: "per gallon",
      },
      { id: "paint-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "ceiling",
    title: "Ceiling Materials",
    subtitle: "Per sq ft / tile · Qty × unit cost",
    headerGradient: gradients.amber,
    headerIcon: PanelTop,
    items: [
      {
        id: "ceiling-drop-tiles",
        name: "Drop Ceiling Tiles",
        unitCost: 2,
        unitHint: "per sq ft",
      },
      {
        id: "ceiling-tin-tiles",
        name: "Tin Tiles",
        unitCost: 10,
        unitHint: "per tile",
      },
      {
        id: "ceiling-grid",
        name: "Ceiling Grid System",
        unitCost: 1.5,
        unitHint: "per sq ft",
      },
      {
        id: "ceiling-acoustic",
        name: "Acoustic Panels",
        unitCost: 30,
        unitHint: "each",
      },
      { id: "ceiling-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "electrical",
    title: "Electrical Materials",
    subtitle: "Per foot / each · Qty × unit cost",
    headerGradient: gradients.rose,
    headerIcon: Zap,
    items: [
      {
        id: "elec-wiring",
        name: "Wiring",
        unitCost: 0.3,
        unitHint: "per foot",
      },
      {
        id: "elec-conduit",
        name: "Conduit",
        unitCost: 0.75,
        unitHint: "per foot",
      },
      {
        id: "elec-switches",
        name: "Switches-outlets",
        unitCost: 3,
        unitHint: "each",
      },
      {
        id: "elec-face-plates",
        name: "Face Plates",
        unitCost: 10,
        unitHint: "each",
      },
      {
        id: "elec-light-fixtures",
        name: "Light fixtures",
        unitCost: 50,
        unitHint: "each",
      },
      {
        id: "elec-track-recessed",
        name: "Track / recessed Lights",
        unitCost: 150,
        unitHint: "each",
      },
      {
        id: "elec-breaker",
        name: "Breaker Panel",
        unitCost: 150,
        unitHint: "each",
      },
      { id: "elec-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "plumbing",
    title: "Plumbing Materials",
    subtitle: "Per kit / ft · Qty × unit cost",
    headerGradient: gradients.indigo,
    headerIcon: Droplets,
    items: [
      {
        id: "plumb-toilet-sink",
        name: "Toilet & Sink Plumbing Kits",
        unitCost: 30,
        unitHint: "each",
      },
      {
        id: "plumb-water-heater",
        name: "Hot water heater Plumbing Kit",
        unitCost: 60,
        unitHint: "each",
      },
      {
        id: "plumb-shampoo",
        name: "Shampoo Bowl Plumbing Kit",
        unitCost: 100,
        unitHint: "each",
      },
      {
        id: "plumb-kit",
        name: "Plumbing kit",
        unitCost: 45,
        unitHint: "each",
      },
      {
        id: "plumb-pvc",
        name: "PVC Pipe",
        unitCost: 2.9,
        unitHint: "per ft",
      },
      {
        id: "plumb-copper",
        name: "Copper Pipe",
        unitCost: 6,
        unitHint: "per ft",
      },
      {
        id: "plumb-galvanized",
        name: "Galvanized Pipe",
        unitCost: 5.5,
        unitHint: "per ft",
      },
      { id: "plumb-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "hvac",
    title: "HVAC & Ventilation",
    subtitle: "Per ft / each · Qty × unit cost",
    headerGradient: gradients.cyan,
    headerIcon: AirVent,
    items: [
      {
        id: "hvac-ductwork",
        name: "Ductwork",
        unitCost: 1,
        unitHint: "per ft",
      },
      {
        id: "hvac-materials",
        name: "Materials",
        unitCost: 3,
        unitHint: "per ft",
      },
      {
        id: "hvac-ac",
        name: "Air Conditioning Unit",
        unitCost: 3800,
        unitHint: "each",
      },
      {
        id: "hvac-fans",
        name: "Ventilation fans",
        unitCost: 75,
        unitHint: "each",
      },
      {
        id: "hvac-thermostats",
        name: "Thermostats",
        unitCost: 35,
        unitHint: "each",
      },
      { id: "hvac-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "doors-windows",
    title: "Doors & Windows",
    subtitle: "Per item · Qty × unit cost",
    headerGradient: gradients.slate,
    headerIcon: DoorOpen,
    items: [
      { id: "dw-interior-doors", name: "Interior Doors", unitCost: 100 },
      { id: "dw-doors", name: "Doors", unitCost: 250 },
      { id: "dw-glass-entry", name: "Glass entry", unitCost: 800 },
      { id: "dw-customized", name: "Customized Door", unitCost: 1500 },
      { id: "dw-windows", name: "Windows", unitCost: 500 },
      { id: "dw-exterior", name: "Exterior Doors", unitCost: 500 },
      { id: "dw-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "cabinets",
    title: "Counters, Cabinets & Storage",
    subtitle: "Per unit / each · Qty × unit cost",
    headerGradient: gradients.violet,
    headerIcon: Warehouse,
    items: [
      {
        id: "cab-custom",
        name: "Custom cabinetry",
        unitCost: 1500,
        unitHint: "per unit",
      },
      {
        id: "cab-stock",
        name: "Stock units",
        unitCost: 200,
        unitHint: "each",
      },
      {
        id: "cab-glass-entry",
        name: "Glass Entry Cabinets",
        unitCost: 800,
        unitHint: "each",
      },
      {
        id: "cab-reception",
        name: "Reception Station",
        unitCost: 5000,
        unitHint: "custom-built",
      },
      { id: "cab-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "mirrors",
    title: "Mirror & Glasswork",
    subtitle: "Per each / unit · Qty × unit cost",
    headerGradient: gradients.sky,
    headerIcon: Frame,
    items: [
      {
        id: "mirror-wall",
        name: "Single Wall-mounted Mirrors",
        unitCost: 100,
        unitHint: "each",
      },
      {
        id: "mirror-full",
        name: "Full Salon Mirrors",
        unitCost: 1200,
        unitHint: "each",
      },
      {
        id: "mirror-dividers",
        name: "Glass dividers",
        unitCost: 700,
        unitHint: "per unit",
      },
      {
        id: "mirror-partitions",
        name: "Partitions",
        unitCost: 5000,
        unitHint: "custom-built",
      },
      {
        id: "mirror-stations",
        name: "Styling Stations without Mirrors",
        unitCost: 325,
        unitHint: "each",
      },
      { id: "mirror-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "molding",
    title: "Plaster Molding Baseboards",
    subtitle: "Per linear ft / bag · Qty × unit cost",
    headerGradient: gradients.emerald,
    headerIcon: Ruler,
    items: [
      {
        id: "mold-baseboard",
        name: "Baseboard",
        unitCost: 1,
        unitHint: "per linear ft",
      },
      {
        id: "mold-trim",
        name: "Trim",
        unitCost: 3,
        unitHint: "per linear ft",
      },
      {
        id: "mold-crown",
        name: "Crown molding",
        unitCost: 1.5,
        unitHint: "per linear ft",
      },
      {
        id: "mold-plaster",
        name: "Plaster",
        unitCost: 10,
        unitHint: "per bag",
      },
      {
        id: "mold-compound",
        name: "Compound",
        unitCost: 25,
        unitHint: "per bag",
      },
      { id: "mold-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "restroom",
    title: "Restroom Materials",
    subtitle: "Per item · Qty × unit cost",
    headerGradient: gradients.amber,
    headerIcon: Bath,
    items: [
      { id: "rest-toilet", name: "Toilets", unitCost: 375 },
      { id: "rest-vanity-sink", name: "Vanity (with sink)", unitCost: 350 },
      { id: "rest-accessories", name: "Accessories", unitCost: 100 },
      {
        id: "rest-vanity-no-sink",
        name: "Vanity (without the sink)",
        unitCost: 175,
      },
      { id: "rest-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "construction-by-size",
    title: "Estimated Construction Cost by Size",
    subtitle: "Package totals · enter quantity (usually 0 or 1)",
    headerGradient: gradients.rose,
    headerIcon: LayoutGrid,
    items: [
      {
        id: "size-small",
        name: "Small salon (1,000 sq ft)",
        unitCost: 50000,
      },
      {
        id: "size-mid",
        name: "Mid-size salon (5,000 sq ft)",
        unitCost: 250000,
      },
      {
        id: "size-large",
        name: "Large or luxury salon (12,000 sq ft)",
        unitCost: 600000,
      },
      { id: "size-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "furniture",
    title: "Salon Furniture & Equipment",
    subtitle: "Retail prices (2025) · Qty × unit cost",
    headerGradient: gradients.indigo,
    headerIcon: Armchair,
    items: [
      {
        id: "furn-styling-chairs",
        name: "Styling Chairs",
        unitCost: 300,
        unitHint: "each",
      },
      {
        id: "furn-shampoo",
        name: "Shampoo Chairs with Bowls",
        unitCost: 600,
        unitHint: "each",
      },
      {
        id: "furn-dryer",
        name: "Dryer Chairs with Hooded Dryers",
        unitCost: 400,
        unitHint: "each",
      },
      {
        id: "furn-stations-mirrors",
        name: "Styling Stations with Mirrors",
        unitCost: 500,
        unitHint: "each",
      },
      {
        id: "furn-reception",
        name: "Reception Desk",
        unitCost: 600,
        unitHint: "each",
      },
      {
        id: "furn-waiting",
        name: "Waiting Area Chairs or Sofa",
        unitCost: 150,
        unitHint: "per seat",
      },
      {
        id: "furn-shelves",
        name: "Retail Display Shelves",
        unitCost: 250,
        unitHint: "each",
      },
      {
        id: "furn-software-basic",
        name: "Software/Hardware/Monthly Fees (Basic)",
        unitCost: 6000,
        unitHint: "each",
      },
      {
        id: "furn-software-standard",
        name: "Software/Hardware/Monthly Fees (Standard)",
        unitCost: 8000,
        unitHint: "each",
      },
      {
        id: "furn-software-large",
        name: "Software/Hardware/Monthly Fees (Large)",
        unitCost: 12000,
        unitHint: "each",
      },
      { id: "furn-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
];

export const ALL_ESTIMATE_ITEMS: EstimateLineItem[] =
  ESTIMATE_CATEGORIES.flatMap((c) => c.items);

export const MATERIAL_CATEGORIES = ESTIMATE_CATEGORIES.filter(
  (c) => c.id !== "furniture"
);
export const FURNITURE_CATEGORY = ESTIMATE_CATEGORIES.find(
  (c) => c.id === "furniture"
)!;

/** @deprecated Use ESTIMATE_CATEGORIES — kept for any residual imports. */
export const CONSTRUCTION_ITEMS = MATERIAL_CATEGORIES.flatMap((c) => c.items);
/** @deprecated Use ESTIMATE_CATEGORIES */
export const ADDITIONAL_ITEMS = FURNITURE_CATEGORY.items;

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

export const MAKEUP_SALON_DEFAULTS = {
  staff: "",
  stations: "",
  boothRentalRate: "200",
};

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

export function calcMakeupSalonMonthly(input: {
  stations: string;
  boothRentalRate: string;
}) {
  const stations = parseQty(input.stations);
  const rate = parseAmount(input.boothRentalRate);
  return stations * rate * WEEKS_PER_MONTH;
}

export function calcReceptionistMonthly(input: {
  payRate: string;
  hoursPerWeek: string;
}) {
  const payRate = parseAmount(input.payRate);
  const hours = parseAmount(input.hoursPerWeek);
  return payRate * hours * WEEKS_PER_MONTH;
}
