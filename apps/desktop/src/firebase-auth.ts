import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { AuthService } from "@lich-am/ui";

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

export const firebaseAuthService: AuthService | undefined = auth
  ? {
      subscribe: (listener) =>
        onAuthStateChanged(
          auth,
          (user) =>
            listener(
              user
                ? { email: user.email, displayName: user.displayName }
                : null,
            ),
          (error) => console.error("Firebase auth state listener failed", error),
        ),
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      createAccount: async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
      },
      signOut: async () => {
        await signOut(auth);
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email);
      },
    }
  : undefined;
