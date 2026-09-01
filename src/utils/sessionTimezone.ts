/**
 * Admin availability / session slot times are stored as UTC wall-clock strings
 * ("HH:mm" or "HH:mm:ss") on a UTC calendar day. Convert only for display;
 * always submit the original API strings when booking.
 */

export function normalizeTimeToHms(time: string): string {
  if (!time) return "00:00:00";
  const [h = "0", m = "0", s = "0"] = time.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
}

/** Extract YYYY-MM-DD from an API date (UTC midnight) without local day shift. */
export function calendarDateYmdFromApi(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Build a UTC instant from admin calendar day + slot time. */
export function utcSlotToDate(dateYmd: string, time: string): Date {
  return new Date(`${dateYmd}T${normalizeTimeToHms(time)}Z`);
}

export function getLocalTimezoneAbbr(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

export function getLocalTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
  } catch {
    return "local time";
  }
}

function formatLocalYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLocalTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Format a single UTC slot time in the teacher's browser timezone.
 * Times only — the selected / session calendar date is shown separately.
 */
export function formatUtcTimeInLocal(dateYmd: string, time: string): string {
  const instant = utcSlotToDate(dateYmd, time);
  if (Number.isNaN(instant.getTime())) return time;
  return formatLocalTime(instant);
}

/** e.g. "2:00 PM – 3:00 PM GMT+5" */
export function formatUtcSlotRangeInLocal(
  dateYmd: string,
  startTime: string,
  endTime: string,
  options?: { withTimezone?: boolean }
): string {
  const startInstant = utcSlotToDate(dateYmd, startTime);
  const endInstant = utcSlotToDate(dateYmd, endTime);
  if (Number.isNaN(startInstant.getTime()) || Number.isNaN(endInstant.getTime())) {
    return `${startTime} - ${endTime}`;
  }

  const startLabel = formatLocalTime(startInstant);
  const endLabel = formatLocalTime(endInstant);
  const withTz = options?.withTimezone !== false;
  const abbr = withTz ? getLocalTimezoneAbbr(startInstant) : "";
  return abbr ? `${startLabel} – ${endLabel} ${abbr}` : `${startLabel} – ${endLabel}`;
}

/** Local calendar date label for a UTC slot start (e.g. upcoming card). */
export function formatUtcSlotLocalDate(
  dateYmdOrApiDate: string | Date,
  startTime: string
): string {
  const dateYmd =
    typeof dateYmdOrApiDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateYmdOrApiDate)
      ? dateYmdOrApiDate
      : calendarDateYmdFromApi(dateYmdOrApiDate);
  const instant = utcSlotToDate(dateYmd, startTime);
  if (Number.isNaN(instant.getTime())) return dateYmd;
  return formatLocalYmd(instant);
}

export function isUtcSlotInPast(dateYmd: string, startTime: string): boolean {
  const instant = utcSlotToDate(dateYmd, startTime);
  return Number.isNaN(instant.getTime()) || instant.getTime() <= Date.now();
}
