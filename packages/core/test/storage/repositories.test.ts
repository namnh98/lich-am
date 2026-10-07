import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  initializeLocalDatabase,
  type LocalEvent,
  type LocalRepositories,
  type SqlRow,
} from "../../src/index";
import { NodeSqliteTestDriver } from "./node-sqlite-test-driver";

describe("local SQLite repositories", () => {
  let driver: NodeSqliteTestDriver;
  let repositories: LocalRepositories;

  beforeEach(async () => {
    driver = new NodeSqliteTestDriver();
    repositories = await initializeLocalDatabase(driver);
  });

  afterEach(async () => {
    await driver.close();
  });

  it("applies both migrations exactly once", async () => {
    await initializeLocalDatabase(driver);
    const rows = await driver.query<SqlRow & { version: number }>(
      "SELECT version FROM schema_migrations ORDER BY version",
    );
    expect(rows.map((row) => Number(row.version))).toEqual([1, 2, 3, 4]);
  });

  it("stores and reads a yearly lunar anniversary", async () => {
    const event: LocalEvent = {
      id: "gio-ba",
      title: "Giỗ bà",
      notes: null,
      kind: "anniversary",
      calendarType: "lunar",
      solarDate: null,
      lunarDay: 12,
      lunarMonth: 8,
      lunarYear: null,
      lunarLeapMonth: false,
      recurrence: "yearly",
      notificationTime: "08:00",
      allDay: false,
      durationMinutes: 60,
      reminderIntervalMinutes: 30,
      color: "#A84938",
      enabled: true,
      createdAt: "2026-09-06T00:00:00.000Z",
      updatedAt: "2026-09-06T00:00:00.000Z",
    };

    await repositories.events.save(event);
    expect(await repositories.events.getById(event.id)).toEqual(event);
  });

  it("stores typed settings as JSON", async () => {
    await repositories.settings.set(
      "appearance",
      {
        colorScheme: "system",
        firstDayOfWeek: 1,
      },
      "2026-09-06T00:00:00.000Z",
    );

    expect(await repositories.settings.get("appearance")).toEqual({
      colorScheme: "system",
      firstDayOfWeek: 1,
    });
  });

  it("calculates a lunar date once and serves it from cache", async () => {
    const first = await repositories.lunarDates.getOrCalculate(
      { day: 10, month: 2, year: 2024 },
      { algorithmVersion: "test-1", recommendedActions: ["Cầu an"] },
    );
    const second = await repositories.lunarDates.getOrCalculate(
      { day: 10, month: 2, year: 2024 },
      { algorithmVersion: "test-1" },
    );

    expect(first.lunar).toMatchObject({ day: 1, month: 1, year: 2024 });
    expect(second).toEqual(first);
  });

  it("stores bundled holidays without any API", async () => {
    await repositories.holidays.upsert({
      id: "tet-nguyen-dan",
      name: "Tết Nguyên Đán",
      calendarType: "lunar",
      month: 1,
      day: 1,
      year: null,
      official: true,
      note: null,
      sourceVersion: "2026.1",
    });

    const holidays = await repositories.holidays.findForDate(
      "lunar",
      1,
      1,
      2027,
    );
    expect(holidays.map((holiday) => holiday.id)).toEqual(["tet-nguyen-dan"]);
  });
});
