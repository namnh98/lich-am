#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const mobileDir = resolve(rootDir, "apps/mobile");
const desktopDir = resolve(rootDir, "apps/desktop");
const tauriDir = resolve(desktopDir, "src-tauri");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--allow-debug-signing") {
      options.allowDebugSigning = true;
    } else if (arg === "--version" || arg === "-v") {
      options.version = args[++i];
    } else if (arg === "--build-number" || arg === "-b") {
      options.buildNumber = args[++i];
    } else if (arg === "--bump") {
      options.bump = args[++i];
    } else if (arg === "--target" || arg === "-t") {
      options.target = args[++i];
    } else if (arg === "--variant") {
      options.variant = args[++i];
    } else if (arg === "--android-format") {
      options.androidFormat = args[++i];
    } else if (arg === "--desktop-bundles") {
      options.desktopBundles = args[++i];
    } else if (arg.startsWith("--version=")) {
      options.version = arg.split("=")[1];
    } else if (arg.startsWith("--build-number=")) {
      options.buildNumber = arg.split("=")[1];
    } else if (arg.startsWith("--bump=")) {
      options.bump = arg.split("=")[1];
    } else if (arg.startsWith("--target=")) {
      options.target = arg.split("=")[1];
    } else if (arg.startsWith("--variant=")) {
      options.variant = arg.split("=")[1];
    }
  }

  return options;
}

function printHelp() {
  console.log(`
========================================================================
🚀 LỊCH ÂM - JENKINS-STYLE BUILD PIPELINE & VERSION CONFIGURATION
========================================================================

Usage:
  node scripts/pipeline.mjs [OPTIONS]

Options / Jenkins Parameters:
  --target, -t <all|android|desktop>   Build target (default: 'all' or TARGET env)
  --version, -v <semver>               Explicit version e.g. 0.2.0 (VERSION env)
  --bump <patch|minor|major>           Bump version automatically (BUMP env)
  --build-number, -b <int>             Explicit build code/number (BUILD_NUMBER env)
  --variant <release|debug>            Build variant (default: 'release' or VARIANT env)
  --android-format <apk|aab>           Android artifact type (default: 'apk')
  --desktop-bundles <app|dmg|all>      Desktop bundle type (default: 'app')
  --allow-debug-signing                Fallback to debug.keystore if release key missing (default: true)
  --dry-run                            Only configure and sync versions, skip compiling
  --help, -h                           Show this help message

Environment Variables (Jenkins Parameter Mapping):
  TARGET               Target platform: 'all', 'android', 'desktop'
  VERSION              Explicit semantic version (e.g. '0.2.0')
  BUMP                 Bump type: 'patch', 'minor', 'major', 'none'
  BUILD_NUMBER         Build number/code integer (e.g. '7')
  VARIANT / BUILD_TYPE 'release' or 'debug'
  ANDROID_FORMAT       'apk' or 'aab'
  DESKTOP_BUNDLES      'app' or 'dmg'
  ALLOW_DEBUG_SIGNING  'true' or 'false'
  DRY_RUN              'true' or 'false'

Examples:
  # Jenkins standard parameter build:
  TARGET=all BUMP=minor npm run build:pipeline

  # Explicit version & build number:
  npm run build:pipeline -- --version 0.2.0 --build-number 7 --target all

  # Sync version only without building:
  npm run build:pipeline -- --version 0.2.0 --dry-run
========================================================================
`);
}

function calculateNextVersion(currentVersion, currentBuildNumber, bumpType, explicitVersion, explicitBuild) {
  let nextVersion = currentVersion;
  let nextBuild = currentBuildNumber;

  if (explicitVersion) {
    if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(explicitVersion)) {
      throw new Error(`Phiên bản '${explicitVersion}' không hợp lệ (cần SemVer x.y.z).`);
    }
    nextVersion = explicitVersion;
    nextBuild = explicitBuild ? parseInt(explicitBuild, 10) : currentBuildNumber + 1;
  } else if (bumpType && bumpType !== "none") {
    const parts = currentVersion.split("-")[0].split(".").map(Number);
    if (bumpType === "major") {
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
    } else if (bumpType === "minor") {
      parts[1] += 1;
      parts[2] = 0;
    } else if (bumpType === "patch") {
      parts[2] += 1;
    } else {
      throw new Error(`Loại bump không hợp lệ: '${bumpType}'. Chọn 'patch', 'minor', hoặc 'major'.`);
    }
    nextVersion = parts.join(".");
    nextBuild = explicitBuild ? parseInt(explicitBuild, 10) : currentBuildNumber + 1;
  } else if (explicitBuild) {
    nextBuild = parseInt(explicitBuild, 10);
  }

  if (explicitBuild) {
    const parsed = parseInt(explicitBuild, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new Error(`Build number '${explicitBuild}' phải là số nguyên dương.`);
    }
    nextBuild = parsed;
  }

  return { nextVersion, nextBuild };
}

