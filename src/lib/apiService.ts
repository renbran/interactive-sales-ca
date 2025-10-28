// API Service for Scholarix CRM Frontend
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '/api';
    this.token = localStorage.getItem('scholarix-auth-token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
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
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: { email: string; password: string }) {
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
    } finally {
      this.token = null;
      localStorage.removeItem('scholarix-auth-token');
    }
  }

  // User Management (Admin only)
  async getUsers() {
    return this.request('/admin/users');
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    phone?: string;
  }) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, updates: any) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Lead Management
  async getLeads(params: {
    status?: string;
    source?: string;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][]
    ).toString();
    
    return this.request(`/leads${queryString ? `?${queryString}` : ''}`);
  }

  async createLead(leadData: {
    name: string;
    email: string;
    phone: string;
    country?: string;
    industry?: string;
    company_size?: string;
    interest_level?: string;
    source?: string;
    assigned_to?: string;
    notes?: string;
  }) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(leadId: string, updates: any) {
    return this.request(`/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Call Management
  async createCall(callData: {
    lead_id: string;
    status?: string;
    started_at?: string;
    duration?: number;
    outcome?: string;
    qualification_score?: number;
    next_steps?: string;
    notes?: string;
  }) {
    return this.request('/calls', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  }

  async getCalls(leadId?: string) {
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