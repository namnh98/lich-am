import { describe, expect, it } from "vitest";

import { getAuspiciousHours } from "../src/index";

describe("auspicious hours", () => {
  it("returns the six expected periods for Lunar New Year 2024", () => {
    expect(getAuspiciousHours(10, 2, 2024)).toEqual([
      { branchIndex: 2, name: "Bính Dần", range: "03:00–05:00" },
      { branchIndex: 4, name: "Mậu Thìn", range: "07:00–09:00" },
      { branchIndex: 5, name: "Kỷ Tỵ", range: "09:00–11:00" },
      { branchIndex: 8, name: "Nhâm Thân", range: "15:00–17:00" },
      { branchIndex: 9, name: "Quý Dậu", range: "17:00–19:00" },
      { branchIndex: 11, name: "Ất Hợi", range: "21:00–23:00" },
    ]);
  });
});
