// src/lib/api.ts
// API Client for Scholarix CRM

import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type {
  ApiResponse,
  PaginatedResponse,
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  Call,
  CreateCallInput,
  UpdateCallInput,
  Conversation,
  CreateConversationInput,
  User,
  CreateUserInput,
  UpdateUserInput,
  CallScript,
  CreateCallScriptInput,
  UpdateCallScriptInput,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  Tag,
  CreateTagInput,
  DashboardStats,
  UserCallStats,
  PipelineSummary,
  AgentPerformance,
  LeadFilters,
  CallFilters,
  PaginationParams,
} from './types';

// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Set token getter (from Clerk)
  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getToken ? await this.getToken() : null;
      
      const headers: HeadersInit = {
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
    } catch (error) {
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

  async getLeads(
    filters?: LeadFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Lead>>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
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

  async getLeadById(id: number): Promise<ApiResponse<Lead>> {
    return this.request(`/leads/${id}`);
  }

  async createLead(data: CreateLeadInput): Promise<ApiResponse<Lead>> {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLead(id: number, data: UpdateLeadInput): Promise<ApiResponse<Lead>> {
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: number): Promise<ApiResponse<void>> {
    return this.request(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // =====================================================
  // CALL ENDPOINTS
  // =====================================================

  async getCalls(
    filters?: CallFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Call>>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
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

  async getCallById(id: number): Promise<ApiResponse<Call>> {
    return this.request(`/calls/${id}`);
  }

  async createCall(data: CreateCallInput): Promise<ApiResponse<Call>> {
    return this.request('/calls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCall(id: number, data: UpdateCallInput): Promise<ApiResponse<Call>> {
    return this.request(`/calls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCall(id: number): Promise<ApiResponse<void>> {
    return this.request(`/calls/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadCallRecording(callId: number, file: File): Promise<ApiResponse<{ url: string }>> {
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

  async getConversations(leadId: number): Promise<ApiResponse<Conversation[]>> {
    return this.request(`/leads/${leadId}/conversations`);
  }

  async createConversation(data: CreateConversationInput): Promise<ApiResponse<Conversation>> {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // =====================================================
  // USER ENDPOINTS (Admin only)
  // =====================================================

  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request('/users');
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`);
  }

  async createUser(data: CreateUserInput): Promise<ApiResponse<User>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: UpdateUserInput): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // =====================================================
  // CALL SCRIPT ENDPOINTS
  // =====================================================

  async getCallScripts(): Promise<ApiResponse<CallScript[]>> {
    return this.request('/scripts');
  }

  async getCallScriptById(id: number): Promise<ApiResponse<CallScript>> {
    return this.request(`/scripts/${id}`);
  }

  async createCallScript(data: CreateCallScriptInput): Promise<ApiResponse<CallScript>> {
    return this.request('/scripts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCallScript(id: number, data: UpdateCallScriptInput): Promise<ApiResponse<CallScript>> {
    return this.request(`/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCallScript(id: number): Promise<ApiResponse<void>> {
    return this.request(`/scripts/${id}`, {
      method: 'DELETE',
    });
  }

  // =====================================================
  // TASK ENDPOINTS
  // =====================================================

  async getTasks(userId?: number): Promise<ApiResponse<Task[]>> {
    const endpoint = userId ? `/tasks?user_id=${userId}` : '/tasks';
    return this.request(endpoint);
  }

  async createTask(data: CreateTaskInput): Promise<ApiResponse<Task>> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: number, data: UpdateTaskInput): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: number): Promise<ApiResponse<void>> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // =====================================================
  // TAG ENDPOINTS
  // =====================================================

  async getTags(): Promise<ApiResponse<Tag[]>> {
    return this.request('/tags');
  }

  async createTag(data: CreateTagInput): Promise<ApiResponse<Tag>> {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addTagToLead(leadId: number, tagId: number): Promise<ApiResponse<void>> {
    return this.request(`/leads/${leadId}/tags/${tagId}`, {
      method: 'POST',
    });
  }

  async removeTagFromLead(leadId: number, tagId: number): Promise<ApiResponse<void>> {
    return this.request(`/leads/${leadId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  }

  // =====================================================
  // ANALYTICS ENDPOINTS
  // =====================================================

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/analytics/dashboard');
  }

  async getUserCallStats(userId?: number): Promise<ApiResponse<UserCallStats>> {
    const endpoint = userId ? `/analytics/user-calls/${userId}` : '/analytics/user-calls';
    return this.request(endpoint);
  }

  async getPipelineSummary(): Promise<ApiResponse<PipelineSummary[]>> {
    return this.request('/analytics/pipeline');
  }

  async getAgentPerformance(): Promise<ApiResponse<AgentPerformance[]>> {
    return this.request('/analytics/agent-performance');
  }

  // =====================================================
  // SYNC ENDPOINT (Sync Clerk user to DB)
  // =====================================================

  async syncUser(clerkUserId: string, email: string, fullName: string, role: 'admin' | 'agent' = 'agent'): Promise<ApiResponse<User>> {
    return this.request('/auth/sync', {
      method: 'POST',
      body: JSON.stringify({
        clerk_id: clerkUserId,
        email,
        full_name: fullName,
        role
      }),
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
