# Lịch Âm monorepo

Monorepo npm workspaces + Turborepo cho ứng dụng Lịch Âm trên mobile và desktop. Tên tạm thời là **Lịch Âm**; đổi `name`, `slug`, bundle identifier và product name trước khi phát hành.

## Cấu trúc

```text
.
├── apps
│   ├── mobile                 # Expo / React Native (iOS, Android)
│   │   ├── App.tsx
│   │   └── metro.config.js
│   └── desktop                # Tauri v2
│       ├── src                # React + Vite + react-native-web frontend
│       └── src-tauri          # Rust, Tauri config và capabilities
├── packages
│   ├── core                   # TypeScript thuần, không import React
│   └── ui                     # React Native components dùng chung
├── package.json               # npm workspaces và lệnh toàn repo
└── turbo.json                 # task graph dev/build/lint/test
```

`apps/desktop/src` import trực tiếp `@lich-oi/core` và `@lich-am/ui`. Vite ánh xạ `react-native` sang `react-native-web`, đồng thời cho phép đọc source nằm ngoài thư mục app. `apps/desktop/src-tauri` chỉ chứa phần native Rust.

## Bắt đầu

```bash
npm install
npm run test
npm run lint
npm run dev:mobile
```

## Firebase Authentication và phân phối bản thử nghiệm

Auth dùng email/mật khẩu trên mobile và desktop. Sao chép các biến trong
`apps/mobile/.env.example` và `apps/desktop/.env.example` vào `.env` tương ứng,
lấy Web config từ Firebase Console, rồi bật **Authentication → Email/Password**.
Firebase client config được nhúng trong app; không đặt service-account JSON hay
keystore password vào `.env` hoặc commit.

Workflow `Firebase App Distribution` chỉ phân phối APK Android (Firebase App
Distribution không phân phối ứng dụng desktop). Thêm các GitHub Actions
variables `EXPO_PUBLIC_FIREBASE_*`, `FIREBASE_ANDROID_APP_ID` và
`FIREBASE_TESTER_GROUP`; thêm các repository secrets
`ANDROID_KEYSTORE_BASE64`, `LICH_AM_ANDROID_KEYSTORE_PASSWORD`,
`LICH_AM_ANDROID_KEY_ALIAS`, `LICH_AM_ANDROID_KEY_PASSWORD` và
`FIREBASE_SERVICE_ACCOUNT_JSON`. Desktop tiếp tục build theo từng hệ điều hành
và được build/publish thành GitHub Release khi push tag `desktop-v*`; cần cấu hình
các GitHub Actions variables `VITE_FIREBASE_*`. Các gói desktop CI hiện chưa được
ký/notarize bằng chứng thư Apple hoặc chứng thư ký Windows.

Để chạy debug native trực tiếp trên Android hoặc iOS:

```bash
# Android: cần emulator đang chạy hoặc thiết bị USB đã bật USB debugging
npm run android --workspace=@lich-am/mobile

# iOS: cần Xcode và Simulator/thiết bị iOS
npm run ios --workspace=@lich-am/mobile
```

Nếu Metro hoặc native build giữ cache cũ, chạy lại với cache sạch:

```bash
npx expo start --clear --project-root apps/mobile
```

Repo dùng npm workspaces để Expo/Metro và Tauri dùng chung workspace
dependencies. Các version React/React Native vẫn được kiểm tra bằng
`npx expo install --check`.

Ở terminal khác, sau khi cài Rust và các dependency hệ điều hành:

```bash
npm run dev:desktop
```

Desktop chỉ hiện icon system tray/status bar khi bật tùy chọn ghim trong Cài đặt.
Bấm trái icon để mở lịch nhanh ngày âm, Can Chi và tiết khí; chọn **Mở lịch đầy đủ**
để mở cửa sổ chính. Bấm phải icon để mở menu hệ thống, hoặc dùng phím tắt
`CmdOrCtrl+Shift+L`. Khi đã ghim, nút đóng cửa sổ chính sẽ ẩn app xuống tray;
khi chưa ghim, đóng cửa sổ sẽ thoát ứng dụng.

Các lệnh root:

