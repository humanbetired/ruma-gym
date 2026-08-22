import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { api, setAccessToken } from '../api/axios';
import type { User, LoginPayload, RegisterPayload } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setSessionFromOAuth: (accessToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRestoredSession = useRef(false);

  useEffect(() => {
    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;

    async function restoreSession() {
      try {
        const res = await api.post<{ accessToken: string }>('/auth/refresh');
        setAccessToken(res.data.accessToken);

        const meRes = await api.get<User>('/auth/me');
        setUser(meRes.data);
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(payload: LoginPayload) {
    const res = await api.post<{ accessToken: string }>('/auth/login', payload);
    setAccessToken(res.data.accessToken);

    const meRes = await api.get<User>('/auth/me');
    setUser(meRes.data);
  }

  async function register(payload: RegisterPayload) {
    await api.post('/auth/register', payload);
  }

  async function setSessionFromOAuth(accessToken: string) {
    setAccessToken(accessToken);

    const meRes = await api.get<User>('/auth/me');
    setUser(meRes.data);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, setSessionFromOAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}