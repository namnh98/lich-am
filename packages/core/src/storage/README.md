# Local storage architecture

`packages/core` owns SQL schema, forward migrations and repositories. It
only sees the `SqlDriver` port and never imports Expo or Tauri.

## Schema

| Table | Purpose |
| --- | --- |
| `events` | Giỗ, sinh nhật, nhắc nhở dương/âm lịch và recurrence |
| `settings` | Key/value JSON cho theme, timezone, notification, sync opt-in |
| `holidays` | Ngày lễ dương/âm lịch được bundle và seed tại lần mở DB |
| `lunar_dates` | Cache kết quả âm lịch, Can Chi, giờ hoàng đạo, việc nên/kiêng |
| `schema_migrations` | Những migration đã áp dụng |
| `sync_outbox` | Hàng đợi chỉ dùng nếu người dùng bật backup/sync |

Mọi timestamp là ISO-8601 UTC; ngày không có giờ dùng `YYYY-MM-DD`.
Boolean được lưu dạng SQLite integer `0/1`. Array/object được serialize
thành JSON.

## App adapters

```ts
// Expo
import { initializeMobileStorage } from "./src/storage";
const repositories = await initializeMobileStorage();

// Tauri
import { initializeDesktopStorage } from "./src/storage";
const repositories = await initializeDesktopStorage();
```

Hai hàm đều gọi `initializeLocalDatabase(driver)`, chạy migration và
seed ngày lễ local trước khi trả repositories.

## Usage

```ts
const today = await repositories.lunarDates.getOrCalculate({
  day: 10,
  month: 2,
  year: 2024,
});

await repositories.events.save({
  id: "gio-ba",
  title: "Giỗ bà",
  notes: null,
  kind: "anniversary",
  calendarType: "lunar",
  solarDate: null,
  lunarDay: 12,
  lunarMonth: 8,
  lunarYear: null,
  lunarLeapMonth: false,
  recurrence: "yearly",
  notificationTime: "08:00",
  color: "#A84938",
  enabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

## Migration example

Migration 2 trong `migrations.ts` thêm cột `events.color` và bảng
`sync_outbox`. Nó kiểm tra `PRAGMA table_info(events)` trước khi
`ALTER TABLE`, nên có thể chạy lại nếu app bị tắt giữa migration:

```ts
const addColor: Migration = {
  version: 2,
  name: "event_color",
  async up(db) {
    const columns = await db.query<{ name: string }>(
      "PRAGMA table_info(events)",
    );
    if (!columns.some(column => column.name === "color")) {
      await db.execute(
        "ALTER TABLE events ADD COLUMN color TEXT",
      );
    }
  },
};
```

Quy tắc migration:

1. Không sửa migration đã phát hành; luôn thêm version mới.
2. Migration phải forward-only và idempotent.
3. Thêm cột nullable hoặc có default trước, backfill sau.
4. Test cả DB rỗng và DB đang ở version ngay trước đó.

## Optional sync

`OptionalSyncCoordinator` nhận một `OptionalSyncAdapter`. Không truyền
adapter thì `syncOnce()` trả `disabled`; toàn bộ repository vẫn hoạt
động local.

Khi bổ sung cloud backup:

1. Luôn commit thay đổi vào local DB trước.
2. Nếu sync được bật, thêm mutation vào `sync_outbox`.
3. Adapter upload khi có mạng và acknowledge item thành công.
4. Không chặn màn hình hoặc thao tác local khi sync thất bại.
5. Mã hóa backup và để người dùng chủ động bật tài khoản/sync.
