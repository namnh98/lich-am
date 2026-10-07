import { CalendarShell } from "./calendar-app/CalendarShell";
import type { LunarCalendarAppProps } from "./calendar-app/types";
import { useCalendarPreferences } from "./calendar-app/useCalendarPreferences";
import { ThemeProvider } from "./theme";

export type {
  AppScreen,
  CalendarPreferences,
  LunarCalendarAppProps,
  ThemePreference,
  WidgetDisplay,
  AuthService,
  AuthUser,
} from "./calendar-app/types";

export function LunarCalendarApp(props: LunarCalendarAppProps) {
  const { preferences, resolvedTheme, updatePreferences } =
    useCalendarPreferences(props);

  return (
    <ThemeProvider mode={resolvedTheme}>
      <CalendarShell
        initialScreen={props.initialScreen}
        mobilePlatform={props.mobilePlatform}
        navigationRequestId={props.navigationRequestId}
        onAddWidget={props.onAddWidget}
        onRequestNotifications={props.onRequestNotifications}
        appVersion={props.appVersion}
        eventStore={props.eventStore}
        authService={props.authService}
        onPreferencesChange={updatePreferences}
        platform={props.platform}
        preferences={preferences}
        widgetAvailable={props.widgetAvailable}
      />
    </ThemeProvider>
  );
}
