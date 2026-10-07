import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "../primitives/AppText";
import { theme } from "../theme";

export interface NavigationItem<Key extends string = string> {
  key: Key;
  label: string;
  icon: ReactNode;
  accessibilityLabel?: string;
  badge?: string | number;
}

export interface NavigationProps<Key extends string = string> {
  items: readonly NavigationItem<Key>[];
  activeKey: Key;
  onChange: (key: Key) => void;
  style?: StyleProp<ViewStyle>;
}

export function BottomNav<Key extends string = string>({
  items,
  activeKey,
  onChange,
  style,
}: NavigationProps<Key>) {
  return (
    <View accessibilityRole="tablist" style={[styles.bottom, style]}>
      {items.map((item) => (
        <NavButton
          active={item.key === activeKey}
          item={item}
          key={item.key}
          onPress={() => onChange(item.key)}
          orientation="bottom"
        />
      ))}
    </View>
  );
}

export function SideNav<Key extends string = string>({
  items,
  activeKey,
  onChange,
  style,
}: NavigationProps<Key>) {
  return (
    <View accessibilityRole="tablist" style={[styles.sidebar, style]}>
      {items.map((item) => (
        <NavButton
          active={item.key === activeKey}
          item={item}
          key={item.key}
          onPress={() => onChange(item.key)}
          orientation="side"
        />
      ))}
    </View>
  );
}

export interface ResponsiveNavProps<Key extends string = string> extends NavigationProps<Key> {
  desktopBreakpoint?: number;
}

export function ResponsiveNav<Key extends string = string>({
  desktopBreakpoint = theme.breakpoints.desktopNavigation,
  ...props
}: ResponsiveNavProps<Key>) {
  const { width } = useWindowDimensions();
  return width >= desktopBreakpoint ? <SideNav {...props} /> : <BottomNav {...props} />;
}

interface NavButtonProps<Key extends string> {
  active: boolean;
  item: NavigationItem<Key>;
  onPress: () => void;
  orientation: "bottom" | "side";
}

function NavButton<Key extends string>({ active, item, onPress, orientation }: NavButtonProps<Key>) {
  return (
    <Pressable
      accessibilityLabel={item.accessibilityLabel ?? item.label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        orientation === "bottom" ? styles.bottomItem : styles.sideItem,
        active && styles.activeItem,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.icon}>
        {item.icon}
        {item.badge !== undefined ? (
          <View style={styles.badge}>
            <AppText style={styles.badgeText} variant="caption">{item.badge}</AppText>
          </View>
        ) : null}
      </View>
      <AppText
        style={[styles.label, active && styles.activeLabel]}
        tone={active ? "accent" : "muted"}
        variant="caption"
      >
        {item.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottom: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    width: "100%",
  },
  sidebar: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRightWidth: 1,
    gap: theme.spacing.xs,
    minWidth: 208,
    padding: theme.spacing.sm,
  },
  item: {
    alignItems: "center",
    borderRadius: theme.radius.medium,
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
  bottomItem: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: theme.spacing.xs,
  },
  sideItem: {
    flexDirection: "row",
    justifyContent: "flex-start",
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  activeItem: {
    backgroundColor: theme.colors.accentSoft,
  },
  pressed: {
    opacity: 0.68,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 22,
    minWidth: 22,
  },
  label: {
    fontWeight: "500",
  },
  activeLabel: {
    fontWeight: "700",
  },
  badge: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.small,
    justifyContent: "center",
    minHeight: 16,
    minWidth: 16,
    paddingHorizontal: theme.spacing.xs,
    position: "absolute",
    right: -10,
    top: -6,
  },
  badgeText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
});
