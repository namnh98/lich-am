/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// RemoteViews inflates in the launcher, so unsupported views can compile but
// fail only after users place the release widget on their home screen.
describe("Android widget RemoteViews layout", () => {
  it("uses only launcher-supported view classes", () => {
    const xml = readFileSync(new URL("../modules/calendar-widget/android/src/main/res/layout/calendar_widget.xml", import.meta.url), "utf8");
    const tags = [...xml.matchAll(/<([A-Z][A-Za-z0-9.]*)\b/g)].map((match) => match[1]);
    expect(tags.length).toBeGreaterThan(0);
    const supported = new Set(["FrameLayout", "LinearLayout", "RelativeLayout", "GridLayout", "TextView", "ImageView", "Button", "ImageButton", "ProgressBar", "Chronometer", "AnalogClock", "ListView", "GridView", "StackView", "ViewFlipper", "AdapterViewFlipper"]);
    expect(tags.filter((tag) => !supported.has(tag!))).toEqual([]);
  });
});
