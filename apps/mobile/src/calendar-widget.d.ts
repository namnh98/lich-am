import type { LocalEvent } from "@lich-oi/core";
export function updateCalendarWidget(
  display?: "compact" | "detail" | "agenda" | "month",
  theme?: "light" | "dark",
  events?: readonly LocalEvent[],
  selectedDate?: string,
  density?: "compact" | "balanced" | "spacious",
): void;
export function requestCalendarWidgetPin(): boolean;
