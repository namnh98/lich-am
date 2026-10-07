import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const mobileDirectory = fileURLToPath(new URL("../", import.meta.url));
const rootDirectory = resolve(mobileDirectory, "../..");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, value) =>
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);

export function syncMobileVersion(command = "sync", explicitBuild) {
  const configPath = resolve(mobileDirectory, "app.json");
  const packagePath = resolve(mobileDirectory, "package.json");
  const lockPath = resolve(rootDirectory, "package-lock.json");
  const config = readJson(configPath);
  const pkg = readJson(packagePath);
  const lock = readJson(lockPath);
  const current = config.expo.version;
  const currentBuild = config.expo.android.versionCode;
  if (
    !/^\d+\.\d+\.\d+$/.test(current) ||
    !Number.isInteger(currentBuild) ||
    currentBuild < 1
  ) {
    throw new Error(
      "app.json cần version dạng x.y.z và versionCode nguyên dương.",
    );
  }
  let version = current;
  let build = currentBuild;
  if (["patch", "minor", "major"].includes(command)) {
    const parts = current.split(".").map(Number);
    const index = { major: 0, minor: 1, patch: 2 }[command];
    parts[index] += 1;
    for (let i = index + 1; i < parts.length; i++) parts[i] = 0;
    version = parts.join(".");
    build += 1;
  } else if (command === "build") {
    build += 1;
  } else if (command !== "sync") {
    if (!/^\d+\.\d+\.\d+$/.test(command))
      throw new Error(
        "Dùng sync, build, patch, minor, major hoặc x.y.z [buildCode].",
      );
    version = command;
    build =
      explicitBuild === undefined ? currentBuild + 1 : Number(explicitBuild);
  }
  if (
    explicitBuild !== undefined &&
    ["sync", "build", "patch", "minor", "major"].includes(command)
  ) {
    throw new Error("Chỉ truyền buildCode khi chỉ định version x.y.z.");
  }
  if (
    !Number.isInteger(build) ||
    build < currentBuild ||
    build > 2100000000 ||
    (version !== current && build <= currentBuild)
  ) {
    throw new Error(
      "Build code phải là số nguyên tăng dần, tối đa 2100000000.",
    );
  }
  config.expo.version = version;
  config.expo.android.versionCode = build;
  // Keep Expo iOS configuration aligned; native iOS projects need prebuild.
  config.expo.ios.buildNumber = String(build);
  pkg.version = version;
  lock.packages["apps/mobile"].version = version;
  writeJson(configPath, config);
  writeJson(packagePath, pkg);
  writeJson(lockPath, lock);
  console.log(`Mobile version: ${version} (${build})`);
  return { version, build };
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    if (process.argv.length > 4) throw new Error("Quá nhiều tham số.");
    syncMobileVersion(process.argv[2], process.argv[3]);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