- `npm run dev:mobile`: mở Expo development server.
- `npm run dev:desktop`: chạy `tauri dev`; Tauri tự gọi Vite bằng `beforeDevCommand`.
- `npm run build`: Turborepo build tất cả workspace. Task desktop gọi đúng `tauri build`; hook `beforeBuildCommand` build frontend trước.
- `npm run lint`: typecheck từng workspace.
- `npm run test`: chạy test; package core có các test chuyển đổi âm–dương lịch.

Build mobile hiện dùng `expo export` để kiểm tra riêng bundle JavaScript
Android và iOS. Bản cài thật nên dùng EAS Build hoặc chạy `expo prebuild`
rồi build native trong CI. Web không nằm trong task mobile vì frontend
desktop đã dùng Vite + SQLite driver của Tauri.

## Trải nghiệm lịch và kiến trúc UI

Màn chính luôn hiển thị trọn một tháng, kể cả các ngày đệm ở đầu và cuối
lưới. Chạm tiêu đề tháng/năm để mở bộ chọn nhanh dạng bottom sheet (phạm vi
±5 năm); chạm một ngày để mở chi tiết ngày dương, ngày âm, Can Chi và giờ
hoàng đạo trong bottom sheet riêng. Cài đặt được mở từ nút trên header và chỉ
giữ các tùy chọn giao diện, widget — không còn chế độ lịch tuần.

Source UI dùng hướng MVVM: các màn hình chỉ compose component trình bày, còn
state và hành động nằm trong các hook `use*ViewModel`. Component lịch, modal,
cài đặt và primitive bottom sheet được tách thành file riêng trong
`packages/ui/src/calendar-app` và `packages/ui/src/primitives`.

Asset nguồn của app icon nằm tại `apps/mobile/assets/app-icon.png`. Expo dùng
asset này để sinh launcher icon thường và adaptive icon Android khi chạy
`expo prebuild`. Desktop dùng cùng asset; chạy `npm run icons
--workspace=@lich-am/desktop`
khi thay logo để sinh lại `.icns`, `.ico` và các
kích thước PNG cho Tauri.

## Widget màn hình chính

Mobile có widget **Lịch Việt** trên Android và iOS, hiển thị ngày dương, ngày
âm và Can Chi theo hai kiểu gọn/chi tiết. Android dùng `AppWidgetProvider` và
`RemoteViews` trong Expo local module; iOS dùng `expo-widgets`. Vì có native
code, widget không xuất hiện trong Expo Go. Hãy cài development/release build,
sau đó nhấn giữ màn hình chính và chọn **Lịch Việt** trong thư viện widget.

Hai nền tảng dùng chung bộ tạo timeline 32 ngày. Timeline được đồng bộ khi app
mở và khi đổi kiểu widget trong Cài đặt; Android cũng tự render lại khi đổi
ngày, múi giờ hoặc ngôn ngữ hệ thống.

Trên Android có hai static shortcut khi nhấn giữ icon app:

- **Thêm widget**: mở thẳng hộp thoại pin widget do launcher quản lý.
- **Tùy chỉnh**: mở trực tiếp phần Widget trong màn Cài đặt.

`android:targetPackage` trong XML shortcut phải là tên package trực tiếp, không dùng
`@string`. Module widget dùng XML trong `src/main/res/xml` cho release và bản
ghi đè trong `src/debug/res/xml` cho package `.debug`; khi sửa shortcut cần cập
nhật cả hai file.

Trong Cài đặt Android cũng có nút **Thêm ra màn hình chính** dùng cùng native
pin flow. Một số launcher không hỗ trợ pin tự động; app sẽ hướng dẫn thêm widget
thủ công trong trường hợp đó. Trên iOS, nút **Xem cách thêm widget** hiển thị
các bước mở thư viện widget của hệ thống; iOS không cho ứng dụng tự ghim widget
lên màn hình chính.

## Quản lý version mobile

`apps/mobile/app.json` là nguồn version chính. Android Gradle đọc trực tiếp
`expo.version` → `versionName` và `expo.android.versionCode` → `versionCode`.
Không cần sửa số version trong `android/app/build.gradle`.
Trước đây Gradle ghi cứng `0.1.1 (2)`, nên chỉ sửa app.json không đổi version APK/AAB.

Chạy từ thư mục gốc repo:

