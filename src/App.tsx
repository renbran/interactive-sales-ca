// Main application with routing and authentication using Clerk
import { useState } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton, 
  useUser,
  RedirectToSignIn
} from '@clerk/clerk-react';
import CallApp from '@/components/CallApp';
import LeadManager from '@/components/LeadManager';
import AdminPanel from '@/pages/AdminPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { 
  PhoneCall,
  Users,
  Shield,
  User as UserIcon
} from '@phosphor-icons/react';

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Sign-in page component
function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Scholarix CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your sales dashboard
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <Button size="lg" className="w-full">
                Sign in to continue
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main protected layout
function ProtectedLayout() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('calls');

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <RedirectToSignIn />;
  }

  // Get user role from user metadata or default to 'agent'
  const userRole = user.publicMetadata?.role as string || 'agent';

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
                {/* User details - hidden on very small screens */}
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-24 md:max-w-none">
                    {user.fullName || user.firstName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-24 md:max-w-none">
                    {user.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
                
                {/* Role badge - smaller on mobile */}
                <div className="hidden xs:block">
                  {getRoleBadge(userRole)}
                </div>

                {/* Clerk User Button - handles user menu and logout */}
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8 sm:h-10 sm:w-10"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200">
        <div className="mobile-container max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 h-12 sm:h-14 bg-transparent p-0">
              <TabsTrigger 
                value="calls" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Calls</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="leads" 
                className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Leads</span>
              </TabsTrigger>
              
              {(userRole === 'admin' || userRole === 'manager') && (
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center justify-center space-x-1 sm:space-x-2 h-full text-xs sm:text-sm touch-target data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
                >
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Admin</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Tab Content */}
            <div className="min-h-[calc(100vh-8rem)]">
              <TabsContent value="calls" className="mt-0 h-full">
                <CallApp />
              </TabsContent>
              
              <TabsContent value="leads" className="mt-0 h-full">
                <LeadManager />
              </TabsContent>
              
              {(userRole === 'admin' || userRole === 'manager') && (
                <TabsContent value="admin" className="mt-0 h-full">
                  <AdminPanel />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'toast-mobile'
        }}
      />
    </div>
  );
}

// Main App component
export default function App() {
  return (
    <>
      <SignedOut>
        <SignInPage />
      </SignedOut>
      <SignedIn>
        <ProtectedLayout />
      </SignedIn>
    </>
  );
}