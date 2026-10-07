import type { LocalEvent } from "@lich-oi/core";
import { formatLocalDate, getCanChi, parseLocalDate, solarToLunar } from "@lich-oi/core";

export type CalendarWidgetDisplay = "compact" | "detail" | "agenda" | "month";
export type CalendarWidgetDensity = "compact" | "balanced" | "spacious";

export interface CalendarWidgetMonthDay {
  day: string;
  lunarDay: string;
  isOutsideMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}

export interface CalendarWidgetProps {
  weekday: string;
  solarDate: string;
  solarDay: string;
  lunarDate: string;
  canChi: string;
  display: CalendarWidgetDisplay;
  theme: "light" | "dark";
  density: CalendarWidgetDensity;
  eventSummary: string;
  eventAgenda: string;
  monthLabel: string;
  monthDays: CalendarWidgetMonthDay[];
}

export interface CalendarWidgetTimelineEntry {
  date: Date;
  props: CalendarWidgetProps;
}

export function buildCalendarWidgetTimeline(
  display: CalendarWidgetDisplay,
  dayCount = 32,
  theme: "light" | "dark" = "light",
  events: readonly LocalEvent[] = [],
  selectedDate = formatLocalDate(new Date()),
  density: CalendarWidgetDensity = "compact",
): CalendarWidgetTimelineEntry[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(start);

  return Array.from({ length: dayCount }, (_, offset) => {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const lunar = solarToLunar(day, month, year);
    const matching = events.filter((event) => {
      if (!event.enabled) return false;
      if (event.calendarType === "lunar") {
        return event.lunarDay === lunar.day && event.lunarMonth === lunar.month
          && event.lunarLeapMonth === lunar.isLeapMonth
          && (event.recurrence === "yearly" || event.lunarYear === lunar.year);
      }
      const key = formatLocalDate(date);
      return event.recurrence === "yearly"
        ? event.solarDate?.slice(5) === key.slice(5)
        : event.solarDate === key;
    }).sort((a, b) => (a.allDay ? "" : a.notificationTime ?? "").localeCompare(b.allDay ? "" : b.notificationTime ?? "") || a.title.localeCompare(b.title, "vi"));
    const label = (event: LocalEvent) => `${event.allDay ? "Cả ngày · " : event.notificationTime ? `${event.notificationTime} · ` : ""}${event.title.slice(0, 80)}`;
    const remaining = (limit: number) => matching.length > limit ? `\n+${matching.length - limit} sự kiện khác` : "";
    return {
      date,
      props: {
        weekday: new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(date),
        solarDate: `${day}/${month}/${year}`,
        solarDay: String(day),
        lunarDate: `${lunar.day}/${lunar.month}`,
        canChi: `Ngày ${getCanChi(day, month, year).day}`,
        eventSummary: matching.length ? label(matching[0]!) + remaining(1) : "Hôm nay chưa có sự kiện",
        eventAgenda: matching.length ? matching.slice(0, 3).map((event) => label(event) + (event.notes ? ` · ${event.notes.slice(0, 100)}` : "")).join("\n") + remaining(3) : "Hôm nay chưa có sự kiện",
        monthLabel: new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(display === "month" ? parseLocalDate(selectedDate) : date),
        monthDays: buildMonthDays(display === "month" ? parseLocalDate(selectedDate) : date, selectedDate, todayKey),
        display,
        theme,
        density,
      },
    };
  });
}

function buildMonthDays(
  date: Date,
  selectedDate: string,
  todayKey: string,
): CalendarWidgetMonthDay[] {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const firstCell = new Date(date.getFullYear(), date.getMonth(), 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(firstCell);
    cellDate.setDate(firstCell.getDate() + index);
    const cellKey = formatLocalDate(cellDate);
    const cellLunar = solarToLunar(
      cellDate.getDate(),
      cellDate.getMonth() + 1,
      cellDate.getFullYear(),
    );
    const lunarDay =
      cellLunar.day === 1
        ? `${cellLunar.day}/${cellLunar.month}`
        : String(cellLunar.day);
    return {
      day: String(cellDate.getDate()),
      lunarDay,
      isOutsideMonth: cellDate.getMonth() !== date.getMonth(),
      isSelected: cellKey === selectedDate,
      isToday: cellKey === todayKey,
    };
  });
}

export function serializeCalendarWidgetTimeline(entries: CalendarWidgetTimelineEntry[]): string {
  return JSON.stringify(entries.map((entry) => ({
    date: formatLocalDate(entry.date),
    props: entry.props,
  })));
}
