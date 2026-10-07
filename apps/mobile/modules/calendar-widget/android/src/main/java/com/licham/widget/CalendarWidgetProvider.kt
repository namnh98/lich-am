package com.licham.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent

class CalendarWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, widgetIds: IntArray) {
    CalendarWidgetRenderer.update(context, manager, widgetIds)
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, widgetId: Int, newOptions: android.os.Bundle) {
    CalendarWidgetRenderer.update(context, manager, intArrayOf(widgetId))
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    if (intent.action in REFRESH_ACTIONS) CalendarWidgetRenderer.updateAll(context)
  }

  private companion object {
    val REFRESH_ACTIONS = setOf(
      Intent.ACTION_MY_PACKAGE_REPLACED,
      Intent.ACTION_DATE_CHANGED,
      Intent.ACTION_TIMEZONE_CHANGED,
      Intent.ACTION_LOCALE_CHANGED,
    )
  }
}
