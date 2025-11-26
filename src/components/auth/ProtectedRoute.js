import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/auth/ProtectedRoute.tsx
// Protected route component with role-based access control
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
export function ProtectedRoute({ children, allowedRoles }) {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const location = useLocation();
    // Show loading state while auth is being checked
    if (!isLoaded) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }) }));
    }
    // Redirect to login if not authenticated
    if (!isSignedIn) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    // Check role-based access if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.publicMetadata?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Access Denied" }), _jsx("p", { className: "text-gray-600", children: "You don't have permission to access this page." }), _jsx("a", { href: "/dashboard", className: "text-blue-600 hover:underline mt-4 inline-block", children: "Go to Dashboard" })] }) }));
        }
    }
    return _jsx(_Fragment, { children: children });
}
export function RoleGuard({ children, allowedRoles, fallback = null }) {
    const { user } = useUser();
    const userRole = user?.publicMetadata?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
        return _jsx(_Fragment, { children: fallback });
    }
    return _jsx(_Fragment, { children: children });
}
// =====================================================
// REQUIRE AUTH HOOK
// =====================================================
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export function useRequireAuth(redirectTo = '/login') {
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
export function useCheckRole(allowedRoles) {
    const { user } = useUser();
    const userRole = user?.publicMetadata?.role;
    if (!userRole)
        return false;
    return allowedRoles.includes(userRole);
}
// =====================================================
// GET USER ROLE HOOK
// =====================================================
export function useUserRole() {
    const { user } = useUser();
    return user?.publicMetadata?.role;
}
