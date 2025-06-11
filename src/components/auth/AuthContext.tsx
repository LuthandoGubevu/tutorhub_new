
// src/components/auth/AuthContext.tsx
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase'; 
import { doc, setDoc, getDoc } from "firebase/firestore"; 

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email?: string, password?: string, isGoogle?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (fullName: string, email: string, password: string, cellNumber?: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const ADMIN_UID = "wtUG3rAQVRRLf1INMSEbY7UXSdj1"; 

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("AuthContext: Firebase Auth not available for onAuthStateChanged listener. Ensure Firebase is initialized on client.");
      setLoading(false);
      return;
    }

    const handleAuthStateChange = async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        let appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin: firebaseUser.uid === ADMIN_UID,
        };

        // Fetch additional user data from Firestore
        const db = getFirestoreDb();
        if (db) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const firestoreData = userDocSnap.data();
              appUser = {
                ...appUser,
                fullName: firestoreData.name || appUser.fullName, // Prefer Firestore name if available
                cellNumber: firestoreData.cellNumber,
                role: firestoreData.role,
                createdAt: firestoreData.createdAt,
                // isAdmin can also be set from Firestore if preferred, e.g., firestoreData.isAdmin
              };
            }
          } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
          }
        }
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, []);

  const login = async (email?: string, password?: string, isGoogle?: boolean) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.error("Firebase auth not initialized for login.");
      throw new Error("Firebase auth not initialized for login.");
    }
    setLoading(true);
    try {
      let loggedInUser: FirebaseUser | null = null;
      if (isGoogle) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        loggedInUser = result.user;
      } else if (email && password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        loggedInUser = result.user;
      } else {
        throw new Error("Email/password or Google sign-in method must be chosen.");
      }
      
      if (loggedInUser?.uid === ADMIN_UID) {
        router.push('/tutor/dashboard');
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error("Login error:", error);
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("Firebase auth not available for logout.");
      setUser(null); 
      router.push('/login');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null); 
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, cellNumber?: string) => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();

    if (!auth) {
      console.error("Firebase auth not initialized for register.");
      throw new Error("Firebase auth not initialized for register.");
    }
     if (!db) {
      console.error("Firestore not initialized for register.");
      throw new Error("Firestore not initialized for register.");
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        await updateProfile(firebaseUser, {
          displayName: fullName,
        });

        const userRole = firebaseUser.uid === ADMIN_UID ? "admin" : "student";

        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: fullName,
          role: userRole, 
          cellNumber: cellNumber || null,
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, "users", firebaseUser.uid), userData);
          console.log("User document successfully written to Firestore.");
        } catch (firestoreError) {
          console.error("Error writing user document to Firestore:", firestoreError);
        }

        const updatedFirebaseUser = auth.currentUser; 
        if (updatedFirebaseUser) {
           const appUser: User = {
            uid: updatedFirebaseUser.uid,
            email: updatedFirebaseUser.email,
            fullName: updatedFirebaseUser.displayName,
            photoURL: updatedFirebaseUser.photoURL,
            cellNumber: cellNumber, 
            isAdmin: updatedFirebaseUser.uid === ADMIN_UID,
            role: userRole, 
            createdAt: userData.createdAt,
          };
          setUser(appUser); 
        }
      }
      if (firebaseUser?.uid === ADMIN_UID) {
        router.push('/tutor/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/login', '/register'];
    const isPublicLessonPath = pathname.startsWith('/lessons') || pathname.startsWith('/lesson/');


    if (pathname === '/tutor/dashboard') {
      if (!user) {
        router.push('/login'); 
      } else if (!user.isAdmin) { 
        router.push('/dashboard'); 
      }
    } else if (!publicPaths.includes(pathname) && !isPublicLessonPath) {
      if (!user) {
        router.push('/login'); 
      }
    }
  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
