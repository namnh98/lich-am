# @lich-am/ui

React Native components dùng chung cho Expo và frontend desktop chạy
`react-native-web`. Package không gọi API Expo, Electron hoặc Tauri.

## Components

- `DayCard`: một ô ngày dương/âm, trạng thái hôm nay, được chọn, ngoài
  tháng và các marker.
- `CalendarGrid`: nhận danh sách ô ngày và đúng bảy nhãn thứ; không tự
  tính lịch.
- `TodayHighlightCard`: nhận toàn bộ nội dung ngày âm, Can Chi, giờ
  hoàng đạo và việc nên/kiêng qua props.
- `BottomNav`: điều hướng cho màn hình hẹp.
- `SideNav`: biến thể desktop dùng cùng `NavigationItem[]`.
- `ResponsiveNav`: tự chọn BottomNav/SideNav theo breakpoint có thể
  cấu hình.

## Ví dụ

```tsx
import {
  CalendarGrid,
  TodayHighlightCard,
  type CalendarGridDay,
} from "@lich-am/ui";

const days: CalendarGridDay[] = calendarDays.map((day) => ({
  key: day.isoDate,
  solarLabel: day.solarDay,
  lunarLabel: day.lunarDay,
  accessibilityLabel: day.accessibilityLabel,
  isToday: day.isToday,
  isOutsideMonth: day.isOutsideMonth,
  markers: day.isHoliday
    ? [{ key: "holiday", accessibilityLabel: day.holidayName }]
    : [],
}));

<CalendarGrid
  accessibilityLabel="Lịch tháng"
  days={days}
  weekdayLabels={["T2", "T3", "T4", "T5", "T6", "T7", "CN"]}
  onDayPress={(day) => selectDate(day.key)}
/>;

<TodayHighlightCard
  labels={{
    canChi: "Can Chi",
    auspiciousHours: "Giờ hoàng đạo",
    recommendation: "Nên làm",
    avoidance: "Nên tránh",
  }}
  title="Hôm nay"
  solarDate="06/09/2026"
  lunarDate="25 tháng 7"
  canChi="Ngày ..."
  auspiciousHours="Dần, Thìn, Tỵ"
  recommendation="Gặp gỡ, cầu an"
/>;
```

## Mobile và desktop

Nên giữ data và navigation state ở app, chỉ chia sẻ model props:

```tsx
const navigationProps = { items, activeKey, onChange };

// App mobile
<BottomNav {...navigationProps} />;

// App desktop
<SideNav {...navigationProps} />;
```

`ResponsiveNav` phù hợp khi cùng một bundle cần đổi layout theo chiều
rộng. Nếu desktop có routing, keyboard shortcut hoặc menu ngữ cảnh riêng,
nên để app desktop compose `SideNav` thay vì nhét logic platform vào
package UI.
