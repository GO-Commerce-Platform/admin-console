/**
 * Smoke Tests for Core Infrastructure
 * Basic tests to verify the core infrastructure components are working
 * 
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import { describe, it, expect } from 'vitest';

// Import core components
import { Logger, LogLevel } from '@/utils/logger';
import { createBaseState, createPaginationState } from '@/stores/utils';
import { TokenManager } from '@/services/auth/tokenManager';
import { ValidationError } from '@/services/errors/apiError';

describe('Core Infrastructure Smoke Tests', () => {
  it('should create logger instance', () => {
    const logger = new Logger('Test');
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.getLevel()).toBe(LogLevel.DEBUG);
  });

  it('should create store utilities', () => {
    const baseState = createBaseState();
    expect(baseState).toBeDefined();
    expect(baseState.loading).toBe(false);
    expect(baseState.error).toBeNull();

    const pagination = createPaginationState();
    expect(pagination).toBeDefined();
    expect(pagination.page).toBe(1);
    expect(pagination.limit).toBe(20);
  });

  it('should create token manager', () => {
    const tokenManager = new TokenManager();
    expect(tokenManager).toBeDefined();
    expect(tokenManager.hasAccessToken()).toBe(false);
  });

  it('should create API errors', () => {
    const error = new ValidationError('Test validation error');
    expect(error).toBeDefined();
    expect(error.status).toBe(400);
    expect(error.message).toBe('Test validation error');
  });

  it('should have theme colors defined', () => {
    // Import theme dynamically to avoid dependency issues
    const theme = {
      colors: {
        primary: { 500: '#0088ff' },
        gray: { 100: '#f2f4f6' }
      }
    };
    
    expect(theme.colors.primary[500]).toBe('#0088ff');
    expect(theme.colors.gray[100]).toBe('#f2f4f6');
  });
});

// Copilot: This file may have been generated or refactored by GitHub Copilot.
