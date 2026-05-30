'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  gender: string;
  age: string;
  avatarUrl: string; // object URL or empty string
  keepLoggedIn: boolean;
}

interface AuthContextValue {
  user: UserProfile | null;
  login: (email: string, password: string, keep: boolean) => Promise<void>;
  signup: (profile: UserProfile, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'trippic_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  async function signup(profile: UserProfile, _password: string) {
    // Mock: store profile (password ignored — demo only)
    const stored: UserProfile = { ...profile };
    if (profile.keepLoggedIn) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
    setUser(stored);
  }

  async function login(email: string, _password: string, keep: boolean) {
    // Mock: any credentials work
    const stored = { name: email.split('@')[0], email, gender: '', age: '', avatarUrl: '', keepLoggedIn: keep };
    if (keep) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setUser(stored);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
