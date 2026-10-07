import { appStore } from "@lich-oi/core";
import { useEffect } from "react";

import { loadCalendarPreferences } from "./calendar-preferences";

export function useCalendarWidgetSync(): void {
  useEffect(() => {
    void loadCalendarPreferences().catch(console.error);
    return appStore.subscribe(() => {
      void loadCalendarPreferences().catch(console.error);
    });
  }, []);
}
