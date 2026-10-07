import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";

export interface CalendarDayProps {
  solarDay: number;
  lunarDay: number;
  selected?: boolean;
  marked?: boolean;
  onPress?: () => void;
}

export function CalendarDay({ solarDay, lunarDay, selected = false, marked = false, onPress }: CalendarDayProps) {
  const currentTheme = useTheme();
  return (
    <Pressable
      accessibilityLabel={`Ngày ${solarDay}, âm lịch ${lunarDay}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.day,
        selected && { backgroundColor: currentTheme.colors.accent },
        pressed && styles.pressed,
      ]}
    >
      <AppText style={selected && { color: currentTheme.colors.onAccent, fontWeight: "700" }}>{solarDay}</AppText>
      <AppText
        style={selected && { color: currentTheme.colors.onAccent }}
        tone={selected ? "default" : "muted"}
        variant="caption"
      >
        {lunarDay}
      </AppText>
      <View style={[styles.marker, { backgroundColor: currentTheme.colors.accent }, !marked && styles.markerHidden]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  day: {
    alignItems: "center",
    borderRadius: theme.radius.medium,
    gap: 1,
    justifyContent: "center",
    minHeight: 60,
    padding: theme.spacing.xs,
    width: 52,
  },
  pressed: { opacity: 0.72 },
  marker: { borderRadius: 2, height: 4, marginTop: 2, width: 4 },
  markerHidden: { opacity: 0 },
});
