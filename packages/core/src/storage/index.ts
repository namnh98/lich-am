import type { SqlDriver } from "./driver";
import { DEFAULT_HOLIDAYS } from "./default-holidays";
import { migrateDatabase } from "./migrations";
import { EventRepository } from "./repositories/event-repository";
import { HolidayRepository } from "./repositories/holiday-repository";
import { LunarDateRepository } from "./repositories/lunar-date-repository";
import { SettingsRepository } from "./repositories/settings-repository";
import { SyncOutboxRepository } from "./repositories/sync-outbox-repository";

export * from "./driver";
export * from "./default-holidays";
export * from "./migrations";
export * from "./optional-sync";
export * from "./types";
export * from "./repositories/event-repository";
export * from "./repositories/holiday-repository";
export * from "./repositories/lunar-date-repository";
export * from "./repositories/settings-repository";
export * from "./repositories/sync-outbox-repository";

export interface LocalRepositories {
  events: EventRepository;
  holidays: HolidayRepository;
  lunarDates: LunarDateRepository;
  settings: SettingsRepository;
  syncOutbox: SyncOutboxRepository;
}

export async function initializeLocalDatabase(
  driver: SqlDriver,
  options: { seedHolidays?: readonly import("./types").Holiday[] } = {},
): Promise<LocalRepositories> {
  await migrateDatabase(driver);
  const repositories = {
    events: new EventRepository(driver),
    holidays: new HolidayRepository(driver),
    lunarDates: new LunarDateRepository(driver),
    settings: new SettingsRepository(driver),
    syncOutbox: new SyncOutboxRepository(driver),
  };
  await repositories.holidays.upsertMany(options.seedHolidays ?? DEFAULT_HOLIDAYS);
  return repositories;
}
