
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

const ADMIN_EMAIL = "gugunkululo@gmail.com";

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
          isAdmin: firebaseUser.email === ADMIN_EMAIL,
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
      
      // onAuthStateChanged will handle setting the user state, including isAdmin
      // Redirect based on admin status after successful login handled by useEffect
      if (loggedInUser?.email === ADMIN_EMAIL) {
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
    setLoading(true);
    try {
      await signOut(auth);
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
        });
        const updatedFirebaseUser = auth.currentUser; 
        if (updatedFirebaseUser) {
           const appUser: User = {
            uid: updatedFirebaseUser.uid,
            email: updatedFirebaseUser.email,
            fullName: updatedFirebaseUser.displayName,
            photoURL: updatedFirebaseUser.photoURL,
            cellNumber: cellNumber,
            isAdmin: updatedFirebaseUser.email === ADMIN_EMAIL,
          };
          setUser(appUser);
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

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/login', '/register'];
    const isPublicLessonPath = pathname.startsWith('/lesson/') || pathname === '/lessons' || /^\/lessons\/[^/]+\/?([^/]+\/?)?$/.test(pathname);

    if (pathname === '/tutor/dashboard') {
      if (!user) {
        router.push('/login'); // Not logged in, redirect to login
      } else if (!user.isAdmin) { // Logged in but not admin
        router.push('/dashboard'); // Redirect to student dashboard
      }
      // If user exists and is admin, they are allowed.
    } else if (!publicPaths.includes(pathname) && !isPublicLessonPath) {
      // This is a protected route (not public, not lesson, not tutor dashboard which is handled above)
      if (!user) {
        router.push('/login'); // Not logged in, redirect to login
      }
      // If user is logged in (and it's not an admin trying to access a non-admin student page, or a student on a student page), they are allowed.
    }
  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
