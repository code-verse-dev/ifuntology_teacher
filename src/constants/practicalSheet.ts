import {
  Brush,
  Droplet,
  Droplets,
  Eye,
  Flame,
  FlaskConical,
  Gem,
  GitBranch,
  Grid2x2,
  Hand,
  Layers,
  LayoutGrid,
  Palette,
  Scissors,
  ShieldCheck,
  Sigma,
  Sparkles,
  Star,
  Wand2,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

export type PracticalColumn = {
  key: string;
  label: string;
  bg: string;
  text?: string;
  /** Credit multiplier shown on row 0; default 1 when omitted from source list */
  creditWeight: number;
};

/** @deprecated sheets are date-based; kept for any leftover references */
export const PRACTICAL_SHEET_DATA_ROW_COUNT = 30;

/** @deprecated */
export const PRACTICAL_SHEET_ROW_COUNT = PRACTICAL_SHEET_DATA_ROW_COUNT + 1;

export const PRACTICAL_SHEET_INTRO =
  "Record your completed hands-on services each day. Enter only the services you performed, then click SAVE for Teacher approval. Daily entries are required to earn practical credit.";

export const PRACTICAL_SHEET_LOG_TITLE = "Practical Services Log";

const C = {
  pink: { bg: "#e11d8f", text: "#fff" },
  yellow: { bg: "#eab308", text: "#111" },
  gray: { bg: "#9ca3af", text: "#111" },
  red: { bg: "#dc2626", text: "#fff" },
  navy: { bg: "#1e3a8a", text: "#fff" },
  tan: { bg: "#d6b98c", text: "#111" },
  teal: { bg: "#0d9488", text: "#fff" },
  greenSoft: { bg: "#86efac", text: "#111" },
  sky: { bg: "#38bdf8", text: "#111" },
  rose: { bg: "#fb7185", text: "#111" },
  green: { bg: "#22c55e", text: "#111" },
  purple: { bg: "#a855f7", text: "#fff" },
  forest: { bg: "#166534", text: "#fff" },
  violet: { bg: "#7c3aed", text: "#fff" },
  orange: { bg: "#f97316", text: "#111" },
  cyan: { bg: "#22d3ee", text: "#111" },
  brown: { bg: "#a16207", text: "#fff" },
  cream: { bg: "#e7d5b8", text: "#111" },
  blue: { bg: "#60a5fa", text: "#111" },
  indigo: { bg: "#3730a3", text: "#fff" },
  fuchsia: { bg: "#ec4899", text: "#fff" },
  slate: { bg: "#64748b", text: "#fff" },
  amberSoft: { bg: "#fde68a", text: "#111" },
  blueSoft: { bg: "#3b82f6", text: "#fff" },
  pinkSoft: { bg: "#f9a8d4", text: "#111" },
  slateDark: { bg: "#475569", text: "#fff" },
  total: { bg: "#facc15", text: "#111" },
};

function col(
  key: string,
  label: string,
  creditWeight: number,
  color: { bg: string; text: string },
): PracticalColumn {
  return { key, label, creditWeight, bg: color.bg, text: color.text };
}

export const SKINTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  col("sanitationDisinfection", "Sanitation & Disinfection", 0.5, C.gray),
  col("stationSetUp", "Station Set Up", 0.5, C.violet),
  col("makeUpRemoval", "Make Up Removal", 1, C.pink),
  col("browApplications", "Brow Applications", 1, C.yellow),
  col("facialManipulations", "Facial Manipulations", 1.5, C.cream),
  col("specialtyFacialArt", "Specialty Facial Art", 1, C.red),
  col("deepFacialTreatment", "Deep Facial Treatment", 1, C.navy),
  col("draping", "Draping", 0.5, C.tan),
  col("fiveStepCleansing", "Five Step Cleansing", 1.5, C.teal),
  col("mockHairRemoval", "Mock Hair Removal", 1, C.greenSoft),
  col("eyelashApplication", "Eyelash Application", 1, C.sky),
  col("facialGems", "Facial Gems", 0.75, C.purple),
  col("facialContourHighlighting", "Facial Contour/Highlighting", 1.75, C.rose),
  col("fullFacialMakeUpApplication", "Full Facial Make Up Application", 2.5, C.green),
  col("eyelashReplacement", "Eyelash Replacement", 0.75, C.indigo),
  col("eyes", "Eyes", 1, C.blue),
  col("lips", "Lips", 1, C.fuchsia),
  col("theatricalMakeUp", "Theatrical Make-Up", 3, C.orange),
  col("specialtyHolidayFacial", "Specialty/Holiday Facial", 2, C.forest),
  col("weddingPromsHomecomingLooks", "Wedding, Proms & Homecoming Looks", 3, C.pink),
  col("total", "TOTAL", 0, C.total),
];

