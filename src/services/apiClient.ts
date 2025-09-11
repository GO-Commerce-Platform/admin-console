/**
 * HTTP API Client
 * Configured Axios instance with interceptors for authentication, multi-tenancy, and error handling
 * 
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { tokenManager } from './auth/tokenManager';
import { ApiErrorFactory, type BaseApiError } from './errors/apiError';
import type { PaginationParams, ApiResponse } from '@/types/api';

/**
 * API client configuration
 */
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Request configuration with additional options
 */
interface RequestConfig extends AxiosRequestConfig {
  storeId?: string;
  skipAuth?: boolean;
  skipRetry?: boolean;
  requestId?: string;
}

/**
 * Request queue item for handling concurrent requests during token refresh
 */
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

/**
 * HTTP API Client Class
 * Provides a configured Axios instance with authentication, error handling, and retry logic
 */
export class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private isRefreshing = false;
  private requestQueue: QueuedRequest[] = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => this.handleRequest(config as RequestConfig),
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleResponseError(error)
    );
  }

  /**
   * Handle outgoing requests
   */
  private async handleRequest(config: RequestConfig): Promise<RequestConfig> {
    // Generate unique request ID for tracing
    const requestId = config.requestId || this.generateRequestId();
    config.headers = {
      ...config.headers,
      'X-Request-ID': requestId,
    };

    // Add authentication header if not skipped
    if (!config.skipAuth) {
      const authHeader = await this.getAuthHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
    }

    // Add store context header for multi-tenant support
    if (config.storeId) {
      config.headers['X-Store-ID'] = config.storeId;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  }

  /**
   * Handle successful responses
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
    }

    return response;
  }

  /**
   * Handle response errors
   */
  private async handleResponseError(error: AxiosError): Promise<never> {
    const config = error.config as RequestConfig;
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${error.response?.status} ${config?.method?.toUpperCase()} ${config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !config?.skipAuth) {
      return this.handleAuthError(error);
    }

    // Handle retryable errors
    if (this.shouldRetry(error) && !config?.skipRetry) {
      return this.retryRequest(error);
    }

    // Convert to custom API error
    const apiError = ApiErrorFactory.fromAxiosError(error);
    throw apiError;
  }

  /**
   * Handle 401 authentication errors with token refresh
   */
  private async handleAuthError(error: AxiosError): Promise<never> {
    const config = error.config as RequestConfig;

    // If already refreshing, queue the request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ resolve, reject });
      }).then((token) => {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return this.client(config);
      });
    }

    this.isRefreshing = true;

    try {
      // Attempt to refresh the token
      const newToken = await tokenManager.getValidAccessToken();
      
      if (newToken) {
        // Process the queued requests
        this.processRequestQueue(newToken);
        
        // Retry the original request
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
        return this.client(config);
      } else {
        // Token refresh failed, reject all queued requests
        this.processRequestQueue(null);
        throw ApiErrorFactory.fromAxiosError(error);
      }
    } catch (refreshError) {
      this.processRequestQueue(null);
      throw ApiErrorFactory.fromAxiosError(error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processRequestQueue(token: string | null): void {
    this.requestQueue.forEach(({ resolve, reject }) => {
      if (token) {
        resolve(token);
      } else {
        reject(new Error('Token refresh failed'));
      }
    });
    this.requestQueue = [];
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    const config = error.config as RequestConfig & { _retryCount?: number };
    
    if (!config || config._retryCount >= this.config.retryAttempts) {
      return false;
    }

    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500);
  }

  /**
   * Retry failed request with exponential backoff
   */
  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as RequestConfig & { _retryCount?: number };
    config._retryCount = (config._retryCount || 0) + 1;

    const delay = this.config.retryDelay * Math.pow(2, config._retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    return this.client(config);
  }

  /**
   * Get authorization header for requests
   */
  private async getAuthHeader(): Promise<string | null> {
    try {
      const token = await tokenManager.getValidAccessToken();
      return token ? `Bearer ${token}` : null;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * GET request with type safety
   */
  public async get<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST request with type safety
   */
  public async post<T = any, D = any>(
    url: string,
    data?: D,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT request with type safety
   */
  public async put<T = any, D = any>(
    url: string,
    data?: D,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request with type safety
   */
  public async patch<T = any, D = any>(
    url: string,
    data?: D,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request with type safety
   */
  public async delete<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * GET request with pagination support
   */
  public async getPaginated<T = any>(
    url: string,
    params: PaginationParams = {},
    config: RequestConfig = {}
  ): Promise<ApiResponse<T[]>> {
    const response = await this.client.get<ApiResponse<T[]>>(url, {
      ...config,
      params: {
        page: 1,
        limit: 20,
        ...params,
        ...config.params,
      },
    });
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  public async uploadFile<T = any>(
    url: string,
    file: File,
    config: RequestConfig & {
      onUploadProgress?: (progressEvent: any) => void;
    } = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Make request with store context
   */
  public withStore(storeId: string): ApiClient {
    const newClient = new ApiClient(this.config);
    
    // Override the handleRequest method to always include storeId
    const originalHandleRequest = newClient.handleRequest.bind(newClient);
    newClient.handleRequest = async (config: RequestConfig) => {
      config.storeId = storeId;
      return originalHandleRequest(config);
    };

    return newClient;
  }

  /**
   * Get raw Axios instance (use sparingly)
   */
  public getRawClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Update base URL dynamically
   */
  public setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }

  /**
   * Set default headers
   */
  public setDefaultHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers.common, headers);
  }

  /**
   * Health check endpoint
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { skipAuth: true, skipRetry: true });
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();

/**
 * Helper function to create a store-specific API client
 */
export function createStoreApiClient(storeId: string): ApiClient {
  return apiClient.withStore(storeId);
}

/**
 * Helper function to handle API errors in components
 */
export function handleApiError(error: unknown): BaseApiError {
  if (error instanceof Error) {
    return ApiErrorFactory.fromAxiosError(error as AxiosError);
  }
  
  // Fallback for non-Error objects
  return new (class extends BaseApiError {
    constructor() {
      super(
        'An unexpected error occurred',
        0,
        'Unknown Error',
        'UNKNOWN_ERROR'
      );
    }
  })();
}

// Export types
export type { ApiClientConfig, RequestConfig };

// Copilot: This file may have been generated or refactored by GitHub Copilot.
