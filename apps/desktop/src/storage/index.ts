import { initializeLocalDatabase } from "@lich-oi/core";

import { openDesktopDatabase } from "./tauri-sql-driver";

let repositoriesPromise: ReturnType<typeof initializeLocalDatabase> | undefined;

export async function initializeDesktopStorage() {
  repositoriesPromise ??= openDesktopDatabase().then(initializeLocalDatabase);
  return repositoriesPromise;
}

export * from "./tauri-sql-driver";
