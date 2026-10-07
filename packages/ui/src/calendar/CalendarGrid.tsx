import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "../primitives/AppText";
import { theme } from "../theme";
import { DayCard, type DayCardProps } from "./DayCard";

export interface CalendarGridDay extends Omit<
  DayCardProps,
  "onPress" | "style"
> {
  key: string;
}

export interface CalendarGridProps {
  days: readonly CalendarGridDay[];
  weekdayLabels: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  accessibilityLabel?: string;
  onDayPress?: (day: CalendarGridDay, index: number) => void;
  desktopInteraction?: boolean;
  renderDay?: (day: CalendarGridDay, index: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CalendarGrid({
  days,
  weekdayLabels,
  accessibilityLabel,
  onDayPress,
  desktopInteraction = false,
  renderDay,
  style,
}: CalendarGridProps) {
  const weeks = chunk(days, 7);

  return (
    <View accessibilityLabel={accessibilityLabel} style={[styles.grid, style]}>
      <View style={styles.row}>
        {weekdayLabels.map((label, index) => (
          <View key={label + "-" + index} style={styles.cell}>
            <AppText style={styles.weekday} tone="muted" variant="caption">
              {label}
            </AppText>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={week[0]?.key ?? weekIndex} style={styles.row}>
          {week.map((day, dayIndex) => {
            const index = weekIndex * 7 + dayIndex;
            const { key: _key, ...dayCardProps } = day;
            return (
              <View key={day.key} style={styles.cell}>
                {renderDay?.(day, index) ?? (
                  <DayCard
                    {...dayCardProps}
                    desktopInteraction={desktopInteraction}
                    onPress={() => onDayPress?.(day, index)}
                  />
                )}
              </View>
            );
          })}
          {Array.from({ length: 7 - week.length }, (_, index) => (
            <View
              key={"empty-" + weekIndex + "-" + index}
              style={styles.cell}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

const styles = StyleSheet.create({
  grid: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    width: "100%",
  },
  cell: {
    alignItems: "stretch",
    flexBasis: "14.285714%",
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
  },
  weekday: {
    fontWeight: "600",
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    textAlign: "center",
  },
});
