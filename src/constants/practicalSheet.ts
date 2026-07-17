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
};

export const PRACTICAL_SHEET_ROW_COUNT = 30;

export const SKINTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  { key: "makeupRemoval", label: "Make up Removal", bg: "#e11d8f", text: "#fff" },
  { key: "browApplications", label: "Brow Applications", bg: "#eab308", text: "#111" },
  { key: "facialManipulations", label: "Facial Manipulations", bg: "#9ca3af", text: "#111" },
  { key: "facialArtSpecialty", label: "Facial Art/Specialty", bg: "#dc2626", text: "#fff" },
  { key: "deepTreatmentHotTowels", label: "Deep Treatment Hot Towels", bg: "#1e3a8a", text: "#fff" },
  { key: "drapingForMakeup", label: "Draping for Make up", bg: "#d6b98c", text: "#111" },
  { key: "lotionOilMoisturizer", label: "Lotion/Oil Moisturizer Application", bg: "#0d9488", text: "#fff" },
  { key: "mockHairRemoval", label: "Mock Hair Removal for Face", bg: "#86efac", text: "#111" },
  { key: "individualEyelashMannequin", label: "Individual Eyelash Application on Mannequin", bg: "#38bdf8", text: "#111" },
  { key: "contourAndHighlighting", label: "Contour and Highlighting", bg: "#fb7185", text: "#111" },
  { key: "fullFacialMakeup", label: "Full Facial Make up Application", bg: "#22c55e", text: "#111" },
  { key: "eyelashStrips", label: "Eyelash Strips", bg: "#a855f7", text: "#fff" },
  { key: "eyelinerMascaraLipstick", label: "Eyeliner, Mascara, Lipstick, Lipgloss", bg: "#166534", text: "#fff" },
  { key: "stationSetup", label: "Station Set-up", bg: "#7c3aed", text: "#fff" },
  { key: "total", label: "TOTAL", bg: "#facc15", text: "#111" },
];

export const FUNTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  { key: "sanitationDisinfectionControl", label: "(S)anitation & (D)isinfection Control", bg: "#9ca3af", text: "#111" },
  { key: "shampooRollerSettingStyling", label: "Shampoo Roller Setting/ Styling", bg: "#f97316", text: "#111" },
  { key: "permanentWaving", label: "Permanent Waving", bg: "#22d3ee", text: "#111" },
  { key: "shampooOrConditionerDeepOnly", label: "(S)hampoo or (C)onditioner (D)eep Conditioner Only", bg: "#e11d8f", text: "#fff" },
  { key: "haircutting", label: "Haircutting (0, 45, 90, 180)", bg: "#a16207", text: "#fff" },
  { key: "facialMassages", label: "Facial Massages (E)ffleurage, (T)apotement, (P)etrissage, (V)ibration, (F)riction", bg: "#e7d5b8", text: "#111" },
  { key: "styleOnlyThermalStyling", label: "Style Only, Thermal Styling", bg: "#dc2626", text: "#fff" },
  { key: "chemicalHairRelaxers", label: "Chemical Hair Relaxers", bg: "#60a5fa", text: "#111" },
  { key: "sectioningAndPartings", label: "(S)ectioning & (P)artings", bg: "#d6b98c", text: "#111" },
  { key: "scalpMassagesAndTreatment", label: "Scalp (M)assages & (T)reatment", bg: "#0d9488", text: "#fff" },
  { key: "fingerWaving", label: "Finger Waving", bg: "#86efac", text: "#111" },
  { key: "coloringHighlightingSpecialty", label: "(S)emi, (D)emi, (P)ermanent Coloring, (H)ighlighting, (Sp)ecialty Applications", bg: "#38bdf8", text: "#111" },
  { key: "browWaxingMakeupLash", label: "(B)row Arching, (W)axing, (M)ake Up & (L)ash Applications", bg: "#fb7185", text: "#111" },
  { key: "permanentWaving2", label: "Permanent Waving", bg: "#22c55e", text: "#111" },
  { key: "braidingTwistStyling", label: "(B)raiding, (T)wist Styling", bg: "#3730a3", text: "#fff" },
  { key: "artificialEnhancements", label: "Artificial Enhancements (Br)aids, (S)ew-ins, (W)igs, (B)onding", bg: "#166534", text: "#fff" },
  { key: "nails", label: "Nails (M)anicuring, (P)edicuring, (Po)lish Only, (Na)il Art", bg: "#ec4899", text: "#fff" },
  { key: "total", label: "TOTAL", bg: "#facc15", text: "#111" },
];

export const NAILTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  { key: "nailPolishRemoval", label: "Nail Polish Removal", bg: "#e11d8f", text: "#fff" },
  { key: "nailShaping", label: "Nail Shaping", bg: "#a16207", text: "#fff" },
  { key: "handArmMassages", label: "Hand/Arm Massages (E)ffleurage, (T)apotement, (P)etrissage, (V)ibration, (F)riction", bg: "#d1d5db", text: "#111" },
  { key: "nailArtOnly10Nails", label: "Nail Art Only 10 Nails", bg: "#dc2626", text: "#fff" },
  { key: "oilTreatmentCuticlesFilePolish", label: "Oil Treatment for Cuticles, File, Nail Polish Removal and Polish", bg: "#64748b", text: "#fff" },
  { key: "nailPolish", label: "Nail Polish", bg: "#fde68a", text: "#111" },
  { key: "lotionMoisturizerApplication", label: "Lotion Moisturizer Application", bg: "#0d9488", text: "#fff" },
  { key: "nailPolishNailArtOn10Nails", label: "Nail Polish Nail Art on 10 Nails", bg: "#86efac", text: "#111" },
  { key: "nailPolish3Colors", label: "Nail Polish: 3 Colors", bg: "#3b82f6", text: "#fff" },
  { key: "nailPolish2Colors", label: "Nail Polish: 2 Colors", bg: "#f9a8d4", text: "#111" },
  { key: "nailArtWithRhinestonesOn10Nails", label: "Nail Art with Rhinestones on 10 Nails", bg: "#22c55e", text: "#111" },
  { key: "dailySanitationAndDisinfecting", label: "Daily Sanitation and Disinfecting", bg: "#6b7280", text: "#fff" },
  { key: "specialStyles", label: "Special Styles", bg: "#166534", text: "#fff" },
  { key: "stationSetup", label: "Station Set-up", bg: "#a78bfa", text: "#111" },
  { key: "total", label: "TOTAL", bg: "#facc15", text: "#111" },
];

