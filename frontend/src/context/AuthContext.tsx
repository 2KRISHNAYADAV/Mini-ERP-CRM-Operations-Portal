import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '../types';
import { getMeApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  // True until we've verified (or invalidated) the stored token on mount
  const [isInitializing, setIsInitializing] = useState<boolean>(!!localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsInitializing(false);
      return;
    }

    // Verify the stored token is still valid by calling /auth/me
    getMeApi()
      .then(({ data }) => {
        // Token is valid — refresh user data from server (handles role/name changes)
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      })
      .catch(() => {
        // Token is expired or invalid — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []); // runs once on app boot

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
