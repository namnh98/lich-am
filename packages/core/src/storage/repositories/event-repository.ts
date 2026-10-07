import type { SqlExecutor, SqlRow } from "../driver";
import type { LocalEvent } from "../types";

interface EventRow extends SqlRow {
  id: string;
  title: string;
  notes: string | null;
  kind: LocalEvent["kind"];
  calendar_type: LocalEvent["calendarType"];
  solar_date: string | null;
  lunar_day: number | null;
  lunar_month: number | null;
  lunar_year: number | null;
  lunar_leap_month: number;
  recurrence: LocalEvent["recurrence"];
  notification_time: string | null;
  all_day: number;
  duration_minutes: number | null;
  reminder_interval_minutes: number | null;
  color: string | null;
  is_enabled: number;
  created_at: string;
  updated_at: string;
}

const selectColumns = `id, title, notes, kind, calendar_type, solar_date,
  lunar_day, lunar_month, lunar_year, lunar_leap_month, recurrence,
  notification_time, all_day, duration_minutes, reminder_interval_minutes,
  color, is_enabled, created_at, updated_at`;

export class EventRepository {
  constructor(private readonly db: SqlExecutor) {}

  async save(event: LocalEvent): Promise<void> {
    validateEvent(event);
    await this.db.execute(
      `INSERT INTO events(
        id, title, notes, kind, calendar_type, solar_date,
        lunar_day, lunar_month, lunar_year, lunar_leap_month,
        recurrence, notification_time, all_day, duration_minutes,
        reminder_interval_minutes, color, is_enabled, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        notes = excluded.notes,
        kind = excluded.kind,
        calendar_type = excluded.calendar_type,
        solar_date = excluded.solar_date,
        lunar_day = excluded.lunar_day,
        lunar_month = excluded.lunar_month,
        lunar_year = excluded.lunar_year,
        lunar_leap_month = excluded.lunar_leap_month,
        recurrence = excluded.recurrence,
        notification_time = excluded.notification_time,
        all_day = excluded.all_day,
        duration_minutes = excluded.duration_minutes,
        reminder_interval_minutes = excluded.reminder_interval_minutes,
        color = excluded.color,
        is_enabled = excluded.is_enabled,
        updated_at = excluded.updated_at`,
      [
        event.id,
        event.title,
        event.notes,
        event.kind,
        event.calendarType,
        event.solarDate,
        event.lunarDay,
        event.lunarMonth,
        event.lunarYear,
        event.lunarLeapMonth ? 1 : 0,
        event.recurrence,
        event.notificationTime,
        event.allDay ? 1 : 0,
        event.durationMinutes,
        event.reminderIntervalMinutes,
        event.color,
        event.enabled ? 1 : 0,
        event.createdAt,
        event.updatedAt,
      ],
    );
  }

  async getById(id: string): Promise<LocalEvent | null> {
    const rows = await this.db.query<EventRow>(
      `SELECT ${selectColumns} FROM events WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ? mapEvent(rows[0]) : null;
  }

  async list(
    options: { enabledOnly?: boolean; limit?: number } = {},
  ): Promise<LocalEvent[]> {
    const conditions = options.enabledOnly ? "WHERE is_enabled = 1" : "";
    const limit = Math.max(1, Math.min(options.limit ?? 500, 5_000));
    const rows = await this.db.query<EventRow>(
      `SELECT ${selectColumns} FROM events
       ${conditions}
       ORDER BY updated_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows.map(mapEvent);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.execute("DELETE FROM events WHERE id = ?", [
      id,
    ]);
    return result.rowsAffected > 0;
  }
}

function mapEvent(row: EventRow): LocalEvent {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    kind: row.kind,
    calendarType: row.calendar_type,
    solarDate: row.solar_date,
    lunarDay: nullableNumber(row.lunar_day),
    lunarMonth: nullableNumber(row.lunar_month),
    lunarYear: nullableNumber(row.lunar_year),
    lunarLeapMonth: Number(row.lunar_leap_month) === 1,
    recurrence: row.recurrence,
    notificationTime: row.notification_time,
    allDay: Number(row.all_day) === 1,
    durationMinutes: nullableNumber(row.duration_minutes),
    reminderIntervalMinutes: nullableNumber(row.reminder_interval_minutes),
    color: row.color,
    enabled: Number(row.is_enabled) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function nullableNumber(value: number | null): number | null {
  return value === null ? null : Number(value);
}

function validateEvent(event: LocalEvent): void {
  if (!event.id || !event.title.trim())
    throw new TypeError("Event id and title are required");
  if (event.calendarType === "solar" && !event.solarDate) {
    throw new TypeError("A solar event requires solarDate");
  }
  if (
    event.calendarType === "lunar" &&
    (event.lunarDay === null || event.lunarMonth === null)
  ) {
    throw new TypeError("A lunar event requires lunarDay and lunarMonth");
  }
}
