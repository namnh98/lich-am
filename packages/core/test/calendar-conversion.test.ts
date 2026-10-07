import { describe, expect, it } from "vitest";

import {
  dateFromJulianDay,
  julianDayFromDate,
  lunarToSolar,
  solarToLunar,
} from "../src/index";

describe("solar and Vietnamese lunar conversion", () => {
  it.each([
    [10, 2, 2024],
    [17, 2, 2026],
  ])("maps Lunar New Year %i/%i/%i to lunar 1/1", (day, month, year) => {
    expect(solarToLunar(day, month, year)).toEqual({
      day: 1,
      month: 1,
      year,
      isLeapMonth: false,
    });
  });

  it.each([
    [2, 9, 2025],
    [29, 2, 2024],
    [31, 12, 2030],
  ])("round-trips %i/%i/%i", (day, month, year) => {
    const lunar = solarToLunar(day, month, year);
    expect(lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeapMonth)).toEqual({
      day,
      month,
      year,
    });
  });

  it("round-trips a Julian day", () => {
    expect(dateFromJulianDay(julianDayFromDate(6, 9, 2026))).toEqual({
      day: 6,
      month: 9,
      year: 2026,
    });
  });

  it("rejects invalid solar dates", () => {
    expect(() => solarToLunar(31, 2, 2026)).toThrow(RangeError);
  });

  it("rejects invalid lunar dates", () => {
    expect(() => lunarToSolar(0, 1, 2026)).toThrow(RangeError);
  });
});
