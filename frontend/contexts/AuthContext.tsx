import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user:            User | null;
  loading:         boolean;
  isAuthenticated: boolean;
  login:           (email: string, password: string) => Promise<AuthResponse>;
  // Step 1 — sends OTP, stores nothing locally yet
  sendOtp:         (username: string, email: string, password: string, role: 'tenant' | 'agent') => Promise<{ sent: boolean; message: string; devOtp?: string }>;
  // Step 2 — verifies OTP, creates user, logs them in
  verifyOtp:       (email: string, otp: string) => Promise<AuthResponse>;
  logout:          () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

const KEYS = { TOKEN: 'vf_token', USER: 'vf_user' };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token  = localStorage.getItem(KEYS.TOKEN);
    const stored = localStorage.getItem(KEYS.USER);
    if (token && stored) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.removeItem(KEYS.TOKEN); localStorage.removeItem(KEYS.USER); }
    }
    setLoading(false);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res  = await api.post('/api/auth/login', { email, password }) as any;
      const data = res.data as { token: string; user: User };
      localStorage.setItem(KEYS.TOKEN, data.token);
      localStorage.setItem(KEYS.USER, JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user, token: data.token };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Login failed' };
    }
  };

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  // Does NOT log the user in yet — just triggers the email.
  const sendOtp = async (
    username: string,
    email:    string,
    password: string,
    role:     'tenant' | 'agent',
  ): Promise<{ sent: boolean; message: string; devOtp?: string }> => {
    try {
      const res = await api.post('/api/auth/send-otp', { username, email, password, role }) as any;

      if (!res.success) {
        return { sent: false, message: res.message || 'Failed to send verification code' };
      }

      if (res.data?.devOtp) {
        console.log('%c[DEV] OTP: ' + res.data.devOtp, 'background: #2563EB; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
      }
      return { sent: true, message: res.data?.message || 'Code sent', devOtp: res.data?.devOtp };
    } catch (err: any) {
      return {
        sent:    false,
        message: err?.response?.data?.message || 'Failed to send verification code',
      };
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  // Creates the real user account, logs them in, stores token.
  const verifyOtp = async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const res  = await api.post('/api/auth/verify-email', { email, otp }) as any;
      const data = res.data as { token: string; user: User };
      localStorage.setItem(KEYS.TOKEN, data.token);
      localStorage.setItem(KEYS.USER, JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user, token: data.token };
    } catch (err: any) {
      const msg     = err?.response?.data?.message || 'Verification failed';
      const expired = err?.response?.data?.expired  || false;
      return { success: false, message: msg, ...(expired ? { expired: true } : {}) };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};