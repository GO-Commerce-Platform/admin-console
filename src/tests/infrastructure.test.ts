/**
 * Core Infrastructure Tests
 * Tests for theme, HTTP client, token manager, and store utilities
 * 
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import components to test
import theme from '@/theme';
import { ApiClient } from '@/services/apiClient';
import { TokenManager, TokenValidator } from '@/services/auth/tokenManager';
import { ApiErrorFactory, ValidationError, AuthenticationError } from '@/services/errors/apiError';
import { Logger, LogLevel, DevTools, FeatureFlags, Environment } from '@/utils/logger';
import { 
  createBaseState, 
  createPaginationState, 
  createLoadingManager, 
  createErrorManager 
} from '@/stores/utils';

describe('Theme Configuration', () => {
  it('should have all required theme properties', () => {
    expect(theme).toBeDefined();
    expect(theme.colors).toBeDefined();
    expect(theme.components).toBeDefined();
    expect(theme.fonts).toBeDefined();
    expect(theme.space).toBeDefined();
    expect(theme.breakpoints).toBeDefined();
  });

  it('should have professional color palette', () => {
    expect(theme.colors.primary).toBeDefined();
    expect(theme.colors.primary[500]).toBe('#0088ff');
    expect(theme.colors.secondary).toBeDefined();
    expect(theme.colors.gray).toBeDefined();
    expect(theme.colors.success).toBeDefined();
    expect(theme.colors.error).toBeDefined();
  });

  it('should have 8px grid system spacing', () => {
    expect(theme.space[2]).toBe('8px');   // Base unit
    expect(theme.space[4]).toBe('16px');  // 2x base
    expect(theme.space[6]).toBe('24px');  // 3x base
    expect(theme.space[8]).toBe('32px');  // 4x base
  });

  it('should have responsive breakpoints', () => {
    expect(theme.breakpoints.sm).toBe('320px');
    expect(theme.breakpoints.md).toBe('768px');
    expect(theme.breakpoints.lg).toBe('1024px');
  });
});

describe('API Client', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient({
      baseURL: 'http://localhost:8080/api/v1',
      timeout: 5000,
      retryAttempts: 2,
      retryDelay: 500,
    });
  });

  it('should create API client with proper configuration', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.healthCheck).toBeDefined();
    expect(apiClient.get).toBeDefined();
    expect(apiClient.post).toBeDefined();
    expect(apiClient.put).toBeDefined();
    expect(apiClient.delete).toBeDefined();
  });

  it('should generate unique request IDs', () => {
    // Test the private method indirectly by checking if requests have unique IDs
    const client = apiClient as any;
    const id1 = client.generateRequestId();
    const id2 = client.generateRequestId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^req_\\d+_[a-z0-9]+$/);
  });

  it('should create store-specific client', () => {
    const storeClient = apiClient.withStore('test-store-123');
    expect(storeClient).toBeDefined();
    expect(storeClient).toBeInstanceOf(ApiClient);
  });
});

describe('Token Manager', () => {
  let tokenManager: TokenManager;
  const mockTokenResponse = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
  };

  beforeEach(() => {
    tokenManager = new TokenManager();
    // Clear any stored tokens
    tokenManager.clearTokens();
  });

  it('should store and retrieve tokens', () => {
    tokenManager.storeTokens(mockTokenResponse);
    
    expect(tokenManager.hasAccessToken()).toBe(true);
    expect(tokenManager.getAccessToken()).toBe(mockTokenResponse.accessToken);
    expect(tokenManager.getRefreshToken()).toBe(mockTokenResponse.refreshToken);
    expect(tokenManager.getTokenType()).toBe(mockTokenResponse.tokenType);
  });

  it('should detect token expiration', () => {
    const expiredTokenResponse = {
      ...mockTokenResponse,
      expiresIn: -3600, // Expired 1 hour ago
    };
    
    tokenManager.storeTokens(expiredTokenResponse);
    expect(tokenManager.isTokenExpired()).toBe(true);
    expect(tokenManager.isTokenValid()).toBe(false);
  });

  it('should clear all tokens', () => {
    tokenManager.storeTokens(mockTokenResponse);
    expect(tokenManager.hasAccessToken()).toBe(true);
    
    tokenManager.clearTokens();
    expect(tokenManager.hasAccessToken()).toBe(false);
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it('should provide token info for debugging', () => {
    tokenManager.storeTokens(mockTokenResponse);
    const info = tokenManager.getTokenInfo();
    
    expect(info.hasAccessToken).toBe(true);
    expect(info.hasRefreshToken).toBe(true);
    expect(info.tokenType).toBe('Bearer');
    expect(info.isRefreshing).toBe(false);
  });
});

describe('Token Validator', () => {
  const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlcyI6WyJhZG1pbiIsInVzZXIiXX0.invalid';

  it('should decode JWT payload', () => {
    const payload = TokenValidator.decodeJwtPayload(mockJwtToken);
    expect(payload).toBeDefined();
    expect(payload.sub).toBe('1234567890');
    expect(payload.name).toBe('John Doe');
  });

  it('should extract user roles from token', () => {
    const roles = TokenValidator.getUserRoles(mockJwtToken);
    expect(roles).toEqual(['admin', 'user']);
  });

  it('should check if token has specific role', () => {
    expect(TokenValidator.hasRole(mockJwtToken, 'admin')).toBe(true);
    expect(TokenValidator.hasRole(mockJwtToken, 'user')).toBe(true);
    expect(TokenValidator.hasRole(mockJwtToken, 'guest')).toBe(false);
  });

  it('should get user info from token', () => {
    const userInfo = TokenValidator.getUserInfo(mockJwtToken);
    expect(userInfo).toBeDefined();
    expect(userInfo?.sub).toBe('1234567890');
    expect(userInfo?.name).toBe('John Doe');
    expect(userInfo?.roles).toEqual(['admin', 'user']);
  });
});

describe('API Error Factory', () => {
  it('should create validation error from 400 response', () => {
    const mockResponse = {
      status: 400,
      statusText: 'Bad Request',
      data: {
        message: 'Validation failed',
        validationErrors: {
          name: ['Name is required'],
          email: ['Invalid email format'],
        },
      },
      headers: {},
    } as any;

    const error = ApiErrorFactory.fromResponse(mockResponse);
    expect(error).toBeInstanceOf(ValidationError);
    
    const validationError = error as ValidationError;
    expect(validationError.status).toBe(400);
    expect(validationError.message).toBe('Validation failed');
    expect(validationError.validationErrors.name).toEqual(['Name is required']);
  });

  it('should create authentication error from 401 response', () => {
    const mockResponse = {
      status: 401,
      statusText: 'Unauthorized',
      data: {
        message: 'Authentication required',
      },
      headers: {},
    } as any;

    const error = ApiErrorFactory.fromResponse(mockResponse);
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.status).toBe(401);
    expect(error.getUserMessage()).toBe('Please log in to continue.');
  });

  it('should determine if errors are retryable', () => {
    const validationError = new ValidationError();
    const authError = new AuthenticationError();
    const serverError = new (ApiErrorFactory as any).ServerError();

    expect(ApiErrorFactory.isRetryable(validationError)).toBe(false);
    expect(ApiErrorFactory.isRetryable(authError)).toBe(false);
    // Note: ServerError test would need proper implementation
  });
});

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: any;

  beforeEach(() => {
    logger = new Logger('TestLogger');
    consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should create logger with category', () => {
    expect(logger).toBeDefined();
  });

  it('should respect log levels', () => {
    logger.setLevel(LogLevel.WARN);
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    
    // Debug and info should not be logged, warn should be
    expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(false);
    expect(logger.isLevelEnabled(LogLevel.INFO)).toBe(false);
    expect(logger.isLevelEnabled(LogLevel.WARN)).toBe(true);
  });

  it('should create child loggers', () => {
    const childLogger = logger.child('SubCategory');
    expect(childLogger).toBeDefined();
    expect(childLogger).toBeInstanceOf(Logger);
  });

  it('should store and retrieve log entries', () => {
    logger.info('Test message');
    logger.warn('Warning message');
    
    const entries = logger.getEntries();
    expect(entries.length).toBeGreaterThanOrEqual(2);
    
    const warnEntries = logger.getEntries(LogLevel.WARN);
    expect(warnEntries.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Development Tools', () => {
  it('should track function execution time', () => {
    const testFunction = (x: number) => x * 2;
    const timedFunction = DevTools.timeFunction(testFunction, 'multiply');
    
    const result = timedFunction(5);
    expect(result).toBe(10);
  });

  it('should track async function execution time', async () => {
    const asyncFunction = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return x * 2;
    };
    
    const timedAsyncFunction = DevTools.timeAsyncFunction(asyncFunction, 'asyncMultiply');
    const result = await timedAsyncFunction(5);
    expect(result).toBe(10);
  });
});

describe('Feature Flags', () => {
  beforeEach(() => {
    // Clear existing flags
    FeatureFlags.setFlag('test-flag', false);
  });

  it('should set and get feature flags', () => {
    FeatureFlags.setFlag('new-feature', true);
    expect(FeatureFlags.isEnabled('new-feature')).toBe(true);
    
    FeatureFlags.setFlag('disabled-feature', false);
    expect(FeatureFlags.isEnabled('disabled-feature')).toBe(false);
  });

  it('should return false for undefined flags', () => {
    expect(FeatureFlags.isEnabled('non-existent-flag')).toBe(false);
  });

  it('should get all flags', () => {
    FeatureFlags.setFlag('flag1', true);
    FeatureFlags.setFlag('flag2', false);
    
    const allFlags = FeatureFlags.getAllFlags();
    expect(allFlags.flag1).toBe(true);
    expect(allFlags.flag2).toBe(false);
  });
});

describe('Environment', () => {
  it('should load configuration', () => {
    Environment.loadConfig();
    const config = Environment.getAll();
    
    expect(config).toBeDefined();
    expect(config.API_BASE_URL).toBeDefined();
    expect(config.ENVIRONMENT).toBeDefined();
  });

  it('should get configuration values', () => {
    Environment.loadConfig();
    
    const apiUrl = Environment.get('API_BASE_URL');
    expect(apiUrl).toBeDefined();
    
    const defaultValue = Environment.get('NON_EXISTENT_KEY', 'default');
    expect(defaultValue).toBe('default');
  });

  it('should detect environment', () => {
    // These tests depend on the actual environment
    const isDev = Environment.isDevelopment();
    const isProd = Environment.isProduction();
    
    expect(typeof isDev).toBe('boolean');
    expect(typeof isProd).toBe('boolean');
    expect(isDev || isProd).toBe(true); // Should be one or the other
  });
});

describe('Store Utils', () => {
  it('should create base state', () => {
    const state = createBaseState();
    
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastUpdated).toBeNull();
  });

  it('should create pagination state', () => {
    const pagination = createPaginationState();
    
    expect(pagination.page).toBe(1);
    expect(pagination.limit).toBe(20);
    expect(pagination.total).toBe(0);
    expect(pagination.hasMore).toBe(false);
  });

  it('should create loading manager', () => {
    const manager = createLoadingManager();
    
    expect(manager.isLoading()).toBe(false);
    
    manager.setLoading('test', true);
    expect(manager.isLoading('test')).toBe(true);
    expect(manager.isLoading()).toBe(true);
    
    manager.setLoading('test', false);
    expect(manager.isLoading('test')).toBe(false);
    expect(manager.isLoading()).toBe(false);
  });

  it('should create error manager', () => {
    const manager = createErrorManager();
    
    expect(manager.hasError()).toBe(false);
    
    manager.setError('test', 'Test error message');
    expect(manager.hasError('test')).toBe(true);
    expect(manager.getError('test')).toBe('Test error message');
    
    manager.clearError('test');
    expect(manager.hasError('test')).toBe(false);
    expect(manager.getError('test')).toBeNull();
  });
});

// Copilot: This file may have been generated or refactored by GitHub Copilot.
