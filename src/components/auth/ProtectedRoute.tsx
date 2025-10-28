// src/components/auth/ProtectedRoute.tsx
// Protected route component with role-based access control

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../../lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  // Show loading state while auth is being checked
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.publicMetadata?.role as UserRole | undefined;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <a href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// =====================================================
// ROLE GUARD COMPONENT (For inline role checking)
// =====================================================

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as UserRole | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// =====================================================
// REQUIRE AUTH HOOK
// =====================================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRequireAuth(redirectTo: string = '/login') {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate(redirectTo);
    }
  }, [isLoaded, isSignedIn, navigate, redirectTo]);

  return { isLoaded, isSignedIn };
}

// =====================================================
// CHECK ROLE HOOK
// =====================================================

export function useCheckRole(allowedRoles: UserRole[]): boolean {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as UserRole | undefined;

  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

// =====================================================
// GET USER ROLE HOOK
// =====================================================

export function useUserRole(): UserRole | undefined {
  const { user } = useUser();
  return user?.publicMetadata?.role as UserRole | undefined;
}
