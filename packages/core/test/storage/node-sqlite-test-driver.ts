import { DatabaseSync } from "node:sqlite";

import type {
  SqlDriver,
  SqlExecutionResult,
  SqlParameters,
  SqlRow,
} from "../../src/storage/driver";

export class NodeSqliteTestDriver implements SqlDriver {
  private readonly database = new DatabaseSync(":memory:");

  async execute(
    sql: string,
    parameters: SqlParameters = [],
  ): Promise<SqlExecutionResult> {
    const result = this.database.prepare(sql).run(...parameters);
    return {
      rowsAffected: Number(result.changes),
      lastInsertId: Number(result.lastInsertRowid),
    };
  }

  async query<Row extends SqlRow>(
    sql: string,
    parameters: SqlParameters = [],
  ): Promise<Row[]> {
    return this.database.prepare(sql).all(...parameters) as Row[];
  }

  async close(): Promise<void> {
    this.database.close();
  }
}
