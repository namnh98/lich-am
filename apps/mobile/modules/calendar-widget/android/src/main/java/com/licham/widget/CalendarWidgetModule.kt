package com.licham.widget

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class CalendarWidgetModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CalendarWidget")

    Function("setTimeline") { timelineJson: String ->
      val context = requireNotNull(appContext.reactContext) {
        "CalendarWidget requires an active React context"
      }
      CalendarWidgetStore.saveTimeline(context, timelineJson)
      CalendarWidgetRenderer.updateAll(context)
    }

    Function("requestPin") {
      val context = requireNotNull(appContext.reactContext) {
        "CalendarWidget requires an active React context"
      }
      CalendarWidgetPinning.request(context)
    }
  }
}
