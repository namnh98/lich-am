import { formatLocalDate, parseLocalDate } from "@lich-oi/core";

export const QUICK_YEAR_RADIUS = 5;

export function getQuickYears(
  centerYear = new Date().getFullYear(),
  radius = QUICK_YEAR_RADIUS,
): number[] {
  return Array.from({ length: radius * 2 + 1 }, (_, index) => centerYear - radius + index);
}

/** Keeps the selected day where possible and clamps it for shorter months. */
export function dateInPeriod(selectedDate: string, year: number, month: number): string {
  const selected = parseLocalDate(selectedDate);
  const lastDay = new Date(year, month, 0, 12).getDate();
  const day = Math.min(selected.getDate(), lastDay);
  return formatLocalDate(new Date(year, month - 1, day, 12));
}

export function shiftSelectedMonth(selectedDate: string, amount: number): string {
  const selected = parseLocalDate(selectedDate);
  const target = new Date(selected.getFullYear(), selected.getMonth() + amount, 1, 12);
  return dateInPeriod(selectedDate, target.getFullYear(), target.getMonth() + 1);
}
