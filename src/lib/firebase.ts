import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD46jGvc5Y7rcxfMJ1_msSlfEdEaXMkjLU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "medi-store-2k25.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "medi-store-2k25",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "medi-store-2k25.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "957867853968",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:957867853968:web:6efdbbeb5c6130518cb015",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-SKKCTNPEZ3",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export type GooglePopupUser = {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  idToken: string;
};

export const signInWithGooglePopup = async (): Promise<GooglePopupUser> => {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();

  return {
    uid: credential.user.uid,
    name: credential.user.displayName || "Google User",
    email: credential.user.email || "",
    photoURL: credential.user.photoURL || "",
    idToken,
  };
};
