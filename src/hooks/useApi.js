/**
 * React Query hooks for API data fetching
 * Provides automatic caching, background refetching, and optimistic updates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
/**
 * Hook to fetch all calls with optional filters
 */
export function useCalls(filters = {}) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.calls.list(filters),
        queryFn: async () => {
            const token = await getToken();
            const params = new URLSearchParams();
            if (filters.limit)
                params.append('limit', filters.limit.toString());
            if (filters.leadId)
                params.append('lead_id', filters.leadId);
            const response = await fetch(`/api/calls?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok)
                throw new Error('Failed to fetch calls');
            const data = await response.json();
            return data.calls;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}
/**
 * Hook to fetch a single call by ID
 */
export function useCall(callId) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.calls.detail(callId),
        queryFn: async () => {
            const token = await getToken();
            const response = await fetch(`/api/calls/${callId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok)
                throw new Error('Failed to fetch call');
            const data = await response.json();
            return data.call;
        },
        enabled: !!callId,
    });
}
/**
 * Hook to create a new call
 */
export function useCreateCall() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (callData) => {
            const token = await getToken();
            const response = await fetch('/api/calls', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(callData),
            });
            if (!response.ok)
                throw new Error('Failed to create call');
            return response.json();
        },
        onSuccess: () => {
            invalidateQueries.calls();
            invalidateQueries.analytics();
            toast.success('Call saved successfully');
            logger.info('Call created successfully');
        },
        onError: (error) => {
            toast.error('Failed to save call');
            logger.error('Failed to create call', error);
        },
    });
}
/**
 * Hook to fetch all leads with optional filters
 */
export function useLeads(filters = {}) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.leads.list(filters),
        queryFn: async () => {
            const token = await getToken();
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value)
                    params.append(key, value.toString());
            });
            const response = await fetch(`/api/leads?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok)
                throw new Error('Failed to fetch leads');
            const data = await response.json();
            return data.leads;
        },
        staleTime: 3 * 60 * 1000, // 3 minutes
    });
}
/**
 * Hook to fetch a single lead by ID
 */
export function useLead(leadId) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.leads.detail(leadId),
        queryFn: async () => {
            const token = await getToken();
            const response = await fetch(`/api/leads/${leadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok)
                throw new Error('Failed to fetch lead');
            const data = await response.json();
            return data.lead;
        },
        enabled: !!leadId,
    });
}
/**
 * Hook to create a new lead
 */
export function useCreateLead() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (leadData) => {
            const token = await getToken();
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData),
            });
            if (!response.ok)
                throw new Error('Failed to create lead');
            return response.json();
        },
        onMutate: async (newLead) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.leads.all });
            // Snapshot previous value
            const previousLeads = queryClient.getQueryData(queryKeys.leads.lists());
            // Optimistically update to the new value
            queryClient.setQueryData(queryKeys.leads.lists(), (old) => {
                return old ? [...old, { ...newLead, id: Date.now() }] : [newLead];
            });
            return { previousLeads };
        },
        onError: (err, newLead, context) => {
            // Rollback on error
            if (context?.previousLeads) {
                queryClient.setQueryData(queryKeys.leads.lists(), context.previousLeads);
            }
            toast.error('Failed to create lead');
            logger.error('Failed to create lead', err);
        },
        onSuccess: () => {
            invalidateQueries.leads();
            toast.success('Lead created successfully');
            logger.info('Lead created successfully');
        },
    });
}
/**
 * Hook to update a lead
 */
export function useUpdateLead() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const token = await getToken();
            const response = await fetch(`/api/leads/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok)
                throw new Error('Failed to update lead');
            return response.json();
        },
        onSuccess: (_, variables) => {
            invalidateQueries.leads();
            queryClient.invalidateQueries({
                queryKey: queryKeys.leads.detail(variables.id)
            });
            toast.success('Lead updated successfully');
            logger.info('Lead updated successfully', { metadata: { leadId: variables.id } });
        },
        onError: (error) => {
            toast.error('Failed to update lead');
            logger.error('Failed to update lead', error);
        },
    });
}
/**
 * Hook to fetch analytics data
 */
export function useAnalytics() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.analytics.dashboard(),
        queryFn: async () => {
            const token = await getToken();
            const response = await fetch('/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok)
                throw new Error('Failed to fetch analytics');
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60 * 1000, // Refetch every minute
    });
}
/**
 * Hook to fetch activity logs
 */
export function useActivityLogs(limit = 50) {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.activity.list(limit),
        queryFn: async () => {
            const token = await getToken();
            const response = await fetch(`/api/admin/activity-log?limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok)
                throw new Error('Failed to fetch activity logs');
            return response.json();
        },
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}
/**
 * Hook to fetch users (admin only)
 */
export function useUsers() {
    const { getToken } = useAuth();
    return useQuery({
        queryKey: queryKeys.users.lists(),
        queryFn: async () => {
            const token = await getToken();
            const response = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok)
                throw new Error('Failed to fetch users');
            const data = await response.json();
            return data.users;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
