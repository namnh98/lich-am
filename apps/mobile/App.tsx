import appConfig from "./app.json";
import { firebaseAuthService } from "./src/firebase-auth";

import { LunarCalendarApp } from "@lich-am/ui";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useEffect } from "react";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import {
  loadCalendarPreferences,
  saveCalendarPreferences,
} from "./src/calendar-preferences";
import { useAddCalendarWidget } from "./src/useAddCalendarWidget";
import { useCalendarWidgetSync } from "./src/useCalendarWidgetSync";
import { useMobileNavigation } from "./src/useMobileNavigation";
import { initializeMobileStorage } from "./src/storage";
import {
  cancelEventNotification,
  prepareNotifications,
  scheduleEventNotification,
} from "./src/notifications";

export default function App() {
  const navigation = useMobileNavigation();
  const addCalendarWidget = useAddCalendarWidget();
  useCalendarWidgetSync();

  useEffect(() => {
    void initializeMobileStorage()
      .then(async ({ events }) => {
        await prepareNotifications();
        const savedEvents = await events.list({ enabledOnly: true });
        await Promise.all(savedEvents.map(scheduleEventNotification));
      })
      .catch(console.error);
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="auto" />
      <LunarCalendarApp
        initialScreen={navigation.screen}
        authService={firebaseAuthService}
        loadPreferences={loadCalendarPreferences}
        navigationRequestId={navigation.id}
        mobilePlatform={Platform.OS === "ios" ? "ios" : "android"}
        onAddWidget={addCalendarWidget}
        onRequestNotifications={prepareNotifications}
        platform="mobile"
        savePreferences={saveCalendarPreferences}
        appVersion={`${appConfig.expo.version} (${Platform.OS === "android" ? appConfig.expo.android.versionCode : appConfig.expo.ios.buildNumber})`}
        eventStore={{
          list: async () => (await initializeMobileStorage()).events.list(),
          save: async (event) => {
            await (await initializeMobileStorage()).events.save(event);
            await scheduleEventNotification(event);
            await loadCalendarPreferences().catch(console.error);
          },
          remove: async (id) => {
            const removed = await (
              await initializeMobileStorage()
            ).events.remove(id);
            await loadCalendarPreferences().catch(console.error);
            cancelEventNotification(id);
            return removed;
          },
        }}
        widgetAvailable={Platform.OS === "ios" || Platform.OS === "android"}
      />
    </SafeAreaProvider>
  );
}
