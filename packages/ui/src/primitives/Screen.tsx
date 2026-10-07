import type { PropsWithChildren } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { theme, useTheme } from "../theme";

export function Screen({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  const currentTheme = useTheme();
  return (
    <View
      style={[styles.screen, { backgroundColor: currentTheme.colors.background }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: theme.spacing.md },
});
