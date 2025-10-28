// Authentication context and hooks for Scholarix CRM
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/lib/apiService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'agent';
  phone?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing session on app load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem('scholarix-auth-token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('scholarix-auth-token');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('scholarix-auth-token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const data = await apiService.login({ email, password });
      setUser(data.user);
      
      // Log activity
      await logActivity('user', data.user.id, 'login', {}, { timestamp: new Date().toISOString() });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Log activity before clearing user
      if (user) {
        await logActivity('user', user.id, 'logout', {}, { timestamp: new Date().toISOString() });
      }

      // Use API service for logout
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if logout call fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('scholarix-auth-token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('User refresh failed:', error);
    }
  };

  const logActivity = async (entityType: string, entityId: string, action: string, oldValues: any, newValues: any) => {
    try {
      const token = localStorage.getItem('scholarix-auth-token');
      if (!token) return;

      await fetch('/api/activity-log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          action,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify(newValues),
        }),
      });
    } catch (error) {
      console.error('Activity logging failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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

// Role-based access control hooks
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, isLoading]);

  return { user, isLoading };
}

export function useRequireRole(requiredRole: 'admin' | 'manager' | 'agent') {
  const { user, isLoading } = useAuth();
  
  const hasAccess = user && (
    user.role === 'admin' || 
    (requiredRole === 'manager' && ['admin', 'manager'].includes(user.role)) ||
    (requiredRole === 'agent' && ['admin', 'manager', 'agent'].includes(user.role))
  );

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      window.location.href = '/unauthorized';
    }
  }, [hasAccess, isLoading]);

  return { user, hasAccess, isLoading };
}

// Permission helper functions
export function canAccess(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'admin': 3,
    'manager': 2,
    'agent': 1
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

export function canEditLead(user: User, leadAssignedTo: string): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager') return true;
  return user.id === leadAssignedTo;
}

export function canViewAllLeads(user: User): boolean {
  return user.role === 'admin' || user.role === 'manager';
}