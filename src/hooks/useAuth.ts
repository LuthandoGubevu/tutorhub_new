// src/hooks/useAuth.ts
"use client";

import type { User } from '@/types';
import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '@/components/auth/AuthContext';

// Mock user data
const mockUser: User = {
  id: '123',
  fullName: 'Demo Student',
  email: 'student@example.com',
  cellNumber: '0821234567'
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
