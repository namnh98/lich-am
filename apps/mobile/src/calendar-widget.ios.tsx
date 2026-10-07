import type { LocalEvent } from "@lich-oi/core";
import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

import {
  buildCalendarWidgetTimeline,
  type CalendarWidgetDisplay,
  type CalendarWidgetProps,
} from "./calendar-widget-data";

function CalendarWidget(props: CalendarWidgetProps, environment: WidgetEnvironment) {
  "widget";
  const compact = environment.widgetFamily === "systemSmall";
  const monthView = props.display === "month";
  return (
    <VStack
      alignment="leading"
      spacing={monthView ? 4 : compact ? 5 : 8}
      modifiers={[padding({ all: monthView ? 8 : 16 }), containerBackground(props.theme === "dark" ? "#20211F" : "#F7F7F4", "widget")]}
    >
      {monthView ? (
        <>
          <Text modifiers={[font({ size: 13, weight: "semibold" }), foregroundStyle(props.theme === "dark" ? "#F2A797" : "#A33A2B")]}>{props.monthLabel}</Text>
          <HStack spacing={0}>
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((weekday) => (
              <Text key={weekday} modifiers={[font({ size: 8, weight: "semibold" }), foregroundStyle(props.theme === "dark" ? "#BEC1B7" : "#73766F")]}>{weekday}</Text>
            ))}
          </HStack>
          {Array.from({ length: 6 }, (_, row) => (
            <HStack key={row} spacing={0}>
              {props.monthDays.slice(row * 7, row * 7 + 7).map((day, column) => (
                <Text key={`${row}-${column}`} modifiers={[font({ size: 9, weight: day.isSelected ? "bold" : "regular" }), foregroundStyle(day.isSelected ? (props.theme === "dark" ? "#F2A797" : "#A33A2B") : day.isOutsideMonth ? (props.theme === "dark" ? "#73766F" : "#BEC1B7") : (props.theme === "dark" ? "#F1F2ED" : "#20211F"))]}>{day.day}</Text>
              ))}
            </HStack>
          ))}
        </>
      ) : null}
      {!monthView ? (
        <>
          <HStack>
            <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(props.theme === "dark" ? "#F2A797" : "#A33A2B")]}>
              {props.weekday.toUpperCase()}
            </Text>
            <Spacer />
            {!compact ? (
              <Text modifiers={[font({ size: 12 }), foregroundStyle(props.theme === "dark" ? "#BEC1B7" : "#73766F")]}>{props.solarDate}</Text>
            ) : null}
          </HStack>
          <Text modifiers={[font({ size: props.display === "agenda" ? 24 : 32, weight: "light" }), foregroundStyle(props.theme === "dark" ? "#F1F2ED" : "#20211F")]}>
            {props.solarDay}
          </Text>
          <Text modifiers={[font({ size: 16, weight: "semibold" }), foregroundStyle(props.theme === "dark" ? "#F2A797" : "#A33A2B")]}>
            Âm lịch {props.lunarDate}
          </Text>
          {props.display === "detail" ? (
            <Text modifiers={[font({ size: 13 }), foregroundStyle(props.theme === "dark" ? "#BEC1B7" : "#73766F")]}>{props.canChi}</Text>
          ) : null}
          <Text modifiers={[font({ size: 11 }), foregroundStyle(props.theme === "dark" ? "#F1F2ED" : "#20211F")]}>
            {props.display === "agenda" && !compact ? props.eventAgenda : props.eventSummary}
          </Text>
        </>
      ) : null}
    </VStack>
  );
}

const calendarWidget = createWidget<CalendarWidgetProps>("VietnameseCalendar", CalendarWidget);
export default calendarWidget;

/** Keep a rolling 32-day timeline so the widget advances without opening the app daily. */
export function updateCalendarWidget(display: CalendarWidgetDisplay = "compact", theme: "light" | "dark" = "light", events: readonly LocalEvent[] = [], selectedDate?: string): void {
  calendarWidget.updateTimeline(buildCalendarWidgetTimeline(display, 32, theme, events, selectedDate));
}

export function requestCalendarWidgetPin(): boolean {
  return false;
}
