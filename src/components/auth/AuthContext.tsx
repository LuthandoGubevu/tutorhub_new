
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
      console.warn("AuthContext: Firebase Auth not available.");
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
              const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";
              const newUserDocData: Record<string, any> = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName || "New User",
                role: userRole,
                createdAt: serverTimestamp(),
              };
              if (firebaseUser.photoURL !== null && firebaseUser.photoURL !== undefined) {
                newUserDocData.photoURL = firebaseUser.photoURL;
              } else if (firebaseUser.photoURL === null) {
                newUserDocData.photoURL = null;
              }
              await setDoc(userDocRef, newUserDocData);
              appUser.role = userRole;
              appUser.createdAt = new Date().toISOString(); 
              appUser.isAdmin = userRole === 'tutor' || userRole === 'admin' || firebaseUser.uid === ADMIN_UID;
            }
          } catch (error) {
            console.error("Error fetching/creating user data from Firestore:", error);
          }
        } else {
           // Fallback if DB is not available or user doc not found, isAdmin check relies purely on UID
           appUser.isAdmin = firebaseUser.uid === ADMIN_UID;
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
          if (firebaseUser.photoURL !== null && firebaseUser.photoURL !== undefined) {
            userData.photoURL = firebaseUser.photoURL;
          } else if (firebaseUser.photoURL === null) {
             userData.photoURL = null;
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
           // This case should ideally be handled by the onAuthStateChanged listener creating the doc
           // For safety, redirect to a generic place or handle as an anomaly.
           console.warn("User signed in but no Firestore document found immediately after login. User object might be incomplete.");
           const tempAppUser: User = { // Create a temporary user object for redirection
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                isAdmin: firebaseUser.uid === ADMIN_UID,
           };
           setUser(tempAppUser); // Set a minimal user
           if (tempAppUser.isAdmin) {
             router.push('/tutor/dashboard');
           } else {
             router.push('/dashboard');
           }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false); // Ensure loading is reset on error
      throw error;
    }
    // setLoading(false); // Moved inside try/catch/finally or after setUser if successful
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
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
    } finally {
        setLoading(false);
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
        
        if (firebaseUser.photoURL !== null && firebaseUser.photoURL !== undefined) {
            userDataForFirestore.photoURL = firebaseUser.photoURL;
        } else if (firebaseUser.photoURL === null) {
            userDataForFirestore.photoURL = null;
        }


        await setDoc(doc(db, "users", firebaseUser.uid), userDataForFirestore);
        
        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: fullName,
          role: userRole,
          cellNumber: cellNumber || undefined,
          photoURL: firebaseUser.photoURL,
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
      setLoading(false); // Ensure loading is reset on error
      throw error;
    }
    // setLoading(false); // Moved inside try/catch/finally
  };

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/login', '/register'];
    const isPublicLessonPath = pathname.startsWith('/lessons') || pathname.startsWith('/lesson/');
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user) { // No user logged in
      // If trying to access a protected page (not public, not lessons, not auth pages themselves)
      if (!isPublicLessonPath && !publicPaths.includes(pathname)) {
        router.push('/login');
      }
    } else { // User is logged in
      if (user.isAdmin) {
        // If admin is on an auth page, or student dashboard, or booking page, redirect to tutor dashboard
        if (isAuthPage || pathname === '/dashboard' || pathname === '/book-session') {
          router.push('/tutor/dashboard');
        }
      } else { // User is a student
        // If student is on an auth page or tutor dashboard, redirect to student dashboard
        if (isAuthPage || pathname === '/tutor/dashboard') {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
