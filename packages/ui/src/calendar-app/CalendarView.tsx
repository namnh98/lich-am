import { useCallback, useEffect, useState } from "react";
import { formatLocalDate, type LocalEvent } from "@lich-oi/core";
import { StyleSheet, View } from "react-native";

import { CalendarMonthCard } from "./CalendarMonthCard";
import { CalendarPeriodModal } from "./CalendarPeriodModal";
import { DayDetailsModal } from "./DayDetailsModal";
import { CalendarEventsModal } from "./CalendarEventsModal";
import type { EventStore } from "./types";
import { useCalendarViewModel } from "./useCalendarViewModel";

export function CalendarView({
  eventStore,
  platform = "mobile",
}: {
  eventStore?: EventStore;
  platform?: "mobile" | "desktop";
}) {
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const refreshEventCounts = useCallback(async () => {
    if (!eventStore) return;
    const events = await eventStore.list();
    setEventCounts(
      events.reduce<Record<string, number>>((counts, event) => {
        if (!event.solarDate) return counts;
        counts[event.solarDate] = (counts[event.solarDate] ?? 0) + 1;
        return counts;
      }, {}),
    );
  }, [eventStore]);
  useEffect(() => {
    void refreshEventCounts().catch(() => undefined);
  }, [refreshEventCounts]);

  const viewModel = useCalendarViewModel(eventCounts);
  const [eventsVisible, setEventsVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);

  const openCreateEvent = useCallback(() => {
    setEditingEvent(null);
    setEventsVisible(true);
  }, []);
  const openEditEvent = useCallback((event: LocalEvent) => {
    setEditingEvent(event);
    setEventsVisible(true);
  }, []);
  const deleteEvent = useCallback(
    async (event: LocalEvent) => {
      if (!eventStore) return;
      await eventStore.remove(event.id);
      await refreshEventCounts();
    },
    [eventStore, refreshEventCounts],
  );

  return (
    <View style={styles.content}>
      <CalendarMonthCard
        days={viewModel.days}
        month={viewModel.month}
        onDayPress={viewModel.selectDay}
        platform={platform}
        onNextMonth={viewModel.showNextMonth}
        onOpenPeriodPicker={viewModel.openPeriodPicker}
        onPreviousMonth={viewModel.showPreviousMonth}
        year={viewModel.year}
      />
      <CalendarPeriodModal
        month={viewModel.draftPeriod.month}
        onApply={viewModel.applyDraftPeriod}
        onClose={viewModel.closePeriodPicker}
        onSelect={viewModel.selectDraftPeriod}
        platform={platform}
        visible={viewModel.periodPickerVisible}
        year={viewModel.draftPeriod.year}
      />
      <DayDetailsModal
        date={viewModel.dayDetailsDate ?? viewModel.selectedDay}
        eventStore={eventStore}
        eventCount={
          viewModel.dayDetailsDate
            ? (eventCounts[formatLocalDate(viewModel.dayDetailsDate)] ?? 0)
            : 0
        }
        onClose={viewModel.closeDayDetails}
        onAddEvent={openCreateEvent}
        onDeleteEvent={deleteEvent}
        onEditEvent={openEditEvent}
        platform={platform}
        visible={
          viewModel.dayDetailsDate !== null &&
          !(platform === "desktop" && eventsVisible)
        }
      />
      <CalendarEventsModal
        date={viewModel.dayDetailsDate ?? viewModel.selectedDay}
        eventStore={eventStore}
        onClose={() => setEventsVisible(false)}
        onEventsChange={refreshEventCounts}
        eventToEdit={editingEvent}
        visible={eventsVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 860, width: "100%" },
});
