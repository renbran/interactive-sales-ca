/**
 * Unified API error handling and client
 * Provides consistent error handling across all API calls
 */

import { logger } from './logger';
import { getEnv } from './env';

/**
 * Custom API Error class with status code and error code
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.status === 0;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (this.isAuthError()) {
      return 'Authentication failed. Please sign in again.';
    }
    
    if (this.status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (this.isServerError()) {
      return 'A server error occurred. Please try again later.';
    }
    
    return this.message || 'An unexpected error occurred.';
  }
}

/**
 * API request options
 */
interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  data: T;
  status: number;
}

/**
 * Unified API client
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout = 30000; // 30 seconds

  constructor() {
    const env = getEnv();
    this.baseURL = env.API_BASE_URL;
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string | null> {
    // This will be injected by Clerk's useAuth hook in components
    // For now, return null - components should pass token via headers
    return null;
  }

  /**
   * Make API request with timeout and error handling
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      skipAuth = false,
      headers = {},
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const startTime = performance.now();

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Prepare headers
      const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Add auth token if not skipped
      if (!skipAuth) {
        const token = await this.getAuthToken();
        if (token) {
          (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
      }

      // Log request in development
      logger.apiRequest(
        fetchOptions.method || 'GET',
        endpoint,
        undefined
      );

      // Make request
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log response time
      logger.perf(`API ${fetchOptions.method || 'GET'} ${endpoint}`, startTime);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Unknown error',
          message: response.statusText,
        }));

        const apiError = new ApiError(
          response.status,
          errorData.code || 'UNKNOWN_ERROR',
          errorData.message || response.statusText,
          errorData
        );

        logger.apiError(
          fetchOptions.method || 'GET',
          endpoint,
          response.status,
          apiError
        );

        throw apiError;
      }

      // Parse response
      const data = await response.json();

      logger.apiRequest(
        fetchOptions.method || 'GET',
        endpoint,
        response.status
      );

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new ApiError(
          0,
          'TIMEOUT',
          `Request timeout after ${timeout}ms`
        );
        logger.apiError(fetchOptions.method || 'GET', endpoint, 0, timeoutError);
        throw timeoutError;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        const networkError = new ApiError(
          0,
          'NETWORK_ERROR',
          'Network request failed. Please check your connection.'
        );
        logger.apiError(fetchOptions.method || 'GET', endpoint, 0, networkError);
        throw networkError;
      }

      // Re-throw ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle unexpected errors
      const unexpectedError = new ApiError(
        0,
        'UNEXPECTED_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        error
      );
      logger.apiError(fetchOptions.method || 'GET', endpoint, 0, unexpectedError);
      throw unexpectedError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
