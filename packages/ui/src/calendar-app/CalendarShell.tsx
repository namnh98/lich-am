import { ScrollView, StyleSheet } from "react-native";

import { Screen } from "../primitives/Screen";
import { theme } from "../theme";
import { AppHeader } from "./AppChrome";
import { CalendarNavigator } from "./CalendarNavigator";
import type {
  CalendarPreferences,
  EventStore,
  LunarCalendarAppProps,
  PreferencesChangeHandler,
} from "./types";
import { useAppNavigationViewModel } from "./useAppNavigationViewModel";

type CalendarShellProps = Pick<
  LunarCalendarAppProps,
  | "platform"
  | "mobilePlatform"
  | "widgetAvailable"
  | "initialScreen"
  | "navigationRequestId"
  | "onAddWidget"
  | "onRequestNotifications"
  | "authService"
> & {
  preferences: CalendarPreferences;
  onPreferencesChange: PreferencesChangeHandler;
  eventStore?: EventStore;
  appVersion?: string;
};

export function CalendarShell({
  platform = "mobile",
  widgetAvailable = false,
  initialScreen = "calendar",
  mobilePlatform,
  navigationRequestId,
  onAddWidget,
  onRequestNotifications,
  authService,
  preferences,
  onPreferencesChange,
  eventStore,
  appVersion = "0.1.0",
}: CalendarShellProps) {
  const navigation = useAppNavigationViewModel(
    initialScreen,
    navigationRequestId,
  );

  return (
    <Screen style={styles.screen}>
      <AppHeader
        onBack={navigation.showCalendar}
        onOpenNotifications={navigation.showNotifications}
        onOpenSettings={navigation.showSettings}
        appVersion={appVersion}
        screen={navigation.screen}
      />
      <ScrollView
        key={navigation.screen}
        contentContainerStyle={styles.scrollContent}
      >
        <CalendarNavigator
          eventStore={eventStore}
          authService={authService}
          mobilePlatform={mobilePlatform}
          onAddWidget={onAddWidget}
          onPreferencesChange={onPreferencesChange}
          platform={platform}
          preferences={preferences}
          screen={navigation.screen}
          widgetAvailable={widgetAvailable}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  scrollContent: { flexGrow: 1, padding: theme.spacing.md },
});
