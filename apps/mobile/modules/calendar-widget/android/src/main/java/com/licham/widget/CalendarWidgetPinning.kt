package com.licham.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import android.widget.Toast

internal object CalendarWidgetPinning {
  fun request(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      showManualInstructions(context)
      return false
    }

    val manager = AppWidgetManager.getInstance(context)
    if (!manager.isRequestPinAppWidgetSupported) {
      showManualInstructions(context)
      return false
    }

    val provider = ComponentName(context, CalendarWidgetProvider::class.java)
    return manager.requestPinAppWidget(provider, null, null)
  }

  private fun showManualInstructions(context: Context) {
    Toast.makeText(
      context,
      context.getString(R.string.calendar_widget_manual_add),
      Toast.LENGTH_LONG,
    ).show()
  }
}
