import { describe, expect, it } from "vitest";

import { getCanChi } from "../src/index";

describe("Can Chi", () => {
  it("calculates Can Chi for Lunar New Year 2024", () => {
    expect(getCanChi(10, 2, 2024)).toEqual({
      day: "Giáp Thìn",
      month: "Bính Dần",
      year: "Giáp Thìn",
    });
  });
});
