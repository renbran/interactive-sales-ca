// API Service for Scholarix CRM Frontend
class ApiService {
    constructor() {
        Object.defineProperty(this, "baseURL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "token", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.baseURL = import.meta.env.VITE_API_URL || '/api';
        this.token = localStorage.getItem('scholarix-auth-token');
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` }),
                ...options.headers,
            },
        };
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            return data;
        }
        catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
    // Authentication
    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('scholarix-auth-token', data.token);
        }
        return data;
    }
    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        }
        finally {
            this.token = null;
            localStorage.removeItem('scholarix-auth-token');
        }
    }
    // User Management (Admin only)
    async getUsers() {
        return this.request('/admin/users');
    }
    async createUser(userData) {
        return this.request('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }
    async updateUser(userId, updates) {
        return this.request(`/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    }
    // Lead Management
    async getLeads(params = {}) {
        const queryString = new URLSearchParams(Object.entries(params).filter(([_, value]) => value !== undefined)).toString();
        return this.request(`/leads${queryString ? `?${queryString}` : ''}`);
    }
    async createLead(leadData) {
        return this.request('/leads', {
            method: 'POST',
            body: JSON.stringify(leadData),
        });
    }
    async updateLead(leadId, updates) {
        return this.request(`/leads/${leadId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    }
    // Call Management
    async createCall(callData) {
        return this.request('/calls', {
            method: 'POST',
            body: JSON.stringify(callData),
        });
    }
    async getCalls(leadId) {
        const endpoint = leadId ? `/calls?lead_id=${leadId}` : '/calls';
        return this.request(endpoint);
    }
    // Analytics (Admin only)
    async getActivityLog(limit = 50) {
        return this.request(`/admin/activity-log?limit=${limit}`);
    }
    async getPerformanceMetrics() {
        return this.request('/admin/performance-metrics');
    }
    // Dashboard Stats
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }
}
export const apiService = new ApiService();
