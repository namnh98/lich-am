#!/usr/bin/env node
import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const args = process.argv.slice(2);
const filePath = args.find((a) => !a.startsWith("-"));

if (!filePath) {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║               LỊCH VIỆT - FIREBASE SETUP CLI                     ║
╚══════════════════════════════════════════════════════════════════╝

Sử dụng:
  node scripts/setup-firebase.mjs <đường_dẫn_tới_google-services.json>
  node scripts/setup-firebase.mjs <đường_dẫn_tới_firebase-config.json>

Script sẽ tự động:
  1. Copy google-services.json vào apps/mobile/android/app/
  2. Trích xuất thông tin Firebase và sinh file apps/mobile/.env
  3. Trích xuất thông tin Firebase và sinh file apps/desktop/.env
  4. Hướng dẫn các biến cấu hình cho GitHub CI/CD & App Distribution.
`);
  process.exit(0);
}

const resolvedPath = resolve(process.cwd(), filePath);
if (!existsSync(resolvedPath)) {
  console.error(`❌ Không tìm thấy file: ${resolvedPath}`);
  process.exit(1);
}

try {
  const content = JSON.parse(readFileSync(resolvedPath, "utf8"));

  // Check if it's google-services.json
  if (content.project_info && content.client) {
    const projectInfo = content.project_info;
    const client = content.client[0];
    const apiKey = client?.api_key?.[0]?.current_key || "";
    const appId = client?.client_info?.mobilesdk_app_id || "";
    const projectId = projectInfo.project_id || "";
    const storageBucket =
      projectInfo.storage_bucket || `${projectId}.appspot.com`;
    const messagingSenderId = projectInfo.project_number || "";
    const authDomain = `${projectId}.firebaseapp.com`;

    console.log(`✔ Đã nhận diện google-services.json cho dự án: ${projectId}`);

    // 1. Copy to android app
    const androidAppDir = resolve(rootDir, "apps/mobile/android/app");
    if (existsSync(androidAppDir)) {
      copyFileSync(
        resolvedPath,
        resolve(androidAppDir, "google-services.json"),
      );
      console.log(
        `✔ Đã sao chép vào apps/mobile/android/app/google-services.json`,
      );
    }

    // 2. Write mobile .env
    const mobileEnv = `EXPO_PUBLIC_FIREBASE_API_KEY=${apiKey}
EXPO_PUBLIC_FIREBASE_APP_ID=${appId}
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=${authDomain}
EXPO_PUBLIC_FIREBASE_PROJECT_ID=${projectId}
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=${storageBucket}
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
`;
    writeFileSync(resolve(rootDir, "apps/mobile/.env"), mobileEnv, "utf8");
    console.log(`✔ Đã tạo file cấu hình apps/mobile/.env`);

    // 3. Write desktop .env
    const desktopEnv = `VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_APP_ID=${appId}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
`;
    writeFileSync(resolve(rootDir, "apps/desktop/.env"), desktopEnv, "utf8");
    console.log(`✔ Đã tạo file cấu hình apps/desktop/.env`);

    console.log(`
🎉 CẤU HÌNH FIREBASE THÀNH CÔNG!
Các biến môi trường đã được áp dụng đồng bộ cho cả Mobile App và Desktop App.

📋 CÁC BIẾN CẦN THÊM VÀO GITHUB ACTIONS (Settings -> Secrets and variables -> Actions):
--------------------------------------------------------------------------------
1. Repository Variables (vars):
   - EXPO_PUBLIC_FIREBASE_API_KEY: ${apiKey}
   - EXPO_PUBLIC_FIREBASE_APP_ID: ${appId}
   - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: ${authDomain}
   - EXPO_PUBLIC_FIREBASE_PROJECT_ID: ${projectId}
   - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: ${storageBucket}
   - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${messagingSenderId}
   - FIREBASE_ANDROID_APP_ID: ${appId}
   - FIREBASE_TESTER_GROUP: testers

2. Repository Secrets (secrets):
   - FIREBASE_SERVICE_ACCOUNT_JSON: (Nội dung file JSON service account tải từ Firebase Console -> Project Settings -> Service accounts)
   - ANDROID_KEYSTORE_BASE64: (Base64 chuỗi của release keystore)
   - LICH_AM_ANDROID_KEYSTORE_PASSWORD
   - LICH_AM_ANDROID_KEY_ALIAS
   - LICH_AM_ANDROID_KEY_PASSWORD
`);
  } else if (content.apiKey && content.projectId) {
    // Web config JSON
    const apiKey = content.apiKey;
    const appId = content.appId;
    const projectId = content.projectId;
    const authDomain = content.authDomain || `${projectId}.firebaseapp.com`;
    const storageBucket = content.storageBucket || `${projectId}.appspot.com`;
    const messagingSenderId = content.messagingSenderId || "";

    const mobileEnv = `EXPO_PUBLIC_FIREBASE_API_KEY=${apiKey}
EXPO_PUBLIC_FIREBASE_APP_ID=${appId}
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=${authDomain}
EXPO_PUBLIC_FIREBASE_PROJECT_ID=${projectId}
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=${storageBucket}
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
`;
    writeFileSync(resolve(rootDir, "apps/mobile/.env"), mobileEnv, "utf8");
    console.log(`✔ Đã tạo file cấu hình apps/mobile/.env`);

    const desktopEnv = `VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_APP_ID=${appId}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
`;
    writeFileSync(resolve(rootDir, "apps/desktop/.env"), desktopEnv, "utf8");
    console.log(`✔ Đã tạo file cấu hình apps/desktop/.env`);
    console.log(`🎉 Cấu hình Web Firebase thành công!`);
  } else {
    console.error(
      "❌ File JSON không đúng định dạng Firebase (google-services.json hoặc web config).",
    );
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Lỗi khi xử lý file:", error.message);
  process.exit(1);
}
