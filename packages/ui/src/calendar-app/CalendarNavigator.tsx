import type { ReactNode } from "react";

import { AuthScreen } from "./AuthScreen";
import { CalendarView } from "./CalendarView";
import { NotificationsScreen } from "./NotificationsScreen";
import { SettingsScreen } from "./SettingsScreen";
import type {
  AppScreen,
  CalendarPreferences,
  EventStore,
  LunarCalendarAppProps,
  PreferencesChangeHandler,
} from "./types";

type CalendarNavigatorProps = Pick<
  LunarCalendarAppProps,
  | "platform"
  | "mobilePlatform"
  | "widgetAvailable"
  | "onAddWidget"
  | "onRequestNotifications"
  | "authService"
> & {
  screen: AppScreen;
  preferences: CalendarPreferences;
  onPreferencesChange: PreferencesChangeHandler;
  eventStore?: EventStore;
  onOpenAuth?: () => void;
  onBackToCalendar?: () => void;
};

type RouteContext = Omit<
  CalendarNavigatorProps,
  "screen" | "platform" | "widgetAvailable"
> & {
  platform: "mobile" | "desktop";
  widgetAvailable: boolean;
};
type RouteRenderer = (context: RouteContext) => ReactNode;

const routeRenderers: Record<AppScreen, RouteRenderer> = {
  calendar: ({ eventStore, platform }) => (
    <CalendarView eventStore={eventStore} platform={platform} />
  ),
  notifications: ({ eventStore }) => (
    <NotificationsScreen eventStore={eventStore} />
  ),
  settings: ({
    mobilePlatform,
    onAddWidget,
    onPreferencesChange,
    platform,
    preferences,
    onRequestNotifications,
    authService,
    widgetAvailable,
    onOpenAuth,
  }) => (
    <SettingsScreen
      onAddWidget={onAddWidget}
      onChange={onPreferencesChange}
      mobilePlatform={mobilePlatform}
      onRequestNotifications={onRequestNotifications}
      authService={authService}
      platform={platform}
      preferences={preferences}
      widgetAvailable={widgetAvailable}
      onOpenAuth={onOpenAuth}
    />
  ),
  auth: ({ authService, onBackToCalendar }) => (
    <AuthScreen
      authService={authService}
      onSuccess={onBackToCalendar ?? (() => {})}
      onCancel={onBackToCalendar}
    />
  ),
};

export function CalendarNavigator({
  platform = "mobile",
  widgetAvailable = false,
  screen,
  ...context
}: CalendarNavigatorProps) {
  return routeRenderers[screen]({ platform, widgetAvailable, ...context });
}
