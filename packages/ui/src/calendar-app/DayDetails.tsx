import { getAuspiciousHours, getCanChi, getSolarTerm, solarToLunar } from "@lich-oi/core";
import { StyleSheet, View } from "react-native";

import { AppText } from "../primitives/AppText";
import { Card } from "../primitives/Card";
import { theme, useTheme } from "../theme";

export function DayDetails({ date }: { date: Date }) {
  const currentTheme = useTheme();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const lunar = solarToLunar(day, month, year);
  const canChi = getCanChi(day, month, year);
  const hours = getAuspiciousHours(day, month, year);
  const solarTerm = getSolarTerm(day, month, year);
  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(date);

  return (
    <Card style={styles.card}>
      <AppText tone="muted" variant="caption">{weekday.toUpperCase()} · {day}/{month}/{year}</AppText>
      <View style={styles.lunarHeading}>
        <AppText tone="accent" style={styles.lunarDay}>{lunar.day}</AppText>
        <View>
          <AppText variant="title">Tháng {lunar.month}{lunar.isLeapMonth ? " nhuận" : ""}</AppText>
          <AppText tone="muted">Năm {lunar.year}</AppText>
        </View>
      </View>
      <Divider />
      <InfoRow label="Ngày" value={canChi.day} />
      <InfoRow label="Tháng" value={canChi.month} />
      <InfoRow label="Năm" value={canChi.year} />
      <InfoRow label="Tiết khí" value={solarTerm.name} />
      <Divider />
      <AppText style={styles.sectionTitle}>Giờ hoàng đạo</AppText>
      <View style={styles.hours}>
        {hours.map((hour) => (
          <View key={hour.branchIndex} style={[styles.hour, { backgroundColor: currentTheme.colors.surfaceMuted }]}>
            <AppText style={styles.hourName}>{hour.name}</AppText>
            <AppText tone="muted" variant="caption">{hour.range}</AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

function Divider() {
  const currentTheme = useTheme();
  return <View style={[styles.divider, { backgroundColor: currentTheme.colors.border }]} />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="muted">{label}</AppText>
      <AppText style={styles.infoValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing.md },
  lunarHeading: { alignItems: "center", flexDirection: "row", gap: theme.spacing.md },
  lunarDay: { fontSize: 58, fontWeight: "300", lineHeight: 64 },
  divider: { height: 1 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoValue: { fontWeight: "600" },
  sectionTitle: { fontWeight: "700" },
  hours: { alignItems: "stretch", flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  hour: {
    borderRadius: theme.radius.small,
    flexBasis: "45%",
    flexGrow: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  hourName: { fontSize: 14, fontWeight: "600" },
});
