import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setSession: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => ({} as User),
  logout: () => {},
  refreshUser: async () => {},
  setSession: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('verifind_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get<{ user: User }>('/api/auth/me')
        .then(res => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('verifind_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  function setSession(newToken: string, newUser: User) {
    localStorage.setItem('verifind_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function login(email: string, password: string): Promise<User> {
    const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
    setSession(res.token, res.user);
    return res.user;
  }

  function logout() {
    localStorage.removeItem('verifind_token');
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (!token) return;
    try {
      const res = await api.get<{ user: User }>('/api/auth/me');
      setUser(res.user);
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
