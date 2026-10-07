import type { LocalEvent } from "@lich-oi/core";
import { requireNativeModule } from "expo-modules-core";

import {
  buildCalendarWidgetTimeline,
  serializeCalendarWidgetTimeline,
  type CalendarWidgetDensity,
  type CalendarWidgetDisplay,
} from "./calendar-widget-data";

interface CalendarWidgetNativeModule {
  setTimeline(timelineJson: string): void;
  requestPin(): boolean;
}

const nativeWidget = requireNativeModule<CalendarWidgetNativeModule>("CalendarWidget");

export function requestCalendarWidgetPin(): boolean {
  return nativeWidget.requestPin();
}

export function updateCalendarWidget(
  display: CalendarWidgetDisplay = "compact",
  theme: "light" | "dark" = "light",
  events: readonly LocalEvent[] = [],
  selectedDate?: string,
  density: CalendarWidgetDensity = "compact",
): void {
  const timeline = buildCalendarWidgetTimeline(
    display,
    32,
    theme,
    events,
    selectedDate,
    density,
  );
  nativeWidget.setTimeline(serializeCalendarWidgetTimeline(timeline));
}
