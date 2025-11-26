// src/lib/api.ts
// API Client for Scholarix CRM
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
// =====================================================
// API CONFIGURATION
// =====================================================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
class ApiClient {
    constructor(baseUrl) {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "getToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.baseUrl = baseUrl;
    }
    // Set token getter (from Clerk)
    setTokenGetter(getter) {
        this.getToken = getter;
    }
    // Generic request method
    async request(endpoint, options = {}) {
        try {
            const token = this.getToken ? await this.getToken() : null;
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
            });
            const data = await response.json();
            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'An error occurred',
                    message: data.message,
                };
            }
            return {
                success: true,
                data: data.data || data,
            };
        }
        catch (error) {
            console.error('API request error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }
    // =====================================================
    // LEAD ENDPOINTS
    // =====================================================
    async getLeads(filters, pagination) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        params.append(key, value.join(','));
                    }
                    else {
                        params.append(key, String(value));
                    }
                }
            });
        }
        if (pagination) {
            Object.entries(pagination).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
        }
        const queryString = params.toString();
        return this.request(`/leads${queryString ? `?${queryString}` : ''}`);
    }
    async getLeadById(id) {
        return this.request(`/leads/${id}`);
    }
    async createLead(data) {
        return this.request('/leads', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateLead(id, data) {
        return this.request(`/leads/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async deleteLead(id) {
        return this.request(`/leads/${id}`, {
            method: 'DELETE',
        });
    }
    // =====================================================
    // CALL ENDPOINTS
    // =====================================================
    async getCalls(filters, pagination) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        params.append(key, value.join(','));
                    }
                    else {
                        params.append(key, String(value));
                    }
                }
            });
        }
        if (pagination) {
            Object.entries(pagination).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
        }
        const queryString = params.toString();
        return this.request(`/calls${queryString ? `?${queryString}` : ''}`);
    }
    async getCallById(id) {
        return this.request(`/calls/${id}`);
    }
    async createCall(data) {
        return this.request('/calls', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateCall(id, data) {
        return this.request(`/calls/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async deleteCall(id) {
        return this.request(`/calls/${id}`, {
            method: 'DELETE',
        });
    }
    async uploadCallRecording(callId, file) {
        const formData = new FormData();
        formData.append('recording', file);
        const token = this.getToken ? await this.getToken() : null;
        const response = await fetch(`${this.baseUrl}/calls/${callId}/recording`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData,
        });
        return response.json();
    }
    // =====================================================
    // CONVERSATION ENDPOINTS
    // =====================================================
    async getConversations(leadId) {
        return this.request(`/leads/${leadId}/conversations`);
    }
    async createConversation(data) {
        return this.request('/conversations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // =====================================================
    // USER ENDPOINTS (Admin only)
    // =====================================================
    async getUsers() {
        return this.request('/users');
    }
    async getUserById(id) {
        return this.request(`/users/${id}`);
    }
    async createUser(data) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateUser(id, data) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }
    // =====================================================
    // CALL SCRIPT ENDPOINTS
    // =====================================================
    async getCallScripts() {
        return this.request('/scripts');
    }
    async getCallScriptById(id) {
        return this.request(`/scripts/${id}`);
    }
    async createCallScript(data) {
        return this.request('/scripts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateCallScript(id, data) {
        return this.request(`/scripts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async deleteCallScript(id) {
        return this.request(`/scripts/${id}`, {
            method: 'DELETE',
        });
    }
    // =====================================================
    // TASK ENDPOINTS
    // =====================================================
    async getTasks(userId) {
        const endpoint = userId ? `/tasks?user_id=${userId}` : '/tasks';
        return this.request(endpoint);
    }
    async createTask(data) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateTask(id, data) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async deleteTask(id) {
        return this.request(`/tasks/${id}`, {
            method: 'DELETE',
        });
    }
    // =====================================================
    // TAG ENDPOINTS
    // =====================================================
    async getTags() {
        return this.request('/tags');
    }
    async createTag(data) {
        return this.request('/tags', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async addTagToLead(leadId, tagId) {
        return this.request(`/leads/${leadId}/tags/${tagId}`, {
            method: 'POST',
        });
    }
    async removeTagFromLead(leadId, tagId) {
        return this.request(`/leads/${leadId}/tags/${tagId}`, {
            method: 'DELETE',
        });
    }
    // =====================================================
    // ANALYTICS ENDPOINTS
    // =====================================================
    async getDashboardStats() {
        return this.request('/analytics/dashboard');
    }
    async getUserCallStats(userId) {
        const endpoint = userId ? `/analytics/user-calls/${userId}` : '/analytics/user-calls';
        return this.request(endpoint);
    }
    async getPipelineSummary() {
        return this.request('/analytics/pipeline');
    }
    async getAgentPerformance() {
        return this.request('/analytics/agent-performance');
    }
    // =====================================================
    // SYNC ENDPOINT (Sync Clerk user to DB)
    // =====================================================
    async syncUser(clerkUserId) {
        return this.request('/auth/sync', {
            method: 'POST',
            body: JSON.stringify({ clerk_id: clerkUserId }),
        });
    }
}
// =====================================================
// CREATE API CLIENT INSTANCE
// =====================================================
export const apiClient = new ApiClient(API_BASE_URL);
// =====================================================
// REACT HOOK FOR API CLIENT
// =====================================================
export function useApiClient() {
    const { getToken } = useAuth();
    // Set token getter on mount
    useEffect(() => {
        apiClient.setTokenGetter(getToken);
    }, [getToken]);
    return apiClient;
}
// =====================================================
// EXPORT
// =====================================================
export default apiClient;
