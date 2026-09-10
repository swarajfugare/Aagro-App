import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ShieldAlert, LogOut } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading, logout, currentUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBEE]">
        <img src="/logo.svg" alt="KrishiSetu Logo" className="w-16 h-16 mb-4 animate-pulse" />
        <h3 className="text-base font-semibold text-forest-900">Authenticating KrishiSetu Operations...</h3>
        <LoadingSpinner className="mt-2" size="md" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-600 mt-2">
            Your account ({currentUser?.email || currentUser?.phone || 'User'}) has the role{' '}
            <span className="font-semibold text-slate-800">{currentUser?.role || 'Unassigned'}</span>, which does not have administrative access to the KrishiSetu Operations Control Center.
          </p>
          <button
            onClick={logout}
            className="mt-6 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-forest-900 hover:bg-forest-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