```bash
# Đồng bộ version đã sửa trong app.json, không tăng số (hiện tại 0.1.2 (3))
npm run version:mobile -- sync

# Release bản vá tiếp theo: 0.1.2 (3) → 0.1.3 (4)
npm run version:mobile -- patch

# Chỉ tăng build code: 0.1.2 (3) → 0.1.2 (4)
npm run version:mobile -- build

# Hoặc đặt version và build code cụ thể
npm run version:mobile -- 0.2.0 10

# Sau đó build với signing config đã thiết lập
npm run release:android:apk
# Hoặc AAB cho Google Play
npm run release:android
```

Các ví dụ tăng version ở trên là những lựa chọn thay thế, không cần chạy lần lượt.
Có thể dùng `minor` hoặc `major` thay `patch`. Script cập nhật app.json,
package.json mobile và workspace tương ứng trong package-lock.json; đồng bộ cả
`expo.ios.buildNumber`. Nếu tạo lại native iOS, chạy Expo prebuild để áp dụng cấu hình đó.

Mỗi lần phát hành Android mới cần tăng `versionCode` so với bản đã phát hành.
Lệnh build không tự tăng số: có thể build lại khi lỗi hoặc tạo APK và AAB cùng một
release mà vẫn giữ chung version. Script release tự chạy bước `sync` trước Gradle.
Nếu chạy `expo prebuild --clean`, kiểm tra lại phần đọc app.json trong Gradle vì
lệnh này tạo lại dự án native và có thể thay thế các chỉnh sửa native hiện có.

Kiểm tra version mà Gradle thực sự sử dụng, không cần ký hoặc build APK:

```bash
cd apps/mobile/android
./gradlew :app:printAppVersion --quiet
# Android version: 0.1.2 (3)
```

## Build release nhanh

Các shortcut chạy từ thư mục root:

```bash
# Android App Bundle cho Play Console
npm run release:android

# Android APK release để phân phối trực tiếp
npm run release:android:apk

# iOS local Release build trên macOS
npm run release:ios

# Tauri macOS (.app và .dmg), chỉ chạy trên macOS
npm run release:macos

# Tauri Windows (.msi và NSIS), chỉ chạy trên Windows
npm run release:windows
```

Android release script từ chối build nếu thiếu signing config, tránh tạo nhầm
artifact production bằng debug key. Cấu hình bốn biến môi trường sau trước khi
chạy:

```bash
export LICH_AM_ANDROID_KEYSTORE="/duong-dan/lich-am-upload.jks"
export LICH_AM_ANDROID_KEYSTORE_PASSWORD="..."
export LICH_AM_ANDROID_KEY_ALIAS="..."
export LICH_AM_ANDROID_KEY_PASSWORD="..."
```

Artifact Android nằm trong `apps/mobile/android/app/build/outputs/bundle/release`
hoặc `apps/mobile/android/app/build/outputs/apk/release`. Lệnh iOS tạo local
Release build; để phát hành App Store vẫn cần archive/sign bằng Xcode hoặc dịch
vụ build có Apple Distribution certificate. Tauri chỉ tạo bundle cho hệ điều
hành hiện tại, vì vậy `.dmg` cần macOS và `.msi`/NSIS cần Windows.

## Core dùng chung

`packages/core` không import React hay React Native:

- `calendar.ts`: chuyển đổi âm–dương lịch theo phép tính thiên văn Jean Meeus, mặc định múi giờ Việt Nam UTC+7; tính Can Chi và giờ hoàng đạo.
- `storage/`: schema, migration và repository thuần TypeScript. Mobile
  cung cấp driver `expo-sqlite`; desktop cung cấp driver
  `tauri-plugin-sql`.
- `store.ts`: store Zustand từ `zustand/vanilla`. UI React có thể kết nối bằng `useSyncExternalStore` hoặc `useStore` ở phía app.
- `api-client.ts`: client JSON dựa trên chuẩn `fetch`, cho phép inject implementation khi test.

Thuật toán nên được đối soát thêm với bảng lịch đã thẩm định trước khi dùng cho nghiệp vụ nhạy cảm, đặc biệt ngày lịch sử, tháng nhuận và người dùng ngoài UTC+7.

## Expo trong monorepo và lỗi resolve thường gặp

