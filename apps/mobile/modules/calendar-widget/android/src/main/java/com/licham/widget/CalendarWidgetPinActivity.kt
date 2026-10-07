package com.licham.widget

import android.app.Activity
import android.os.Bundle

/** Lightweight target for the launcher shortcut; the system owns the pin confirmation UI. */
class CalendarWidgetPinActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    CalendarWidgetPinning.request(this)
    finish()
  }
}
