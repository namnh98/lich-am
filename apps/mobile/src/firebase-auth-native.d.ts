import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  // Firebase's React Native runtime exports this API via package conditions, but
  // its default public type entry does not include the React Native-only export.
  export function getReactNativePersistence(storage: {
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<void>;
    setItem: (key: string, value: string) => Promise<void>;
  }): Persistence;
}
