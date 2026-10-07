import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { createElement, type CSSProperties } from "react";

import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";

export interface DayMarker {
  key: string;
  color?: string;
  accessibilityLabel?: string;
}

export interface DayCardProps {
  solarLabel: string | number;
  lunarLabel: string | number;
  /** Fully localized label supplied by the consuming app. */
  accessibilityLabel: string;
  isToday?: boolean;
  isSelected?: boolean;
  isOutsideMonth?: boolean;
  disabled?: boolean;
  markers?: readonly DayMarker[];
  markerLimit?: number;
  eventCount?: number;
  onPress?: () => void;
  desktopInteraction?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function DayCard({
  solarLabel,
  lunarLabel,
  accessibilityLabel,
  isToday = false,
  isSelected = false,
  isOutsideMonth = false,
  disabled = false,
  markers = [],
  markerLimit = 3,
  eventCount = 0,
  onPress,
  desktopInteraction = false,
  style,
}: DayCardProps) {
  const currentTheme = useTheme();
  const visibleMarkers = markers.slice(0, markerLimit);

  const content = (
    <View style={[styles.content, desktopInteraction && styles.desktopContent]}>
      <AppText
        style={[
          styles.solar,
          isToday && { color: currentTheme.colors.onAccent },
        ]}
      >
        {solarLabel}
      </AppText>
      <AppText
        style={[
          styles.lunar,
          isToday && { color: currentTheme.colors.onAccent, opacity: 0.82 },
        ]}
        tone={isToday ? "default" : "muted"}
        variant="caption"
      >
        {lunarLabel}
      </AppText>
      {eventCount > 0 ? (
        <View style={styles.eventMeta}>
          <View
            accessibilityRole="none"
            style={[
              styles.eventMarker,
              {
                backgroundColor: isToday
                  ? currentTheme.colors.onAccent
                  : currentTheme.colors.accent,
              },
            ]}
          />
          <AppText
            accessibilityLabel={`${eventCount} sự kiện`}
            style={
              isToday ? { color: currentTheme.colors.onAccent } : undefined
            }
            tone={isToday ? "default" : "accent"}
            variant="caption"
          >
            {eventCount}
          </AppText>
        </View>
      ) : null}
      <View accessibilityRole="none" style={styles.markers}>
        {visibleMarkers.map((marker) => (
          <View
            accessibilityLabel={marker.accessibilityLabel}
            key={marker.key}
            style={[
              styles.marker,
              { backgroundColor: marker.color ?? currentTheme.colors.accent },
            ]}
          />
        ))}
      </View>
    </View>
  );

  if (desktopInteraction) {
    const desktopStyle = StyleSheet.flatten([
      styles.container,
      {
        backgroundColor: currentTheme.colors.surface,
      },
      styles.desktopButton,
      isToday && {
        backgroundColor: currentTheme.colors.accent,
      },
      isOutsideMonth && styles.outsideMonth,
      disabled && styles.disabled,
      style,
    ]) as CSSProperties;
    return createElement(
      "button",
      {
        "aria-label": accessibilityLabel,
        "aria-pressed": isSelected,
        disabled,
        onClick: disabled ? undefined : onPress,
        onMouseDown: disabled ? undefined : onPress,
        style: desktopStyle,
        type: "button",
      },
      content,
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isSelected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: currentTheme.colors.surface,
        },
        isToday && {
          backgroundColor: currentTheme.colors.accent,
        },
        isOutsideMonth && styles.outsideMonth,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: theme.radius.medium,
    borderWidth: 0,
    elevation: 0,
    flexDirection: "column",
    gap: 1,
    justifyContent: "center",
    minHeight: 62,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    shadowOpacity: 0,
    width: "100%",
  },
  content: {
    alignItems: "center",
    flexDirection: "column",
    gap: 2,
  },
  desktopContent: {
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  solar: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  lunar: {
    fontSize: 12,
    lineHeight: 16,
  },
  outsideMonth: {
    opacity: 0.42,
  },
  disabled: {
    opacity: 0.28,
  },
  pressed: {
    opacity: 0.7,
  },
  desktopButton: {
    cursor: "pointer",
  },
  markers: {
    flexDirection: "row",
    gap: 3,
    height: 4,
    marginTop: 2,
  },
  eventMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    height: 16,
  },
  eventMarker: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  marker: {
    borderRadius: 2,
    height: 4,
    width: 4,
  },
});
