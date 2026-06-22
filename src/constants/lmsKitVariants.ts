/** Physical kit variants — keep in sync with backend LmsKitVariant enum. */
export const LMS_KIT_VARIANTS = [
  { value: "STANDARD", label: "Standard Kits" },
  { value: "BUNDLE_4_IN_1", label: "Bundle Kit 4 in 1" },
] as const;

export type LmsKitVariant = (typeof LMS_KIT_VARIANTS)[number]["value"];

export const DEFAULT_LMS_KIT_VARIANT: LmsKitVariant = "STANDARD";
