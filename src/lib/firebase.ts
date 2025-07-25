// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { 
  getFirestore, 
  type Firestore,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp,
  onSnapshot,
  deleteDoc,
  writeBatch,
  getDocs, // Ensure getDocs is imported here
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFZrjm_kMFRdKQZWptaVKE6aXBMbQaXE0",
  authDomain: "tutorhub-online-academy.firebaseapp.com",
  projectId: "tutorhub-online-academy",
  storageBucket: "tutorhub-online-academy.appspot.com", // Corrected based on common Firebase setup
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
        appInstance = null; 
      }
    } else {
      appInstance = getApps()[0];
    }

    if (appInstance && !authInstance) {
      try {
        const auth = getAuth(appInstance);
        // Use session persistence to avoid cross-origin storage issues
        setPersistence(auth, browserSessionPersistence).then(() => {
          authInstance = auth;
        }).catch((error) => {
          console.error("Firebase Auth: Could not set persistence.", error);
          authInstance = auth; // Fallback to default
        });
      } catch (e) {
        console.error("Firebase error getting Auth instance:", e);
        authInstance = null;
      }
    }

    if (appInstance && !dbInstance) {
      try {
        // Use initializeFirestore for modern cache settings
        dbInstance = initializeFirestore(appInstance, {
          localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
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
    initializeFirebaseInstances();
  }
  return authInstance;
}

export function getFirestoreDb(): Firestore | null {
  if (!dbInstance) {
    initializeFirebaseInstances();
  }
  return dbInstance;
}

// Export Firestore functions for direct use
export {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  deleteDoc,
  writeBatch,
  getDocs // Added getDocs to the export list
};
