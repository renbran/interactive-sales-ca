/**
 * React Query configuration and setup
 * Provides intelligent caching, background refetching, and optimistic updates
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { logger } from './logger';

/**
 * Configure React Query client with optimal defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time: keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus in development
      refetchOnWindowFocus: import.meta.env.PROD,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      
      // Mutation error handler
      onError: (error) => {
        logger.error('Mutation failed', error as Error, {
          component: 'ReactQuery',
        });
      },
    },
  },
});

/**
 * React Query Provider Component
 */
interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

/**
 * Query keys factory for consistent cache management
 */
export const queryKeys = {
  // Call-related queries
  calls: {
    all: ['calls'] as const,
    lists: () => [...queryKeys.calls.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.calls.lists(), filters] as const,
    details: () => [...queryKeys.calls.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.calls.details(), id] as const,
  },
  
  // Lead-related queries
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.leads.lists(), filters] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leads.details(), id] as const,
  },
  
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },
  
  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    performance: () => [...queryKeys.analytics.all, 'performance'] as const,
    conversion: () => [...queryKeys.analytics.all, 'conversion'] as const,
  },
  
  // Activity logs
  activity: {
    all: ['activity'] as const,
    lists: () => [...queryKeys.activity.all, 'list'] as const,
    list: (limit: number) => [...queryKeys.activity.lists(), { limit }] as const,
  },
};

/**
 * Invalidate related queries after mutations
 */
export const invalidateQueries = {
  // Invalidate all call-related data
  calls: () => queryClient.invalidateQueries({ queryKey: queryKeys.calls.all }),
  
  // Invalidate all lead-related data
  leads: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }),
  
  // Invalidate all user-related data
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  
  // Invalidate analytics
  analytics: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
  
  // Invalidate activity logs
  activity: () => queryClient.invalidateQueries({ queryKey: queryKeys.activity.all }),
  
  // Invalidate everything (use sparingly)
  all: () => queryClient.invalidateQueries(),
};

/**
 * Prefetch functions for improved UX
 */
export const prefetch = {
  calls: async (filters: Record<string, unknown> = {}) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.calls.list(filters),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  leads: async (filters: Record<string, unknown> = {}) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.leads.list(filters),
      staleTime: 5 * 60 * 1000,
    });
  },
};
