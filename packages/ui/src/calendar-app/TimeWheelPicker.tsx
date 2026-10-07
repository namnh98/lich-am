import { useCallback, useEffect, useRef } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 3;
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);
const HOURS = Array.from({ length: 24 }, (_, index) => index);

export function TimeWheelPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [selectedHour, selectedMinute] = parseTime(value);
  return (
    <View accessibilityLabel="Chọn thời gian nhắc" style={styles.picker}>
      <WheelColumn
        accessibilityLabel="Chọn giờ"
        options={HOURS}
        selected={selectedHour}
        onSelect={(hour) => onChange(formatTime(hour, selectedMinute))}
      />
      <AppText style={styles.separator}>:</AppText>
      <WheelColumn
        accessibilityLabel="Chọn phút"
        options={MINUTES}
        selected={selectedMinute}
        onSelect={(minute) => onChange(formatTime(selectedHour, minute))}
      />
    </View>
  );
}

function WheelColumn({
  accessibilityLabel,
  onSelect,
  options,
  selected,
}: {
  accessibilityLabel: string;
  onSelect: (value: number) => void;
  options: readonly number[];
  selected: number;
}) {
  const currentTheme = useTheme();
  const listRef = useRef<FlatList<number>>(null);
  const selectedIndex = Math.max(0, options.indexOf(selected));

  useEffect(() => {
    listRef.current?.scrollToOffset({
      animated: false,
      offset: selectedIndex * ITEM_HEIGHT,
    });
  }, [selectedIndex]);

  const selectIndex = useCallback(
    (index: number) => {
      const boundedIndex = Math.max(0, Math.min(index, options.length - 1));
      onSelect(options[boundedIndex]);
      listRef.current?.scrollToOffset({
        animated: true,
        offset: boundedIndex * ITEM_HEIGHT,
      });
    },
    [onSelect, options],
  );

  return (
    <View style={styles.column}>
      <AppText tone="muted" variant="caption">
        {accessibilityLabel === "Chọn giờ" ? "Giờ" : "Phút"}
      </AppText>
      <View style={[styles.wheel, { borderColor: currentTheme.colors.border }]}>
        <View
          pointerEvents="none"
          style={[
            styles.selection,
            {
              backgroundColor: currentTheme.colors.accentSoft,
              borderColor: currentTheme.colors.accent,
            },
          ]}
        />
        <FlatList
          accessibilityLabel={accessibilityLabel}
          data={options}
          decelerationRate="fast"
          getItemLayout={(_data, index) => ({
            index,
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
          })}
          initialScrollIndex={selectedIndex}
          keyExtractor={(item) => String(item)}
          nestedScrollEnabled
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.y / ITEM_HEIGHT,
            );
            selectIndex(index);
          }}
          ref={listRef}
          renderItem={({ item, index }) => {
            const active = index === selectedIndex;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => selectIndex(index)}
                style={[
                  styles.option,
                  active && {
                    backgroundColor: currentTheme.colors.accentSoft,
                    borderColor: currentTheme.colors.accent,
                    borderRadius: theme.radius.small,
                    borderWidth: 1,
                  },
                ]}
              >
                <AppText
                  style={[
                    styles.optionText,
                    active && {
                      color: currentTheme.colors.accent,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {String(item).padStart(2, "0")}
                </AppText>
              </Pressable>
            );
          }}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

function parseTime(value: string): [number, number] {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return [9, 0];
  const hour = Math.min(23, Number(match[1]));
  const minute = Math.min(55, Math.round(Number(match[2]) / 5) * 5);
  return [hour, minute];
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  picker: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    width: "100%",
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  wheel: {
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    height: ITEM_HEIGHT * VISIBLE_ROWS,
    overflow: "hidden",
    position: "relative",
  },
  list: { flex: 1 },
  listContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  selection: {
    borderRadius: theme.radius.small,
    borderWidth: 1,
    height: ITEM_HEIGHT,
    left: theme.spacing.xs,
    position: "absolute",
    right: theme.spacing.xs,
    top: ITEM_HEIGHT,
    zIndex: 0,
  },
  option: {
    alignItems: "center",
    height: ITEM_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    zIndex: 1,
  },
  optionText: { fontSize: 20, lineHeight: 28 },
  separator: { fontSize: 24, fontWeight: "700", marginTop: theme.spacing.lg },
});
