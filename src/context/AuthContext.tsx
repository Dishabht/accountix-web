import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: (message?: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getStoredToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const data = await api.get('/auth/me', token);
          setUser(data.user);
        } catch (err) {
          // token invalid or request failed — ensure clean logout
          logout();
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: User, rememberMe = true) => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    if (rememberMe) {
      localStorage.setItem('token', newToken);
    } else {
      sessionStorage.setItem('token', newToken);
    }

    setToken(newToken);
    setUser(newUser);
  };

  const logout = (message?: string) => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    if (message) {
      sessionStorage.setItem('auth:flash', message);
    }

    setToken(null);
    setUser(null);
  };

  // Listen for global API unauthorized events (dispatched by `api` client)
  React.useEffect(() => {
    const handler = () => {
      logout('Your session has expired. Please sign in again.');
      try {
        // Force navigation to login page
        window.location.href = '/login';
      } catch (e) {
        // noop
      }
    };

    window.addEventListener('api:unauthorized', handler);
    return () => window.removeEventListener('api:unauthorized', handler);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {/* Wait for the stored session to be checked before rendering routes */}
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
