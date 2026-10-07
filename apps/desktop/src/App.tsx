import type { CalendarPreferences } from "@lich-am/ui";
import { appStore, formatLocalDate, solarToLunar } from "@lich-oi/core";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

import { initializeDesktopStorage } from "./storage";
import { DesktopCalendarApp } from "./desktop-ui/DesktopCalendarApp";
import { MenuBarPopup } from "./desktop-ui/MenuBarPopup";
import { firebaseAuthService } from "./firebase-auth";
import {
  cancelEventNotification,
  prepareNotifications,
  scheduleEventNotification,
} from "./notifications";

const PREFERENCES_KEY = "calendar.preferences";

async function loadPreferences(): Promise<Partial<CalendarPreferences> | null> {
  const { settings } = await initializeDesktopStorage();
  return settings.get<CalendarPreferences>(PREFERENCES_KEY);
}

async function savePreferences(
  preferences: CalendarPreferences,
): Promise<void> {
  const { settings } = await initializeDesktopStorage();
  await settings.set(PREFERENCES_KEY, preferences);
  await emit("desktop:preferences-changed", preferences);
  const pinned = preferences.pinToMenuBar === "true";
  await invoke("set_pin_to_menu_bar", { pinned });
}

export default function App() {
  return getCurrentWindow().label === "quick-view" ? (
    <MenuBarPopup />
  ) : (
    <DesktopMainApp />
  );
}

function DesktopMainApp() {
  const [navigationRequestId, setNavigationRequestId] = useState(0);

  useEffect(() => {
    const syncToday = () => {
      appStore.getState().selectDate(formatLocalDate(new Date()));
      setNavigationRequestId((current) => current + 1);
    };

    let unlisten: (() => void) | undefined;
    void listen("desktop:show-calendar", syncToday)
      .then((stopListening) => {
        unlisten = stopListening;
      })
      .catch(console.error);

    const handleFocus = () => syncToday();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncToday();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      unlisten?.();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const updateTray = () => {
      const today = new Date();
      const lunar = solarToLunar(
        today.getDate(),
        today.getMonth() + 1,
        today.getFullYear(),
      );
      void invoke("set_tray_lunar_date", {
        title: ` AL ${lunar.day}/${lunar.month} - DL ${today.getDate()}/${today.getMonth() + 1}`,
      }).catch(console.error);
    };

    updateTray();
    const interval = setInterval(updateTray, 60 * 60 * 1000); // Cập nhật mỗi tiếng
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    void loadPreferences()
      .then((prefs) =>
        invoke("set_pin_to_menu_bar", {
          pinned: prefs?.pinToMenuBar === "true",
        }),
      )
      .catch((error: unknown) => {
        console.error(error);
        void invoke("set_pin_to_menu_bar", { pinned: false }).catch(
          console.error,
        );
      });
  }, []);

  useEffect(() => {
    void initializeDesktopStorage()
      .then(async ({ events }) => {
        await prepareNotifications();
        const savedEvents = await events.list({ enabledOnly: true });
        await Promise.all(savedEvents.map(scheduleEventNotification));
      })
      .catch(console.error);
  }, []);

  return (
    <DesktopCalendarApp
      appVersion="0.1.0"
      authService={firebaseAuthService}
      eventStore={{
        list: async () => (await initializeDesktopStorage()).events.list(),
        save: async (event) => {
          await (await initializeDesktopStorage()).events.save(event);
          await scheduleEventNotification(event);
        },
        remove: async (id) => {
          const removed = await (
            await initializeDesktopStorage()
          ).events.remove(id);
          cancelEventNotification(id);
          return removed;
        },
      }}
      loadPreferences={loadPreferences}
      navigationRequestId={navigationRequestId}
      onRequestNotifications={prepareNotifications}
      platform="desktop"
      savePreferences={savePreferences}
    />
  );
}
