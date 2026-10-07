import { solarToLunar } from "./calendar";

export interface MonthGridDay {
  date: string;
  day: number;
  month: number;
  year: number;
  lunarDay: number;
  lunarMonth: number;
  isOutsideMonth: boolean;
}

/** Returns complete Monday-first weeks so the month never changes grid shape mid-render. */
export function getMonthGrid(year: number, month: number): MonthGridDay[] {
  const first = new Date(year, month - 1, 1, 12);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month - 1, 1 - mondayOffset, 12);
  const last = new Date(year, month, 0, 12);
  const usedCells = mondayOffset + last.getDate();
  const cellCount = Math.ceil(usedCells / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const cellYear = date.getFullYear();
    const cellMonth = date.getMonth() + 1;
    const day = date.getDate();
    const lunar = solarToLunar(day, cellMonth, cellYear);
    return {
      date: formatLocalDate(date),
      day,
      month: cellMonth,
      year: cellYear,
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      isOutsideMonth: cellMonth !== month,
    };
  });
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
