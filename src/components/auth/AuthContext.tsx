
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
          isAdmin: firebaseUser.uid === ADMIN_UID, // Initial admin status
        };

        if (db) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const firestoreData = userDocSnap.data() as User; // Assert User type from Firestore
              appUser = {
                ...appUser,
                fullName: firestoreData.fullName || appUser.fullName,
                cellNumber: firestoreData.cellNumber,
                role: firestoreData.role,
                createdAt: firestoreData.createdAt, // Expecting Timestamp or string
                isAdmin: firestoreData.role === 'admin' || firestoreData.role === 'tutor' || firebaseUser.uid === ADMIN_UID, // More robust admin check
              };
            } else {
              // User exists in Auth but not Firestore (e.g. first Google sign-in, or data migration)
              // Create a basic profile in Firestore
              const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";
              const newUserDocData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName || "New User",
                role: userRole,
                createdAt: serverTimestamp(),
              };
              await setDoc(userDocRef, newUserDocData);
              appUser.role = userRole;
              appUser.createdAt = new Date().toISOString(); // Approximate client-side
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
        
        // Check if user exists in Firestore, if not, create them
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName,
            role: userRole,
            createdAt: serverTimestamp(),
            photoURL: firebaseUser.photoURL,
          };
          await setDoc(userDocRef, userData);
        }

      } else if (email && password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = result.user;
      } else {
        throw new Error("Email/password or Google sign-in method must be chosen.");
      }
      
      // Fetch Firestore data to update user context, including role
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data() as User;
           const appUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firestoreData.fullName || firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
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
          // This case should ideally be handled by onAuthStateChanged creating the doc if missing
           console.warn("User signed in but no Firestore document found, redirecting to dashboard.");
           router.push('/dashboard'); // Fallback redirect
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      // setLoading(false); // setLoading is handled by onAuthStateChanged
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("Firebase auth not available for logout.");
      setUser(null);
      router.push('/login');
      setLoading(false); // Ensure loading is false if auth is not available
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
      // setLoading(false); // setLoading is handled by onAuthStateChanged
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

        const userData: Omit<User, 'isAdmin' | 'createdAt'> & { createdAt: any } = { // Ensure createdAt is compatible with serverTimestamp
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: fullName,
          role: userRole,
          cellNumber: cellNumber || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", firebaseUser.uid), userData);
        console.log("User document successfully written to Firestore.");

        // Update local user state with the newly registered user's details
        const appUser: User = {
          ...userData,
          isAdmin: userRole === 'tutor' || firebaseUser.uid === ADMIN_UID, // Set isAdmin based on role/UID
          createdAt: new Date().toISOString(), // For immediate local state, Firestore will have serverTimestamp
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
    } finally {
      // setLoading(false); // setLoading is handled by onAuthStateChanged
    }
  };

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/login', '/register'];
    // Allow access to individual lesson pages and subject/branch listings without full auth,
    // but submission capabilities inside LessonDetailClient will check for user.
    const isPublicLessonPath = pathname.startsWith('/lessons') || pathname.startsWith('/lesson/');

    if (pathname === '/tutor/dashboard') {
      if (!user) {
        router.push('/login');
      } else if (!user.isAdmin) { // Check isAdmin flag from user context
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
