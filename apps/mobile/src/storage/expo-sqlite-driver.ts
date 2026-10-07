import type {
  SqlDriver,
  SqlExecutionResult,
  SqlExecutor,
  SqlParameters,
  SqlRow,
} from "@lich-oi/core";
import * as SQLite from "expo-sqlite";

type ExpoExecutor = Pick<SQLite.SQLiteDatabase, "getAllAsync" | "runAsync">;

function createExecutor(database: ExpoExecutor): SqlExecutor {
  return {
    async execute(sql: string, parameters: SqlParameters = []): Promise<SqlExecutionResult> {
      const result = await database.runAsync(sql, [...parameters]);
      return {
        rowsAffected: result.changes,
        lastInsertId: result.lastInsertRowId,
      };
    },
    async query<Row extends SqlRow>(
      sql: string,
      parameters: SqlParameters = [],
    ): Promise<Row[]> {
      return database.getAllAsync<Row>(sql, [...parameters]);
    },
  };
}

export class ExpoSQLiteDriver implements SqlDriver {
  constructor(private readonly database: SQLite.SQLiteDatabase) {}

  execute(sql: string, parameters?: SqlParameters) {
    return createExecutor(this.database).execute(sql, parameters);
  }

  query<Row extends SqlRow>(sql: string, parameters?: SqlParameters) {
    return createExecutor(this.database).query<Row>(sql, parameters);
  }

  async transaction<Result>(
    work: (executor: SqlExecutor) => Promise<Result>,
  ): Promise<Result> {
    let result: Result | undefined;
    await this.database.withExclusiveTransactionAsync(async (transaction) => {
      result = await work(createExecutor(transaction));
    });
    return result as Result;
  }

  close(): Promise<void> {
    return this.database.closeAsync();
  }
}

export async function openMobileDatabase(
  databaseName = "lich-oi.db",
): Promise<ExpoSQLiteDriver> {
  const database = await SQLite.openDatabaseAsync(databaseName);
  return new ExpoSQLiteDriver(database);
}
