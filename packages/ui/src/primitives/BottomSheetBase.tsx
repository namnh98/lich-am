import type { PropsWithChildren } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";

import { useBottomSheetAnimation } from "../hooks/useBottomSheetAnimation";
import { theme, useTheme } from "../theme";
import { AppText } from "./AppText";

export interface BottomSheetProps {
  expanded?: boolean;
  onClose: () => void;
  title: string;
  visible: boolean;
}

interface BottomSheetBaseProps extends BottomSheetProps {
  bottomInset: number;
}

export function BottomSheetBase({
  bottomInset,
  children,
  expanded = false,
  onClose,
  title,
  visible,
}: PropsWithChildren<BottomSheetBaseProps>) {
  const currentTheme = useTheme();
  const animation = useBottomSheetAnimation(visible);

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: currentTheme.colors.overlay,
              opacity: animation.backdropOpacity,
            },
          ]}
        >
          <Pressable
            accessibilityLabel="Đóng cửa sổ"
            accessibilityRole="button"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            expanded && styles.expandedSheet,
            {
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.border,
              paddingBottom:
                theme.spacing.md + Math.max(theme.spacing.xl, bottomInset),
              transform: [{ translateY: animation.translateY }],
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="title">{title}</AppText>
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
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    borderTopLeftRadius: theme.radius.large,
    borderTopRightRadius: theme.radius.large,
    borderWidth: 1,
    gap: theme.spacing.md,
    maxHeight: "88%",
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
  },
  expandedSheet: { height: "88%" },
  handle: {
    alignSelf: "center",
    backgroundColor: "#A4A79F",
    borderRadius: 2,
    height: 4,
    marginTop: theme.spacing.sm,
    opacity: 0.7,
    width: 40,
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
