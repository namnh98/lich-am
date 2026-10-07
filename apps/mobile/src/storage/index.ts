import { initializeLocalDatabase } from "@lich-oi/core";

import { openMobileDatabase } from "./expo-sqlite-driver";

let repositoriesPromise: ReturnType<typeof initializeLocalDatabase> | undefined;

export async function initializeMobileStorage() {
  repositoriesPromise ??= openMobileDatabase().then(initializeLocalDatabase);
  return repositoriesPromise;
}

export * from "./expo-sqlite-driver";
