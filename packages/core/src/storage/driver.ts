export type SqlValue = string | number | null;
export type SqlParameters = readonly SqlValue[];
export type SqlRow = Record<string, unknown>;

export interface SqlExecutionResult {
  rowsAffected: number;
  lastInsertId?: number;
}

export interface SqlExecutor {
  execute(sql: string, parameters?: SqlParameters): Promise<SqlExecutionResult>;
  query<Row extends SqlRow = SqlRow>(sql: string, parameters?: SqlParameters): Promise<Row[]>;
}

/**
 * Platform boundary implemented by expo-sqlite, tauri-plugin-sql, or a test
 * driver. Transactions are optional because tauri-plugin-sql's guest API does
 * not currently expose a connection-scoped transaction.
 */
export interface SqlDriver extends SqlExecutor {
  transaction?<Result>(work: (executor: SqlExecutor) => Promise<Result>): Promise<Result>;
  close?(): Promise<void>;
}
