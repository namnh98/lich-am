import { Pressable, StyleSheet, View } from "react-native";

import { CalendarGrid, type CalendarGridDay } from "../calendar/CalendarGrid";
import { AppText } from "../primitives/AppText";
import { Card } from "../primitives/Card";
import { theme } from "../theme";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

export function CalendarMonthCard({
  days,
  month,
  onDayPress,
  platform = "mobile",
  onNextMonth,
  onOpenPeriodPicker,
  onPreviousMonth,
  year,
}: {
  days: readonly CalendarGridDay[];
  month: number;
  onDayPress: (day: CalendarGridDay) => void;
  platform?: "mobile" | "desktop";
  onNextMonth: () => void;
  onOpenPeriodPicker: () => void;
  onPreviousMonth: () => void;
  year: number;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <PeriodButton
          label="Tháng trước"
          onPress={onPreviousMonth}
          symbol="‹"
        />
        <Pressable
          accessibilityLabel="Chọn tháng và năm"
          accessibilityRole="button"
          onPress={onOpenPeriodPicker}
          style={styles.titleButton}
        >
          <AppText variant="title">
            Tháng {month}, {year}
          </AppText>
        </Pressable>
        <PeriodButton label="Tháng sau" onPress={onNextMonth} symbol="›" />
      </View>
      <CalendarGrid
        accessibilityLabel={`Lịch tháng ${month} năm ${year}`}
        days={days}
        desktopInteraction={platform === "desktop"}
        onDayPress={onDayPress}
        weekdayLabels={WEEKDAYS}
      />
    </Card>
  );
}

function PeriodButton({
  label,
  onPress,
  symbol,
}: {
  label: string;
  onPress: () => void;
  symbol: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.arrow}
    >
      <AppText style={styles.arrowText}>{symbol}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: theme.spacing.sm },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.sm,
  },
  titleButton: { alignItems: "center", flex: 1 },
  arrow: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  arrowText: { fontSize: 32, lineHeight: 36 },
});
