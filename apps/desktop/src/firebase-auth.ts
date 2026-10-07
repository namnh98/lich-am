import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { AuthService, AuthUser } from "@lich-am/ui";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const configured = Boolean(config.apiKey && config.appId && config.projectId);
const auth = configured
  ? getAuth(getApps().length ? getApp() : initializeApp(config))
  : undefined;

function toAuthUser(user?: (typeof auth extends undefined ? never : NonNullable<typeof auth>["currentUser"]) | null): AuthUser | null {
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
  const currentUser = auth?.currentUser;
  const authUser = toAuthUser(currentUser);
  for (const listener of activeListeners) {
    listener(authUser);
  }
}

export const firebaseAuthService: AuthService | undefined = auth
  ? {
      subscribe: (listener) => {
        activeListeners.add(listener);
        const unsubscribe = onAuthStateChanged(
          auth,
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
        await signInWithEmailAndPassword(auth, email, password);
      },
      createAccount: async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
      },
      signInAnonymously: async () => {
        await signInAnonymously(auth);
      },
      signOut: async () => {
        await signOut(auth);
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email);
      },
      updateProfile: async (profile) => {
        if (!auth.currentUser) {
          throw new Error("Người dùng chưa đăng nhập.");
        }
        await updateProfile(auth.currentUser, {
          displayName: profile.displayName,
          photoURL: profile.photoURL,
        });
        broadcastAuthState();
      },
    }
  : undefined;
