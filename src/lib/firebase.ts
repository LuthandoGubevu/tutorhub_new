// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: Ensure these values EXACTLY match your Firebase project settings.
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
let dbInstance: Firestore | null = null;

function initializeFirebaseInstances() {
  if (typeof window !== 'undefined') { // Ensure this runs only on the client
    if (!getApps().length) {
      try {
        console.log("Firebase Client: Initializing new app with config:", firebaseConfig);
        appInstance = initializeApp(firebaseConfig);
        console.log("Firebase Client: New app initialized successfully.");
      } catch (e) {
        console.error("Firebase critical initialization error:", e);
        appInstance = null; // Explicitly set to null on error
      }
    } else {
      appInstance = getApps()[0];
      // console.log("Firebase Client: Using existing app:", appInstance?.name);
    }

    if (appInstance && !authInstance) {
      try {
        authInstance = getAuth(appInstance);
      } catch (e) {
        console.error("Firebase error getting Auth instance:", e);
        authInstance = null;
      }
    }

    if (appInstance && !dbInstance) {
      try {
        dbInstance = getFirestore(appInstance);
      } catch (e) {
        console.error("Firebase error getting Firestore instance:", e);
        dbInstance = null;
      }
    }
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!appInstance) {
    initializeFirebaseInstances();
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth | null {
  if (!authInstance) {
    initializeFirebaseInstances(); // This ensures appInstance is also attempted
  }
  return authInstance;
}

export function getFirestoreDb(): Firestore | null {
  if (!dbInstance) {
    initializeFirebaseInstances(); // This ensures appInstance is also attempted
  }
  return dbInstance;
}