export const FUNTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  col("sanitationDisinfection", "Sanitation & Disinfection", 0.5, C.gray),
  col("stationSetUp", "Station Set Up", 1, C.violet),
  col("wetHairstyling", "Wet Hairstyling", 1.5, C.cyan),
  col("dryHairstyling", "Dry Hairstyling", 1, C.orange),
  col("mockPermanentWaveServices", "Mock Permanent Wave Services", 3, C.sky),
  col("mockShampooServices", "Mock Shampoo Services", 0.5, C.pink),
  col("mockConditionerServices", "Mock Conditioner Services", 0.5, C.teal),
  col("haircutting", "Haircutting", 0.75, C.brown),
  col("facialMassages", "Facial Massages", 1, C.cream),
  col("mockChemicalServices", "Mock Chemical Services", 2, C.blue),
  col("hairSectioningParting", "Hair Sectioning/Parting", 1, C.tan),
  col("scalpTreatments", "Scalp Treatments", 1, C.greenSoft),
  col("hairSculptingFingerwaving", "Hair Sculpting/Fingerwaving", 2, C.green),
  col("mockHaircolorServices", "Mock Haircolor Services", 1.75, C.rose),
  col("mockRetouchApplications", "Mock Retouch Applications", 1.75, C.purple),
  col("braidsTwistsCornrows", "Braids, Twists & Cornrows", 3, C.indigo),
  col("artificialEnhancements", "Artificial Enhancements", 2, C.forest),
  col("lashBrowServices", "Lash & Brow Services", 1, C.fuchsia),
  col("nailcareServices", "Nailcare Services", 1.5, C.pink),
  col("total", "TOTAL", 0, C.total),
];

export const NAILTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  col("sanitationDisinfection", "Sanitation & Disinfection", 0.5, C.gray),
  col("stationSetUp", "Station Set Up", 1, C.violet),
  col("nailPolishing", "Nail Polishing", 1, C.amberSoft),
  col("nailPolishRemoval", "Nail Polish Removal", 0.5, C.pink),
  col("nailShapingServices", "Nail Shaping Services", 0.5, C.brown),
  col("handArmMassages", "Hand/Arm Massages", 1, C.cream),
  col("nailArtServices", "Nail Art Services", 1.5, C.red),
  col("manicures", "Manicures", 1, C.blueSoft),
  col("facialMassages", "Facial Massages", 1, C.tan),
  col("pedicures", "Pedicures", 1, C.teal),
  col("nailPolishing5Nails", "Nail Polishing: 5 Nails", 0.75, C.sky),
  col("nailPolishing10Nails", "Nail Polishing: 10 Nails", 1.5, C.green),
  col("extraLongNails", "Extra Long Nails", 2.25, C.purple),
  col("mockOilTreatmentServices", "Mock Oil Treatment Services", 1, C.slate),
  col("nailRepair", "Nail Repair", 1, C.orange),
  col("alternatingNailPatterns", "Alternating Nail Patterns", 1, C.rose),
  col("primaryColorNailDesigns", "Primary Color Nail Designs", 1, C.blue),
  col("secondaryColorNailDesigns", "Secondary Color Nail Designs", 1, C.pinkSoft),
  col("nailcareServices", "Nailcare Services", 1.5, C.fuchsia),
  col("themeNails", "Theme Nails", 2, C.forest),
  col("total", "TOTAL", 0, C.total),
];

export const BARBERTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  col("sanitationDisinfection", "Sanitation & Disinfection", 0.5, C.gray),
  col("stationSetUp", "Station Set Up", 0.5, C.violet),
  col("haircuttingBeard", "Haircutting (Beard)", 0.5, C.brown),
  col("haircuttingMustaches", "Haircutting Mustaches", 0.5, C.slateDark),
  col("haircuttingShears", "Haircutting/Shears", 0.75, C.orange),
  col("haircuttingClippers", "Haircutting/Clippers", 0.75, C.blue),
  col("haircuttingWith3PlusGuards", "Haircutting with 3+ Guards", 1, C.navy),
  col("haircuttingOverComb", "Haircutting/Over Comb", 0.75, C.cyan),
  col("drapings", "Drapings", 1, C.tan),
  col("wetHairstyling", "Wet Hairstyling", 1.5, C.sky),
  col("dryHairstyling", "Dry Hairstyling", 1, C.amberSoft),
  col("mockPermanentWaveServices", "Mock Permanent Wave Services", 3, C.green),
  col("mockShampooServices", "Mock Shampoo Services", 0.5, C.pink),
  col("mockConditionerServices", "Mock Conditioner Services", 0.5, C.teal),
  col("facialMassages", "Facial Massages", 1, C.cream),
  col("mockChemicalServices", "Mock Chemical Services", 2, C.blueSoft),
  col("hairSectioningParting", "Hair Sectioning/Parting", 1, C.gray),
  col("scalpTreatmentsDetangling", "Scalp Treatments & Detangling", 1, C.greenSoft),
  col("hairSculpting", "Hair Sculpting", 1, C.indigo),
  col("mockHaircolorServices", "Mock Haircolor Services", 1.75, C.rose),
  col("mockRetouchApplications", "Mock Retouch Applications", 1.75, C.purple),
  col("braidsTwistsCornrows", "Braids, Twists & Cornrows", 3, C.forest),
  col("artificialEnhancements", "Artificial Enhancements", 2, C.slate),
  col("browServices", "Brow Services", 1, C.yellow),
  col("nailcareServices", "Nailcare Services", 1, C.fuchsia),
  col("total", "TOTAL", 0, C.total),
];

