import type { SqlExecutor, SqlRow } from "../driver";
import type { SyncOutboxItem } from "../types";

interface OutboxRow extends SqlRow {
  id: string;
  entity_type: SyncOutboxItem["entityType"];
  entity_id: string;
  operation: SyncOutboxItem["operation"];
  payload_json: string | null;
  occurred_at: string;
  attempt_count: number;
}

export class SyncOutboxRepository {
  constructor(private readonly db: SqlExecutor) {}

  async enqueue(item: SyncOutboxItem): Promise<void> {
    await this.db.execute(
      `INSERT INTO sync_outbox(
        id, entity_type, entity_id, operation, payload_json, occurred_at, attempt_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        payload_json = excluded.payload_json,
        occurred_at = excluded.occurred_at,
        attempt_count = excluded.attempt_count`,
      [
        item.id,
        item.entityType,
        item.entityId,
        item.operation,
        item.payload === null ? null : JSON.stringify(item.payload),
        item.occurredAt,
        item.attemptCount,
      ],
    );
  }

  async listPending(limit = 100): Promise<SyncOutboxItem[]> {
    const rows = await this.db.query<OutboxRow>(
      `SELECT id, entity_type, entity_id, operation, payload_json, occurred_at, attempt_count
       FROM sync_outbox ORDER BY occurred_at LIMIT ?`,
      [Math.max(1, Math.min(limit, 500))],
    );
    return rows.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation,
      payload: row.payload_json ? JSON.parse(row.payload_json) as Record<string, unknown> : null,
      occurredAt: row.occurred_at,
      attemptCount: Number(row.attempt_count),
    }));
  }

  async markAttempt(id: string): Promise<void> {
    await this.db.execute(
      "UPDATE sync_outbox SET attempt_count = attempt_count + 1 WHERE id = ?",
      [id],
    );
  }

  async acknowledge(ids: readonly string[]): Promise<void> {
    for (const id of ids) await this.db.execute("DELETE FROM sync_outbox WHERE id = ?", [id]);
  }
}
