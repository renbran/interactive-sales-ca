import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeSlash, User, Lock, SignIn } from '@phosphor-icons/react';
export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error)
            setError('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                // Redirect will happen automatically via AuthContext
                window.location.href = '/dashboard';
            }
            else {
                setError(result.error || 'Login failed. Please try again.');
            }
        }
        catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const isFormValid = formData.email && formData.password;
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading..." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100", children: _jsxs("div", { className: "w-full max-w-md px-4", children: [_jsxs(Card, { className: "shadow-xl border-0", children: [_jsxs(CardHeader, { className: "text-center pb-6", children: [_jsx("div", { className: "mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center", children: _jsx(User, { className: "h-8 w-8 text-white" }) }), _jsx(CardTitle, { className: "text-2xl font-bold text-gray-900", children: "Welcome to Scholarix CRM" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Sign in to access your sales dashboard" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: "text-sm font-medium text-gray-700", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "email", name: "email", type: "email", required: true, value: formData.email, onChange: handleInputChange, placeholder: "Enter your email", className: "pl-10 h-11", disabled: isSubmitting })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", className: "text-sm font-medium text-gray-700", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "password", name: "password", type: showPassword ? "text" : "password", required: true, value: formData.password, onChange: handleInputChange, placeholder: "Enter your password", className: "pl-10 pr-10 h-11", disabled: isSubmitting }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", disabled: isSubmitting, children: showPassword ? (_jsx(EyeSlash, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] }), _jsx(Button, { type: "submit", className: "w-full h-11 bg-blue-600 hover:bg-blue-700", disabled: !isFormValid || isSubmitting, children: isSubmitting ? (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Signing in..."] })) : (_jsxs("div", { className: "flex items-center", children: [_jsx(SignIn, { className: "h-4 w-4 mr-2" }), "Sign In"] })) })] }), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-200", children: _jsx("p", { className: "text-xs text-gray-500 text-center", children: "Forgot your password? Contact your administrator." }) }), _jsxs("div", { className: "mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md", children: [_jsx("p", { className: "text-xs text-yellow-800 font-medium mb-1", children: "Demo Credentials:" }), _jsx("p", { className: "text-xs text-yellow-700", children: "Admin: admin@scholarixglobal.com / admin123" }), _jsx("p", { className: "text-xs text-yellow-600 mt-1", children: "(Change default password after first login)" })] })] })] }), _jsx("div", { className: "text-center mt-6", children: _jsx("p", { className: "text-xs text-gray-500", children: "\u00A9 2024 Scholarix Global. All rights reserved." }) })] }) }));
}
