import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";

import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";
import type { AppScreen } from "./types";

interface AppHeaderProps {
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  appVersion: string;
  screen: AppScreen;
}

interface HeaderButtonProps {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
}

export function AppHeader({
  onBack,
  onOpenSettings,
  onOpenNotifications,
  appVersion,
  screen,
}: AppHeaderProps) {
  const currentTheme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  if (screen === "settings" || screen === "notifications") {
    return (
      <View
        style={[
          styles.header,
          { borderBottomColor: currentTheme.colors.border },
        ]}
      >
        <HeaderButton
          accessibilityLabel="Quay lại lịch"
          label="‹"
          onPress={onBack}
        />
        <AppText style={styles.screenTitle}>
          {screen === "settings" ? "CÀI ĐẶT" : "THÔNG BÁO"}
        </AppText>
        <View style={styles.headerSpacer} />
      </View>
    );
  }

  return (
    <View
      style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}
    >
      <View>
        <AppText style={styles.brand}>LỊCH VIỆT</AppText>
      </View>
      <View style={styles.actions}>
        <HeaderButton
          accessibilityLabel="Mở menu cài đặt"
          label="Cài đặt"
          onPress={() => setMenuVisible(true)}
        />
      </View>
      <Modal
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        transparent
        visible={menuVisible}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: currentTheme.colors.overlay },
          ]}
        >
          <Pressable
            onPress={() => setMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.menu,
              {
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              },
            ]}
          >
            <AppText variant="title">LỊCH VIỆT</AppText>
            <HeaderButton
              accessibilityLabel="Mở cài đặt"
              label="Cài đặt"
              onPress={() => {
                setMenuVisible(false);
                onOpenSettings();
              }}
            />
            <HeaderButton
              accessibilityLabel="Mở thông báo"
              label="Thông báo"
              onPress={() => {
                setMenuVisible(false);
                onOpenNotifications();
              }}
            />
            <HeaderButton
              accessibilityLabel="Xem thông tin ứng dụng"
              label="Thông tin ứng dụng"
              onPress={() => {
                setMenuVisible(false);
                setAboutVisible(true);
              }}
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        onRequestClose={() => setAboutVisible(false)}
        transparent
        visible={aboutVisible}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: currentTheme.colors.overlay },
          ]}
        >
          <View
            style={[
              styles.about,
              {
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              },
            ]}
          >
            <AppText variant="title">Lịch Việt</AppText>
            <AppText tone="muted">
              Lịch âm dương và ghi chú ngày quan trọng.
            </AppText>
            <AppText tone="accent">Phiên bản {appVersion}</AppText>
            <HeaderButton
              accessibilityLabel="Đóng thông tin ứng dụng"
              label="Đóng"
              onPress={() => setAboutVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HeaderButton({
  accessibilityLabel,
  label,
  onPress,
}: HeaderButtonProps) {
  const currentTheme = useTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.headerButton, { borderColor: currentTheme.colors.border }]}
    >
      <AppText style={styles.headerButtonText}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 68,
    paddingHorizontal: theme.spacing.lg,
  },
  brand: { fontSize: 18, fontWeight: "800", letterSpacing: 1.5 },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: theme.spacing.md,
  },
  headerButtonText: { fontWeight: "700" },
  headerSpacer: { width: 76 },
  screenTitle: { fontSize: 16, fontWeight: "800", letterSpacing: 1.2 },
  modalOverlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  menu: {
    borderRadius: theme.radius.large,
    borderWidth: 1,
    gap: theme.spacing.sm,
    maxWidth: 380,
    padding: theme.spacing.lg,
    width: "100%",
  },
  about: {
    borderRadius: theme.radius.large,
    borderWidth: 1,
    gap: theme.spacing.md,
    maxWidth: 380,
    padding: theme.spacing.lg,
    width: "100%",
  },
});
