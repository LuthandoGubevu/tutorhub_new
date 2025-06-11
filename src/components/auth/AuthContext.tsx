// src/components/auth/AuthContext.tsx
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Mock user data
const mockDemoUser: User = {
  id: '123',
  fullName: 'Demo Student',
  email: 'student@example.com',
  cellNumber: '0821234567'
};

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email?: string, password?: string, isGoogle?: boolean) => Promise<void>; // Made params optional for mock
  logout: () => Promise<void>;
  register: (fullName?: string, email?: string, password?: string, cellNumber?: string) => Promise<void>; // Made params optional for mock
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
    // Mock checking for existing session
    const storedUser = localStorage.getItem('tutorhub-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email?: string, password?: string, isGoogle?: boolean) => {
    setLoading(true);
    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    const loggedInUser = { ...mockDemoUser, email: email || mockDemoUser.email };
    setUser(loggedInUser);
    localStorage.setItem('tutorhub-user', JSON.stringify(loggedInUser));
    setLoading(false);
    router.push('/dashboard');
  };

  const logout = async () => {
    setLoading(true);
    // Mock logout logic
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('tutorhub-user');
    setLoading(false);
    router.push('/login');
  };

  const register = async (fullName?: string, email?: string, password?: string, cellNumber?: string) => {
    setLoading(true);
    // Mock register logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = { ...mockDemoUser, fullName: fullName || mockDemoUser.fullName, email: email || mockDemoUser.email, cellNumber: cellNumber || mockDemoUser.cellNumber };
    setUser(newUser);
    localStorage.setItem('tutorhub-user', JSON.stringify(newUser));
    setLoading(false);
    router.push('/dashboard');
  };

  // Redirect unauthenticated users
   useEffect(() => {
    if (!loading && !user) {
      const publicPaths = ['/', '/login', '/register'];
      // Allow access to lesson pages even if not logged in, viewing is public
      // Specific lesson viewing might be public
      const isPublicLessonPath = pathname.startsWith('/lesson/') || pathname === '/lessons' || /^\/lessons\/[^/]+\/?([^/]+\/?)?$/.test(pathname);

      if (!publicPaths.includes(pathname) && !isPublicLessonPath && pathname !== '/tutor/dashboard') {
         // Allow tutor dashboard for now, can add role based check later
        if (pathname !== '/tutor/dashboard') { // allow access to tutor dashboard for mocking
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
