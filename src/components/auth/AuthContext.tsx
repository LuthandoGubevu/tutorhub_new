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
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import Firebase auth instance

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          // cellNumber is not directly available on firebaseUser, would need separate handling if crucial
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email?: string, password?: string, isGoogle?: boolean) => {
    setLoading(true);
    try {
      if (isGoogle) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle setting the user
      } else if (email && password) {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle setting the user
      } else {
        throw new Error("Email/password or Google sign-in method must be chosen.");
      }
      router.push('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      // Handle specific error codes (e.g., auth/wrong-password, auth/user-not-found)
      // For now, a generic error, but you might want to pass this to the form
      throw error; // Re-throw to be caught by the form
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will set user to null
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, cellNumber?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName,
          // photoURL can be set here if available
        });
         // Manually update our app's user state immediately after profile update
        const updatedFirebaseUser = auth.currentUser; // Refresh to get the latest profile
        if (updatedFirebaseUser) {
           const appUser: User = {
            uid: updatedFirebaseUser.uid,
            email: updatedFirebaseUser.email,
            fullName: updatedFirebaseUser.displayName,
            photoURL: updatedFirebaseUser.photoURL,
            cellNumber: cellNumber // Keep cellNumber from form if provided
          };
          setUser(appUser);
        }
      }
      // cellNumber would typically be saved to Firestore here, linked by userCredential.user.uid
      // e.g., await setDoc(doc(db, "users", userCredential.user.uid), { cellNumber });
      router.push('/dashboard');
    } catch (error) {
      console.error("Registration error:", error);
      // Handle specific error codes (e.g., auth/email-already-in-use)
      throw error; // Re-throw to be caught by the form
    } finally {
      setLoading(false);
    }
  };

  // Redirect unauthenticated users
   useEffect(() => {
    if (!loading && !user) {
      const publicPaths = ['/', '/login', '/register'];
      const isPublicLessonPath = pathname.startsWith('/lesson/') || pathname === '/lessons' || /^\/lessons\/[^/]+\/?([^/]+\/?)?$/.test(pathname);

      if (!publicPaths.includes(pathname) && !isPublicLessonPath && pathname !== '/tutor/dashboard') {
        if (pathname !== '/tutor/dashboard') { 
             router.push('/login');
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
