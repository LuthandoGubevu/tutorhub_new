
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
  serverTimestamp,
  Timestamp
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
          // photoURL is handled below to avoid undefined
          isAdmin: firebaseUser.uid === ADMIN_UID, 
        };

        // Handle photoURL carefully
        if (firebaseUser.photoURL) { // Only assign if it's a non-empty string
          appUser.photoURL = firebaseUser.photoURL;
        } else if (firebaseUser.photoURL === null) { // Explicitly store null if it's null
          appUser.photoURL = null;
        }
        // If firebaseUser.photoURL is undefined, appUser.photoURL remains unset (omitted)

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
                // Overwrite photoURL from Firestore if it exists and is explicitly set (string or null)
                photoURL: firestoreData.photoURL !== undefined ? firestoreData.photoURL : appUser.photoURL,
                isAdmin: firestoreData.role === 'tutor' || firestoreData.role === 'admin' || firebaseUser.uid === ADMIN_UID, 
              };
            } else { // Create user doc if it doesn't exist (e.g. first Google sign-in)
              const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";
              const newUserDocData: Record<string, any> = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName || "New User",
                role: userRole,
                createdAt: serverTimestamp(),
              };
              if (firebaseUser.photoURL) {
                newUserDocData.photoURL = firebaseUser.photoURL;
              } else if (firebaseUser.photoURL === null) {
                newUserDocData.photoURL = null;
              }
              await setDoc(userDocRef, newUserDocData);
              appUser.role = userRole;
              // appUser.createdAt will be set once data is re-fetched or if we assume serverTimestamp gives immediate effect locally
              appUser.isAdmin = userRole === 'tutor' || userRole === 'admin' || firebaseUser.uid === ADMIN_UID;
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
           if (firebaseUser.photoURL) {
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
            // photoURL from Firestore or fallback to firebaseUser, then handle null/undefined
            photoURL: firestoreData.photoURL !== undefined ? firestoreData.photoURL : (firebaseUser.photoURL || null),
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
           console.warn("User signed in but no Firestore document found immediately after login. User object might be incomplete.");
           const tempAppUser: User = { 
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL || null,
                isAdmin: firebaseUser.uid === ADMIN_UID,
           };
           setUser(tempAppUser); 
           if (tempAppUser.isAdmin) {
             router.push('/tutor/dashboard');
           } else {
             router.push('/dashboard');
           }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      // setLoading(false) is handled by finally
      throw error;
    } finally {
        setLoading(false);
    }
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
        
        if (firebaseUser.photoURL) {
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
          photoURL: firebaseUser.photoURL || null,
          isAdmin: userRole === 'tutor' || userRole === 'admin' || firebaseUser.uid === ADMIN_UID,
          // createdAt will be a server timestamp, client representation might differ until re-fetch
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
      // setLoading(false) is handled by finally
      throw error;
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return; // Wait for auth state to be determined (from onAuthStateChanged)

    const publicPaths = ['/', '/login', '/register'];
    // Allow /lessons and /lesson/:lessonId for anyone
    const isPublicLessonPath = pathname.startsWith('/lessons') || pathname.startsWith('/lesson/');
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user) { // User is not logged in
      // If trying to access a protected page (not public, not lessons, not auth pages themselves)
      if (!publicPaths.includes(pathname) && !isPublicLessonPath && !isAuthPage) {
        router.push('/login');
      }
    } else { // User is logged in
      if (isAuthPage) { // If logged in user is on an auth page (/login or /register)
        if (user.isAdmin) {
          router.push('/tutor/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else { // Logged in user is on a non-auth page
        // Specific handling for admins on student pages
        if (user.isAdmin && (pathname === '/dashboard' || pathname === '/book-session')) {
          router.push('/tutor/dashboard');
        }
        // Specific handling for students on admin pages
        else if (!user.isAdmin && pathname === '/tutor/dashboard') {
          router.push('/dashboard');
        }
        // If user is on landing page ('/'), redirect them to their dashboard
        else if (pathname === '/') {
           if (user.isAdmin) {
            router.push('/tutor/dashboard');
          } else {
            router.push('/dashboard');
          }
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

