import { describe, expect, it } from "vitest";

import {
  dateInPeriod,
  getQuickYears,
  shiftSelectedMonth,
} from "./calendar-navigation";

describe("calendar navigation", () => {
  it("offers at least five years before and after the anchor year", () => {
    expect(getQuickYears(2026)).toEqual([
      2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031,
    ]);
  });

  it("preserves the selected day and clamps shorter months", () => {
    expect(dateInPeriod("2024-01-31", 2024, 2)).toBe("2024-02-29");
    expect(dateInPeriod("2025-01-31", 2025, 2)).toBe("2025-02-28");
  });

  it("moves across year boundaries without overflowing into another month", () => {
    expect(shiftSelectedMonth("2026-12-31", 2)).toBe("2027-02-28");
  });
});
