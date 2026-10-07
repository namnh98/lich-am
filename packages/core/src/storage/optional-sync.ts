import type { SyncOutboxItem } from "./types";
import type { SyncOutboxRepository } from "./repositories/sync-outbox-repository";

export interface OptionalSyncAdapter {
  push(changes: readonly SyncOutboxItem[]): Promise<{ acknowledgedIds: string[] }>;
}

export type SyncResult =
  | { status: "disabled" }
  | { status: "idle" }
  | { status: "synced"; uploaded: number }
  | { status: "failed"; error: unknown };

/**
 * Online sync is an optional secondary port. Without an adapter, every local
 * repository remains fully operational and syncOnce is a no-op.
 */
export class OptionalSyncCoordinator {
  constructor(
    private readonly outbox: SyncOutboxRepository,
    private readonly adapter?: OptionalSyncAdapter,
  ) {}

  async syncOnce(): Promise<SyncResult> {
    if (!this.adapter) return { status: "disabled" };
    const changes = await this.outbox.listPending();
    if (changes.length === 0) return { status: "idle" };

    try {
      const result = await this.adapter.push(changes);
      await this.outbox.acknowledge(result.acknowledgedIds);
      return { status: "synced", uploaded: result.acknowledgedIds.length };
    } catch (error) {
      for (const change of changes) await this.outbox.markAttempt(change.id);
      return { status: "failed", error };
    }
  }
}
