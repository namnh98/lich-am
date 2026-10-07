import type { LunarCalendarAppProps } from "@lich-am/ui";
import { LunarCalendarApp } from "@lich-am/ui";

import "./desktop-calendar.css";

export function DesktopCalendarApp(props: LunarCalendarAppProps) {
  return (
    <div className="desktop-calendar-ui">
      <LunarCalendarApp {...props} platform="desktop" />
    </div>
  );
}
