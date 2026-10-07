import { Pressable, StyleSheet } from "react-native";

import { theme, useTheme } from "../theme";
import { AppText } from "./AppText";

export function ActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const currentTheme = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: currentTheme.colors.accent },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <AppText style={[styles.label, { color: currentTheme.colors.onAccent }]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: theme.radius.medium,
    minHeight: 44,
    justifyContent: "center",
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  label: { fontWeight: "700" },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
});
