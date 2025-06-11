// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// These NEXT_PUBLIC_ variables need to be set in your environment
// (e.g., in a .env.local file at the root of your project, or via Firebase Studio environment settings).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Basic check if essential config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error(
    "Firebase configuration is incomplete. Make sure all NEXT_PUBLIC_FIREBASE_... environment variables are set."
  );
  // Depending on the desired behavior, you might throw an error here or handle it gracefully.
  // For now, initialization will proceed, but Firebase services will likely fail.
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);

export { app, auth };
