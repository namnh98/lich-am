import type { PropsWithChildren } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { theme, useTheme } from "../theme";

export function Card({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  const currentTheme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: theme.radius.large, borderWidth: 1, padding: theme.spacing.md },
});
