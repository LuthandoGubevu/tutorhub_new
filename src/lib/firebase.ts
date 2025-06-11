// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
// User has confirmed these values.
const firebaseConfig = {
  apiKey: "AIzaSyAFZrjm_kMFRdKQZWptaVKE6aXBMbQaXE0",
  authDomain: "tutorhub-online-academy.firebaseapp.com",
  projectId: "tutorhub-online-academy",
  storageBucket: "tutorhub-online-academy.firebasestorage.app",
  messagingSenderId: "796118388625",
  appId: "1:796118388625:web:429b28e820c37b47f41430"
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

function initializeFirebaseOnClient() {
  if (typeof window !== 'undefined') { // Ensure this runs only on the client
    if (!getApps().length) {
      try {
        console.log("Firebase Client: Initializing new app with config:", firebaseConfig);
        appInstance = initializeApp(firebaseConfig);
        authInstance = getAuth(appInstance);
        console.log("Firebase Client: New app initialized successfully.");
      } catch (e) {
        console.error("Firebase critical initialization error:", e);
        appInstance = null;
        authInstance = null;
      }
    } else {
      appInstance = getApps()[0];
      if (!authInstance && appInstance) { // Ensure authInstance is also set if app was already initialized
        try {
            authInstance = getAuth(appInstance);
        } catch(e) {
            console.error("Firebase error getting auth from existing app:", e);
            authInstance = null;
        }
      }
      console.log("Firebase Client: Using existing app:", appInstance?.name);
    }
  } else {
    // This block should ideally not be hit if only client components use these getters.
    // console.warn("Firebase getters called on server. Firebase client SDK not initialized server-side.");
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!appInstance && typeof window !== 'undefined') {
    initializeFirebaseOnClient();
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth | null {
  // Ensure app is initialized before trying to get auth
  const app = getFirebaseApp();
  if (app && !authInstance && typeof window !== 'undefined') {
    try {
      authInstance = getAuth(app);
    } catch (e) {
      console.error("Firebase error in getFirebaseAuth after app init:", e);
      authInstance = null;
    }
  }
  return authInstance;
}
