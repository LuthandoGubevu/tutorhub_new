// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFZrjm_kMFRdKQZWptaVKE6aXBMbQaXE0",
  authDomain: "tutorhub-online-academy.firebaseapp.com",
  projectId: "tutorhub-online-academy",
  storageBucket: "tutorhub-online-academy.firebasestorage.app",
  messagingSenderId: "796118388625",
  appId: "1:796118388625:web:429b28e820c37b47f41430"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);

export { app, auth };
