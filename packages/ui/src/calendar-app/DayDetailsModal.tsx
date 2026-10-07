import type { LocalEvent } from "@lich-oi/core";
import { formatLocalDate } from "@lich-oi/core";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useEffect, useState, type ReactNode } from "react";

import { AppText } from "../primitives/AppText";
import { BottomSheet } from "../primitives/BottomSheet";
import { theme, useTheme } from "../theme";
import { DayDetails } from "./DayDetails";
import type { EventStore } from "./types";

interface DayDetailsModalProps {
  date: Date;
  eventStore?: EventStore;
  eventCount?: number;
  onAddEvent?: () => void;
  onClose: () => void;
  onDeleteEvent?: (event: LocalEvent) => void | Promise<void>;
  onEditEvent?: (event: LocalEvent) => void;
  platform?: "mobile" | "desktop";
  visible: boolean;
}

export function DayDetailsModal({
  date,
  eventStore,
  eventCount = 0,
  onAddEvent,
  onClose,
  onDeleteEvent,
  onEditEvent,
  platform = "mobile",
  visible,
}: DayDetailsModalProps) {
  if (!visible) return null;

  const content = (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <DayDetails date={date} />
      {eventStore ? (
        <DayEventsBlock
          date={date}
          eventCount={eventCount}
          eventStore={eventStore}
          onAddEvent={onAddEvent}
          onDeleteEvent={onDeleteEvent}
          onEditEvent={onEditEvent}
        />
      ) : null}
    </ScrollView>
  );

  if (platform === "mobile") {
    return (
      <BottomSheet onClose={onClose} title="Thông tin ngày" visible>
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <DesktopDialog onClose={onClose}>{content}</DesktopDialog>
    </Modal>
  );
}

function DesktopDialog({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const currentTheme = useTheme();
  return (
    <View
      style={[
        styles.desktopOverlay,
        { backgroundColor: currentTheme.colors.overlay },
      ]}
    >
      <Pressable
        accessibilityLabel="Đóng cửa sổ"
        accessibilityRole="button"
        onPress={onClose}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.desktopDialog,
          {
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
          },
        ]}
      >
        <View style={styles.desktopHeader}>
          <AppText variant="title">Thông tin ngày</AppText>
          <Pressable
            accessibilityLabel="Đóng"
            accessibilityRole="button"
            onPress={onClose}
            style={[
              styles.closeButton,
              { backgroundColor: currentTheme.colors.surfaceMuted },
            ]}
          >
            <AppText style={styles.closeText}>Đóng</AppText>
          </Pressable>
        </View>
        {children}
      </View>
    </View>
  );
}

function DayEventsBlock({
  date,
  eventCount,
  eventStore,
  onAddEvent,
  onDeleteEvent,
  onEditEvent,
}: {
  date: Date;
  eventCount: number;
  eventStore: EventStore;
  onAddEvent?: () => void;
  onDeleteEvent?: (event: LocalEvent) => void | Promise<void>;
  onEditEvent?: (event: LocalEvent) => void;
}) {
  const currentTheme = useTheme();
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const solarDate = formatLocalDate(date);

  useEffect(() => {
    let active = true;
    void eventStore
      .list()
      .then((items) => {
        if (active)
          setEvents(items.filter((event) => event.solarDate === solarDate));
      })
      .catch(() => {
        if (active) setEvents([]);
      });
    return () => {
      active = false;
    };
  }, [eventCount, eventStore, solarDate]);

  return (
    <View style={styles.eventsSection}>
      {onAddEvent ? (
        <View style={styles.addEventRow}>
          <Pressable
            accessibilityLabel="Thêm sự kiện cho ngày này"
            accessibilityRole="button"
            onPress={onAddEvent}
            style={[
              styles.addEventButton,
              { backgroundColor: currentTheme.colors.accent },
            ]}
          >
            <AppText
              style={[
                styles.addEventText,
                { color: currentTheme.colors.onAccent },
              ]}
            >
              + Thêm sự kiện
            </AppText>
          </Pressable>
        </View>
      ) : null}
      <View
        style={[
          styles.eventsBlock,
          {
            backgroundColor: currentTheme.colors.surfaceMuted,
            borderColor: currentTheme.colors.border,
          },
        ]}
      >
        <View style={styles.eventsBlockHeader}>
          <AppText style={styles.eventsBlockTitle}>Sự kiện trong ngày</AppText>
          <AppText tone="accent" variant="caption">
            {events.length} sự kiện
          </AppText>
        </View>
        {events.length === 0 ? (
          <AppText tone="muted" variant="caption">
            Chưa có sự kiện nào.
          </AppText>
        ) : (
          events.map((event) => (
            <View
              key={event.id}
              style={[
                styles.eventItem,
                { borderTopColor: currentTheme.colors.border },
              ]}
            >
              <View style={styles.eventItemCopy}>
                <AppText style={styles.eventTitle}>{event.title}</AppText>
                <AppText tone="accent" variant="caption">
                  {formatEventTime(event)}
                </AppText>
                {event.notes ? (
                  <AppText tone="muted" variant="caption">
                    {event.notes}
                  </AppText>
                ) : null}
              </View>
              <View style={styles.eventActions}>
                {onEditEvent ? (
                  <Pressable
                    accessibilityLabel={`Sửa ${event.title}`}
                    accessibilityRole="button"
                    onPress={() => onEditEvent(event)}
                  >
                    <AppText tone="accent" variant="caption">
                      Sửa
                    </AppText>
                  </Pressable>
                ) : null}
                {onDeleteEvent ? (
                  <Pressable
                    accessibilityLabel={`Xóa ${event.title}`}
                    accessibilityRole="button"
                    onPress={() => void onDeleteEvent(event)}
                  >
                    <AppText tone="muted" variant="caption">
                      Xóa
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function formatEventTime(event: LocalEvent): string {
  if (event.allDay) return "Cả ngày";
  const time = event.notificationTime
    ? `Nhắc lúc ${event.notificationTime}`
    : "Chưa đặt giờ";
  return `${time}${event.durationMinutes ? ` · ${event.durationMinutes} phút` : ""}`;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 4 },
  desktopOverlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  desktopDialog: {
    borderRadius: theme.radius.large,
    borderWidth: 1,
    gap: theme.spacing.md,
    maxHeight: "88%",
    maxWidth: 620,
    padding: theme.spacing.lg,
    width: "100%",
  },
  desktopHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  closeButton: {
    borderRadius: 999,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  closeText: { fontWeight: "700" },
  eventsSection: { gap: theme.spacing.sm },
  addEventRow: { alignItems: "flex-end" },
  addEventButton: {
    borderRadius: theme.radius.small,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  addEventText: { fontSize: 12, fontWeight: "700" },
  eventsBlock: {
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  eventsBlockHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventsBlockTitle: { fontWeight: "700" },
  eventItem: {
    borderTopWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  eventItemCopy: { flex: 1, gap: 2, minWidth: 0 },
  eventActions: { flexDirection: "row", gap: theme.spacing.sm },
  eventTitle: { fontWeight: "700" },
});
