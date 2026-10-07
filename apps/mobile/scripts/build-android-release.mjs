import { syncMobileVersion } from "./mobile-version.mjs";

import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REQUIRED_SIGNING_VARIABLES = [
  "LICH_AM_ANDROID_KEYSTORE",
  "LICH_AM_ANDROID_KEYSTORE_PASSWORD",
  "LICH_AM_ANDROID_KEY_ALIAS",
  "LICH_AM_ANDROID_KEY_PASSWORD",
];

const missingVariables = REQUIRED_SIGNING_VARIABLES.filter((name) => !process.env[name]);
if (missingVariables.length > 0) {
  console.error(`Thiếu biến môi trường ký Android: ${missingVariables.join(", ")}`);
  console.error("Xem mục Build release trong README.md để cấu hình keystore.");
  process.exit(1);
}

syncMobileVersion();

const androidDirectory = fileURLToPath(new URL("../android", import.meta.url));
const embeddedBundle = fileURLToPath(
  new URL("../android/app/build/generated/assets/react/release/index.android.bundle", import.meta.url),
);
const buildApk = process.argv.includes("--apk");
const task = buildApk ? "app:assembleRelease" : "app:bundleRelease";
const gradleWrapper = process.platform === "win32" ? "gradlew.bat" : "./gradlew";

// The shared UI package lives outside apps/mobile. Removing this generated
// output makes Gradle ask Metro for a fresh bundle without rebuilding every
// native dependency.
rmSync(embeddedBundle, { force: true });

const result = spawnSync(gradleWrapper, [task], {
  cwd: androidDirectory,
  env: { ...process.env, NODE_ENV: "production" },
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
