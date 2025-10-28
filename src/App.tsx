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
      {/* Mobile-First Header */}
      <header className="bg-white border-b border-gray-200 safe-area-top">
        <div className="mobile-container max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - Always visible */}
            <div className="flex items-center">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                Scholarix CRM
              </div>
            </div>

            {/* Mobile-optimized header actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User info - responsive */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 touch-target">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* User details - hidden on very small screens */}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-24 md:max-w-none">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-24 md:max-w-none">
                    {user.email}
                  </div>
                </div>
                
                {/* Role badge - smaller on mobile */}
                <div className="hidden xs:block">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              {/* Logout button - mobile-optimized */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 touch-target px-3 sm:px-4"
              >
                <SignOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Main Content */}
      <main className="mobile-container max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 safe-area-bottom">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Mobile-optimized tabs with horizontal scroll */}
          <div className="tabs-mobile">
            <TabsList className="inline-flex h-12 w-max min-w-full sm:w-full items-center justify-start sm:justify-center rounded-lg bg-muted p-1 text-muted-foreground space-x-1">
              <TabsTrigger 
                value="calls" 
                className="flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium touch-target"
              >
                <PhoneCall className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:inline">Calls</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="leads" 
                className="flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium touch-target"
              >
                <Users className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:inline">Leads</span>
              </TabsTrigger>
              
              {user.role === 'admin' && (
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium touch-target"
                >
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline sm:inline">Admin</span>
                </TabsTrigger>
              )}
              
              <TabsTrigger 
                value="profile" 
                className="flex items-center whitespace-nowrap px-3 py-2 text-sm font-medium touch-target"
              >
                <UserIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
            <div className="max-w-2xl mx-auto">
              <div className="card-mobile bg-white rounded-lg border border-gray-200">
                <h2 className="text-responsive-lg font-semibold mb-4 sm:mb-6">Profile Settings</h2>
                
                <div className="space-mobile-y">
                  <div className="grid-mobile-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <div className="text-sm text-gray-900 break-words">{user.name}</div>
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