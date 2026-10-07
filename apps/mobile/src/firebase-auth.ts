import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
} from "firebase/auth";
import type { AuthService, AuthUser } from "@lich-am/ui";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const configured = Boolean(config.apiKey && config.appId && config.projectId);
let auth: Auth | undefined;

if (configured) {
  const app = getApps().length ? getApp() : initializeApp(config);
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "auth/already-initialized"
    ) {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }
}

const configuredAuth = auth;

function toAuthUser(user?: Auth["currentUser"] | null): AuthUser | null {
  if (!user) return null;
  return {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid,
    isAnonymous: user.isAnonymous,
  };
}

const activeListeners = new Set<(user: AuthUser | null) => void>();

function broadcastAuthState() {
  const currentUser = configuredAuth?.currentUser;
  const authUser = toAuthUser(currentUser);
  for (const listener of activeListeners) {
    listener(authUser);
  }
}

export const firebaseAuthService: AuthService | undefined = configuredAuth
  ? {
      subscribe: (listener) => {
        activeListeners.add(listener);
        const unsubscribe = onAuthStateChanged(
          configuredAuth,
          (user) => {
            listener(toAuthUser(user));
          },
          (error) => console.error("Firebase auth state listener failed", error),
        );
        return () => {
          activeListeners.delete(listener);
          unsubscribe();
        };
      },
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(configuredAuth, email, password);
      },
      createAccount: async (email, password) => {
        await createUserWithEmailAndPassword(configuredAuth, email, password);
      },
      signInAnonymously: async () => {
        await signInAnonymously(configuredAuth);
      },
      signOut: async () => {
        await signOut(configuredAuth);
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(configuredAuth, email);
      },
      updateProfile: async (profile) => {
        if (!configuredAuth.currentUser) {
          throw new Error("Người dùng chưa đăng nhập.");
        }
        await updateProfile(configuredAuth.currentUser, {
          displayName: profile.displayName,
          photoURL: profile.photoURL,
        });
        broadcastAuthState();
      },
    }
  : undefined;
