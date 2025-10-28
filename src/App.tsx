// Main application with routing and authentication
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import CallApp from '@/components/CallApp';
import LeadManagement from '@/pages/LeadManagement';
import AdminPanel from '@/pages/AdminPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from 'sonner';
import { 
  PhoneCall,
  Users,
  Shield,
  SignOut,
  User as UserIcon
} from '@phosphor-icons/react';

// Protected layout component
function ProtectedLayout() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('calls');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleLogout = async () => {
    await logout();
  };

  const getRoleBadge = (role: string) => (
    <Badge 
      variant="outline" 
      className={
        role === 'admin' ? 'border-purple-300 text-purple-700' :
        role === 'manager' ? 'border-blue-300 text-blue-700' :
        'border-gray-300 text-gray-700'
      }
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-blue-600">
                Scholarix CRM
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                {getRoleBadge(user.role)}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                <SignOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
            <TabsTrigger value="calls" className="flex items-center">
              <PhoneCall className="h-4 w-4 mr-2" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Leads
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="admin" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </TabsTrigger>
            )}
            <TabsTrigger value="profile" className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calls">
            <CallApp />
          </TabsContent>

          <TabsContent value="leads">
            <LeadManagement />
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}

          <TabsContent value="profile">
            <div className="max-w-2xl">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <div className="text-sm text-gray-900">{user.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <div>{getRoleBadge(user.role)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <div className="text-sm text-gray-900">{user.department || 'Not specified'}</div>
                    </div>
                  </div>

                  {user.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <div className="text-sm text-gray-900">{user.phone}</div>
                    </div>
                  )}

                  {user.lastLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Login
                      </label>
                      <div className="text-sm text-gray-900">
                        {new Date(user.lastLogin).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}

// Main App component
export default function App() {
  return (
    <AuthProvider>
      <ProtectedLayout />
    </AuthProvider>
  );
}