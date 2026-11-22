import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: Role;
  onRedirectToLogin: () => void;
  onRedirectToDashboard: () => void;
  onRedirectToAdminDashboard: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
  onRedirectToLogin,
  onRedirectToDashboard,
  onRedirectToAdminDashboard,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center font-sans text-stone-600 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span>Memeriksa sesi autentikasi...</span>
        </div>
      </div>
    );
  }

  // 1. Belum login -> redirect ke login
  if (!isAuthenticated || !role) {
    onRedirectToLogin();
    return null;
  }

  // 2. Jika ditentukan allowedRole dan role user tidak sesuai
  if (allowedRole && role !== allowedRole) {
    if (role === 'ADMIN') {
      onRedirectToAdminDashboard();
    } else {
      onRedirectToDashboard();
    }
    return null;
  }

  return <>{children}</>;
};
