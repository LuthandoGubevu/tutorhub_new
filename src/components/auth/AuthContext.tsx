
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
  type Auth as FirebaseAuthType
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase'; // Import the getter

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

const ADMIN_EMAIL = "gugunkululo@gmail.com";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("AuthContext: Firebase Auth not available for onAuthStateChanged listener. Retrying in 1s.");
      // Attempt to initialize/get auth again after a short delay if it wasn't ready immediately
      const timer = setTimeout(() => {
        const delayedAuth = getFirebaseAuth();
        if(delayedAuth) {
            const unsubscribe = onAuthStateChanged(delayedAuth, handleAuthStateChange);
            return () => unsubscribe();
        } else {
            console.error("AuthContext: Firebase Auth still not available after delay.");
            setLoading(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    const handleAuthStateChange = (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin: firebaseUser.email === ADMIN_EMAIL,
        };
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
      setError("Firebase authentication service is not available. Please try again later.");
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
      
      if (loggedInUser?.email === ADMIN_EMAIL) {
        router.push('/tutor/dashboard');
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error("Login error:", error);
      // Update to use the local setError if defined in LoginForm or pass to toast
      // For now, re-throwing for LoginForm to catch.
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("Firebase auth not available for logout.");
      setUser(null); // Clear user state
      router.push('/login');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null); // Ensure user state is cleared
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, cellNumber?: string) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase auth not initialized for register.");
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        await updateProfile(firebaseUser, {
          displayName: fullName,
        });
        // Re-fetch the current user from auth to get the updated profile
        const updatedFirebaseUser = auth.currentUser; 
        if (updatedFirebaseUser) {
           const appUser: User = {
            uid: updatedFirebaseUser.uid,
            email: updatedFirebaseUser.email,
            fullName: updatedFirebaseUser.displayName,
            photoURL: updatedFirebaseUser.photoURL,
            cellNumber: cellNumber, // This is not standard, would need custom handling
            isAdmin: updatedFirebaseUser.email === ADMIN_EMAIL,
          };
          setUser(appUser); // Set user in context
        }
      }
      router.push('/dashboard');
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Local error state for displaying messages in AuthContext consumers, if needed
  // const [error, setError] = useState<string | null>(null); 
  // This would require further changes to expose and use setError


  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/login', '/register'];
    // Adjusted regex to be more specific for subject and branch paths
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
