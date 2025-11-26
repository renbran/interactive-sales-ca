import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Admin Panel for Scholarix CRM
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Shield, Eye, PencilSimple, Users, ChartLine, Target } from '@phosphor-icons/react';
export default function AdminPanel() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewUserDialog, setShowNewUserDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'agent',
        phone: '',
        department: ''
    });
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchAllData();
        }
    }, [user]);
    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchUsers(),
                fetchActivityLog(),
                fetchPerformanceMetrics()
            ]);
        }
        catch (error) {
            console.error('Error fetching admin data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const fetchUsers = async () => {
        const token = localStorage.getItem('scholarix-auth-token');
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            setUsers(data.users);
        }
    };
    const fetchActivityLog = async () => {
        const token = localStorage.getItem('scholarix-auth-token');
        const response = await fetch('/api/admin/activity-log?limit=50', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            setActivityLog(data.activities);
        }
    };
    const fetchPerformanceMetrics = async () => {
        const token = localStorage.getItem('scholarix-auth-token');
        const response = await fetch('/api/admin/performance-metrics', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            setPerformanceMetrics(data.metrics);
        }
    };
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('scholarix-auth-token');
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(prev => [data.user, ...prev]);
                setShowNewUserDialog(false);
                resetNewUserForm();
            }
            else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to create user');
            }
        }
        catch (error) {
            setError('Network error. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleUpdateUser = async (userId, updates) => {
        try {
            const token = localStorage.getItem('scholarix-auth-token');
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
            }
        }
        catch (error) {
            console.error('Error updating user:', error);
        }
    };
    const handleToggleUserStatus = async (userId, isActive) => {
        await handleUpdateUser(userId, { isActive });
    };
    const resetNewUserForm = () => {
        setNewUser({
            name: '',
            email: '',
            password: '',
            role: 'agent',
            phone: '',
            department: ''
        });
    };
    const getStatusBadge = (isActive) => (_jsx(Badge, { className: isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', children: isActive ? 'Active' : 'Inactive' }));
    const getRoleBadge = (role) => (_jsx(Badge, { variant: "outline", className: role === 'admin' ? 'border-purple-300 text-purple-700' :
            role === 'manager' ? 'border-blue-300 text-blue-700' :
                'border-gray-300 text-gray-700', children: role.charAt(0).toUpperCase() + role.slice(1) }));
    if (user?.role !== 'admin') {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx(Card, { className: "max-w-md", children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(Shield, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-xl font-semibold mb-2", children: "Access Denied" }), _jsx("p", { className: "text-gray-600", children: "You need administrator privileges to access this page." })] }) }) }));
    }
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading admin panel..." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Admin Panel" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage users, monitor activity, and track performance" })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "h-8 w-8 text-blue-600" }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: users.length }), _jsx("p", { className: "text-sm text-gray-600", children: "Total Users" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Shield, { className: "h-8 w-8 text-purple-600" }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: users.filter(u => u.isActive).length }), _jsx("p", { className: "text-sm text-gray-600", children: "Active Users" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(ChartLine, { className: "h-8 w-8 text-green-600" }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: activityLog.length }), _jsx("p", { className: "text-sm text-gray-600", children: "Recent Activities" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Target, { className: "h-8 w-8 text-orange-600" }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: performanceMetrics.reduce((sum, m) => sum + m.dealsClosed, 0) }), _jsx("p", { className: "text-sm text-gray-600", children: "Total Deals Closed" })] })] }) }) })] }), _jsxs(Tabs, { defaultValue: "users", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "users", children: "User Management" }), _jsx(TabsTrigger, { value: "activity", children: "Activity Log" }), _jsx(TabsTrigger, { value: "performance", children: "Performance" })] }), _jsx(TabsContent, { value: "users", children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs(CardTitle, { children: ["Users (", users.length, ")"] }), _jsxs(Dialog, { open: showNewUserDialog, onOpenChange: setShowNewUserDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(UserPlus, { className: "h-4 w-4 mr-2" }), "New User"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New User" }) }), _jsxs("form", { onSubmit: handleCreateUser, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Full Name *" }), _jsx(Input, { id: "name", value: newUser.name, onChange: (e) => setNewUser({ ...newUser, name: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email *" }), _jsx(Input, { id: "email", type: "email", value: newUser.email, onChange: (e) => setNewUser({ ...newUser, email: e.target.value }), required: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "password", children: "Password *" }), _jsx(Input, { id: "password", type: "password", value: newUser.password, onChange: (e) => setNewUser({ ...newUser, password: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "role", children: "Role *" }), _jsxs(Select, { value: newUser.role, onValueChange: (value) => setNewUser({ ...newUser, role: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "agent", children: "Agent" }), _jsx(SelectItem, { value: "manager", children: "Manager" }), _jsx(SelectItem, { value: "admin", children: "Admin" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "phone", children: "Phone" }), _jsx(Input, { id: "phone", value: newUser.phone, onChange: (e) => setNewUser({ ...newUser, phone: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "department", children: "Department" }), _jsx(Input, { id: "department", value: newUser.department, onChange: (e) => setNewUser({ ...newUser, department: e.target.value }) })] })] }), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setShowNewUserDialog(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? 'Creating...' : 'Create User' })] })] })] })] })] }), _jsx(CardContent, { className: "p-0", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Email" }), _jsx(TableHead, { children: "Role" }), _jsx(TableHead, { children: "Department" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Last Login" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: users.map((user) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: user.name }), user.phone && _jsx("div", { className: "text-sm text-gray-600", children: user.phone })] }) }), _jsx(TableCell, { children: user.email }), _jsx(TableCell, { children: getRoleBadge(user.role) }), _jsx(TableCell, { children: user.department || '-' }), _jsx(TableCell, { children: getStatusBadge(user.isActive) }), _jsx(TableCell, { children: user.lastLogin ? (new Date(user.lastLogin).toLocaleDateString()) : (_jsx("span", { className: "text-gray-400", children: "Never" })) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { size: "sm", variant: "outline", title: "View Details", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", title: "Edit User", children: _jsx(PencilSimple, { className: "h-4 w-4" }) }), _jsx(Switch, { checked: user.isActive, onCheckedChange: (checked) => handleToggleUserStatus(user.id, checked), title: user.isActive ? "Deactivate User" : "Activate User" })] }) })] }, user.id))) })] }) })] }) }), _jsx(TabsContent, { value: "activity", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { className: "p-0", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "User" }), _jsx(TableHead, { children: "Action" }), _jsx(TableHead, { children: "Entity" }), _jsx(TableHead, { children: "Date" })] }) }), _jsx(TableBody, { children: activityLog.map((activity) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: activity.userName }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: activity.action }) }), _jsxs(TableCell, { children: [activity.entityType, " #", activity.entityId.slice(-8)] }), _jsx(TableCell, { children: new Date(activity.createdAt).toLocaleString() })] }, activity.id))) })] }) })] }) }), _jsx(TabsContent, { value: "performance", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Performance Metrics" }) }), _jsx(CardContent, { className: "p-0", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "User" }), _jsx(TableHead, { children: "Calls Made" }), _jsx(TableHead, { children: "Connected" }), _jsx(TableHead, { children: "Demos Booked" }), _jsx(TableHead, { children: "Deals Closed" }), _jsx(TableHead, { children: "Revenue" }), _jsx(TableHead, { children: "Avg Call Duration" })] }) }), _jsx(TableBody, { children: performanceMetrics.map((metric) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: metric.userName }), _jsx(TableCell, { children: metric.callsMade }), _jsxs(TableCell, { children: [metric.callsConnected, _jsxs("span", { className: "text-sm text-gray-500 ml-1", children: ["(", metric.callsMade > 0 ? Math.round((metric.callsConnected / metric.callsMade) * 100) : 0, "%)"] })] }), _jsx(TableCell, { children: metric.demosBooked }), _jsx(TableCell, { children: metric.dealsClosed }), _jsxs(TableCell, { children: [metric.revenueGenerated.toLocaleString(), " AED"] }), _jsxs(TableCell, { children: [Math.round(metric.avgCallDuration / 60), "m ", metric.avgCallDuration % 60, "s"] })] }, metric.userId))) })] }) })] }) })] })] }));
}
