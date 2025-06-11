
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration directly provided
const firebaseConfig = {
  apiKey: "AIzaSyAFZrjm_kMFRdKQZWptaVKE6aXBMbQaXE0",
  authDomain: "tutorhub-online-academy.firebaseapp.com",
  projectId: "tutorhub-online-academy",
  storageBucket: "tutorhub-online-academy.appspot.com", // Corrected common typo: .appspot.com instead of .firebasestorage.app
  messagingSenderId: "796118388625",
  appId: "1:796118388625:web:429b28e820c37b47f41430"
};

// Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initializeApp failed. This is critical. Error:", error);
    // Non-functional fallback
    app = { name: "INITIALIZATION_FAILED_APP", options: {}, automaticDataCollectionEnabled: false } as any;
  }
} else {
  app = getApps()[0];
}

let auth: Auth;

if (app && app.name !== "INITIALIZATION_FAILED_APP") {
  try {
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase getAuth(app) failed. This usually means the API key in your config is invalid for the project or sign-in methods are not enabled. Error:", error);
    auth = {} as Auth; // Non-functional fallback
  }
} else {
  console.warn("Firebase Auth instance cannot be created because Firebase app initialization failed or was skipped due to configuration issues.");
  auth = {} as Auth; // Non-functional fallback
}

export { app, auth };
