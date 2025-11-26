import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * React Query configuration and setup
 * Provides intelligent caching, background refetching, and optimistic updates
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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
                logger.error('Mutation failed', error, {
                    component: 'ReactQuery',
                });
            },
        },
    },
});
export function QueryProvider({ children }) {
    return (_jsxs(QueryClientProvider, { client: queryClient, children: [children, import.meta.env.DEV && (_jsx(ReactQueryDevtools, { initialIsOpen: false, position: "bottom-right" }))] }));
}
/**
 * Query keys factory for consistent cache management
 */
export const queryKeys = {
    // Call-related queries
    calls: {
        all: ['calls'],
        lists: () => [...queryKeys.calls.all, 'list'],
        list: (filters) => [...queryKeys.calls.lists(), filters],
        details: () => [...queryKeys.calls.all, 'detail'],
        detail: (id) => [...queryKeys.calls.details(), id],
    },
    // Lead-related queries
    leads: {
        all: ['leads'],
        lists: () => [...queryKeys.leads.all, 'list'],
        list: (filters) => [...queryKeys.leads.lists(), filters],
        details: () => [...queryKeys.leads.all, 'detail'],
        detail: (id) => [...queryKeys.leads.details(), id],
    },
    // User-related queries
    users: {
        all: ['users'],
        lists: () => [...queryKeys.users.all, 'list'],
        list: (filters) => [...queryKeys.users.lists(), filters],
        details: () => [...queryKeys.users.all, 'detail'],
        detail: (id) => [...queryKeys.users.details(), id],
        current: () => [...queryKeys.users.all, 'current'],
    },
    // Analytics queries
    analytics: {
        all: ['analytics'],
        dashboard: () => [...queryKeys.analytics.all, 'dashboard'],
        performance: () => [...queryKeys.analytics.all, 'performance'],
        conversion: () => [...queryKeys.analytics.all, 'conversion'],
    },
    // Activity logs
    activity: {
        all: ['activity'],
        lists: () => [...queryKeys.activity.all, 'list'],
        list: (limit) => [...queryKeys.activity.lists(), { limit }],
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
    calls: async (filters = {}) => {
        await queryClient.prefetchQuery({
            queryKey: queryKeys.calls.list(filters),
            staleTime: 5 * 60 * 1000,
        });
    },
    leads: async (filters = {}) => {
        await queryClient.prefetchQuery({
            queryKey: queryKeys.leads.list(filters),
            staleTime: 5 * 60 * 1000,
        });
    },
};
