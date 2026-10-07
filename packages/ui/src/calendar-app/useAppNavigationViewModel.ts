import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

import type { AppScreen } from "./types";

export function useAppNavigationViewModel(
  initialScreen: AppScreen,
  navigationRequestId?: number,
) {
  const [screen, setScreen] = useState<AppScreen>(initialScreen);

  useEffect(
    () => setScreen(initialScreen),
    [initialScreen, navigationRequestId],
  );

  const showCalendar = useCallback(() => setScreen("calendar"), []);
  const showSettings = useCallback(() => setScreen("settings"), []);
  const showNotifications = useCallback(() => setScreen("notifications"), []);

  useEffect(() => {
    if (screen === "calendar") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        showCalendar();
        return true;
      },
    );
    return () => subscription.remove();
  }, [screen, showCalendar]);

  return { screen, showCalendar, showNotifications, showSettings };
}
