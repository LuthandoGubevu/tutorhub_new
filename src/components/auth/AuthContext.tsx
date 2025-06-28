
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
  login: (email?: string, password?: string, isGoogle?: boolean) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
  register: (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    grade: string | number, 
    cellNumber?: string
  ) => Promise<void>;
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
          firstName: firebaseUser.displayName ? firebaseUser.displayName.split(' ')[0] : null,
          lastName: firebaseUser.displayName ? firebaseUser.displayName.split(' ').slice(1).join(' ') : null,
          isAdmin: firebaseUser.uid === ADMIN_UID,
        };

        if (firebaseUser.photoURL) {
          appUser.photoURL = firebaseUser.photoURL;
        } else if (firebaseUser.photoURL === null) {
          appUser.photoURL = null;
        }
        
        if (db) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const firestoreData = userDocSnap.data() as User; 
              appUser = {
                ...appUser,
                firstName: firestoreData.firstName || appUser.firstName,
                lastName: firestoreData.lastName || appUser.lastName,
                grade: firestoreData.grade,
                cellNumber: firestoreData.cellNumber,
                role: firestoreData.role,
                createdAt: firestoreData.createdAt, 
                photoURL: firestoreData.photoURL !== undefined ? firestoreData.photoURL : appUser.photoURL,
                isAdmin: firestoreData.role === 'tutor' || firestoreData.role === 'admin' || firebaseUser.uid === ADMIN_UID, 
              };
            } else { 
              const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";
              // For users signing in with Google who might not have a Firestore doc yet
              const displayName = firebaseUser.displayName || "New User";
              const names = displayName.split(' ');
              const firstName = names[0];
              const lastName = names.slice(1).join(' ');

              const newUserDocData: Record<string, any> = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                firstName: firstName,
                lastName: lastName,
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
              appUser.isAdmin = userRole === 'tutor' || userRole === 'admin' || firebaseUser.uid === ADMIN_UID;
              appUser.firstName = firstName;
              appUser.lastName = lastName;
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

  const login = async (email?: string, password?: string, isGoogle?: boolean): Promise<{ success: boolean; error?: any }> => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    if (!auth || !db) {
      console.error("Firebase auth or db not initialized for login.");
      return { success: false, error: new Error("Firebase services not available.") };
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
          const displayName = firebaseUser.displayName || "New User";
          const names = displayName.split(' ');
          const firstName = names[0];
          const lastName = names.slice(1).join(' ');

          const userData: Record<string, any> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: firstName,
            lastName: lastName,
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
        // This case should no longer be reached if LoginForm ensures email/password or isGoogle flag
        console.error("Login: Email/password or Google sign-in method must be chosen.");
        return { success: false, error: new Error("Login method requires email/password or Google flag.") };
      }
      
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data() as User; // Cast to your User type
           const appUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: firestoreData.firstName || (firebaseUser.displayName ? firebaseUser.displayName.split(' ')[0] : null),
            lastName: firestoreData.lastName || (firebaseUser.displayName ? firebaseUser.displayName.split(' ').slice(1).join(' ') : null),
            photoURL: firestoreData.photoURL !== undefined ? firestoreData.photoURL : (firebaseUser.photoURL || null),
            cellNumber: firestoreData.cellNumber,
            grade: firestoreData.grade,
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
           const displayName = firebaseUser.displayName;
           const tempAppUser: User = { 
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                firstName: displayName ? displayName.split(' ')[0] : null,
                lastName: displayName ? displayName.split(' ').slice(1).join(' ') : null,
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
        return { success: true };
      } else {
        return { success: false, error: new Error("Login process completed but no user object was returned from Firebase.")};
      }
    } catch (error: any) {
      console.error("Login error in AuthContext:", error);
      // Return the error to be handled by the form
      return { success: false, error };
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

  const register = async (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    grade: string | number, 
    cellNumber?: string
  ) => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();

    if (!auth) throw new Error("Firebase auth not initialized for register.");
    if (!db) throw new Error("Firestore not initialized for register.");
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const fullName = `${firstName} ${lastName}`;

      if (firebaseUser) {
        await updateProfile(firebaseUser, {
          displayName: fullName,
        });

        const userRole = firebaseUser.uid === ADMIN_UID ? "tutor" : "student";

        const userDataForFirestore: Record<string, any> = {
          uid: firebaseUser.uid,
          firstName,
          lastName,
          email: firebaseUser.email,
          grade,
          role: userRole, // Default role
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
          firstName,
          lastName,
          grade,
          role: userRole,
          cellNumber: cellNumber || undefined,
          photoURL: firebaseUser.photoURL || null,
          isAdmin: userRole === 'tutor' || userRole === 'admin' || firebaseUser.uid === ADMIN_UID,
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
        setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return; 

    const publicPaths = ['/', '/login', '/register'];
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user) { 
      if (!publicPaths.includes(pathname) && !isAuthPage) {
        router.push('/login');
      }
    } else { 
      if (isAuthPage) { 
        if (user.isAdmin) {
          router.push('/tutor/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else { 
        if (user.isAdmin && (pathname === '/dashboard' || pathname === '/book-session')) {
          router.push('/tutor/dashboard');
        }
        else if (!user.isAdmin && pathname === '/tutor/dashboard') {
          router.push('/dashboard');
        }
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
