package com.licham.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.view.View
import android.widget.RemoteViews

internal object CalendarWidgetRenderer {
  private val CELL_IDS = intArrayOf(
    R.id.cell_0, R.id.cell_1, R.id.cell_2, R.id.cell_3, R.id.cell_4, R.id.cell_5, R.id.cell_6,
    R.id.cell_7, R.id.cell_8, R.id.cell_9, R.id.cell_10, R.id.cell_11, R.id.cell_12, R.id.cell_13,
    R.id.cell_14, R.id.cell_15, R.id.cell_16, R.id.cell_17, R.id.cell_18, R.id.cell_19, R.id.cell_20,
    R.id.cell_21, R.id.cell_22, R.id.cell_23, R.id.cell_24, R.id.cell_25, R.id.cell_26, R.id.cell_27,
    R.id.cell_28, R.id.cell_29, R.id.cell_30, R.id.cell_31, R.id.cell_32, R.id.cell_33, R.id.cell_34,
    R.id.cell_35, R.id.cell_36, R.id.cell_37, R.id.cell_38, R.id.cell_39, R.id.cell_40, R.id.cell_41,
  )

  fun updateAll(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    val component = ComponentName(context, CalendarWidgetProvider::class.java)
    update(context, manager, manager.getAppWidgetIds(component))
  }

  fun update(context: Context, manager: AppWidgetManager, widgetIds: IntArray) {
    val entry = CalendarWidgetStore.entryForToday(context)
    widgetIds.forEach { widgetId ->
      val minHeight = manager.getAppWidgetOptions(widgetId).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 140)
      manager.updateAppWidget(widgetId, createRemoteViews(context, entry, minHeight))
    }
  }

  private fun createRemoteViews(context: Context, entry: CalendarWidgetEntry?, height: Int): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.calendar_widget)
    val dark = entry?.dark == true
    val agenda = entry?.agenda == true
    val month = entry?.month == true
    val isCompact = entry?.density == "compact" || height < 150

    views.setViewVisibility(R.id.widget_details, if (month) View.GONE else View.VISIBLE)
    views.setViewVisibility(R.id.widget_month, if (month) View.VISIBLE else View.GONE)

    val text = android.graphics.Color.parseColor(if (dark) "#F1F2ED" else "#20211F")
    val muted = android.graphics.Color.parseColor(if (dark) "#BEC1B7" else "#73766F")
    val accent = android.graphics.Color.parseColor(if (dark) "#F2A797" else "#A33A2B")
    val todayColor = android.graphics.Color.parseColor(if (dark) "#FF7B60" else "#C23924")
    val selectedColor = android.graphics.Color.parseColor(if (dark) "#E8B274" else "#8C4A00")
    val outsideColor = android.graphics.Color.parseColor(if (dark) "#555852" else "#B8BBB2")

    views.setInt(R.id.widget_root, "setBackgroundResource", if (dark) R.drawable.calendar_widget_background_dark else R.drawable.calendar_widget_background)

    if (month) {
      views.setTextViewText(R.id.widget_month_title, entry?.monthLabel.orEmpty())
      views.setTextColor(R.id.widget_month_title, accent)
      views.setTextColor(R.id.widget_month_brand, muted)

      val monthDays = entry?.monthDays.orEmpty()
      val cellFontSize = if (isCompact) 8.5f else 9.5f

      CELL_IDS.forEachIndexed { index, cellId ->
        val day = monthDays.getOrNull(index)
        if (day != null) {
          val lunarText = if (day.lunarDay.isNotEmpty()) day.lunarDay else ""
          views.setTextViewText(cellId, "${day.day}\n$lunarText")
          views.setTextViewTextSize(cellId, android.util.TypedValue.COMPLEX_UNIT_SP, cellFontSize)
          when {
            day.isToday -> {
              views.setTextColor(cellId, todayColor)
            }
            day.isSelected -> {
              views.setTextColor(cellId, selectedColor)
            }
            day.isOutsideMonth -> {
              views.setTextColor(cellId, outsideColor)
            }
            else -> {
              views.setTextColor(cellId, text)
            }
          }
        } else {
          views.setTextViewText(cellId, "")
        }
      }
    }

    views.setTextViewText(R.id.widget_events, entry?.events ?: "Mở ứng dụng để đồng bộ sự kiện")
    views.setInt(R.id.widget_events, "setMaxLines", if (agenda && height >= 200) 4 else if (isCompact) 1 else 2)
    views.setTextViewTextSize(R.id.widget_solar_day, android.util.TypedValue.COMPLEX_UNIT_SP, if (agenda || isCompact) 34f else 44f)

    views.setTextColor(R.id.widget_lunar_date, accent)
    views.setTextColor(R.id.widget_events, text)
    views.setTextColor(R.id.widget_brand, text)
    views.setTextColor(R.id.widget_solar_day, text)
    views.setTextColor(R.id.widget_solar_date, muted)
    views.setTextColor(R.id.widget_solar_label, muted)
    views.setTextColor(R.id.widget_can_chi, muted)
    views.setTextColor(R.id.widget_weekday, accent)

    if (entry == null) {
      views.setTextViewText(R.id.widget_weekday, context.getString(R.string.calendar_widget_name).uppercase())
      views.setTextViewText(R.id.widget_solar_day, "—")
      views.setTextViewText(R.id.widget_solar_date, context.getString(R.string.calendar_widget_open_to_sync))
      views.setTextViewText(R.id.widget_lunar_date, context.getString(R.string.calendar_widget_lunar_placeholder))
      views.setViewVisibility(R.id.widget_can_chi, View.GONE)
    } else {
      views.setTextViewText(R.id.widget_weekday, entry.weekday.uppercase())
      views.setTextViewText(R.id.widget_solar_day, entry.solarDay)
      views.setTextViewText(R.id.widget_solar_date, entry.solarDate)
      views.setTextViewText(R.id.widget_lunar_date, context.getString(R.string.calendar_widget_lunar, entry.lunarDate))
      views.setTextViewText(R.id.widget_can_chi, entry.canChi)
      views.setViewVisibility(R.id.widget_can_chi, if (entry.detailed) View.VISIBLE else View.GONE)
    }

    context.packageManager.getLaunchIntentForPackage(context.packageName)?.let { launchIntent ->
      val pendingIntent = PendingIntent.getActivity(
        context,
        0,
        launchIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )
      views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
    }
    return views
  }
}
