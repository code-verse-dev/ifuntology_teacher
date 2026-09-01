import {
  Armchair,
  BadgeCheck,
  Brush,
  ClipboardList,
  HandMetal,
  HardHat,
  LayoutGrid,
  Megaphone,
  Monitor,
  Scale,
  ShieldCheck,
  Shirt,
  Sparkles,
  SprayCan,
  Warehouse,
  Wifi,
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
  /** Used for KPI / PDF rollups: build vs furniture-ops */
  group: "build" | "ops";
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
  teal: "bg-gradient-to-r from-teal-500 to-emerald-700",
  orange: "bg-gradient-to-r from-orange-500 to-amber-600",
  purple: "bg-gradient-to-r from-purple-500 to-violet-700",
  pink: "bg-gradient-to-r from-pink-500 to-rose-600",
  blue: "bg-gradient-to-r from-blue-600 to-indigo-700",
  lime: "bg-gradient-to-r from-lime-500 to-green-600",
  stone: "bg-gradient-to-r from-stone-500 to-neutral-700",
  fuchsia: "bg-gradient-to-r from-fuchsia-500 to-pink-600",
} as const;

/** Salon estimate categories — unit costs are for quantity of 1. */
export const ESTIMATE_CATEGORIES: EstimateCategory[] = [
  {
    id: "registration",
    title: "Business Registration & Licensing",
    subtitle: "Filings, permits & inspections · Qty × unit cost",
    headerGradient: gradients.indigo,
    headerIcon: BadgeCheck,
    group: "build",
    items: [
      {
        id: "reg-dba",
        name: "Business Name Registration DBA Filing",
        unitCost: 100,
      },
      {
        id: "reg-llc",
        name: "Business Formation LLC Filing",
        unitCost: 100,
      },
      {
        id: "reg-ein",
        name: "Business Formation EIN",
        unitCost: 0,
        unitHint: "Free",
      },
      {
        id: "reg-license",
        name: "Business Formation Business License",
        unitCost: 150,
      },
      {
        id: "reg-occupancy",
        name: "Business Formation Occupancy Permit",
        unitCost: 250,
      },
      {
        id: "reg-contractor",
        name: "Business Formation Contractor Permit",
        unitCost: 500,
      },
      {
        id: "reg-fire",
        name: "Business Formation Fire Inspection",
        unitCost: 150,
      },
      {
        id: "reg-health",
        name: "Business Formation Health Inspection",
        unitCost: 200,
      },
      { id: "reg-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "building",
    title: "Building & Construction",
    subtitle: "Demolition, build-out, materials & systems · Qty × unit cost",
    headerGradient: gradients.amber,
    headerIcon: HardHat,
    group: "build",
    items: [
      {
        id: "build-dumpster",
        name: "Demolition Dumpster Rental",
        unitCost: 650,
      },
      {
        id: "build-demo-interior",
        name: "Demolition Interior Demolition",
        unitCost: 3500,
      },
      {
        id: "build-small-salon",
        name: "Construction (1,000 sq ft) Small Salon",
        unitCost: 50000,
      },
      {
        id: "build-mid-salon",
        name: "Construction (5,000 sq ft) Mid-Size Salon",
        unitCost: 250000,
      },
      {
        id: "build-large-salon",
        name: "Construction (12,000 sq ft) Large or Luxury Salon",
        unitCost: 600000,
      },
      { id: "build-wood-stud", name: "Framing 2x4 Wood Stud", unitCost: 4.48 },
      { id: "build-metal-stud", name: "Framing Metal Stud", unitCost: 8.98 },
      {
        id: "build-drywall",
        name: "Framing Drywall (4×8)",
        unitCost: 14.98,
      },
      { id: "build-sheetrock", name: "Framing Sheetrock", unitCost: 15.98 },
      {
        id: "build-joint-compound",
        name: "Framing Joint Compound",
        unitCost: 23.68,
      },
      {
        id: "build-drywall-screws",
        name: "Framing Drywall Screws",
        unitCost: 12.98,
      },
      {
        id: "build-drywall-tape",
        name: "Framing Drywall Tape",
        unitCost: 4.98,
      },
      { id: "build-insulation", name: "Framing Insulation", unitCost: 72 },
      {
        id: "build-plywood",
        name: 'Framing 1/2" Plywood',
        unitCost: 39.98,
      },
      {
        id: "build-osb",
        name: "Framing OSB Subfloor",
        unitCost: 21.48,
      },
      {
        id: "build-adhesive",
        name: "Framing Construction Adhesive",
        unitCost: 7.98,
      },
      {
        id: "build-lvp",
        name: "Flooring Luxury Vinyl Plank",
        unitCost: 3.48,
        unitHint: "sq. ft.",
      },
      {
        id: "build-ceramic",
        name: "Flooring Ceramic Tile",
        unitCost: 2.49,
        unitHint: "sq. ft.",
      },
      {
        id: "build-porcelain",
        name: "Flooring Porcelain Tile",
        unitCost: 3.98,
        unitHint: "sq. ft.",
      },
      {
        id: "build-floor-adhesive",
        name: "Flooring Floor Adhesive",
        unitCost: 39.98,
      },
      { id: "build-grout", name: "Flooring Grout", unitCost: 18.98 },
      {
        id: "build-underlayment",
        name: "Flooring Underlayment Roll",
        unitCost: 49.98,
      },
      {
        id: "build-baseboards",
        name: "Flooring Base Boards",
        unitCost: 8,
      },
      {
        id: "build-crown",
        name: "Flooring Crown Molding",
        unitCost: 16,
      },
      {
        id: "build-base-shoe",
        name: "Flooring Base Shoe Trim",
        unitCost: 12.98,
      },
      { id: "build-primer", name: "Paint Primer", unitCost: 29.98 },
      {
        id: "build-interior-paint",
        name: "Paint Interior Paint",
        unitCost: 42.98,
      },
      {
        id: "build-exterior-paint",
        name: "Paint Exterior Paint",
        unitCost: 49.98,
      },
      { id: "build-oil-paint", name: "Paint Oil Paint", unitCost: 54.98 },
      {
        id: "build-premium-paint",
        name: "Paint Premium Paint",
        unitCost: 69.98,
      },
      {
        id: "build-wallpaper",
        name: "Paint Wallpaper Roll",
        unitCost: 54.98,
      },
      { id: "build-ceiling-grid", name: "Ceiling Ceiling Grid", unitCost: 8.98 },
      {
        id: "build-ceiling-tiles",
        name: "Ceiling Ceiling Tiles",
        unitCost: 2.58,
      },
      {
        id: "build-acoustic",
        name: "Ceiling Acoustic Panels",
        unitCost: 36.98,
      },
      {
        id: "build-decor-ceiling",
        name: "Ceiling Decorative Ceiling Tiles",
        unitCost: 18.98,
      },
      {
        id: "build-entry-door",
        name: "Doors Commercial Entry Door",
        unitCost: 899,
      },
      {
        id: "build-interior-door",
        name: "Doors Interior Door",
        unitCost: 149,
      },
      {
        id: "build-custom-door",
        name: "Doors Door (Custom)",
        unitCost: 1500,
      },
      {
        id: "build-exterior-door",
        name: "Doors Exterior Door",
        unitCost: 500,
      },
      {
        id: "build-storefront-door",
        name: "Doors Glass Storefront Door",
        unitCost: 2500,
      },
      {
        id: "build-window",
        name: "Windows Commercial Window",
        unitCost: 750,
      },
      {
        id: "build-romex",
        name: "Electrical Romex Wire",
        unitCost: 0.88,
      },
      {
        id: "build-emt",
        name: "Electrical EMT Conduit",
        unitCost: 9.98,
      },
      {
        id: "build-breaker",
        name: "Electrical Breaker Panel",
        unitCost: 239,
      },
      {
        id: "build-led-panel",
        name: "Electrical LED Panel Light",
        unitCost: 89,
      },
      {
        id: "build-recessed",
        name: "Electrical Recessed Lighting",
        unitCost: 24.98,
      },
      {
        id: "build-exit-sign",
        name: "Electrical Exit Sign",
        unitCost: 39.98,
      },
      {
        id: "build-face-plates",
        name: "Electrical Outlet Face Plates",
        unitCost: 9.99,
      },
      {
        id: "build-gfci",
        name: "Electrical GFCI Outlet",
        unitCost: 24.98,
      },
      { id: "build-toilets", name: "Plumbing Toilets", unitCost: 375 },
      { id: "build-pvc", name: "Plumbing PVC Pipe", unitCost: 3.28 },
      {
        id: "build-copper",
        name: "Plumbing Copper Pipe",
        unitCost: 22.98,
      },
      { id: "build-pex", name: "Plumbing PEX Pipe", unitCost: 0.98 },
      {
        id: "build-water-heater",
        name: "Plumbing Water Heater",
        unitCost: 699,
      },
      {
        id: "build-plumbing-kit",
        name: "Plumbing Plumbing Kit",
        unitCost: 45,
      },
      {
        id: "build-commercial-sink",
        name: "Plumbing Commercial Sink",
        unitCost: 399,
      },
      {
        id: "build-shampoo-kit",
        name: "Plumbing Shampoo Plumbing Kit",
        unitCost: 119,
      },
      {
        id: "build-hvac-5ton",
        name: "HVAC 5-Ton HVAC System",
        unitCost: 6500,
      },
      { id: "build-thermostat", name: "HVAC Thermostat", unitCost: 129 },
      { id: "build-ducts", name: "HVAC Ducts", unitCost: 3.5 },
      { id: "build-vent-fan", name: "HVAC Vent Fan", unitCost: 95 },
      { id: "build-air-filter", name: "HVAC Air Filter", unitCost: 29 },
      { id: "build-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "counters",
    title: "Counters, Cabinets, Sinks & Storage",
    subtitle: "Vanities, counters & cabinetry · Qty × unit cost",
    headerGradient: gradients.teal,
    headerIcon: Warehouse,
    group: "build",
    items: [
      {
        id: "counter-vanity-sink",
        name: "Vanity with Sink",
        unitCost: 350,
        unitHint: "each",
      },
      {
        id: "counter-vanity-no-sink",
        name: "Vanity without Sink",
        unitCost: 275,
        unitHint: "each",
      },
      {
        id: "counter-accessories",
        name: "Accessories",
        unitCost: 120,
        unitHint: "per",
      },
      {
        id: "counter-tops",
        name: "Countertops",
        unitCost: 200,
        unitHint: "sq ft",
      },
      {
        id: "counter-butcher",
        name: "Butcher Block",
        unitCost: 350,
        unitHint: "each",
      },
      {
        id: "counter-quartz",
        name: "Countertop (Quartz)",
        unitCost: 800,
        unitHint: "sq ft",
      },
      {
        id: "counter-base-cabinets",
        name: "Base Cabinets",
        unitCost: 190,
        unitHint: "sq ft",
      },
      {
        id: "counter-pantry",
        name: "Tall Pantry",
        unitCost: 450,
        unitHint: "each",
      },
      {
        id: "counter-utility",
        name: "Utility Storage",
        unitCost: 350,
        unitHint: "each",
      },
      {
        id: "counter-freestanding",
        name: "Free Standing",
        unitCost: 500,
        unitHint: "each",
      },
      {
        id: "counter-custom",
        name: "Custom Cabinetry",
        unitCost: 1500,
        unitHint: "sq ft",
      },
      {
        id: "counter-retail-stock",
        name: "Retail Stock Units",
        unitCost: 200,
        unitHint: "each",
      },
      { id: "counter-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "reception",
    title: "Reception Area",
    subtitle: "Front desk & guest amenities · Qty × unit cost",
    headerGradient: gradients.sky,
    headerIcon: LayoutGrid,
    group: "build",
    items: [
      {
        id: "recv-desk-custom",
        name: "Reception Desk Custom",
        unitCost: 5000,
      },
      {
        id: "recv-desk-standard",
        name: "Reception Desk Standard",
        unitCost: 900,
      },
      {
        id: "recv-guest-chairs",
        name: "Guest Chairs",
        unitCost: 175,
        unitHint: "each",
      },
      {
        id: "recv-coffee",
        name: "Coffee Station Complete",
        unitCost: 450,
      },
      {
        id: "recv-water",
        name: "Water Cooler",
        unitCost: 250,
        unitHint: "each",
      },
      {
        id: "recv-shelving",
        name: "Retail Shelving",
        unitCost: 299,
        unitHint: "each",
      },
      { id: "recv-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "salon-furniture",
    title: "Salon Furniture",
    subtitle: "Chairs, stations & mirrors · Qty × unit cost",
    headerGradient: gradients.rose,
    headerIcon: Armchair,
    group: "ops",
    items: [
      {
        id: "furn-styling-chair",
        name: "Styling Chair",
        unitCost: 399,
        unitHint: "each",
      },
      {
        id: "furn-barber-chair",
        name: "Barber Chair",
        unitCost: 999,
        unitHint: "each",
      },
      {
        id: "furn-shampoo-set",
        name: "Shampoo Chair & Bowl Set",
        unitCost: 899,
      },
      {
        id: "furn-hooded-dryer",
        name: "Hooded Dryer",
        unitCost: 699,
        unitHint: "each",
      },
      {
        id: "furn-dryer-chair",
        name: "Dryer Chair",
        unitCost: 499,
        unitHint: "each",
      },
      {
        id: "furn-station-mirrors",
        name: "Styling Station with Mirrors",
        unitCost: 699,
        unitHint: "each",
      },
      {
        id: "furn-station-no-mirrors",
        name: "Styling Station without Mirrors",
        unitCost: 325,
        unitHint: "each",
      },
      {
        id: "furn-anti-fatigue",
        name: "Anti-Fatigue Mat",
        unitCost: 79,
        unitHint: "each",
      },
      {
        id: "furn-stool",
        name: "Salon Stool",
        unitCost: 149,
        unitHint: "each",
      },
      {
        id: "furn-rolling-cart",
        name: "Rolling Cart",
        unitCost: 129,
        unitHint: "each",
      },
      {
        id: "furn-mirror",
        name: "Mirror",
        unitCost: 199,
        unitHint: "each",
      },
      {
        id: "furn-mirror-single",
        name: "Mirror (Single)",
        unitCost: 100,
        unitHint: "each",
      },
      {
        id: "furn-glass-divider",
        name: "Glass Divider",
        unitCost: 700,
        unitHint: "each",
      },
      {
        id: "furn-partitions",
        name: "Partitions Custom",
        unitCost: 5000,
      },
      {
        id: "furn-full-wall-mirror",
        name: "Full Wall Mirror",
        unitCost: 1299,
        unitHint: "each",
      },
      { id: "furn-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "barber",
    title: "Barber Equipment",
    subtitle: "Clippers, razors & implements · Qty × unit cost",
    headerGradient: gradients.slate,
    headerIcon: HandMetal,
    group: "ops",
    items: [
      {
        id: "barber-clippers",
        name: "Clippers",
        unitCost: 199,
        unitHint: "each",
      },
      {
        id: "barber-trimmers",
        name: "Trimmers",
        unitCost: 149,
        unitHint: "each",
      },
      {
        id: "barber-foil",
        name: "Foil Shaver",
        unitCost: 99,
        unitHint: "each",
      },
      {
        id: "barber-straight-razor",
        name: "Straight Razor",
        unitCost: 49,
        unitHint: "each",
      },
      {
        id: "barber-pole",
        name: "Barber Pole",
        unitCost: 299,
        unitHint: "each",
      },
      {
        id: "barber-implements",
        name: "Implements & Equipment",
        unitCost: 4000,
        unitHint: "each",
      },
      { id: "barber-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "cosmetology",
    title: "Cosmetology Tools",
    subtitle: "Shears, irons, brushes & products · Qty × unit cost",
    headerGradient: gradients.pink,
    headerIcon: Brush,
    group: "ops",
    items: [
      {
        id: "cosmo-shears",
        name: "Professional Shears",
        unitCost: 299,
        unitHint: "each",
      },
      {
        id: "cosmo-thinning",
        name: "Thinning Shears",
        unitCost: 149,
        unitHint: "each",
      },
      {
        id: "cosmo-razor-comb",
        name: "Razor Comb",
        unitCost: 19,
        unitHint: "each",
      },
      {
        id: "cosmo-blow-dryer",
        name: "Blow Dryer",
        unitCost: 199,
        unitHint: "each",
      },
      {
        id: "cosmo-flat-iron",
        name: "Flat Iron",
        unitCost: 169,
        unitHint: "each",
      },
      {
        id: "cosmo-curling",
        name: "Curling Iron",
        unitCost: 129,
        unitHint: "each",
      },
      {
        id: "cosmo-hot-comb",
        name: "Hot Comb",
        unitCost: 69,
        unitHint: "each",
      },
      {
        id: "cosmo-brushes",
        name: "Brushes (Set)",
        unitCost: 99,
        unitHint: "set",
      },
      {
        id: "cosmo-combs",
        name: "Combs (Set)",
        unitCost: 49,
        unitHint: "set",
      },
      {
        id: "cosmo-spray",
        name: "Spray Bottles",
        unitCost: 6,
        unitHint: "each",
      },
      {
        id: "cosmo-products",
        name: "Products Bulk",
        unitCost: 10000,
      },
      { id: "cosmo-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "nail",
    title: "Nail Equipment",
    subtitle: "Tables, lamps, spas & products · Qty × unit cost",
    headerGradient: gradients.fuchsia,
    headerIcon: Sparkles,
    group: "ops",
    items: [
      {
        id: "nail-table",
        name: "Nail Table",
        unitCost: 399,
        unitHint: "each",
      },
      {
        id: "nail-lamp",
        name: "Nail Lamp",
        unitCost: 99,
        unitHint: "each",
      },
      {
        id: "nail-drill",
        name: "Nail Drill",
        unitCost: 199,
        unitHint: "each",
      },
      {
        id: "nail-dust",
        name: "Dust Collector",
        unitCost: 149,
        unitHint: "each",
      },
      {
        id: "nail-pedi-spa",
        name: "Pedicure Spa Chair",
        unitCost: 2500,
        unitHint: "each",
      },
      {
        id: "nail-products",
        name: "Nail Products Bulk",
        unitCost: 6000,
      },
      {
        id: "nail-implements",
        name: "Nail Implements Bulk",
        unitCost: 3000,
      },
      {
        id: "nail-polish-rack",
        name: "Polish Rack",
        unitCost: 199,
        unitHint: "each",
      },
      { id: "nail-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "skincare",
    title: "Skincare Equipment",
    subtitle: "Facial beds, machines & products · Qty × unit cost",
    headerGradient: gradients.cyan,
    headerIcon: SprayCan,
    group: "ops",
    items: [
      {
        id: "skin-facial-bed",
        name: "Facial Bed",
        unitCost: 799,
        unitHint: "each",
      },
      {
        id: "skin-steamer",
        name: "Facial Steamer",
        unitCost: 199,
        unitHint: "each",
      },
      {
        id: "skin-magnifying",
        name: "Magnifying Lamp",
        unitCost: 149,
        unitHint: "each",
      },
      {
        id: "skin-high-freq",
        name: "High Frequency Machine",
        unitCost: 199,
        unitHint: "each",
      },
      {
        id: "skin-wax",
        name: "Wax Warmer",
        unitCost: 89,
        unitHint: "each",
      },
      {
        id: "skin-towel",
        name: "Towel Warmer",
        unitCost: 299,
        unitHint: "each",
      },
      {
        id: "skin-microderm",
        name: "Microdermabrasion Machine",
        unitCost: 2500,
        unitHint: "each",
      },
      {
        id: "skin-led",
        name: "LED Therapy Machine",
        unitCost: 1500,
        unitHint: "each",
      },
      {
        id: "skin-products",
        name: "Facial Products Bulk",
        unitCost: 8000,
      },
      {
        id: "skin-implements",
        name: "Facial Implements/Equipment",
        unitCost: 6000,
        unitHint: "each",
      },
      { id: "skin-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "laundry",
    title: "Laundry & Cleaning",
    subtitle: "Washer, dryer & cleaning tools · Qty × unit cost",
    headerGradient: gradients.blue,
    headerIcon: Shirt,
    group: "ops",
    items: [
      {
        id: "laundry-washer",
        name: "Washer",
        unitCost: 799,
        unitHint: "each",
      },
      {
        id: "laundry-dryer",
        name: "Dryer",
        unitCost: 799,
        unitHint: "each",
      },
      {
        id: "laundry-utility-sink",
        name: "Utility Sink",
        unitCost: 299,
        unitHint: "each",
      },
      {
        id: "laundry-mop",
        name: "Mop Bucket",
        unitCost: 79,
        unitHint: "each",
      },
      {
        id: "laundry-vacuum",
        name: "Vacuum",
        unitCost: 249,
        unitHint: "each",
      },
      { id: "laundry-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "safety",
    title: "Safety & Sanitation",
    subtitle: "Disinfectants, PPE & safety gear · Qty × unit cost",
    headerGradient: gradients.lime,
    headerIcon: ShieldCheck,
    group: "ops",
    items: [
      {
        id: "safety-barbicide",
        name: "Barbicide",
        unitCost: 16,
        unitHint: "each",
      },
      {
        id: "safety-epa",
        name: "EPA Disinfectant",
        unitCost: 19,
        unitHint: "each",
      },
      {
        id: "safety-sanitizer",
        name: "Hand Sanitizer Station",
        unitCost: 89,
        unitHint: "each",
      },
      {
        id: "safety-extinguisher",
        name: "Fire Extinguisher",
        unitCost: 69,
        unitHint: "each",
      },
      {
        id: "safety-smoke",
        name: "Smoke Detector",
        unitCost: 35,
        unitHint: "each",
      },
      {
        id: "safety-first-aid",
        name: "First Aid Kit",
        unitCost: 49,
        unitHint: "each",
      },
      {
        id: "safety-biohazard",
        name: "Biohazard Container",
        unitCost: 39,
        unitHint: "each",
      },
      {
        id: "safety-ppe",
        name: "PPE Starter Kit",
        unitCost: 199,
        unitHint: "each",
      },
      { id: "safety-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "technology",
    title: "Technology",
    subtitle: "POS, computers & security · Qty × unit cost",
    headerGradient: gradients.violet,
    headerIcon: Monitor,
    group: "ops",
    items: [
      {
        id: "tech-desktop",
        name: "Desktop Computer",
        unitCost: 899,
        unitHint: "each",
      },
      {
        id: "tech-laptop",
        name: "Laptop",
        unitCost: 999,
        unitHint: "each",
      },
      {
        id: "tech-tablet",
        name: "Tablet",
        unitCost: 399,
        unitHint: "each",
      },
      {
        id: "tech-pos",
        name: "POS System",
        unitCost: 1200,
        unitHint: "each",
      },
      {
        id: "tech-terminal",
        name: "Credit Card Terminal",
        unitCost: 299,
        unitHint: "each",
      },
      {
        id: "tech-receipt",
        name: "Receipt Printer",
        unitCost: 199,
        unitHint: "each",
      },
      {
        id: "tech-cash-drawer",
        name: "Cash Drawer",
        unitCost: 149,
        unitHint: "each",
      },
      {
        id: "tech-cameras",
        name: "Security Cameras (4)",
        unitCost: 599,
        unitHint: "each",
      },
      {
        id: "tech-alarm",
        name: "Alarm System",
        unitCost: 799,
        unitHint: "each",
      },
      {
        id: "tech-router",
        name: "Wi-Fi Router",
        unitCost: 199,
        unitHint: "each",
      },
      {
        id: "tech-printer",
        name: "Office Printer",
        unitCost: 299,
        unitHint: "each",
      },
      { id: "tech-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    subtitle: "Branding, ads & grand opening · Qty × unit cost",
    headerGradient: gradients.orange,
    headerIcon: Megaphone,
    group: "ops",
    items: [
      {
        id: "mkt-logo",
        name: "Logo Design",
        unitCost: 500,
        unitHint: "each",
      },
      {
        id: "mkt-website",
        name: "Website",
        unitCost: 2500,
        unitHint: "each",
      },
      {
        id: "mkt-domain",
        name: "Domain Name",
        unitCost: 25,
        unitHint: "each",
      },
      {
        id: "mkt-cards",
        name: "Business Cards",
        unitCost: 85,
        unitHint: "per box",
      },
      {
        id: "mkt-sign",
        name: "Exterior Sign",
        unitCost: 3500,
        unitHint: "each",
      },
      {
        id: "mkt-window",
        name: "Window Graphics",
        unitCost: 750,
        unitHint: "set",
      },
      {
        id: "mkt-grand-opening",
        name: "Grand Opening Event",
        unitCost: 5000,
        unitHint: "per event",
      },
      {
        id: "mkt-social",
        name: "Social Media Ads",
        unitCost: 500,
        unitHint: "each",
      },
      {
        id: "mkt-google",
        name: "Google Ads",
        unitCost: 500,
        unitHint: "quarterly",
      },
      { id: "mkt-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "insurance",
    title: "Insurance",
    subtitle: "Liability, property & cyber · Qty × unit cost",
    headerGradient: gradients.stone,
    headerIcon: ClipboardList,
    group: "ops",
    items: [
      {
        id: "ins-liability",
        name: "General Liability",
        unitCost: 1500,
        unitHint: "yearly",
      },
      {
        id: "ins-property",
        name: "Property Insurance",
        unitCost: 2000,
        unitHint: "yearly",
      },
      {
        id: "ins-workers",
        name: "Workers' Compensation",
        unitCost: 2500,
        unitHint: "yearly",
      },
      {
        id: "ins-cyber",
        name: "Cyber Insurance",
        unitCost: 750,
        unitHint: "yearly",
      },
      { id: "ins-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "utilities",
    title: "Utilities",
    subtitle: "Deposits & installations · Qty × unit cost",
    headerGradient: gradients.emerald,
    headerIcon: Wifi,
    group: "ops",
    items: [
      {
        id: "util-electric",
        name: "Electricity Deposit",
        unitCost: 500,
        unitHint: "each",
      },
      {
        id: "util-water",
        name: "Water Deposit",
        unitCost: 250,
        unitHint: "each",
      },
      {
        id: "util-internet",
        name: "Internet Installation",
        unitCost: 150,
        unitHint: "each",
      },
      {
        id: "util-phone",
        name: "Phone Installation",
        unitCost: 100,
        unitHint: "each",
      },
      { id: "util-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
  {
    id: "professional",
    title: "Professional Services",
    subtitle: "CPA, attorney, design & cleaning · Qty × unit cost",
    headerGradient: gradients.purple,
    headerIcon: Scale,
    group: "ops",
    items: [
      {
        id: "pro-cpa",
        name: "CPA",
        unitCost: 1500,
        unitHint: "yearly",
      },
      {
        id: "pro-attorney",
        name: "Attorney",
        unitCost: 3000,
        unitHint: "yearly",
      },
      {
        id: "pro-architect",
        name: "Architect",
        unitCost: 8000,
        unitHint: "each",
      },
      {
        id: "pro-interior",
        name: "Interior Designer",
        unitCost: 5000,
        unitHint: "each",
      },
      {
        id: "pro-cleaning",
        name: "Commercial Cleaning",
        unitCost: 350,
        unitHint: "each",
      },
      { id: "pro-misc", name: "Miscellaneous", unitCost: 50 },
    ],
  },
];

export const ALL_ESTIMATE_ITEMS: EstimateLineItem[] =
  ESTIMATE_CATEGORIES.flatMap((c) => c.items);

/** Build / registration / construction-related categories (KPI: Build & Setup). */
export const MATERIAL_CATEGORIES = ESTIMATE_CATEGORIES.filter(
  (c) => c.group === "build"
);

/** Furniture, tools, ops & services categories (KPI: Furniture & Ops). */
export const FURNITURE_CATEGORIES = ESTIMATE_CATEGORIES.filter(
  (c) => c.group === "ops"
);

/** @deprecated Prefer FURNITURE_CATEGORIES — first ops category for legacy callers. */
export const FURNITURE_CATEGORY =
  FURNITURE_CATEGORIES.find((c) => c.id === "salon-furniture") ??
  FURNITURE_CATEGORIES[0]!;

/** @deprecated Use ESTIMATE_CATEGORIES */
export const CONSTRUCTION_ITEMS = MATERIAL_CATEGORIES.flatMap((c) => c.items);
/** @deprecated Use ESTIMATE_CATEGORIES */
export const ADDITIONAL_ITEMS = FURNITURE_CATEGORIES.flatMap((c) => c.items);

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
