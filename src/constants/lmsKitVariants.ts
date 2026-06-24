/** Physical kit variants — keep in sync with backend LmsKitVariant enum. */
export const LMS_KIT_VARIANTS = [
  { value: "STANDARD", label: "Standard Kits" },
  { value: "BUNDLE_4_IN_1", label: "Bundle Kit (4 Courses in 1)" },
] as const;

export const BUNDLE_KIT_HOVER_DESCRIPTION =
  "This kit includes implements of Funtology, Barbertology, Nailtology and Skintology.";

export type LmsKitVariant = (typeof LMS_KIT_VARIANTS)[number]["value"];

export const DEFAULT_LMS_KIT_VARIANT: LmsKitVariant = "STANDARD";
