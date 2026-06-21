'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api-client';
import { AuthUser, LoginResponse, ApiResponse } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('hms_token');
    const storedUser = localStorage.getItem('hms_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { data: response } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });

    if (response.success && response.data) {
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('hms_token', token);
      localStorage.setItem('hms_user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (payload: Record<string, string>): Promise<void> => {
    const { data: response } = await api.post<ApiResponse<LoginResponse>>('/auth/register', payload);

    if (response.success && response.data) {
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('hms_token', token);
      localStorage.setItem('hms_user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue logout even if API call fails
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
