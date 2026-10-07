import { getAuspiciousHours, getCanChi, solarToLunar } from "../../calendar";
import type { SolarDate } from "../../types";
import type { SqlExecutor, SqlRow } from "../driver";
import type { LunarDateCacheEntry } from "../types";

interface LunarDateRow extends SqlRow {
  solar_date: string;
  solar_day: number;
  solar_month: number;
  solar_year: number;
  lunar_day: number;
  lunar_month: number;
  lunar_year: number;
  is_leap_month: number;
  can_chi_day: string;
  can_chi_month: string;
  can_chi_year: string;
  auspicious_hours_json: string;
  recommended_actions_json: string;
  avoid_actions_json: string;
  algorithm_version: string;
  calculated_at: string;
}

const columns = `solar_date, solar_day, solar_month, solar_year,
  lunar_day, lunar_month, lunar_year, is_leap_month,
  can_chi_day, can_chi_month, can_chi_year, auspicious_hours_json,
  recommended_actions_json, avoid_actions_json, algorithm_version, calculated_at`;

export class LunarDateRepository {
  constructor(private readonly db: SqlExecutor) {}

  async get(solarDate: string): Promise<LunarDateCacheEntry | null> {
    const rows = await this.db.query<LunarDateRow>(
      `SELECT ${columns} FROM lunar_dates WHERE solar_date = ? LIMIT 1`,
      [solarDate],
    );
    return rows[0] ? mapLunarDate(rows[0]) : null;
  }

  async upsert(entry: LunarDateCacheEntry): Promise<void> {
    await this.db.execute(
      `INSERT INTO lunar_dates(
        solar_date, solar_day, solar_month, solar_year,
        lunar_day, lunar_month, lunar_year, is_leap_month,
        can_chi_day, can_chi_month, can_chi_year, auspicious_hours_json,
        recommended_actions_json, avoid_actions_json, algorithm_version, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(solar_date) DO UPDATE SET
        lunar_day = excluded.lunar_day,
        lunar_month = excluded.lunar_month,
        lunar_year = excluded.lunar_year,
        is_leap_month = excluded.is_leap_month,
        can_chi_day = excluded.can_chi_day,
        can_chi_month = excluded.can_chi_month,
        can_chi_year = excluded.can_chi_year,
        auspicious_hours_json = excluded.auspicious_hours_json,
        recommended_actions_json = excluded.recommended_actions_json,
        avoid_actions_json = excluded.avoid_actions_json,
        algorithm_version = excluded.algorithm_version,
        calculated_at = excluded.calculated_at`,
      [
        entry.solarDate,
        entry.solar.day,
        entry.solar.month,
        entry.solar.year,
        entry.lunar.day,
        entry.lunar.month,
        entry.lunar.year,
        entry.lunar.isLeapMonth ? 1 : 0,
        entry.canChi.day,
        entry.canChi.month,
        entry.canChi.year,
        JSON.stringify(entry.auspiciousHours),
        JSON.stringify(entry.recommendedActions),
        JSON.stringify(entry.avoidActions),
        entry.algorithmVersion,
        entry.calculatedAt,
      ],
    );
  }

  async getOrCalculate(
    solar: SolarDate,
    options: {
      timeZone?: number;
      algorithmVersion?: string;
      recommendedActions?: readonly string[];
      avoidActions?: readonly string[];
    } = {},
  ): Promise<LunarDateCacheEntry> {
    const key = formatSolarDate(solar);
    const algorithmVersion = options.algorithmVersion ?? "1";
    const cached = await this.get(key);
    if (cached?.algorithmVersion === algorithmVersion) return cached;

    const entry: LunarDateCacheEntry = {
      solarDate: key,
      solar,
      lunar: solarToLunar(solar.day, solar.month, solar.year, options.timeZone),
      canChi: getCanChi(solar.day, solar.month, solar.year, options.timeZone),
      auspiciousHours: getAuspiciousHours(solar.day, solar.month, solar.year),
      recommendedActions: [...(options.recommendedActions ?? [])],
      avoidActions: [...(options.avoidActions ?? [])],
      algorithmVersion,
      calculatedAt: new Date().toISOString(),
    };
    await this.upsert(entry);
    return entry;
  }

  async removeOlderThan(solarDate: string): Promise<number> {
    const result = await this.db.execute(
      "DELETE FROM lunar_dates WHERE solar_date < ?",
      [solarDate],
    );
    return result.rowsAffected;
  }
}

export function formatSolarDate(date: SolarDate): string {
  return [
    date.year.toString().padStart(4, "0"),
    date.month.toString().padStart(2, "0"),
    date.day.toString().padStart(2, "0"),
  ].join("-");
}

function mapLunarDate(row: LunarDateRow): LunarDateCacheEntry {
  return {
    solarDate: row.solar_date,
    solar: {
      day: Number(row.solar_day),
      month: Number(row.solar_month),
      year: Number(row.solar_year),
    },
    lunar: {
      day: Number(row.lunar_day),
      month: Number(row.lunar_month),
      year: Number(row.lunar_year),
      isLeapMonth: Number(row.is_leap_month) === 1,
    },
    canChi: {
      day: row.can_chi_day,
      month: row.can_chi_month,
      year: row.can_chi_year,
    },
    auspiciousHours: parseJson(row.auspicious_hours_json, []),
    recommendedActions: parseJson(row.recommended_actions_json, []),
    avoidActions: parseJson(row.avoid_actions_json, []),
    algorithmVersion: row.algorithm_version,
    calculatedAt: row.calculated_at,
  };
}

function parseJson<Value>(value: string, fallback: Value): Value {
  try {
    return JSON.parse(value) as Value;
  } catch {
    return fallback;
  }
}
