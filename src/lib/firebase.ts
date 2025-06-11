// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: Ensure these values EXACTLY match your Firebase project settings.
// The error "auth/invalid-api-key" means the apiKey below is being rejected
// by Firebase for the given projectId and authDomain.
const firebaseConfig = {
  apiKey: "AIzaSyAFZrjm_kMFRdKQZWptaVKE6aXBMbQaXE0",
  authDomain: "tutorhub-online-academy.firebaseapp.com",
  projectId: "tutorhub-online-academy",
  storageBucket: "tutorhub-online-academy.firebasestorage.app", // Reverted to user's specified value
  messagingSenderId: "796118388625",
  appId: "1:796118388625:web:429b28e820c37b47f41430"
};

let app: FirebaseApp;
let auth: Auth;

try {
  if (!getApps().length) {
    console.log("Firebase: Initializing new app with config:", firebaseConfig);
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
    console.log("Firebase: Using existing app:", app.name);
  }
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase critical initialization error:", error);
  // Fallback to prevent app from crashing, but Firebase will not be functional.
  app = { name: "INITIALIZATION_FAILED_APP", options: {}, automaticDataCollectionEnabled: false } as any;
  auth = {} as Auth; 
}

export { app, auth };
