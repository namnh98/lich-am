import type { LocalEvent } from "@lich-oi/core";
import { formatLocalDate } from "@lich-oi/core";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import type { EventStore } from "./types";
import { AppText } from "../primitives/AppText";
import { Card } from "../primitives/Card";
import { theme, useTheme } from "../theme";

export function CalendarEventsPanel({
  date,
  eventStore,
}: {
  date: Date;
  eventStore?: EventStore;
}) {
  const currentTheme = useTheme();
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [notificationTime, setNotificationTime] = useState("");
  const [saving, setSaving] = useState(false);
  const solarDate = formatLocalDate(date);

  useEffect(() => {
    let active = true;
    if (!eventStore) return undefined;
    void eventStore.list().then((items) => {
      if (active)
        setEvents(items.filter((event) => event.solarDate === solarDate));
    });
    return () => {
      active = false;
    };
  }, [eventStore, solarDate]);

  if (!eventStore) return null;

  const saveEvent = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    const now = new Date().toISOString();
    const event: LocalEvent = {
      id: `event-${Date.now()}`,
      title: title.trim(),
      notes: notes.trim() || null,
      kind: notificationTime ? "reminder" : "other",
      calendarType: "solar",
      solarDate,
      lunarDay: null,
      lunarMonth: null,
      lunarYear: null,
      lunarLeapMonth: false,
      recurrence: "none",
      notificationTime: notificationTime || null,
      allDay: false,
      durationMinutes: notificationTime ? 60 : null,
      reminderIntervalMinutes: null,
      color: null,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };
    await eventStore.save(event);
    setEvents((current) => [event, ...current]);
    setTitle("");
    setNotes("");
    setNotificationTime("");
    setSaving(false);
  };

  const removeEvent = async (id: string) => {
    await eventStore.remove(id);
    setEvents((current) => current.filter((event) => event.id !== id));
  };

  return (
    <Card style={styles.card}>
      <AppText variant="title">Ghi chú & sự kiện</AppText>
      {events.length === 0 ? (
        <AppText tone="muted">Chưa có ghi chú cho ngày này.</AppText>
      ) : null}
      {events.map((event) => (
        <View key={event.id} style={styles.eventRow}>
          <View style={styles.eventCopy}>
            <AppText style={styles.eventTitle}>{event.title}</AppText>
            {event.notes ? <AppText tone="muted">{event.notes}</AppText> : null}
            {event.notificationTime ? (
              <AppText tone="accent" variant="caption">
                Nhắc lúc {event.notificationTime}
              </AppText>
            ) : null}
          </View>
          <Pressable
            accessibilityLabel={`Xóa ${event.title}`}
            accessibilityRole="button"
            onPress={() => void removeEvent(event.id)}
          >
            <AppText tone="muted">Xóa</AppText>
          </Pressable>
        </View>
      ))}
      <TextInput
        accessibilityLabel="Tên sự kiện"
        onChangeText={setTitle}
        placeholder="Tên sự kiện hoặc ghi chú"
        placeholderTextColor={currentTheme.colors.muted}
        style={styles.input}
        value={title}
      />
      <TextInput
        accessibilityLabel="Nội dung ghi chú"
        multiline
        onChangeText={setNotes}
        placeholder="Nội dung chi tiết"
        placeholderTextColor={currentTheme.colors.muted}
        style={[styles.input, styles.notesInput]}
        value={notes}
      />
      <TextInput
        accessibilityLabel="Giờ nhắc"
        onChangeText={setNotificationTime}
        placeholder="Giờ nhắc, ví dụ 08:00"
        placeholderTextColor={currentTheme.colors.muted}
        style={styles.input}
        value={notificationTime}
      />
      <Pressable
        accessibilityLabel="Thêm sự kiện"
        accessibilityRole="button"
        disabled={!title.trim() || saving}
        onPress={() => void saveEvent()}
        style={[styles.addButton, (!title.trim() || saving) && styles.disabled]}
      >
        <AppText style={styles.addButtonText}>
          {saving ? "Đang lưu..." : "Thêm vào ngày này"}
        </AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  eventRow: {
    alignItems: "flex-start",
    borderTopColor: "#D8D7D0",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  eventCopy: { flex: 1, gap: 2 },
  eventTitle: { fontWeight: "700" },
  input: {
    borderColor: "#D8D7D0",
    borderRadius: theme.radius.small,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  notesInput: { minHeight: 72, textAlignVertical: "top" },
  addButton: {
    alignItems: "center",
    backgroundColor: "#A33A2B",
    borderRadius: theme.radius.small,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  addButtonText: { color: "#FFFFFF", fontWeight: "700" },
  disabled: { opacity: 0.45 },
});
