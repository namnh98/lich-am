package com.licham.widget

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

internal data class CalendarWidgetEntry(
  val weekday: String,
  val solarDate: String,
  val solarDay: String,
  val lunarDate: String,
  val canChi: String,
  val detailed: Boolean,
  val dark: Boolean,
  val agenda: Boolean,
  val month: Boolean,
  val events: String,
  val monthLabel: String,
  val density: String,
  val monthDays: List<MonthDay>,
)

internal data class MonthDay(
  val day: String,
  val lunarDay: String,
  val isOutsideMonth: Boolean,
  val isSelected: Boolean,
  val isToday: Boolean,
)

internal object CalendarWidgetStore {
  private const val PREFERENCES_NAME = "lich_viet_widget"
  private const val TIMELINE_KEY = "timeline"

  fun saveTimeline(context: Context, timelineJson: String) {
    // Parse before writing so a malformed JS payload never replaces valid widget data.
    JSONArray(timelineJson)
    context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(TIMELINE_KEY, timelineJson)
      .apply()
  }

  fun entryForToday(context: Context): CalendarWidgetEntry? {
    val timeline = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
      .getString(TIMELINE_KEY, null) ?: return null
    val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    val entries = JSONArray(timeline)

    for (index in 0 until entries.length()) {
      val item = entries.getJSONObject(index)
      if (item.optString("date") == today) return item.toEntry()
    }
    return null
  }

  private fun JSONObject.toEntry(): CalendarWidgetEntry {
    val props = getJSONObject("props")
    return CalendarWidgetEntry(
      weekday = props.optString("weekday"),
      solarDate = props.optString("solarDate"),
      solarDay = props.optString("solarDay"),
      lunarDate = props.optString("lunarDate"),
      canChi = props.optString("canChi"),
      detailed = props.optString("display") == "detail",
      dark = props.optString("theme") == "dark",
      agenda = props.optString("display") == "agenda",
      month = props.optString("display") == "month",
      events = props.optString(if (props.optString("display") == "agenda") "eventAgenda" else "eventSummary", "Hôm nay chưa có sự kiện"),
      monthLabel = props.optString("monthLabel"),
      density = props.optString("density", "compact"),
      monthDays = props.optJSONArray("monthDays")?.let { days ->
        (0 until days.length()).map { index ->
          val day = days.getJSONObject(index)
          MonthDay(
            day = day.optString("day"),
            lunarDay = day.optString("lunarDay"),
            isOutsideMonth = day.optBoolean("isOutsideMonth"),
            isSelected = day.optBoolean("isSelected"),
            isToday = day.optBoolean("isToday"),
          )
        }
      } ?: emptyList(),
    )
  }
}
