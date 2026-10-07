import { StyleSheet, Text, type TextProps } from "react-native";

import { theme, useTheme } from "../theme";

export interface AppTextProps extends TextProps {
  tone?: "default" | "muted" | "accent";
  variant?: "body" | "caption" | "title" | "display";
}

export function AppText({ tone = "default", variant = "body", style, ...props }: AppTextProps) {
  const currentTheme = useTheme();
  const color = tone === "accent"
    ? currentTheme.colors.accent
    : tone === "muted"
      ? currentTheme.colors.muted
      : currentTheme.colors.text;
  return <Text style={[styles.text, variants[variant], { color }, style]} {...props} />;
}

const variants = StyleSheet.create({
  body: theme.typography.body,
  caption: theme.typography.caption,
  title: { ...theme.typography.title, fontWeight: "600" },
  display: { ...theme.typography.display, fontWeight: "700" },
});

const styles = StyleSheet.create({ text: {} });
