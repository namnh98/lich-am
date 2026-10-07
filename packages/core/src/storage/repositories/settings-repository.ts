import type { SqlExecutor, SqlRow } from "../driver";
import type { SettingEntry, SettingValue } from "../types";

interface SettingRow extends SqlRow {
  key: string;
  value_json: string;
  updated_at: string;
}

export class SettingsRepository {
  constructor(private readonly db: SqlExecutor) {}

  async set<Value extends SettingValue>(
    key: string,
    value: Value,
    updatedAt = new Date().toISOString(),
  ): Promise<void> {
    await this.db.execute(
      `INSERT INTO settings(key, value_json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value_json = excluded.value_json,
         updated_at = excluded.updated_at`,
      [key, JSON.stringify(value), updatedAt],
    );
  }

  async get<Value extends SettingValue>(key: string): Promise<Value | null> {
    const rows = await this.db.query<SettingRow>(
      "SELECT key, value_json, updated_at FROM settings WHERE key = ? LIMIT 1",
      [key],
    );
    return rows[0] ? parseJson<Value>(rows[0].value_json) : null;
  }

  async list(): Promise<SettingEntry[]> {
    const rows = await this.db.query<SettingRow>(
      "SELECT key, value_json, updated_at FROM settings ORDER BY key",
    );
    return rows.map((row) => ({
      key: row.key,
      value: parseJson<SettingValue>(row.value_json),
      updatedAt: row.updated_at,
    }));
  }

  async remove(key: string): Promise<boolean> {
    const result = await this.db.execute("DELETE FROM settings WHERE key = ?", [key]);
    return result.rowsAffected > 0;
  }
}

function parseJson<Value>(value: string): Value {
  try {
    return JSON.parse(value) as Value;
  } catch {
    throw new Error("Stored setting contains invalid JSON");
  }
}
