import { appStore } from "@lich-oi/core";
import type { CalendarPreferences } from "@lich-am/ui";

import { updateCalendarWidget } from "./calendar-widget";
import { initializeMobileStorage } from "./storage";

const PREFERENCES_KEY = "calendar.preferences";

export async function loadCalendarPreferences(): Promise<Partial<CalendarPreferences> | null> {
  const { settings, events } = await initializeMobileStorage();
  const preferences = await settings.get<CalendarPreferences>(PREFERENCES_KEY);
  updateCalendarWidget(
    preferences?.widgetDisplay ?? "compact",
    preferences?.widgetTheme ?? "light",
    await events.list(),
    appStore.getState().selectedDate,
    preferences?.widgetDensity ?? "compact",
  );
  return preferences;
}

export async function saveCalendarPreferences(preferences: CalendarPreferences): Promise<void> {
  const { settings, events } = await initializeMobileStorage();
  await settings.set(PREFERENCES_KEY, preferences);
  updateCalendarWidget(
    preferences.widgetDisplay,
    preferences.widgetTheme,
    await events.list(),
    appStore.getState().selectedDate,
    preferences.widgetDensity ?? "compact",
  );
}
