import type { SqlExecutor, SqlRow } from "../driver";
import type { CalendarType, Holiday } from "../types";

interface HolidayRow extends SqlRow {
  id: string;
  name: string;
  calendar_type: CalendarType;
  month: number;
  day: number;
  year: number | null;
  is_official: number;
  note: string | null;
  source_version: string;
}

const columns = "id, name, calendar_type, month, day, year, is_official, note, source_version";

export class HolidayRepository {
  constructor(private readonly db: SqlExecutor) {}

  async upsert(holiday: Holiday): Promise<void> {
    await this.db.execute(
      `INSERT INTO holidays(
        id, name, calendar_type, month, day, year, is_official, note, source_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        calendar_type = excluded.calendar_type,
        month = excluded.month,
        day = excluded.day,
        year = excluded.year,
        is_official = excluded.is_official,
        note = excluded.note,
        source_version = excluded.source_version`,
      [
        holiday.id,
        holiday.name,
        holiday.calendarType,
        holiday.month,
        holiday.day,
        holiday.year,
        holiday.official ? 1 : 0,
        holiday.note,
        holiday.sourceVersion,
      ],
    );
  }

  async upsertMany(holidays: readonly Holiday[]): Promise<void> {
    for (const holiday of holidays) await this.upsert(holiday);
  }

  async findForDate(
    calendarType: CalendarType,
    month: number,
    day: number,
    year: number,
  ): Promise<Holiday[]> {
    const rows = await this.db.query<HolidayRow>(
      `SELECT ${columns} FROM holidays
       WHERE calendar_type = ? AND month = ? AND day = ?
         AND (year IS NULL OR year = ?)
       ORDER BY is_official DESC, name`,
      [calendarType, month, day, year],
    );
    return rows.map(mapHoliday);
  }

  async listAll(): Promise<Holiday[]> {
    const rows = await this.db.query<HolidayRow>(
      `SELECT ${columns} FROM holidays ORDER BY calendar_type, month, day, name`,
    );
    return rows.map(mapHoliday);
  }
}

function mapHoliday(row: HolidayRow): Holiday {
  return {
    id: row.id,
    name: row.name,
    calendarType: row.calendar_type,
    month: Number(row.month),
    day: Number(row.day),
    year: row.year === null ? null : Number(row.year),
    official: Number(row.is_official) === 1,
    note: row.note,
    sourceVersion: row.source_version,
  };
}
