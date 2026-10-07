import type {
  SqlDriver,
  SqlExecutionResult,
  SqlParameters,
  SqlRow,
} from "@lich-oi/core";
import Database from "@tauri-apps/plugin-sql";

export class TauriSqlDriver implements SqlDriver {
  constructor(private readonly database: Database) {}

  async execute(
    sql: string,
    parameters: SqlParameters = [],
  ): Promise<SqlExecutionResult> {
    const result = await this.database.execute(
      toTauriPlaceholders(sql),
      [...parameters],
    );
    return {
      rowsAffected: result.rowsAffected,
      lastInsertId: result.lastInsertId,
    };
  }

  query<Row extends SqlRow>(
    sql: string,
    parameters: SqlParameters = [],
  ): Promise<Row[]> {
    return this.database.select<Row[]>(
      toTauriPlaceholders(sql),
      [...parameters],
    );
  }

  async close(): Promise<void> {
    await this.database.close();
  }
}

export async function openDesktopDatabase(
  databaseUrl = "sqlite:lich-oi.db",
): Promise<TauriSqlDriver> {
  return new TauriSqlDriver(await Database.load(databaseUrl));
}

/**
 * Core repositories use SQLite's positional ? placeholders. The Tauri SQL
 * guest binding documents numbered $1 placeholders for SQLite, so adaptation
 * stays at this platform boundary.
 */
function toTauriPlaceholders(sql: string): string {
  let index = 0;
  return sql.replaceAll("?", () => "$" + String(++index));
}
