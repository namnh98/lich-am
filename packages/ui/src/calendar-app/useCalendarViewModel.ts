import {
  appStore,
  formatLocalDate,
  getMonthGrid,
  parseLocalDate,
} from "@lich-oi/core";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AppState } from "react-native";

import type { CalendarGridDay } from "../calendar/CalendarGrid";
import { dateInPeriod, shiftSelectedMonth } from "./calendar-navigation";

interface CalendarPeriod {
  month: number;
  year: number;
}

export function useCalendarViewModel(
  eventCounts: Readonly<Record<string, number>> = {},
) {
  const selectedDate = useSyncExternalStore(
    appStore.subscribe,
    () => appStore.getState().selectedDate,
  );
  const visibleMonth = useSyncExternalStore(
    appStore.subscribe,
    () => appStore.getState().visibleMonth,
  );
  const [year, month] = visibleMonth.split("-").map(Number);
  const selectedDay = useMemo(
    () => parseLocalDate(selectedDate),
    [selectedDate],
  );
  const [today, setToday] = useState(() => formatLocalDate(new Date()));
  const previousToday = useRef(today);

  useEffect(() => {
    const updateToday = () => {
      const nextToday = formatLocalDate(new Date());
      setToday((current) => (current !== nextToday ? nextToday : current));
    };

    const interval = setInterval(updateToday, 10_000);
    const handleFocus = () => updateToday();
    const handleVisibility = () => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        updateToday();
      }
    };

    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("focus", handleFocus);
    }
    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("visibilitychange", handleVisibility);
    }
    const appStateSub = AppState.addEventListener?.("change", (state) => {
      if (state === "active") {
        updateToday();
      }
    });

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
        window.removeEventListener("focus", handleFocus);
      }
      if (typeof document !== "undefined" && typeof document.removeEventListener === "function") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
      appStateSub?.remove?.();
    };
  }, []);
  useEffect(() => {
    const previous = previousToday.current;
    if (today === previous) return;
    previousToday.current = today;
    if (appStore.getState().selectedDate === previous) {
      appStore.getState().selectDate(today);
    }
  }, [today]);
  const days = useCalendarDays(year, month, eventCounts, today);
  const [periodPickerVisible, setPeriodPickerVisible] = useState(false);
  const [dayDetailsDate, setDayDetailsDate] = useState<Date | null>(null);
  const [draftPeriod, setDraftPeriod] = useState<CalendarPeriod>({
    month,
    year,
  });

  const moveMonth = useCallback(
    (amount: number) => {
      appStore.getState().selectDate(shiftSelectedMonth(selectedDate, amount));
    },
    [selectedDate],
  );
  const showPreviousMonth = useCallback(() => moveMonth(-1), [moveMonth]);
  const showNextMonth = useCallback(() => moveMonth(1), [moveMonth]);

  const openPeriodPicker = useCallback(() => {
    setDraftPeriod({ month, year });
    setPeriodPickerVisible(true);
  }, [month, year]);
  const closePeriodPicker = useCallback(
    () => setPeriodPickerVisible(false),
    [],
  );
  const selectDraftPeriod = useCallback(
    (draftYear: number, draftMonth: number) => {
      setDraftPeriod({ month: draftMonth, year: draftYear });
    },
    [],
  );
  const applyDraftPeriod = useCallback(() => {
    appStore
      .getState()
      .selectDate(
        dateInPeriod(selectedDate, draftPeriod.year, draftPeriod.month),
      );
    setPeriodPickerVisible(false);
  }, [draftPeriod, selectedDate]);

  const selectDay = useCallback((day: CalendarGridDay) => {
    appStore.getState().selectDate(day.key);
    setDayDetailsDate(parseLocalDate(day.key));
  }, []);
  const closeDayDetails = useCallback(() => setDayDetailsDate(null), []);

  return {
    applyDraftPeriod,
    closeDayDetails,
    closePeriodPicker,
    dayDetailsDate,
    days,
    draftPeriod,
    month,
    openPeriodPicker,
    periodPickerVisible,
    selectDay,
    selectDraftPeriod,
    selectedDay,
    showNextMonth,
    showPreviousMonth,
    year,
  };
}

function useCalendarDays(
  year: number,
  month: number,
  eventCounts: Readonly<Record<string, number>>,
  today: string,
): CalendarGridDay[] {
  return useMemo(() => {
    return getMonthGrid(year, month).map((item) => ({
      key: item.date,
      solarLabel: item.day,
      lunarLabel:
        item.lunarDay === 1
          ? `${item.lunarDay}/${item.lunarMonth}`
          : item.lunarDay,
      accessibilityLabel: `${item.day}/${item.month}/${item.year}, âm lịch ${item.lunarDay}/${item.lunarMonth}`,
      isOutsideMonth: item.isOutsideMonth,
      isToday: item.date === today,
      eventCount: eventCounts[item.date] ?? 0,
    }));
  }, [eventCounts, month, today, year]);
}
