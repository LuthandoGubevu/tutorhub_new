
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
import { 
  getFirebaseAuth, 
  getFirestoreDb,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from '@/lib/firebase';

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
      console.warn("AuthContext: Firebase Auth not available. Firebase might not be initialized on client.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        const db = getFirestoreDb();
        let appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin: firebaseUser.uid === ADMIN_UID, 
        };

        if (db) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const firestoreData = userDocSnap.data() as User; 
              appUser = {
                ...appUser,
                fullName: firestoreData.fullName || appUser.fullName,
                cellNumber: firestoreData.cellNumber,
                role: firestoreData.role,
                createdAt: firestoreData.createdAt, 
                photoURL: firestoreData.photoURL !== undefined ? firestoreData.photoURL : appUser.photoURL,
                isAdmin: firestoreData.role === 'tutor' || firestoreData.role === 'admin' || firebaseUser.uid === ADMIN_UID, 
              };
            } else {
              // User exists in Auth but not Firestore
              const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";
              const newUserDocData: Record<string, any> = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName || "New User",
                role: userRole,
                createdAt: serverTimestamp(),
              };
              if (firebaseUser.photoURL !== undefined) {
                newUserDocData.photoURL = firebaseUser.photoURL;
              }
              await setDoc(userDocRef, newUserDocData);
              appUser.role = userRole;
              appUser.createdAt = new Date().toISOString(); 
              appUser.isAdmin = userRole === 'tutor' || userRole === 'admin' || firebaseUser.uid === ADMIN_UID;
               console.log("User document created in Firestore for existing Auth user:", firebaseUser.uid);
            }
          } catch (error) {
            console.error("Error fetching/creating user data from Firestore:", error);
          }
        }
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email?: string, password?: string, isGoogle?: boolean) => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    if (!auth || !db) {
      console.error("Firebase auth or db not initialized for login.");
      throw new Error("Firebase services not available.");
    }
    setLoading(true);
    try {
      let firebaseUser: FirebaseUser | null = null;
      if (isGoogle) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        firebaseUser = result.user;
        
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";
          const userData: Record<string, any> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName,
            role: userRole,
            createdAt: serverTimestamp(),
          };
          if (firebaseUser.photoURL !== undefined) {
            userData.photoURL = firebaseUser.photoURL;
          }
          await setDoc(userDocRef, userData);
        }

      } else if (email && password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = result.user;
      } else {
        throw new Error("Email/password or Google sign-in method must be chosen.");
      }
      
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data() as User;
           const appUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firestoreData.fullName || firebaseUser.displayName,
            photoURL: firestoreData.photoURL !== undefined ? firestoreData.photoURL : firebaseUser.photoURL,
            cellNumber: firestoreData.cellNumber,
            role: firestoreData.role,
            createdAt: firestoreData.createdAt,
            isAdmin: firestoreData.role === 'admin' || firestoreData.role === 'tutor' || firebaseUser.uid === ADMIN_UID,
          };
          setUser(appUser);
          if (appUser.isAdmin) {
            router.push('/tutor/dashboard');
          } else {
            router.push('/dashboard');
          }
        } else {
           console.warn("User signed in but no Firestore document found, redirecting to dashboard.");
           router.push('/dashboard'); 
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("Firebase auth not available for logout.");
      setUser(null);
      router.push('/'); 
      setLoading(false); 
      return;
    }
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      router.push('/'); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const register = async (fullName: string, email: string, password: string, cellNumber?: string) => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();

    if (!auth) throw new Error("Firebase auth not initialized for register.");
    if (!db) throw new Error("Firestore not initialized for register.");
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        await updateProfile(firebaseUser, {
          displayName: fullName,
        });

        const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";

        // Prepare data for Firestore, ensuring photoURL is handled correctly
        const userDataForFirestore: Record<string, any> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: fullName,
          role: userRole,
          createdAt: serverTimestamp(),
        };

        if (cellNumber) {
          userDataForFirestore.cellNumber = cellNumber;
        }

        // Directly assign firebaseUser.photoURL (which is string | null)
        // Firestore can handle `null` values, but not `undefined`.
        if (firebaseUser.photoURL !== undefined) { // Defensive check, though it's usually string | null
            userDataForFirestore.photoURL = firebaseUser.photoURL;
        }


        await setDoc(doc(db, "users", firebaseUser.uid), userDataForFirestore);
        console.log("User document successfully written to Firestore.");

        // Create the app user object for the context
        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: fullName,
          role: userRole,
          cellNumber: cellNumber || undefined,
          photoURL: firebaseUser.photoURL, // This is string | null
          isAdmin: userRole === 'tutor' || userRole === 'admin' || firebaseUser.uid === ADMIN_UID,
          createdAt: new Date().toISOString(), 
        };
        setUser(appUser);
        
        if (appUser.isAdmin) {
          router.push('/tutor/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
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

