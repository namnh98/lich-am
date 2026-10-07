import type { ThemeMode } from "../theme";
import type { LocalEvent } from "@lich-oi/core";

export type ThemePreference = "system" | ThemeMode;
export type WidgetDisplay = "compact" | "detail" | "agenda" | "month";
export type WidgetDensity = "compact" | "balanced" | "spacious";
export type AppScreen = "calendar" | "settings" | "notifications" | "auth";

export interface AuthUser {
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  uid?: string;
  isAnonymous?: boolean;
}

export interface AuthService {
  subscribe: (listener: (user: AuthUser | null) => void) => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  signInAnonymously?: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  updateProfile?: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
}

export interface CalendarPreferences extends Record<string, string> {
  theme: ThemePreference;
  widgetDisplay: WidgetDisplay;
  widgetTheme: "light" | "dark";
  widgetDensity: WidgetDensity;
  pinToMenuBar: "true" | "false";
}

export interface LunarCalendarAppProps {
  platform?: "mobile" | "desktop";
  mobilePlatform?: "android" | "ios";
  widgetAvailable?: boolean;
  initialScreen?: AppScreen;
  navigationRequestId?: number;
  onAddWidget?: () => void;
  onRequestNotifications?: () => boolean | Promise<boolean>;
  authService?: AuthService;
  loadPreferences?: () => Promise<Partial<CalendarPreferences> | null>;
  savePreferences?: (preferences: CalendarPreferences) => Promise<void>;
  eventStore?: EventStore;
  appVersion?: string;
}

export interface EventStore {
  list: () => Promise<LocalEvent[]>;
  save: (event: LocalEvent) => Promise<void>;
  remove: (id: string) => Promise<boolean>;
}

export type PreferencesChangeHandler = (
  patch: Partial<CalendarPreferences>,
) => void;