Expo SDK 52 trở lên tự phát hiện npm workspaces khi `metro.config.js` kế thừa `expo/metro-config`. Vì vậy cấu hình hiện tại cố ý tối giản:

```js
const { getDefaultConfig } = require("expo/metro-config");
module.exports = getDefaultConfig(__dirname);
```

Không thêm đồng thời `watchFolders`, `resolver.nodeModulesPaths`, `resolver.extraNodeModules` hay `disableHierarchicalLookup` theo các bài hướng dẫn cũ. Những cấu hình đó có thể khiến Metro nạp hai bản React/React Native, dẫn đến `Invalid hook call`, hoặc resolve nhầm package đã hoist.

Nếu buộc phải dùng Expo SDK 51 trở xuống, cấu hình legacy thường cần theo dõi workspace root:

```js
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
module.exports = config;
```

Khi đổi Metro config hoặc dependency:

```bash
npm run dev:mobile -- --clear
```

Checklist khi lỗi `Unable to resolve module`:

1. Chạy `npm install` tại root, không cài riêng trong `apps/mobile`.
2. Kiểm tra tên import đúng với `name`/`exports` trong package workspace.
3. Chỉ giữ một version React và React Native; các package UI dùng chúng dưới dạng peer dependency.
4. Xóa cache Metro bằng `--clear`; nếu vẫn lỗi mới kiểm tra symlink và lockfile.
5. Không import file native-only (`.ios.ts`, `.android.ts`) từ package UI nếu desktop cũng sử dụng package đó.

## Yêu cầu riêng của Tauri

Tauri cần Node cho frontend và Rust stable cho phần native:

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
rustup default stable
```

Yêu cầu theo hệ điều hành:

- **macOS:** Xcode Command Line Tools (`xcode-select --install`). Build và ký `.app`/`.dmg` cần chạy trên macOS.
- **Windows:** Microsoft C++ Build Tools với workload “Desktop development with C++”, Windows SDK và WebView2. Phần lớn Windows 10/11 đã có WebView2 runtime.
- **Linux (Debian/Ubuntu):** WebKitGTK 4.1 cùng toolchain hệ thống. Ví dụ: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libxdo-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`. Tên package khác nhau theo distro.

Tauri tạo bundle cho hệ điều hành đang chạy; muốn phát hành đủ Windows/macOS/Linux, nên dùng CI matrix trên cả ba OS. Không thể cross-build mọi bundle chỉ từ một máy.

## Tài liệu nền

- [Expo: Work with monorepos](https://docs.expo.dev/guides/monorepos/)
- [Expo: Metro configuration](https://docs.expo.dev/guides/customizing-metro/)
- [Tauri: Vite frontend](https://v2.tauri.app/start/frontend/vite/)
- [Tauri: Prerequisites](https://v2.tauri.app/start/prerequisites/)
- [Turborepo configuration](https://turborepo.com/docs/reference/configuration)

### Debug widget Android và lỗi cache launcher

`npm run android --workspace=@lich-am/mobile` cài bản **Lịch Âm Debug**
(`com.licham.mobile.debug`) riêng với release, không cần gỡ release hoặc xóa ghi chú.
Trong Cài đặt của bản debug, chọn **Thêm ra màn hình chính** để kiểm tra widget debug.

Nếu sau cập nhật APK launcher báo “Sự cố tải tiện ích”, kiểm tra log:

```bash
adb logcat -d -s AppWidgetHostView RemoteViews AndroidRuntime
```

Trên thiết bị itel đã kiểm tra, log `Package name com.licham.mobile not found`
kèm `Resources$NotFoundException` trong khi package vẫn được cài là cache cũ của
launcher. Khởi động lại launcher đã khôi phục widget mà không gỡ app/xóa dữ liệu.
Có thể khởi động lại điện thoại; riêng launcher itel này có thể dùng:

```bash
adb shell am force-stop com.transsion.itel.launcher
adb shell am start -a android.intent.action.MAIN -c android.intent.category.HOME
```

Provider cũng xử lý `MY_PACKAGE_REPLACED` để gửi lại giao diện widget sau cập nhật.
Việc này không bảo đảm sửa được cache riêng của mọi launcher OEM; nếu log vẫn báo
không tìm thấy package sau cập nhật, thực hiện bước khởi động lại launcher ở trên.
