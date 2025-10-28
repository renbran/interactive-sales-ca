import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { ClerkProvider } from '@clerk/clerk-react';

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('Environment check:', {
  clerkPubKey: clerkPubKey ? 'Found' : 'Missing',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development'
});

if (!clerkPubKey) {
  console.error('Missing Clerk Publishable Key. Available env vars:', import.meta.env);
  throw new Error('Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file.');
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
   </ErrorBoundary>
)
