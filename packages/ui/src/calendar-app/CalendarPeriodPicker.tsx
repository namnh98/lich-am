import { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "../primitives/AppText";
import type { ChoiceOption } from "./ChoiceRow";
import { HorizontalChoicePicker } from "./HorizontalChoicePicker";
import { getQuickYears } from "./calendar-navigation";

const MONTHS: readonly ChoiceOption<string>[] = Array.from({ length: 12 }, (_, index) => ({
  label: `Tháng ${index + 1}`,
  value: String(index + 1),
}));
const QUICK_YEARS = getQuickYears();
const YEARS: readonly ChoiceOption<string>[] = QUICK_YEARS.map((year) => ({
  label: String(year),
  value: String(year),
}));

interface CalendarPeriodPickerProps {
  month: number;
  onSelect: (year: number, month: number) => void;
  year: number;
}

export function CalendarPeriodPicker({
  month,
  onSelect,
  year,
}: CalendarPeriodPickerProps) {
  const selectYear = useCallback(
    (selectedYear: string) => onSelect(Number(selectedYear), month),
    [month, onSelect],
  );
  const selectMonth = useCallback(
    (value: string) => onSelect(year, Number(value)),
    [onSelect, year],
  );

  return (
    <View style={styles.picker}>
      <AppText tone="muted">Chọn năm</AppText>
      <HorizontalChoicePicker
        itemWidth={92}
        onSelect={selectYear}
        options={YEARS}
        selected={String(year)}
      />
      <AppText tone="muted">Tiếp theo, chọn tháng</AppText>
      <HorizontalChoicePicker
        itemWidth={104}
        onSelect={selectMonth}
        options={MONTHS}
        selected={String(month)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  picker: { gap: 6 },
});
