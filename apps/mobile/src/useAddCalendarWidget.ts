import { useCallback } from "react";
import { Alert, Platform } from "react-native";

import { requestCalendarWidgetPin } from "./calendar-widget";

const ANDROID_FALLBACK =
  "Launcher này không hỗ trợ thêm tự động. Hãy nhấn giữ vùng trống trên màn hình chính, chọn Widget, rồi chọn Lịch Việt.";
const IOS_INSTRUCTIONS =
  "Nhấn giữ vùng trống trên màn hình chính, chọn dấu + ở góc trên, tìm Lịch Việt, chọn kích thước rồi nhấn Thêm tiện ích.";

export function useAddCalendarWidget() {
  return useCallback(() => {
    if (Platform.OS === "ios") {
      Alert.alert("Thêm Lịch Việt ra màn hình chính", IOS_INSTRUCTIONS);
      return;
    }

    try {
      // Android only reports whether the request is supported, not whether a dialog opened.
      const pinRequestSupported = requestCalendarWidgetPin();
      if (!pinRequestSupported) {
        Alert.alert("Thêm widget thủ công", ANDROID_FALLBACK);
      }
    } catch {
      Alert.alert("Chưa thể mở trình thêm widget", ANDROID_FALLBACK);
    }
  }, []);
}
