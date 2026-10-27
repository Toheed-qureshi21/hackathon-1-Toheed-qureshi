const DISPLAY_DATE_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const DISPLAY_DATE_HINT = "DD-MM-YYYY";

export function parseDisplayDateToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = ISO_DATE_PATTERN.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (isValidUtcDate(year, month, day)) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }
    return null;
  }

  const displayMatch = DISPLAY_DATE_PATTERN.exec(trimmed);
  if (!displayMatch) return null;

  const day = Number(displayMatch[1]);
  const month = Number(displayMatch[2]);
  const year = Number(displayMatch[3]);
  if (!isValidUtcDate(year, month, day)) return null;

  const monthPart = String(month).padStart(2, "0");
  const dayPart = String(day).padStart(2, "0");
  return `${year}-${monthPart}-${dayPart}`;
}

export function formatIsoDateToDisplay(iso: string): string | null {
  const match = ISO_DATE_PATTERN.exec(iso.trim());
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function normalizeFormDateForDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const fromDisplay = parseDisplayDateToIso(trimmed);
  if (fromDisplay) {
    return formatIsoDateToDisplay(fromDisplay) ?? trimmed;
  }
  return trimmed;
}

function isValidUtcDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
