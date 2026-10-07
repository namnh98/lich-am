import type { LocalEvent } from "@lich-oi/core";
import { formatLocalDate } from "@lich-oi/core";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";

import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";
import { TimeWheelPicker } from "./TimeWheelPicker";
import type { EventStore } from "./types";

const DURATION_OPTIONS = [
  { label: "30 phút", value: 30 },
  { label: "1 giờ", value: 60 },
  { label: "2 giờ", value: 120 },
] as const;

const REPEAT_OPTIONS = [
  { label: "Không lặp", value: null },
  { label: "15 phút", value: 15 },
  { label: "30 phút", value: 30 },
  { label: "1 giờ", value: 60 },
] as const;

export function CalendarEventsModal({
  date,
  eventStore,
  onClose,
  visible,
  embedded = false,
  onEventsChange,
  eventToEdit,
}: {
  date: Date;
  eventStore?: EventStore;
  onClose: () => void;
  visible: boolean;
  embedded?: boolean;
  onEventsChange?: () => void | Promise<void>;
  eventToEdit?: LocalEvent | null;
}) {
  const currentTheme = useTheme();
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [notificationTime, setNotificationTime] = useState("09:00");
  const [allDay, setAllDay] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(60);
  const [reminderIntervalMinutes, setReminderIntervalMinutes] = useState<
    number | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const solarDate = formatLocalDate(date);

  useEffect(() => {
    if (!visible) return;
    setTitle(eventToEdit?.title ?? "");
    setNotes(eventToEdit?.notes ?? "");
    setNotificationTime(eventToEdit?.notificationTime ?? "09:00");
    setAllDay(eventToEdit?.allDay ?? false);
    setDurationMinutes(eventToEdit?.durationMinutes ?? 60);
    setReminderIntervalMinutes(eventToEdit?.reminderIntervalMinutes ?? null);
  }, [eventToEdit, visible]);

  useEffect(() => {
    let active = true;
    if (!eventStore || !visible) return undefined;
    setError(null);
    setEvents([]);
    void eventStore
      .list()
      .then((items) => {
        if (active)
          setEvents(items.filter((event) => event.solarDate === solarDate));
      })
      .catch(() => {
        // if (active) setError("Không thể tải ghi chú. Vui lòng mở lại cửa sổ.");
      });
    return () => {
      active = false;
    };
  }, [eventStore, solarDate, visible]);

  if (!eventStore) return null;

  const saveEvent = async () => {
    if (!title.trim() || saving) return;
    if (!allDay && !/^([01]\d|2[0-3]):[0-5]\d$/.test(notificationTime)) {
      setError("Nhập giờ hợp lệ theo định dạng HH:mm.");
      return;
    }
    setError(null);
    setSaving(true);
    const now = new Date().toISOString();
    const event: LocalEvent = {
      id: eventToEdit?.id ?? `event-${Date.now()}`,
      title: title.trim(),
      notes: notes.trim() || null,
      kind: "reminder",
      calendarType: "solar",
      solarDate,
      lunarDay: null,
      lunarMonth: null,
      lunarYear: null,
      lunarLeapMonth: false,
      recurrence: "none",
      notificationTime: allDay ? null : notificationTime,
      allDay,
      durationMinutes: allDay ? null : durationMinutes,
      reminderIntervalMinutes: allDay ? null : reminderIntervalMinutes,
      color: null,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await eventStore.save(event);
      setEvents((current) =>
        eventToEdit
          ? current.map((item) => (item.id === event.id ? event : item))
          : [event, ...current],
      );
      setTitle("");
      setNotes("");
      void Promise.resolve(onEventsChange?.()).catch(() => undefined);
      onClose();
    } catch (saveError) {
      console.error("Unable to save calendar event", saveError);
      setError("Không thể lưu ghi chú. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const removeEvent = async (id: string) => {
    try {
      await eventStore.remove(id);
      setEvents((current) => current.filter((event) => event.id !== id));
      setError(null);
      void Promise.resolve(onEventsChange?.()).catch(() => undefined);
    } catch {
      setError("Không thể xóa ghi chú. Vui lòng thử lại.");
    }
  };

  const Container = embedded ? View : Modal;
  const Content = embedded ? View : ScrollView;

  return (
    <Container
      {...(!embedded
        ? {
            animationType: "fade" as const,
            onRequestClose: onClose,
            transparent: true,
            visible,
          }
        : {})}
    >
      <View
        style={[
          embedded ? undefined : styles.overlay,
          !embedded && { backgroundColor: currentTheme.colors.overlay },
        ]}
      >
        {!embedded && (
          <Pressable
            accessibilityLabel="Đóng ghi chú"
            accessibilityRole="button"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          style={[
            embedded ? { gap: theme.spacing.md } : styles.dialog,
            {
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <AppText variant="title">Ghi chú & sự kiện</AppText>
              <AppText tone="muted" variant="caption">
                {solarDate} · {events.length} sự kiện
              </AppText>
            </View>
            {!embedded && (
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
            )}
          </View>

          <Content
            {...(embedded
              ? { style: styles.content }
              : {
                  contentContainerStyle: styles.content,
                  keyboardShouldPersistTaps: "handled" as const,
                  showsVerticalScrollIndicator: false,
                })}
          >
            {error ? (
              <AppText accessibilityRole="alert" tone="accent">
                {error}
              </AppText>
            ) : null}
            {events.length === 0 ? (
              <AppText tone="muted">Chưa có ghi chú cho ngày này.</AppText>
            ) : null}
            {events.map((event) => (
              <View
                key={event.id}
                style={[
                  styles.eventRow,
                  { borderTopColor: currentTheme.colors.border },
                ]}
              >
                <View style={styles.eventCopy}>
                  <AppText style={styles.eventTitle}>{event.title}</AppText>
                  {event.notes ? (
                    <AppText tone="muted">{event.notes}</AppText>
                  ) : null}
                  <AppText tone="accent" variant="caption">
                    {formatReminder(event)}
                  </AppText>
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

            <AppText style={styles.sectionTitle}>Thông tin sự kiện</AppText>
            <TextInput
              accessibilityLabel="Tên sự kiện"
              onChangeText={setTitle}
              placeholder="Tên sự kiện"
              placeholderTextColor={currentTheme.colors.muted}
              style={[
                styles.input,
                {
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                },
              ]}
              value={title}
            />
            <TextInput
              accessibilityLabel="Nội dung ghi chú"
              multiline
              onChangeText={setNotes}
              placeholder="Nội dung chi tiết"
              placeholderTextColor={currentTheme.colors.muted}
              style={[
                styles.input,
                styles.notesInput,
                {
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                },
              ]}
              value={notes}
            />

            <View style={styles.toggleRow}>
              <View style={styles.eventCopy}>
                <AppText style={styles.eventTitle}>Cả ngày</AppText>
                <AppText tone="muted" variant="caption">
                  Không giới hạn trong một khung giờ
                </AppText>
              </View>
              <Switch
                accessibilityLabel="Nhắc cả ngày"
                onValueChange={setAllDay}
                value={allDay}
              />
            </View>

            {!allDay ? (
              <>
                <AppText style={styles.fieldLabel}>Thời gian nhắc</AppText>
                <TimeWheelPicker
                  value={notificationTime}
                  onChange={setNotificationTime}
                />
                <AppText tone="muted" variant="caption">
                  Cuộn để chọn giờ và phút nhận thông báo.
                </AppText>
                <AppText tone="muted" variant="caption">
                  Thời lượng
                </AppText>
                <ChoiceRow
                  options={DURATION_OPTIONS}
                  selected={durationMinutes}
                  onSelect={setDurationMinutes}
                />
                <AppText tone="muted" variant="caption">
                  Nhắc lại sau
                </AppText>
                <ChoiceRow
                  options={REPEAT_OPTIONS}
                  selected={reminderIntervalMinutes}
                  onSelect={setReminderIntervalMinutes}
                />
              </>
            ) : null}

            <Pressable
              accessibilityLabel="Thêm sự kiện"
              accessibilityRole="button"
              disabled={!title.trim() || saving}
              onPress={() => void saveEvent()}
              style={[
                styles.addButton,
                { backgroundColor: currentTheme.colors.accent },
                (!title.trim() || saving) && styles.disabled,
              ]}
            >
              <AppText
                style={[
                  styles.addButtonText,
                  { color: currentTheme.colors.onAccent },
                ]}
              >
                {saving ? "Đang lưu..." : "Lưu nhắc nhở"}
              </AppText>
            </Pressable>
          </Content>
        </View>
      </View>
    </Container>
  );
}

function ChoiceRow<T extends number | null>({
  options,
  selected,
  onSelect,
}: {
  options: readonly { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const currentTheme = useTheme();
  return (
    <View style={styles.choiceRow}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            onPress={() => onSelect(option.value)}
            style={[
              styles.choice,
              { borderColor: currentTheme.colors.border },
              active && {
                backgroundColor: currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent,
              },
            ]}
          >
            <AppText
              style={
                active
                  ? { color: currentTheme.colors.onAccent, fontWeight: "700" }
                  : undefined
              }
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function formatReminder(event: LocalEvent): string {
  if (event.allDay) return "Cả ngày";
  const time = event.notificationTime ? ` lúc ${event.notificationTime}` : "";
  const duration = event.durationMinutes
    ? ` · ${event.durationMinutes} phút`
    : "";
  const repeat = event.reminderIntervalMinutes
    ? ` · lặp ${event.reminderIntervalMinutes} phút`
    : "";
  return `Nhắc${time}${duration}${repeat}`;
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  dialog: {
    borderRadius: theme.radius.large,
    borderWidth: 1,
    gap: theme.spacing.md,
    maxHeight: "90%",
    maxWidth: 620,
    padding: theme.spacing.lg,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  content: { gap: theme.spacing.sm, paddingBottom: theme.spacing.sm },
  closeButton: {
    borderRadius: 999,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  closeText: { fontWeight: "700" },
  sectionTitle: { fontWeight: "700", marginTop: theme.spacing.sm },
  fieldLabel: { fontWeight: "600", marginTop: theme.spacing.xs },
  eventRow: {
    borderTopWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  eventCopy: { flex: 1, gap: 2, minWidth: 0 },
  eventTitle: { fontWeight: "700" },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  input: {
    borderRadius: theme.radius.small,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    width: "100%",
  },
  notesInput: { minHeight: 72, textAlignVertical: "top" },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  choice: {
    borderRadius: theme.radius.small,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
  },
  addButton: {
    alignItems: "center",
    borderRadius: theme.radius.small,
    minHeight: 46,
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  addButtonText: { fontWeight: "700" },
  disabled: { opacity: 0.45 },
});
