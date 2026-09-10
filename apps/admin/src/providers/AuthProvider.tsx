import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { authApi } from '@/services/api/auth';
import { UserProfile, RoleName } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithDemo: (role?: RoleName) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const profile = await authApi.getMe();
      setCurrentUser(profile);
    } catch (err) {
      console.warn('Could not fetch server profile from /auth/me:', err);
      // If dev demo session exists, retain mock profile
      const stored = sessionStorage.getItem('krishisetu_admin_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile();
      } else {
        const stored = sessionStorage.getItem('krishisetu_admin_user');
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const creds = await signInWithEmailAndPassword(auth, email, pass);
      setFirebaseUser(creds.user);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async (role: RoleName = 'ADMIN') => {
    setIsLoading(true);
    const demoProfile: UserProfile = {
      id: 'admin-demo-uuid-001',
      firebaseUid: 'firebase-admin-demo-uid',
      email: 'admin@krishisetu.in',
      phone: '+919876543210',
      fullName: 'Swaraj Patil (Admin)',
      avatarUrl: null,
      status: 'ACTIVE',
      role,
      permissions: [
        'users:read',
        'users:write',
        'crops:read',
        'crops:write',
        'supply:read',
        'demand:read',
        'orders:read',
        'orders:update_status',
        'trips:dispatch',
        'reports:view',
        'settings:manage',
      ],
    };
    sessionStorage.setItem('krishisetu_demo_token', 'token-admin');
    sessionStorage.setItem('krishisetu_admin_user', JSON.stringify(demoProfile));
    setCurrentUser(demoProfile);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    sessionStorage.removeItem('krishisetu_demo_token');
    sessionStorage.removeItem('krishisetu_admin_user');
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setFirebaseUser(null);
    setCurrentUser(null);
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const isAuthenticated = Boolean(currentUser || firebaseUser);
  const isAdmin = Boolean(
    currentUser &&
      (currentUser.role === 'ADMIN' ||
        currentUser.role === 'SUPER_ADMIN' ||
        currentUser.role === 'STAFF'),
  );

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        isLoading,
        isAuthenticated,
        isAdmin,
        loginWithEmail,
        loginWithDemo,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
