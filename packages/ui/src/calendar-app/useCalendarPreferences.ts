import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import type { ThemeMode } from "../theme";
import type { CalendarPreferences, LunarCalendarAppProps } from "./types";

const DEFAULT_PREFERENCES: CalendarPreferences = {
  theme: "system",
  widgetDisplay: "compact",
  widgetTheme: "light",
  widgetDensity: "compact",
  pinToMenuBar: "false",
};

export function useCalendarPreferences({
  loadPreferences,
  savePreferences,
}: Pick<LunarCalendarAppProps, "loadPreferences" | "savePreferences">) {
  const systemScheme = useColorScheme();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const resolvedTheme: ThemeMode = preferences.theme === "system"
    ? systemScheme === "dark" ? "dark" : "light"
    : preferences.theme;

  useEffect(() => {
    void loadPreferences?.()
      .then((stored) => {
        if (stored) setPreferences((current) => mergePreferences(current, stored));
      })
      .catch((error: unknown) => console.error("Unable to load preferences", error));
  }, [loadPreferences]);

  const updatePreferences = (patch: Partial<CalendarPreferences>) => {
    setPreferences((current) => {
      const next = mergePreferences(current, patch);
      void savePreferences?.(next).catch((error: unknown) => {
        console.error("Unable to save preferences", error);
      });
      return next;
    });
  };

  return { preferences, resolvedTheme, updatePreferences };
}

function mergePreferences(
  current: CalendarPreferences,
  patch: Partial<CalendarPreferences>,
): CalendarPreferences {
  return {
    theme: patch.theme ?? current.theme,
    widgetDisplay: patch.widgetDisplay ?? current.widgetDisplay,
    widgetTheme: patch.widgetTheme ?? current.widgetTheme,
    widgetDensity: patch.widgetDensity ?? current.widgetDensity ?? "compact",
    pinToMenuBar: patch.pinToMenuBar ?? current.pinToMenuBar ?? "false",
  };
}
