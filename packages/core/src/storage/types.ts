import type {
  AuspiciousHour,
  CanChiDate,
  LunarDate,
  SolarDate,
} from "../types";

export type CalendarType = "solar" | "lunar";
export type EventKind = "anniversary" | "birthday" | "reminder" | "other";
export type EventRecurrence = "none" | "yearly";

export interface LocalEvent {
  id: string;
  title: string;
  notes: string | null;
  kind: EventKind;
  calendarType: CalendarType;
  solarDate: string | null;
  lunarDay: number | null;
  lunarMonth: number | null;
  lunarYear: number | null;
  lunarLeapMonth: boolean;
  recurrence: EventRecurrence;
  notificationTime: string | null;
  allDay: boolean;
  durationMinutes: number | null;
  reminderIntervalMinutes: number | null;
  color: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  calendarType: CalendarType;
  month: number;
  day: number;
  year: number | null;
  official: boolean;
  note: string | null;
  sourceVersion: string;
}

export interface LunarDateCacheEntry {
  solarDate: string;
  solar: SolarDate;
  lunar: LunarDate;
  canChi: CanChiDate;
  auspiciousHours: AuspiciousHour[];
  recommendedActions: string[];
  avoidActions: string[];
  algorithmVersion: string;
  calculatedAt: string;
}

export type SettingValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[];

export interface SettingEntry<Value extends SettingValue = SettingValue> {
  key: string;
  value: Value;
  updatedAt: string;
}

export type SyncEntityType = "event" | "setting";
export type SyncOperation = "upsert" | "delete";

export interface SyncOutboxItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: Record<string, unknown> | null;
  occurredAt: string;
  attemptCount: number;
}
