import { describe, expect, it } from "vitest";

import { getMonthGrid } from "../src/month-grid";

describe("getMonthGrid", () => {
  it("returns complete Monday-first weeks with lunar dates", () => {
    const days = getMonthGrid(2026, 9);
    expect(days).toHaveLength(35);
    expect(days[0]).toMatchObject({ date: "2026-08-31", isOutsideMonth: true });
    expect(days[1]).toMatchObject({ date: "2026-09-01", lunarDay: 20, lunarMonth: 7 });
    expect(days[34]).toMatchObject({ date: "2026-10-04", isOutsideMonth: true });
  });
});
