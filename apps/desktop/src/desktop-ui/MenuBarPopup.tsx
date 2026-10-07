import { useEffect, useRef, useState } from "react";
import {
  formatLocalDate,
  getMonthGrid,
  getVietnameseCalendarDate,
  parseLocalDate,
} from "@lich-oi/core";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ThemePreference } from "@lich-am/ui";

import { initializeDesktopStorage } from "../storage";
import "./menu-bar-popup.css";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function MenuBarPopup() {
  const [themePreference, setThemePreference] =
    useState<ThemePreference>("system");
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [today, setToday] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() =>
    formatLocalDate(new Date()),
  );
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const previousToday = useRef(formatLocalDate(new Date()));
  const syncToday = () => {
    const now = new Date();
    const nowKey = formatLocalDate(now);
    const prevKey = previousToday.current;
    setToday(now);
    if (nowKey !== prevKey) {
      previousToday.current = nowKey;
      setSelectedDate((current) => (current === prevKey ? nowKey : current));
      setMonth((current) => {
        const prev = parseLocalDate(prevKey);
        if (
          current.year === prev.getFullYear() &&
          current.month === prev.getMonth() + 1
        ) {
          return { year: now.getFullYear(), month: now.getMonth() + 1 };
        }
        return current;
      });
    }
  };

  useEffect(() => {
    syncToday();
    const timer = setInterval(syncToday, 10_000);
    const handleFocus = () => syncToday();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncToday();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    let unlisten: (() => void) | undefined;
    void listen("desktop:show-quick-view", () => {
      syncToday();
    }).then((stop) => {
      unlisten = stop;
    });

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    let active = true;
    let unlisten: (() => void) | undefined;
    const loadTheme = async () => {
      const { settings } = await initializeDesktopStorage();
      const preferences = await settings.get<{ theme?: ThemePreference }>(
        "calendar.preferences",
      );
      if (active && preferences?.theme) setThemePreference(preferences.theme);
    };
    void loadTheme().catch(console.error);
    void listen<{ theme?: ThemePreference }>(
      "desktop:preferences-changed",
      ({ payload }) => {
        if (payload.theme) setThemePreference(payload.theme);
      },
    ).then((stopListening) => {
      unlisten = stopListening;
    });
    return () => {
      active = false;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  const days = getMonthGrid(month.year, month.month);
  const selected = parseLocalDate(selectedDate);
  const calendarDate = getVietnameseCalendarDate(
    selected.getDate(),
    selected.getMonth() + 1,
    selected.getFullYear(),
  );
  const todayKey = formatLocalDate(today);

  useEffect(() => {
    const previousKey = previousToday.current;
    if (todayKey === previousKey) return;
    previousToday.current = todayKey;
    setSelectedDate((current) => (current === previousKey ? todayKey : current));
    setMonth((current) =>
      current.year === parseLocalDate(previousKey).getFullYear() &&
      current.month === parseLocalDate(previousKey).getMonth() + 1
        ? { year: today.getFullYear(), month: today.getMonth() + 1 }
        : current,
    );
  }, [today, todayKey]);

  const moveMonth = (amount: number) => {
    const next = new Date(month.year, month.month - 1 + amount, 1, 12);
    setMonth({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const selectDay = (date: string) => {
    const chosen = parseLocalDate(date);
    setSelectedDate(date);
    setMonth({ year: chosen.getFullYear(), month: chosen.getMonth() + 1 });
  };

  const showToday = () => {
    const now = new Date();
    const nowKey = formatLocalDate(now);
    setToday(now);
    setSelectedDate(nowKey);
    setMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
    previousToday.current = nowKey;
  };
  const resolvedTheme =
    themePreference === "system"
      ? systemDark
        ? "dark"
        : "light"
      : themePreference;

  return (
    <main
      aria-label="Lịch Việt nhanh"
      className="menu-bar-popup"
      data-theme={resolvedTheme}
    >
      <header className="menu-bar-popup__header">
        <div>
          <p className="menu-bar-popup__eyebrow">LỊCH VIỆT</p>
          <h1>
            Tháng {month.month}, {month.year}
          </h1>
        </div>
        <button
          className="menu-bar-popup__today"
          onClick={showToday}
          type="button"
        >
          Hôm nay
        </button>
      </header>

      <section aria-label="Lịch tháng" className="menu-bar-popup__calendar">
        <div className="menu-bar-popup__month-controls">
          <button
            aria-label="Tháng trước"
            onClick={() => moveMonth(-1)}
            type="button"
          >
            ‹
          </button>
          <span>
            {month.month.toString().padStart(2, "0")}/{month.year}
          </span>
          <button
            aria-label="Tháng sau"
            onClick={() => moveMonth(1)}
            type="button"
          >
            ›
          </button>
        </div>
        <div className="menu-bar-popup__grid menu-bar-popup__weekdays">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="menu-bar-popup__grid menu-bar-popup__days">
          {days.map((day) => (
            <button
              aria-label={`${day.day}/${day.month}/${day.year}, âm lịch ${day.lunarDay}/${day.lunarMonth}`}
              aria-pressed={day.date === selectedDate}
              className={[
                day.isOutsideMonth ? "is-outside" : "",
                day.date === todayKey ? "is-today" : "",
                day.date === selectedDate ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={day.date}
              onClick={() => selectDay(day.date)}
              type="button"
            >
              <span>{day.day}</span>
              <small>{day.lunarDay}</small>
            </button>
          ))}
        </div>
      </section>

      <section aria-live="polite" className="menu-bar-popup__details">
        <div className="menu-bar-popup__lunar-date">
          <span>Âm lịch</span>
          <strong>
            {calendarDate.lunar.day} tháng {calendarDate.lunar.month}
            {calendarDate.lunar.isLeapMonth ? " nhuận" : ""}
          </strong>
        </div>
        <p>
          {selected.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="menu-bar-popup__details-row">
          <span>Ngày {calendarDate.canChi.day}</span>
          <span>{calendarDate.solarTerm.name}</span>
        </div>
      </section>

      <footer className="menu-bar-popup__footer">
        <span>Ngày âm Việt Nam</span>
        <div className="menu-bar-popup__actions">
          <button
            className="menu-bar-popup__quit"
            onClick={() => void invoke("quit_application").catch(console.error)}
            type="button"
          >
            Thoát
          </button>
          <button
            onClick={() => void invoke("open_main_window").catch(console.error)}
            type="button"
          >
            Mở lịch đầy đủ <span aria-hidden="true">↗</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
