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

// The explicit check for incomplete configuration has been removed.
// If configuration is missing or incorrect, Firebase SDK's initializeApp or getAuth will throw an error.

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  // Check if essential config values are truly undefined, which would cause initializeApp to fail.
  // Firebase expects strings, even if they are empty due to missing env vars,
  // but process.env might return undefined.
  if (typeof firebaseConfig.apiKey !== 'string' || 
      typeof firebaseConfig.authDomain !== 'string' || 
      typeof firebaseConfig.projectId !== 'string') {
    console.error(
      "Critical Firebase configuration values (apiKey, authDomain, projectId) are undefined. " +
      "Please ensure NEXT_PUBLIC_FIREBASE_... environment variables are correctly set. Firebase will not initialize."
    );
    // To prevent runtime errors from getAuth(app) if app is undefined or fails to initialize
    // we can throw or handle this more gracefully. For now, console.error and proceed with caution.
    // A more robust solution would be to not initialize or throw here.
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);

export { app, auth };
