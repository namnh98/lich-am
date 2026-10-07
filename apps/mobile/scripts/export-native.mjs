import { spawn } from "node:child_process";

for (const platform of ["android", "ios"]) {
  await runExpoExport(platform);
}

function runExpoExport(platform) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  return new Promise((resolve, reject) => {
    const child = spawn(
      command,
      [
        "expo",
        "export",
        "--platform",
        platform,
        "--output-dir",
        "dist/" + platform,
      ],
      { env: { ...process.env, NODE_ENV: "development" }, stdio: "inherit" },
    );
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            "Expo " + platform + " export failed with exit code " + code,
          ),
        );
    });
  });
}