export const BARBERTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  { key: "sanitationDisinfectionControl", label: "(S)anitation & (D)isinfection Control", bg: "#9ca3af", text: "#111" },
  { key: "shampooRollerSettingStyling", label: "Shampoo Roller Setting/ Styling", bg: "#f97316", text: "#111" },
  { key: "permanentWaving", label: "Permanent Waving", bg: "#22d3ee", text: "#111" },
  { key: "shampooOrConditionerDeepOnly", label: "(S)hampoo or (C)onditioner (D)eep Conditioner Only", bg: "#e11d8f", text: "#fff" },
  { key: "haircutting", label: "Haircutting (0, 45, 90, 180)", bg: "#a16207", text: "#fff" },
  { key: "facialMassages", label: "Facial Massages (E)ffleurage, (T)apotement, (P)etrissage, (V)ibration, (F)riction", bg: "#f3f4f6", text: "#111" },
  { key: "styleOnlyThermalStyling", label: "Style Only, Thermal Styling", bg: "#dc2626", text: "#fff" },
  { key: "chemicalHairRelaxers", label: "Chemical Hair Relaxers", bg: "#93c5fd", text: "#111" },
  { key: "sectioningAndPartings", label: "(S)ectioning & (P)artings", bg: "#d6b98c", text: "#111" },
  { key: "scalpMassagesAndTreatment", label: "Scalp (M)assages & (T)reatment", bg: "#0d9488", text: "#fff" },
  { key: "beardTrim", label: "Beard Trim", bg: "#86efac", text: "#111" },
  { key: "coloringHighlightingSpecialty", label: "(S)emi, (D)emi, (P)ermanent Coloring, (H)ighlighting, (Sp)ecialty Applications", bg: "#38bdf8", text: "#111" },
  { key: "fadesTempsShadowFadesSpecialtyCuts", label: "Fades, Temps, Shadow Fades and Specialty Cuts", bg: "#fb7185", text: "#111" },
  { key: "dreadlocksTwistsCornrows", label: "Dreadlocks, Twists, Cornrows", bg: "#22c55e", text: "#111" },
  { key: "beardShaves", label: "Beard Shaves", bg: "#475569", text: "#fff" },
  { key: "specialStyles", label: "Special Styles", bg: "#166534", text: "#fff" },
  { key: "shaveDraping", label: "Shave Draping", bg: "#ec4899", text: "#fff" },
  { key: "total", label: "TOTAL", bg: "#facc15", text: "#111" },
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

export function createEmptyPracticalRows(columns: PracticalColumn[]) {
  return Array.from({ length: PRACTICAL_SHEET_ROW_COUNT }, () => ({
    cells: Object.fromEntries(columns.map((col) => [col.key, ""])),
  }));
}

export const PRACTICAL_COLUMN_ICONS: Record<string, LucideIcon> = {
  // Shared (Funtology / Barbertology)
  sanitationDisinfectionControl: ShieldCheck,
  shampooRollerSettingStyling: Droplet,
  permanentWaving: Waves,
  permanentWaving2: Waves,
  shampooOrConditionerDeepOnly: Droplets,
  haircutting: Scissors,
  facialMassages: Hand,
  styleOnlyThermalStyling: Wind,
  chemicalHairRelaxers: FlaskConical,
  sectioningAndPartings: Grid2x2,
  scalpMassagesAndTreatment: Sparkles,
  fingerWaving: Waves,
  coloringHighlightingSpecialty: Palette,
  browWaxingMakeupLash: Eye,
  braidingTwistStyling: GitBranch,
  artificialEnhancements: Layers,
  nails: Hand,
  beardTrim: Scissors,
  fadesTempsShadowFadesSpecialtyCuts: Scissors,
  dreadlocksTwistsCornrows: GitBranch,
  beardShaves: Wand2,
  specialStyles: Star,
  shaveDraping: Layers,
  // Skintology
  makeupRemoval: Droplet,
  browApplications: Eye,
  facialManipulations: Hand,
  facialArtSpecialty: Palette,
  deepTreatmentHotTowels: Flame,
  drapingForMakeup: Layers,
  lotionOilMoisturizer: Droplets,
  mockHairRemoval: Wand2,
  individualEyelashMannequin: Eye,
  contourAndHighlighting: Brush,
  fullFacialMakeup: Palette,
  eyelashStrips: Eye,
  eyelinerMascaraLipstick: Brush,
  stationSetup: LayoutGrid,
  // Nailtology
  nailPolishRemoval: Droplet,
  nailShaping: Scissors,
  handArmMassages: Hand,
  nailArtOnly10Nails: Sparkles,
  oilTreatmentCuticlesFilePolish: Droplets,
  nailPolish: Brush,
  lotionMoisturizerApplication: Droplets,
  nailPolishNailArtOn10Nails: Sparkles,
  nailPolish3Colors: Palette,
  nailPolish2Colors: Palette,
  nailArtWithRhinestonesOn10Nails: Gem,
  dailySanitationAndDisinfecting: ShieldCheck,
  // Summary
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
