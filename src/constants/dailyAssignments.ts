export const DAILY_WURTLE_ASSIGNMENTS_BASE =
  "https://erp.ifuntology.com/images/assignments-wurtle";

export const DAILY_WTR_ASSIGNMENTS_BASE =
  "https://erp.ifuntology.com/images/assignments-wtr";

export const DAILY_WURTLE_ASSIGNMENTS_COUNT = 66;
export const DAILY_WTR_ASSIGNMENTS_COUNT = 153;

export type DailyAssignmentVariant = "wurtle" | "wtr";

export function getDailyAssignmentImageUrl(
  variant: DailyAssignmentVariant,
  index: number
): string {
  const safeIndex = Math.max(1, Math.floor(index));
  if (variant === "wurtle") {
    return `${DAILY_WURTLE_ASSIGNMENTS_BASE}/${safeIndex}.jpeg`;
  }
  return `${DAILY_WTR_ASSIGNMENTS_BASE}/${safeIndex}.png`;
}

export function getDailyAssignmentCount(variant: DailyAssignmentVariant): number {
  return variant === "wurtle"
    ? DAILY_WURTLE_ASSIGNMENTS_COUNT
    : DAILY_WTR_ASSIGNMENTS_COUNT;
}

export function getDailyAssignmentTitle(variant: DailyAssignmentVariant): string {
  return variant === "wurtle"
    ? "Daily Wurtle Assignments"
    : "Daily WTR Assignments";
}
