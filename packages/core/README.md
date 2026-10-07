# @lich-oi/core

Logic dùng chung cho lịch âm Việt Nam. Package không import React,
React Native hoặc API phụ thuộc nền tảng nên dùng được trong Expo, Tauri,
Node.js và unit test.

## Public API

```ts
import {
  getAuspiciousHours,
  getCanChi,
  getSolarTerm,
  getVietnameseCalendarDate,
  lunarToSolar,
  solarToLunar,
  type LunarDate,
  type SolarDate,
} from "@lich-oi/core";
```

- `solarToLunar(day, month, year, timeZone?)`
- `lunarToSolar(day, month, year, isLeapMonth?, timeZone?)`
- `getCanChi(day, month, year, timeZone?)`
- `getSolarTerm(day, month, year, timeZone?)`
- `getVietnameseCalendarDate(day, month, year, timeZone?)`
- `getAuspiciousHours(day, month, year)`
- `julianDayFromDate()` và `dateFromJulianDay()`
- `createApiClient()`
- `appStore`, một Zustand vanilla store không sử dụng React hooks
- `initializeLocalDatabase()` cùng repositories local-first cho event,
  setting, holiday và lunar cache

Xem thiết kế schema và migration tại
[`src/storage/README.md`](./src/storage/README.md).

Múi giờ mặc định là UTC+7. Truyền rõ `timeZone` nếu sản phẩm hỗ trợ
người dùng ở khu vực khác.

`getSolarTerm()` định nghĩa tiết khí của một ngày là tiết khí đang có
hiệu lực lúc 12:00 giờ địa phương. Một ngày chuyển tiết có thể chứa hai
tiết khí, vì ranh giới thực tế là một thời điểm thiên văn.

## Test

```bash
npm run test --workspace=@lich-oi/core
npm run lint --workspace=@lich-oi/core
npm run build --workspace=@lich-oi/core
```

```text
test/
├── calendar-conversion.test.ts  # mốc Tết, round-trip, input invalid
├── can-chi.test.ts              # bảng kỳ vọng Can Chi độc lập
└── auspicious-hours.test.ts     # pattern giờ và khoảng giờ
```

Khi mở rộng, nên bổ sung fixture đã đối soát từ nguồn lịch độc lập cho:
tháng nhuận, giao thừa, năm nhuận dương lịch, mốc trước/sau năm 2000 và
các múi giờ sản phẩm hỗ trợ.
