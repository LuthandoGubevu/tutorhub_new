// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// These NEXT_PUBLIC_ variables need to be set in your environment
// (e.g., in a .env.local file or via Firebase Studio environment settings).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// For debugging: Log whether essential config values are loaded.
// This helps confirm if environment variables are being picked up by Next.js.
console.log("Firebase Client-Side Configuration Check:", {
  isApiKeySet: !!firebaseConfig.apiKey,
  isAuthDomainSet: !!firebaseConfig.authDomain,
  isProjectIdSet: !!firebaseConfig.projectId,
  // You can also log the first few characters if needed for verification, e.g.:
  // apiKeyStart: firebaseConfig.apiKey?.substring(0, 5) + "..."
});

let app: FirebaseApp;

if (!getApps().length) {
  // initializeApp will throw an error if critical config like apiKey is truly missing or malformed.
  // The 'auth/invalid-api-key' error usually happens later, e.g., during getAuth or auth operations,
  // if the key is present but not valid for the project.
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initializeApp failed. This is critical. Error:", error);
    console.error("Firebase config that caused failure:", {
      apiKey: firebaseConfig.apiKey ? 'Exists (value hidden)' : 'MISSING or UNDEFINED',
      authDomain: firebaseConfig.authDomain || 'MISSING or UNDEFINED',
      projectId: firebaseConfig.projectId || 'MISSING or UNDEFINED',
      appId: firebaseConfig.appId || 'MISSING or UNDEFINED'
    });
    // To prevent the app from completely breaking on this module load if init fails,
    // assign a dummy object. Auth and other Firebase services will not work.
    // The user MUST fix their environment variables.
    app = { name: "INITIALIZATION_FAILED_APP", options: {}, automaticDataCollectionEnabled: false } as any;
  }
} else {
  app = getApps()[0];
}

let auth: Auth;

// Attempt to get Auth only if 'app' is a seemingly valid FirebaseApp object.
// If initializeApp failed, 'app' might be our dummy object, and getAuth would fail.
if (app && app.name !== "INITIALIZATION_FAILED_APP") {
  try {
    auth = getAuth(app); // The error "auth/invalid-api-key" often originates here if the API key is bad.
  } catch (error) {
    console.error("Firebase getAuth(app) failed. This usually means the API key in your config is invalid for the project. Error:", error);
    auth = {} as Auth; // Non-functional fallback
  }
} else {
  console.warn("Firebase Auth instance cannot be created because Firebase app initialization failed or was skipped due to configuration issues.");
  auth = {} as Auth; // Non-functional fallback
}

export { app, auth };
