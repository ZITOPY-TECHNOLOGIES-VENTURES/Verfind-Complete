import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  register: (username: string, email: string, password: string, role?: string) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword:  (otp: string, newPassword: string, email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEYS = { TOKEN: 'vf_token', USER: 'vf_user', REMEMBER: 'vf_remember' };

  useEffect(() => {
    const token      = localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)  || sessionStorage.getItem(STORAGE_KEYS.USER);
    if (token && storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe = false): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password }) as any;
      const { token, user } = response.data as { token: string; user: User };
      /* Remember me → localStorage (persists); else → sessionStorage (clears on tab close) */
      const store = rememberMe ? localStorage : sessionStorage;
      store.setItem(STORAGE_KEYS.TOKEN, token);
      store.setItem(STORAGE_KEYS.USER,  JSON.stringify(user));
      if (rememberMe) localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
      setUser(user);
      return { success: true, user, token };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username: string, email: string, password: string, role = 'tenant'): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', { username, email, password, role }) as any;
      const { token, user } = response.data as { token: string; user: User };
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER,  JSON.stringify(user));
      setUser(user);
      return { success: true, user, token };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to send reset email' };
    }
  };

  const resetPassword = async (otp: string, newPassword: string, email: string) => {
    try {
      await api.post('/auth/reset-password', { otp, newPassword, email });
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Password reset failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, forgotPassword, resetPassword, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};