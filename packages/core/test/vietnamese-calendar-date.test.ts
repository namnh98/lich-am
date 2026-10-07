import { describe, expect, it } from "vitest";

import {
  getSolarTerm,
  getVietnameseCalendarDate,
} from "../src/index";

describe("complete Vietnamese calendar date", () => {
  it("converts Lunar New Year 2024 at UTC+7", () => {
    const result = getVietnameseCalendarDate(10, 2, 2024);

    expect(result).toMatchObject({
      solar: { day: 10, month: 2, year: 2024 },
      lunar: { day: 1, month: 1, year: 2024, isLeapMonth: false },
      canChi: {
        day: "Giáp Thìn",
        month: "Bính Dần",
        year: "Giáp Thìn",
      },
      solarTerm: { index: 21, name: "Lập xuân" },
      timeZone: 7,
    });
  });

  it("recognizes the first day of the leap second lunar month in 2023", () => {
    expect(getVietnameseCalendarDate(22, 3, 2023).lunar).toEqual({
      day: 1,
      month: 2,
      year: 2023,
      isLeapMonth: true,
    });
  });

  it.each([
    [20, 3, 2024, 0, "Xuân phân"],
    [21, 6, 2024, 6, "Hạ chí"],
    [23, 9, 2024, 12, "Thu phân"],
    [22, 12, 2024, 18, "Đông chí"],
  ] as const)(
    "maps %i/%i/%i to solar term %s",
    (day, month, year, index, name) => {
      const term = getSolarTerm(day, month, year);
      expect(term).toMatchObject({ index, name });
      expect(term.longitudeDegrees).toBeGreaterThanOrEqual(index * 15);
      expect(term.longitudeDegrees).toBeLessThan((index + 1) * 15);
    },
  );

  it("rejects an invalid time-zone offset", () => {
    expect(() => getSolarTerm(10, 2, 2024, 15)).toThrow(RangeError);
  });
});
