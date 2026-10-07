import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";

import { AppText } from "../primitives/AppText";
import { Card } from "../primitives/Card";
import { theme } from "../theme";

export function SettingCard({
  children,
  description,
  title,
}: PropsWithChildren<{ description: string; title: string }>) {
  return (
    <Card style={styles.card}>
      <AppText style={styles.title}>{title}</AppText>
      <AppText tone="muted" variant="caption">{description}</AppText>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing.sm },
  title: { fontWeight: "700" },
});
