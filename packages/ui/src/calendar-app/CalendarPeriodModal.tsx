import { Modal, Pressable, StyleSheet, View } from "react-native";

import { ActionButton } from "../primitives/ActionButton";
import { BottomSheet } from "../primitives/BottomSheet";
import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";
import { CalendarPeriodPicker } from "./CalendarPeriodPicker";

interface CalendarPeriodModalProps {
  month: number;
  onApply: () => void;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
  platform?: "mobile" | "desktop";
  visible: boolean;
  year: number;
}

export function CalendarPeriodModal({
  month,
  onApply,
  onClose,
  onSelect,
  platform = "mobile",
  visible,
  year,
}: CalendarPeriodModalProps) {
  const currentTheme = useTheme();

  if (platform === "desktop") {
    return (
      <Modal
        animationType="fade"
        onRequestClose={onClose}
        transparent
        visible={visible}
      >
        <View
          style={[
            styles.overlay,
            { backgroundColor: currentTheme.colors.overlay },
          ]}
        >
          <Pressable
            accessibilityLabel="Đóng cửa sổ"
            accessibilityRole="button"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.dialog,
              {
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              },
            ]}
          >
            <View style={styles.header}>
              <AppText variant="title">Đi đến tháng khác</AppText>
              <Pressable
                accessibilityLabel="Đóng"
                accessibilityRole="button"
                onPress={onClose}
                style={[
                  styles.closeButton,
                  { backgroundColor: currentTheme.colors.surfaceMuted },
                ]}
              >
                <AppText style={styles.closeText}>Đóng</AppText>
              </Pressable>
            </View>
            <CalendarPeriodPicker
              month={month}
              onSelect={onSelect}
              year={year}
            />
            <ActionButton
              label={`Mở lịch tháng ${month}/${year}`}
              onPress={onApply}
            />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <BottomSheet onClose={onClose} title="Đi đến tháng khác" visible={visible}>
      <CalendarPeriodPicker month={month} onSelect={onSelect} year={year} />
      <ActionButton
        label={`Mở lịch tháng ${month}/${year}`}
        onPress={onApply}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  dialog: {
    borderRadius: theme.radius.large,
    borderWidth: 1,
    gap: theme.spacing.md,
    maxWidth: 620,
    padding: theme.spacing.lg,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  closeButton: {
    borderRadius: 999,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  closeText: { fontWeight: "700" },
});
