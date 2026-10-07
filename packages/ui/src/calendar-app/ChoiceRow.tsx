import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";

export interface ChoiceOption<Value extends string> {
  value: Value;
  label: string;
}

export function ChoiceRow<Value extends string>({
  options,
  selected,
  onSelect,
  disabled = false,
}: {
  options: readonly ChoiceOption<Value>[];
  selected: Value;
  onSelect: (value: Value) => void;
  disabled?: boolean;
}) {
  const currentTheme = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled }}
            disabled={disabled}
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.choice,
              { borderColor: currentTheme.colors.border },
              active && { backgroundColor: currentTheme.colors.accentSoft, borderColor: currentTheme.colors.accent },
              disabled && styles.disabled,
            ]}
          >
            <AppText tone={active ? "accent" : "default"} style={styles.label}>{option.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  choice: { borderRadius: 999, borderWidth: 1, minWidth: 92, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  label: { fontWeight: "600", textAlign: "center" },
  disabled: { opacity: 0.38 },
});
