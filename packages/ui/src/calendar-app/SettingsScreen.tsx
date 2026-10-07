import { Alert, StyleSheet, View } from "react-native";
import { useState } from "react";

import { AppText } from "../primitives/AppText";
import { theme } from "../theme";
import { ThemeSettingsCard } from "./ThemeSettingsCard";
import { ActionButton } from "../primitives/ActionButton";
import type { AuthService, CalendarPreferences, PreferencesChangeHandler } from "./types";
import { AuthSettingsCard } from "./AuthSettingsCard";
import { useSettingsViewModel } from "./useSettingsViewModel";
import { WidgetSettingsCard } from "./WidgetSettingsCard";
import { DesktopSettingsCard } from "./DesktopSettingsCard";

export function SettingsScreen({
  mobilePlatform,
  onAddWidget,
  onRequestNotifications,
  onChange,
  platform,
  preferences,
  widgetAvailable,
  authService,
}: {
  mobilePlatform?: "android" | "ios";
  onAddWidget?: () => void;
  onRequestNotifications?: () => boolean | Promise<boolean>;
  onChange: PreferencesChangeHandler;
  platform: "mobile" | "desktop";
  preferences: CalendarPreferences;
  widgetAvailable: boolean;
  authService?: AuthService;
}) {
  const viewModel = useSettingsViewModel(onChange);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(
    null,
  );

  const requestNotifications = async () => {
    if (!onRequestNotifications) return;
    const granted = await onRequestNotifications();
    const message = granted
      ? "Thông báo nhắc nhở đã được bật."
      : "Thông báo đang bị tắt. Hãy bật quyền trong cài đặt hệ điều hành.";
    if (platform === "desktop") {
      Alert.alert("Quyền thông báo", message);
    } else {
      setPermissionMessage(message);
    }
  };

  return (
    <View style={styles.screen}>
      <AppText tone="muted">Tùy chỉnh giao diện và widget.</AppText>
      <ThemeSettingsCard
        onSelect={viewModel.selectTheme}
        selected={preferences.theme}
      />
      <AuthSettingsCard authService={authService} />
      {platform === "desktop" ? (
        <DesktopSettingsCard
          onSelect={(value) => onChange({ pinToMenuBar: value })}
          selected={preferences.pinToMenuBar ?? "false"}
        />
      ) : null}
      {onRequestNotifications ? (
        <ActionButton
          label="Cho phép thông báo nhắc nhở"
          onPress={() => void requestNotifications()}
        />
      ) : null}
      {platform === "mobile" && permissionMessage ? (
        <View
          accessibilityRole="alert"
          style={[
            styles.permissionToast,
            {
              backgroundColor: permissionMessage.includes("bật")
                ? "#2E7D32"
                : "#B3261E",
            },
          ]}
        >
          <AppText style={styles.permissionToastText}>
            {permissionMessage}
          </AppText>
        </View>
      ) : null}
      {platform === "mobile" ? (
        <WidgetSettingsCard
          available={widgetAvailable}
          mobilePlatform={mobilePlatform}
          onAddWidget={onAddWidget}
          onSelect={viewModel.selectWidgetDisplay}
          selected={preferences.widgetDisplay}
          widgetTheme={preferences.widgetTheme}
          onThemeSelect={(widgetTheme) => onChange({ widgetTheme })}
          widgetDensity={preferences.widgetDensity}
          onDensitySelect={(widgetDensity) => onChange({ widgetDensity })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignSelf: "center",
    gap: theme.spacing.md,
    maxWidth: 720,
    paddingVertical: theme.spacing.md,
    width: "100%",
  },
  permissionToast: {
    borderRadius: theme.radius.small,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  permissionToastText: { color: "#FFFFFF", fontWeight: "600" },
});
