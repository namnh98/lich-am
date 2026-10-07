import { memo, useCallback, useRef } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";
import type { ChoiceOption } from "./ChoiceRow";

const ITEM_GAP = theme.spacing.sm;

interface HorizontalChoicePickerProps {
  itemWidth: number;
  onSelect: (value: string) => void;
  options: readonly ChoiceOption<string>[];
  selected: string;
}

interface HorizontalChoiceItemProps {
  active: boolean;
  itemWidth: number;
  label: string;
  onSelect: (value: string) => void;
  value: string;
}

export function HorizontalChoicePicker({
  itemWidth,
  onSelect,
  options,
  selected,
}: HorizontalChoicePickerProps) {
  const listRef = useRef<FlatList<ChoiceOption<string>>>(null);
  const itemStep = itemWidth + ITEM_GAP;
  const initialIndex = Math.max(0, options.findIndex((option) => option.value === selected) - 1);

  const selectOption = useCallback((value: string) => {
    onSelect(value);
    const index = options.findIndex((option) => option.value === value);
    if (index < 0) return;
    listRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0.5 });
  }, [onSelect, options]);

  const getItemLayout = useCallback(
    (_data: ArrayLike<ChoiceOption<string>> | null | undefined, index: number) => ({
      index,
      length: itemWidth,
      offset: itemStep * index,
    }),
    [itemStep, itemWidth],
  );

  const renderItem = useCallback<ListRenderItem<ChoiceOption<string>>>(({ item }) => (
    <HorizontalChoiceItem
      active={item.value === selected}
      itemWidth={itemWidth}
      label={item.label}
      onSelect={selectOption}
      value={item.value}
    />
  ), [itemWidth, selectOption, selected]);

  return (
    <FlatList
      accessibilityRole="radiogroup"
      contentContainerStyle={styles.content}
      data={options}
      decelerationRate="fast"
      extraData={selected}
      getItemLayout={getItemLayout}
      horizontal
      initialScrollIndex={initialIndex}
      ItemSeparatorComponent={ChoiceSeparator}
      keyExtractor={getChoiceKey}
      ref={listRef}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemStep}
    />
  );
}

const HorizontalChoiceItem = memo(function HorizontalChoiceItem({
  active,
  itemWidth,
  label,
  onSelect,
  value,
}: HorizontalChoiceItemProps) {
  const currentTheme = useTheme();
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.option,
        { borderColor: currentTheme.colors.border, width: itemWidth },
        active && {
          backgroundColor: currentTheme.colors.accentSoft,
          borderColor: currentTheme.colors.accent,
        },
        pressed && styles.pressed,
      ]}
    >
      <AppText tone={active ? "accent" : "default"} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
});

function ChoiceSeparator() {
  return <View style={styles.separator} />;
}

function getChoiceKey(option: ChoiceOption<string>) {
  return option.value;
}

const styles = StyleSheet.create({
  content: { paddingBottom: theme.spacing.xs },
  label: { fontWeight: "600", textAlign: "center" },
  option: {
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  separator: { width: ITEM_GAP },
});
