import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types/okr';
import { authAPI, type User as APIUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert API user to app User type
const convertAPIUser = (apiUser: APIUser): User => ({
  id: apiUser._id,
  name: apiUser.name,
  email: apiUser.email,
  role: apiUser.role,
  avatar: apiUser.avatar || '',
  avatarUrl: apiUser.avatarUrl,
  teamId: apiUser.teamId,
  createdAt: apiUser.createdAt,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('🔐 AuthContext: Initializing auth, token exists:', !!token);

      if (token) {
        try {
          console.log('🔐 AuthContext: Calling getMe API...');
          const response = await authAPI.getMe();
          const appUser = convertAPIUser(response.data);
          console.log('✅ AuthContext: Session restored successfully', appUser);
          setUser(appUser);
        } catch (error: any) {
          console.error('❌ AuthContext: Failed to restore session:', error);
          console.error('❌ AuthContext: Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('⚠️ AuthContext: No token found in localStorage');
      }
      setIsLoading(false);
      console.log('🔐 AuthContext: Initialization complete');
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      const appUser = convertAPIUser(response.data.user);

      setUser(appUser);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(appUser));

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const updateProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    if (!user || user.id !== userId) return false;

    try {
      const response = await authAPI.updateProfile({
        name: updates.name,
        avatar: updates.avatar,
        avatarUrl: updates.avatarUrl,
      });

      const appUser = convertAPIUser(response.data);
      setUser(appUser);
      localStorage.setItem('user', JSON.stringify(appUser));

      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
