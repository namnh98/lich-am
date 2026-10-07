import type { SqlDriver, SqlExecutor, SqlRow } from "./driver";

export interface Migration {
  version: number;
  name: string;
  up(executor: SqlExecutor): Promise<void>;
}

interface MigrationRow extends SqlRow {
  version: number;
}

interface TableInfoRow extends SqlRow {
  name: string;
}

const initialSchema: Migration = {
  version: 1,
  name: "initial_local_schema",
  async up(db) {
    const statements = [
      `CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        notes TEXT,
        kind TEXT NOT NULL CHECK (kind IN ('anniversary', 'birthday', 'reminder', 'other')),
        calendar_type TEXT NOT NULL CHECK (calendar_type IN ('solar', 'lunar')),
        solar_date TEXT,
        lunar_day INTEGER,
        lunar_month INTEGER,
        lunar_year INTEGER,
        lunar_leap_month INTEGER NOT NULL DEFAULT 0 CHECK (lunar_leap_month IN (0, 1)),
        recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'yearly')),
        notification_time TEXT,
        is_enabled INTEGER NOT NULL DEFAULT 1 CHECK (is_enabled IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CHECK (
          (calendar_type = 'solar' AND solar_date IS NOT NULL)
          OR
          (calendar_type = 'lunar' AND lunar_day IS NOT NULL AND lunar_month IS NOT NULL)
        )
      )`,
      "CREATE INDEX IF NOT EXISTS events_enabled_idx ON events(is_enabled, calendar_type)",
      "CREATE INDEX IF NOT EXISTS events_solar_date_idx ON events(solar_date)",
      "CREATE INDEX IF NOT EXISTS events_lunar_date_idx ON events(lunar_month, lunar_day)",
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS holidays (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        calendar_type TEXT NOT NULL CHECK (calendar_type IN ('solar', 'lunar')),
        month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
        day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 31),
        year INTEGER,
        is_official INTEGER NOT NULL DEFAULT 0 CHECK (is_official IN (0, 1)),
        note TEXT,
        source_version TEXT NOT NULL
      )`,
      "CREATE INDEX IF NOT EXISTS holidays_lookup_idx ON holidays(calendar_type, month, day, year)",
      `CREATE TABLE IF NOT EXISTS lunar_dates (
        solar_date TEXT PRIMARY KEY NOT NULL,
        solar_day INTEGER NOT NULL,
        solar_month INTEGER NOT NULL,
        solar_year INTEGER NOT NULL,
        lunar_day INTEGER NOT NULL,
        lunar_month INTEGER NOT NULL,
        lunar_year INTEGER NOT NULL,
        is_leap_month INTEGER NOT NULL CHECK (is_leap_month IN (0, 1)),
        can_chi_day TEXT NOT NULL,
        can_chi_month TEXT NOT NULL,
        can_chi_year TEXT NOT NULL,
        auspicious_hours_json TEXT NOT NULL,
        recommended_actions_json TEXT NOT NULL DEFAULT '[]',
        avoid_actions_json TEXT NOT NULL DEFAULT '[]',
        algorithm_version TEXT NOT NULL,
        calculated_at TEXT NOT NULL
      )`,
      "CREATE INDEX IF NOT EXISTS lunar_dates_lunar_idx ON lunar_dates(lunar_year, lunar_month, lunar_day)",
    ];

    for (const statement of statements) await db.execute(statement);
  },
};

/**
 * Example forward-only migration: add an optional color to events and an
 * outbox that remains unused until optional sync is enabled.
 */
const addEventColorAndOptionalSyncOutbox: Migration = {
  version: 2,
  name: "event_color_and_optional_sync_outbox",
  async up(db) {
    const columns = await db.query<TableInfoRow>("PRAGMA table_info(events)");
    if (!columns.some((column) => column.name === "color")) {
      await db.execute("ALTER TABLE events ADD COLUMN color TEXT");
    }

    await db.execute(`CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'setting')),
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('upsert', 'delete')),
      payload_json TEXT,
      occurred_at TEXT NOT NULL,
      attempt_count INTEGER NOT NULL DEFAULT 0
    )`);
    await db.execute(
      "CREATE INDEX IF NOT EXISTS sync_outbox_pending_idx ON sync_outbox(occurred_at, attempt_count)",
    );
  },
};

const addEventReminderDetails: Migration = {
  version: 3,
  name: "event_reminder_details",
  async up(db) {
    await ensureEventReminderColumns(db);
  },
};

const repairEventReminderDetails: Migration = {
  version: 4,
  name: "repair_event_reminder_details",
  async up(db) {
    await ensureEventReminderColumns(db);
  },
};

async function ensureEventReminderColumns(db: SqlExecutor): Promise<void> {
  const columns = await db.query<TableInfoRow>("PRAGMA table_info(events)");
  if (!columns.some((column) => column.name === "all_day")) {
    await db.execute(
      "ALTER TABLE events ADD COLUMN all_day INTEGER NOT NULL DEFAULT 0",
    );
  }
  if (!columns.some((column) => column.name === "duration_minutes")) {
    await db.execute("ALTER TABLE events ADD COLUMN duration_minutes INTEGER");
  }
  if (!columns.some((column) => column.name === "reminder_interval_minutes")) {
    await db.execute(
      "ALTER TABLE events ADD COLUMN reminder_interval_minutes INTEGER",
    );
  }
}

export const migrations: readonly Migration[] = [
  initialSchema,
  addEventColorAndOptionalSyncOutbox,
  addEventReminderDetails,
  repairEventReminderDetails,
];

export async function migrateDatabase(
  driver: SqlDriver,
  migrationList: readonly Migration[] = migrations,
): Promise<void> {
  await driver.execute("PRAGMA foreign_keys = ON");
  await driver.execute("PRAGMA journal_mode = WAL");
  await driver.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  )`);

  const appliedRows = await driver.query<MigrationRow>(
    "SELECT version FROM schema_migrations ORDER BY version",
  );
  const applied = new Set(appliedRows.map((row) => Number(row.version)));

  for (const migration of [...migrationList].sort(
    (a, b) => a.version - b.version,
  )) {
    if (applied.has(migration.version)) continue;

    const apply = async (executor: SqlExecutor) => {
      await migration.up(executor);
      await executor.execute(
        "INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)",
        [migration.version, migration.name, new Date().toISOString()],
      );
    };

    if (driver.transaction) {
      await driver.transaction(apply);
    } else {
      // Every migration is idempotent so an interrupted non-transactional
      // adapter can safely retry it on the next launch.
      await apply(driver);
    }
  }
}
