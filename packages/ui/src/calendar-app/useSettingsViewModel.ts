import { useCallback } from "react";

import type {
  PreferencesChangeHandler,
  ThemePreference,
  WidgetDisplay,
} from "./types";

export function useSettingsViewModel(onChange: PreferencesChangeHandler) {
  const selectTheme = useCallback((theme: ThemePreference) => onChange({ theme }), [onChange]);
  const selectWidgetDisplay = useCallback(
    (widgetDisplay: WidgetDisplay) => onChange({ widgetDisplay }),
    [onChange],
  );

  return { selectTheme, selectWidgetDisplay };
}
