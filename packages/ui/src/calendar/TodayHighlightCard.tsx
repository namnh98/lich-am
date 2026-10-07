import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "../primitives/AppText";
import { Card } from "../primitives/Card";
import { theme, useTheme } from "../theme";

export interface TodayHighlightLabels {
  canChi: string;
  auspiciousHours: string;
  recommendation: string;
  avoidance?: string;
}

export interface TodayHighlightCardProps {
  labels: TodayHighlightLabels;
  title: string;
  solarDate: string;
  lunarDate: string;
  canChi: string;
  auspiciousHours: string;
  recommendation: string;
  avoidance?: string;
  style?: StyleProp<ViewStyle>;
}

export function TodayHighlightCard({
  labels,
  title,
  solarDate,
  lunarDate,
  canChi,
  auspiciousHours,
  recommendation,
  avoidance,
  style,
}: TodayHighlightCardProps) {
  const currentTheme = useTheme();
  return (
    <Card accessibilityLabel={[title, lunarDate, canChi].join(". ")} style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText tone="muted" variant="caption">{title.toUpperCase()}</AppText>
          <AppText tone="accent" variant="display">{lunarDate}</AppText>
        </View>
        <AppText tone="muted">{solarDate}</AppText>
      </View>

      <View style={styles.details}>
        <Detail label={labels.canChi} value={canChi} />
        <Detail label={labels.auspiciousHours} value={auspiciousHours} />
      </View>

      <View style={[styles.divider, { backgroundColor: currentTheme.colors.border }]} />
      <Detail label={labels.recommendation} value={recommendation} />
      {avoidance && labels.avoidance ? <Detail label={labels.avoidance} value={avoidance} /> : null}
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <AppText tone="muted" variant="caption">{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  heading: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  detail: {
    flex: 1,
    gap: 2,
    minWidth: 144,
  },
  divider: {
    height: 1,
  },
});