export function getPracticalColumns(courseType?: string): PracticalColumn[] | null {
  switch (courseType) {
    case "Skintology":
      return SKINTOLOGY_PRACTICAL_COLUMNS;
    case "Funtology":
      return FUNTOLOGY_PRACTICAL_COLUMNS;
    case "Nailtology":
      return NAILTOLOGY_PRACTICAL_COLUMNS;
    case "Barbertology":
      return BARBERTOLOGY_PRACTICAL_COLUMNS;
    default:
      return null;
  }
}

export function formatCreditWeight(weight: number): string {
  if (!Number.isFinite(weight) || weight <= 0) return "";
  const fixed = weight.toFixed(2);
  if (weight < 1) return fixed.replace(/^0/, "");
  return fixed;
}

export function createEmptyEntryCells(columns: PracticalColumn[]) {
  return Object.fromEntries(columns.map((col) => [col.key, ""]));
}

export function todayDateString(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function currentMonthRange(now = new Date()): { from: string; to: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const from = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const to = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export function formatEntryDateLabel(value?: string | null) {
  if (!value) return "—";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function computeRowCreditTotal(
  cells: Record<string, string>,
  columns: PracticalColumn[],
): string {
  let sum = 0;
  for (const col of columns) {
    if (col.key === "total") continue;
    const raw = String(cells?.[col.key] ?? "").trim();
    if (!raw) continue;
    const entered = Number(raw);
    if (!Number.isFinite(entered)) continue;
    const weight = col.creditWeight > 0 ? col.creditWeight : 1;
    sum += entered * weight;
  }
  if (sum === 0) return "";
  const rounded = Math.round(sum * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export const PRACTICAL_COLUMN_ICONS: Record<string, LucideIcon> = {
  sanitationDisinfection: ShieldCheck,
  stationSetUp: LayoutGrid,
  wetHairstyling: Droplet,
  dryHairstyling: Wind,
  mockPermanentWaveServices: Waves,
  mockShampooServices: Droplets,
  mockConditionerServices: Droplets,
  haircutting: Scissors,
  facialMassages: Hand,
  mockChemicalServices: FlaskConical,
  hairSectioningParting: Grid2x2,
  scalpTreatments: Sparkles,
  scalpTreatmentsDetangling: Sparkles,
  hairSculptingFingerwaving: Waves,
  hairSculpting: Wand2,
  mockHaircolorServices: Palette,
  mockRetouchApplications: Brush,
  braidsTwistsCornrows: GitBranch,
  artificialEnhancements: Layers,
  lashBrowServices: Eye,
  browServices: Eye,
  nailcareServices: Hand,
  haircuttingBeard: Scissors,
  haircuttingMustaches: Scissors,
  haircuttingShears: Scissors,
  haircuttingClippers: Scissors,
  haircuttingWith3PlusGuards: Scissors,
  haircuttingOverComb: Scissors,
  drapings: Layers,
  draping: Layers,
  makeUpRemoval: Droplet,
  browApplications: Eye,
  facialManipulations: Hand,
  specialtyFacialArt: Palette,
  deepFacialTreatment: Flame,
  fiveStepCleansing: Droplets,
  mockHairRemoval: Wand2,
  eyelashApplication: Eye,
  facialGems: Gem,
  facialContourHighlighting: Brush,
  fullFacialMakeUpApplication: Palette,
  eyelashReplacement: Eye,
  eyes: Eye,
  lips: Brush,
  theatricalMakeUp: Star,
  specialtyHolidayFacial: Sparkles,
  weddingPromsHomecomingLooks: Star,
  nailPolishing: Brush,
  nailPolishRemoval: Droplet,
  nailShapingServices: Scissors,
  handArmMassages: Hand,
  nailArtServices: Sparkles,
  manicures: Hand,
  pedicures: Hand,
  nailPolishing5Nails: Brush,
  nailPolishing10Nails: Brush,
  extraLongNails: Layers,
  mockOilTreatmentServices: Droplets,
  nailRepair: Wand2,
  alternatingNailPatterns: Grid2x2,
  primaryColorNailDesigns: Palette,
  secondaryColorNailDesigns: Palette,
  themeNails: Star,
  total: Sigma,
};

export function getPracticalColumnIcon(key: string): LucideIcon {
  return PRACTICAL_COLUMN_ICONS[key] ?? Sparkles;
}

export type PracticalRowStatus = "completed" | "in-progress" | "not-started";

export function getPracticalRowStatus(
  cells: Record<string, string>,
  columns: PracticalColumn[],
): PracticalRowStatus {
  const dataColumns = columns.filter((col) => col.key !== "total");
  const filled = dataColumns.filter(
    (col) => (cells?.[col.key] ?? "").trim() !== "",
  ).length;

  if (dataColumns.length > 0 && filled === dataColumns.length) return "completed";
  if (filled > 0) return "in-progress";
  return "not-started";
}