function syncVersions(version, buildNumber) {
  console.log(`\n📦 [STAGE 1: VERSION SYNC] Đồng bộ hóa phiên bản v${version} (Build ${buildNumber})...`);

  // 1. Root package.json
  const rootPkgPath = resolve(rootDir, "package.json");
  const rootPkg = readJson(rootPkgPath);
  rootPkg.version = version;
  writeJson(rootPkgPath, rootPkg);

  // 2. Root package-lock.json (if exists)
  const lockPath = resolve(rootDir, "package-lock.json");
  if (existsSync(lockPath)) {
    const lock = readJson(lockPath);
    lock.version = version;
    if (lock.packages?.[""]) {
      lock.packages[""].version = version;
    }
    if (lock.packages?.["apps/mobile"]) {
      lock.packages["apps/mobile"].version = version;
    }
    if (lock.packages?.["apps/desktop"]) {
      lock.packages["apps/desktop"].version = version;
    }
    writeJson(lockPath, lock);
  }

  // 3. Mobile app.json
  const appJsonPath = resolve(mobileDir, "app.json");
  const appJson = readJson(appJsonPath);
  appJson.expo.version = version;
  appJson.expo.android.versionCode = buildNumber;
  appJson.expo.ios.buildNumber = String(buildNumber);
  writeJson(appJsonPath, appJson);

  // 4. Mobile package.json
  const mobilePkgPath = resolve(mobileDir, "package.json");
  const mobilePkg = readJson(mobilePkgPath);
  mobilePkg.version = version;
  writeJson(mobilePkgPath, mobilePkg);

  // 5. Desktop package.json
  const desktopPkgPath = resolve(desktopDir, "package.json");
  const desktopPkg = readJson(desktopPkgPath);
  desktopPkg.version = version;
  writeJson(desktopPkgPath, desktopPkg);

  // 6. Desktop tauri.conf.json
  const tauriConfPath = resolve(tauriDir, "tauri.conf.json");
  const tauriConf = readJson(tauriConfPath);
  tauriConf.version = version;
  writeJson(tauriConfPath, tauriConf);

  // 7. Desktop Cargo.toml
  const cargoTomlPath = resolve(tauriDir, "Cargo.toml");
  let cargoContent = readFileSync(cargoTomlPath, "utf8");
  cargoContent = cargoContent.replace(
    /(\[package\][\s\S]*?version\s*=\s*")[^"]+(")/,
    `$1${version}$2`,
  );
  writeFileSync(cargoTomlPath, cargoContent, "utf8");

  console.log(`   ✓ Root:            package.json (v${version})`);
  console.log(`   ✓ Mobile:          app.json (v${version}, code ${buildNumber})`);
  console.log(`   ✓ Mobile package:  package.json (v${version})`);
  console.log(`   ✓ Desktop Tauri:   tauri.conf.json (v${version})`);
  console.log(`   ✓ Desktop Rust:    Cargo.toml (v${version})`);
  console.log(`   ✓ Desktop package: package.json (v${version})`);
}

function buildAndroid({ variant, format, allowDebugSigning }) {
  console.log(`\n🤖 [STAGE 2: ANDROID BUILD] Bắt đầu build Android (${variant}, format: ${format})...`);
  const androidAppDir = resolve(mobileDir, "android");
  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";

  // Clean stale bundle to ensure fresh Metro assets
  const embeddedBundle = resolve(
    androidAppDir,
    "app/build/generated/assets/react/release/index.android.bundle",
  );
  rmSync(embeddedBundle, { force: true });

  const gradleTask =
    variant === "debug"
      ? ":app:assembleDebug"
      : format === "aab"
        ? ":app:bundleRelease"
        : ":app:assembleRelease";

  const env = {
    ...process.env,
    NODE_ENV: variant === "debug" ? "development" : "production",
    ALLOW_DEBUG_SIGNING: allowDebugSigning ? "true" : "false",
  };

  console.log(`   ▶ Chạy lệnh Gradle: ${gradlew} --no-daemon ${gradleTask}`);
  const result = spawnSync(gradlew, ["--no-daemon", gradleTask], {
    cwd: androidAppDir,
    env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Android build thất bại với exit code ${result.status}`);
  }

  // Locate output artifact
  let outputArtifactPath = null;
  if (variant === "debug") {
    outputArtifactPath = resolve(androidAppDir, "app/build/outputs/apk/debug/app-debug.apk");
  } else if (format === "aab") {
    outputArtifactPath = resolve(androidAppDir, "app/build/outputs/bundle/release/app-release.aab");
  } else {
    outputArtifactPath = resolve(androidAppDir, "app/build/outputs/apk/release/app-release.apk");
    const releaseApkDir = resolve(androidAppDir, "app/build/outputs/apk/release");
    if (existsSync(releaseApkDir)) {
      const apks = readdirSync(releaseApkDir).filter((file) => file.endsWith(".apk"));
      if (apks.length > 0) {
        console.log(`\n📦 Danh sách Android APK xuất ra (${apks.length} file):`);
        for (const file of apks) {
          const filePath = resolve(releaseApkDir, file);
          const stat = statSync(filePath);
          console.log(`   ✓ ${file.padEnd(35)} : ${formatBytes(stat.size)}`);
        }
        if (!existsSync(outputArtifactPath)) {
          outputArtifactPath = resolve(releaseApkDir, apks[0]);
        }
      }
    }
  }

  if (existsSync(outputArtifactPath)) {
    const stat = statSync(outputArtifactPath);
    console.log(`   🎉 Android build thành công: ${outputArtifactPath} (${formatBytes(stat.size)})`);
    return { path: outputArtifactPath, size: stat.size };
  } else {
    console.warn(`   ⚠️ Không tìm thấy file artifact tại ${outputArtifactPath}`);
    return null;
  }
}

function buildDesktop({ variant, bundles }) {
  console.log(`\n🖥️ [STAGE 3: MACOS DESKTOP BUILD] Bắt đầu build Desktop macOS (${variant}, bundles: ${bundles})...`);

  // First build frontend web assets
  console.log("   ▶ Biên dịch Frontend Web (Vite)...");
  const webBuildResult = spawnSync("pnpm", ["run", "build:web"], {
    cwd: desktopDir,
    shell: true,
    stdio: "inherit",
  });

  if (webBuildResult.status !== 0) {
    throw new Error(`Desktop frontend build thất bại với exit code ${webBuildResult.status}`);
  }

  // Then build Tauri app bundle
  const tauriArgs = ["tauri", "build", "--bundles", bundles, "--no-sign"];
  if (variant === "debug") {
    tauriArgs.push("--debug");
  }

  console.log(`   ▶ Chạy Tauri build: npx ${tauriArgs.join(" ")}`);
  const tauriResult = spawnSync("npx", tauriArgs, {
    cwd: desktopDir,
    shell: true,
    stdio: "inherit",
  });

  if (tauriResult.status !== 0) {
    throw new Error(`Desktop Tauri build thất bại với exit code ${tauriResult.status}`);
  }

  const targetDirName = variant === "debug" ? "debug" : "release";
  const appPath = resolve(tauriDir, `target/${targetDirName}/bundle/macos/Lịch Âm.app`);

  if (existsSync(appPath)) {
    console.log(`   🎉 macOS App build thành công: ${appPath}`);
    return { path: appPath };
  } else {
    console.warn(`   ⚠️ Không tìm thấy file .app tại ${appPath}`);
    return null;
  }
}

function main() {
  const cliArgs = parseCliArgs();
  if (cliArgs.help) {
    printHelp();
    return;
  }

  // Parameter resolution (CLI arg takes precedence over ENV var, then defaults)
  const target = (cliArgs.target || process.env.TARGET || "all").toLowerCase();
  const bump = (cliArgs.bump || process.env.BUMP || "").toLowerCase();
  const explicitVersion = cliArgs.version || process.env.VERSION || null;
  const explicitBuild = cliArgs.buildNumber || process.env.BUILD_NUMBER || null;
  const variant = (cliArgs.variant || process.env.VARIANT || process.env.BUILD_TYPE || "release").toLowerCase();
  const androidFormat = (cliArgs.androidFormat || process.env.ANDROID_FORMAT || "apk").toLowerCase();
  const desktopBundles = (cliArgs.desktopBundles || process.env.DESKTOP_BUNDLES || "app").toLowerCase();
  const allowDebugSigning =
    cliArgs.allowDebugSigning !== undefined
      ? cliArgs.allowDebugSigning
      : process.env.ALLOW_DEBUG_SIGNING !== "false";
  const dryRun =
    cliArgs.dryRun ||
    process.env.DRY_RUN === "true" ||
    process.env.DRY_RUN === "1";

  // Read current version state
  const mobileAppJson = readJson(resolve(mobileDir, "app.json"));
  const desktopPkg = readJson(resolve(desktopDir, "package.json"));
  const currentVersion = mobileAppJson.expo.version || desktopPkg.version || "0.1.0";
  const currentBuildNumber = mobileAppJson.expo.android.versionCode || 1;

  // Compute next version
  let effectiveBump = bump;
  if (!explicitVersion && !bump && !explicitBuild) {
    // Default Jenkins behavior: bump patch if building without arguments
    effectiveBump = "patch";
  }

  const { nextVersion, nextBuild } = calculateNextVersion(
    currentVersion,
    currentBuildNumber,
    effectiveBump,
    explicitVersion,
    explicitBuild,
  );

  console.log(`
========================================================================
🚀 LỊCH ÂM - BUILD PIPELINE (JENKINS-STYLE CONFIGURATION)
========================================================================
[PIPELINE PARAMETERS]
  • Target Platform:      ${target}
  • Version Bump:         ${effectiveBump || "none"}
  • Target Version:       ${nextVersion} (hiện tại: ${currentVersion})
  • Target Build Number:  ${nextBuild} (hiện tại: ${currentBuildNumber})
  • Build Variant:        ${variant}
  • Android Format:       ${androidFormat}
  • Desktop Bundles:      ${desktopBundles}
  • Allow Debug Signing:  ${allowDebugSigning}
  • Dry Run:              ${dryRun}
========================================================================`);

  const startTime = Date.now();

  // STAGE 1: VERSION SYNC
  syncVersions(nextVersion, nextBuild);

  if (dryRun) {
    console.log("\n[DRY RUN HOÀN TẤT] Phiên bản đã được cập nhật, bỏ qua bước biên dịch.");
    return;
  }

  const artifacts = [];

  // STAGE 2: ANDROID BUILD
  if (target === "all" || target === "android" || target === "mobile") {
    const androidArtifact = buildAndroid({
      variant,
      format: androidFormat,
      allowDebugSigning,
    });
    if (androidArtifact) artifacts.push({ type: "Android", ...androidArtifact });
  }

  // STAGE 3: DESKTOP BUILD
  if (target === "all" || target === "desktop") {
    const desktopArtifact = buildDesktop({
      variant,
      bundles: desktopBundles,
    });
    if (desktopArtifact) artifacts.push({ type: "macOS Desktop", ...desktopArtifact });
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);

  // STAGE 4: SUMMARY
  console.log(`
========================================================================
✅ PIPELINE BUILD SUCCESSFUL! (${durationSec}s)
========================================================================
[GENERATED ARTIFACTS v${nextVersion} (Build ${nextBuild})]`);

  for (const art of artifacts) {
    const sizeStr = art.size ? ` (${formatBytes(art.size)})` : "";
    console.log(`  • [${art.type}]: ${art.path}${sizeStr}`);
  }

  console.log(`========================================================================\n`);
}

main();
