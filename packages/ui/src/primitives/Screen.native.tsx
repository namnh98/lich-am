import type { ComponentType, PropsWithChildren } from "react";
import { StyleSheet, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme, useTheme } from "../theme";

// RN 0.85's generated HostComponent type currently drops inherited ViewProps.
const CompatibleSafeAreaView = SafeAreaView as unknown as ComponentType<PropsWithChildren<ViewProps>>;

export function Screen({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  const currentTheme = useTheme();
  return (
    <CompatibleSafeAreaView
      style={[styles.screen, { backgroundColor: currentTheme.colors.background }, style]}
      {...props}
    >
      {children}
    </CompatibleSafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: theme.spacing.md },
});
