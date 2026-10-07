import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildCalendarWidgetTimeline,
  serializeCalendarWidgetTimeline,
} from "./calendar-widget-data";

describe("calendar widget timeline", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds consecutive entries using the requested display mode", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 7, 12));

    const timeline = buildCalendarWidgetTimeline("detail", 2, "dark");

    expect(timeline).toHaveLength(2);
    expect(timeline[0]?.props).toMatchObject({
      solarDate: "7/9/2026",
      solarDay: "7",
      lunarDate: "26/7",
      display: "detail",
      theme: "dark",
    });
    expect(timeline[1]?.props.solarDate).toBe("8/9/2026");
  });

  it("serializes dates as local calendar dates for the native Android store", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 7, 12));

    const serialized = serializeCalendarWidgetTimeline(
      buildCalendarWidgetTimeline("compact", 1),
    );

    expect(JSON.parse(serialized)).toEqual([
      expect.objectContaining({
        date: "2026-09-07",
        props: expect.objectContaining({ display: "compact", theme: "light" }),
      }),
    ]);
  });

  it("includes a complete Monday-first month grid and marks today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 7, 12));

    const props = buildCalendarWidgetTimeline("month", 1)[0]!.props;

    expect(props.monthLabel).toBe("tháng 9 năm 2026");
    expect(props.monthDays).toHaveLength(42);
    expect(props.monthDays[0]).toMatchObject({ day: "31", isOutsideMonth: true });
    expect(props.monthDays[1]).toMatchObject({ day: "1", isOutsideMonth: false });
    expect(props.density).toBe("compact");
    expect(props.monthDays[7]).toMatchObject({
      day: "7",
      isSelected: true,
      isToday: true,
      lunarDay: "26",
    });
    expect(props.monthDays[35]).toMatchObject({ day: "5", isOutsideMonth: true });
  });
});

function event(overrides: Partial<import("@lich-oi/core").LocalEvent> = {}): import("@lich-oi/core").LocalEvent {
  return { id: "test", title: "Họp nhóm", notes: "Chuẩn bị tài liệu", kind: "other", calendarType: "solar", solarDate: "2026-09-08", lunarDay: null, lunarMonth: null, lunarYear: null, lunarLeapMonth: false, recurrence: "none", notificationTime: "08:00", allDay: false, durationMinutes: null, reminderIntervalMinutes: null, color: null, enabled: true, createdAt: "", updatedAt: "", ...overrides };
}

describe("widget events", () => {
  afterEach(() => vi.useRealTimers());
  it("includes today's enabled events, ordered by time, with overflow and notes", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 8, 12));
    const events = [event({ title: "Muộn", notificationTime: "18:00" }), event(), event({ title: "Cả ngày", allDay: true }), event({ title: "Trưa", notificationTime: "12:00" }), event({ enabled: false, title: "Ẩn" }), event({ solarDate: "2026-09-09", title: "Ngày mai" })];
    const props = buildCalendarWidgetTimeline("agenda", 1, "light", events)[0]!.props;
    expect(props.eventSummary).toBe("Cả ngày · Cả ngày\n+3 sự kiện khác");
    expect(props.eventAgenda).toContain("08:00 · Họp nhóm · Chuẩn bị tài liệu");
    expect(props.eventAgenda).toContain("+1 sự kiện khác");
    expect(props.eventAgenda).not.toContain("Ẩn");
    expect(props.eventAgenda).not.toContain("Ngày mai");
  });
  it("matches yearly solar and lunar dates, respecting leap months", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 8, 12));
    const events = [event({ title: "Sinh nhật", solarDate: "2000-09-08", recurrence: "yearly" }), event({ title: "Giỗ", calendarType: "lunar", lunarDay: 27, lunarMonth: 7, recurrence: "yearly" }), event({ title: "Nhuận", calendarType: "lunar", lunarDay: 27, lunarMonth: 7, lunarLeapMonth: true, recurrence: "yearly" })];
    const props = buildCalendarWidgetTimeline("agenda", 1, "dark", events)[0]!.props;
    expect(props.eventAgenda).toContain("Sinh nhật"); expect(props.eventAgenda).toContain("Giỗ"); expect(props.eventAgenda).not.toContain("Nhuận");
    expect(buildCalendarWidgetTimeline("detail", 1)[0]!.props.eventSummary).toBe("Hôm nay chưa có sự kiện");
  });
});
