import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Main application with routing and authentication using Clerk
import { useState, lazy, Suspense } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, RedirectToSignIn } from '@clerk/clerk-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { PhoneCall, Users, Shield, User as UserIcon, Books, Robot, ChartBar } from '@phosphor-icons/react';
import { CallErrorBoundary, AIErrorBoundary, LeadErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundaries';
import { QueryProvider } from '@/lib/queryClient';
// Lazy load heavy components for better performance
const CallApp = lazy(() => import('@/components/CallApp'));
const LeadManager = lazy(() => import('@/components/LeadManager'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const ScriptTestPage = lazy(() => import('@/pages/ScriptTestPage'));
const AdvancedAnalyticsDashboard = lazy(() => import('@/components/AdvancedAnalyticsDashboard'));
const RolePlayPage = lazy(() => import('@/pages/RolePlayPage'));
// Loading component
function LoadingSpinner() {
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading..." })] }) }));
}
// Component loading fallback with skeleton
function ComponentLoadingFallback() {
    return (_jsxs("div", { className: "p-4 md:p-6 space-y-6 animate-in fade-in duration-300", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-8 w-48 bg-gray-200 rounded-md animate-pulse" }), _jsx("div", { className: "h-4 w-64 bg-gray-200 rounded-md animate-pulse" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Array.from({ length: 3 }).map((_, i) => (_jsxs("div", { className: "rounded-lg border bg-white p-6 space-y-3", children: [_jsx("div", { className: "h-4 w-24 bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-8 w-20 bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-3 w-32 bg-gray-200 rounded animate-pulse" })] }, i))) })] }));
}
// Sign-in page component
function SignInPage() {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { children: [_jsx("div", { className: "mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100", children: _jsx(UserIcon, { className: "h-6 w-6 text-blue-600" }) }), _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Welcome to Scholarix CRM" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Sign in to access your sales dashboard" })] }), _jsx("div", { className: "mt-8 space-y-6", children: _jsx("div", { className: "flex justify-center", children: _jsx(SignInButton, { mode: "modal", children: _jsx(Button, { size: "lg", className: "w-full", children: "Sign in to continue" }) }) }) })] }) }));
}
// Main protected layout
function ProtectedLayout() {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState('calls');
    if (!isLoaded) {
        return _jsx(LoadingSpinner, {});
    }
    if (!user) {
        return _jsx(RedirectToSignIn, {});
    }
    // Get user role from user metadata or default to 'agent'
    const userRole = user.publicMetadata?.role || 'agent';
    const getRoleBadge = (role) => (_jsx(Badge, { variant: "outline", className: role === 'admin' ? 'border-purple-300 text-purple-700' :
            role === 'manager' ? 'border-blue-300 text-blue-700' :
                'border-gray-300 text-gray-700', children: role.charAt(0).toUpperCase() + role.slice(1) }));
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white border-b border-gray-200 safe-area-top", children: _jsx("div", { className: "mobile-container max-w-7xl mx-auto", children: _jsxs("div", { className: "flex justify-between items-center h-16 sm:h-20", children: [_jsx("div", { className: "flex items-center", children: _jsx("div", { className: "text-lg sm:text-xl font-bold text-blue-600", children: "Scholarix CRM" }) }), _jsx("div", { className: "flex items-center space-x-2 sm:space-x-4", children: _jsxs("div", { className: "flex items-center space-x-2 sm:space-x-3", children: [_jsxs("div", { className: "hidden sm:block", children: [_jsx("div", { className: "text-sm font-medium text-gray-900 truncate max-w-24 md:max-w-none", children: user.fullName || user.firstName || 'User' }), _jsx("div", { className: "text-xs text-gray-500 truncate max-w-24 md:max-w-none", children: user.primaryEmailAddress?.emailAddress })] }), _jsx("div", { className: "hidden xs:block", children: getRoleBadge(userRole) }), _jsx(UserButton, { appearance: {
                                                elements: {
                                                    avatarBox: "h-8 w-8 sm:h-10 sm:w-10"
                                                }
                                            } })] }) })] }) }) }), _jsx("div", { className: "bg-white border-b border-gray-200", children: _jsx("div", { className: "mobile-container max-w-7xl mx-auto", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5 md:grid-cols-6 h-12 sm:h-14 bg-transparent p-0", children: [_jsxs(TabsTrigger, { value: "calls", className: "flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600", children: [_jsx(PhoneCall, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { children: "Calls" })] }), _jsxs(TabsTrigger, { value: "leads", className: "flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600", children: [_jsx(Users, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { children: "Leads" })] }), _jsxs(TabsTrigger, { value: "analytics", className: "flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600", children: [_jsx(ChartBar, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { className: "hidden sm:inline", children: "Analytics" }), _jsx("span", { className: "sm:hidden", children: "Stats" })] }), _jsxs(TabsTrigger, { value: "roleplay", className: "flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600", children: [_jsx(Robot, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { className: "hidden sm:inline", children: "AI Practice" }), _jsx("span", { className: "sm:hidden", children: "AI" })] }), _jsxs(TabsTrigger, { value: "script-test", className: "flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600", children: [_jsx(Books, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { className: "hidden sm:inline", children: "Script Test" }), _jsx("span", { className: "sm:hidden", children: "Script" })] }), (userRole === 'admin' || userRole === 'manager') && (_jsxs(TabsTrigger, { value: "admin", className: "flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600", children: [_jsx(Shield, { className: "h-4 w-4 sm:h-5 sm:w-5" }), _jsx("span", { children: "Admin" })] }))] }), _jsxs("div", { className: "min-h-[calc(100vh-8rem)]", children: [_jsx(TabsContent, { value: "calls", className: "mt-0 h-full", children: _jsx(CallErrorBoundary, { componentName: "CallApp", children: _jsx(Suspense, { fallback: _jsx(ComponentLoadingFallback, {}), children: _jsx(CallApp, {}) }) }) }), _jsx(TabsContent, { value: "leads", className: "mt-0 h-full", children: _jsx(LeadErrorBoundary, { componentName: "LeadManager", children: _jsx(Suspense, { fallback: _jsx(ComponentLoadingFallback, {}), children: _jsx(LeadManager, {}) }) }) }), _jsx(TabsContent, { value: "analytics", className: "mt-0 h-full", children: _jsx(ComponentErrorBoundary, { children: _jsx(Suspense, { fallback: _jsx(ComponentLoadingFallback, {}), children: _jsx(AdvancedAnalyticsDashboard, {}) }) }) }), _jsx(TabsContent, { value: "roleplay", className: "mt-0 h-full", children: _jsx(AIErrorBoundary, { componentName: "RolePlayPage", children: _jsx(Suspense, { fallback: _jsx(ComponentLoadingFallback, {}), children: _jsx(RolePlayPage, {}) }) }) }), _jsx(TabsContent, { value: "script-test", className: "mt-0 h-full", children: _jsx(AIErrorBoundary, { componentName: "ScriptTestPage", children: _jsx(Suspense, { fallback: _jsx(ComponentLoadingFallback, {}), children: _jsx(ScriptTestPage, {}) }) }) }), (userRole === 'admin' || userRole === 'manager') && (_jsx(TabsContent, { value: "admin", className: "mt-0 h-full", children: _jsx(Suspense, { fallback: _jsx(ComponentLoadingFallback, {}), children: _jsx(AdminPanel, {}) }) }))] })] }) }) }), _jsx(Toaster, { position: "top-center", toastOptions: {
                    className: 'toast-mobile'
                } })] }));
}
// Main App component
export default function App() {
    return (_jsxs(QueryProvider, { children: [_jsx(SignedOut, { children: _jsx(SignInPage, {}) }), _jsx(SignedIn, { children: _jsx(ProtectedLayout, {}) })] }));
}
