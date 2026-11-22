import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../types/api';
import { getAuthToken, setAuthToken, removeAuthToken, getStoredUser, setStoredUser, apiRequest } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [user, setUserState] = useState<UserProfile | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const role: Role | null = user?.role || null;
  const isAuthenticated = !!token && !!user;

  // Verifikasi token dan refresh data user dari /api/auth/me saat load
  const refreshProfile = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUserState(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ success: boolean; data: UserProfile }>('/api/auth/me');
      if (res.data) {
        setUserState(res.data);
        setStoredUser(res.data);
      }
    } catch (err) {
      console.warn('Sesi kedaluwarsa atau invalid:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setAuthToken(newToken);
    setStoredUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  };

  const logout = () => {
    removeAuthToken();
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
