/**
 * Test setup configuration for Vitest
 * This file configures the testing environment for the GO Commerce Admin Console
 */

import { expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import '@testing-library/jest-dom'
import { config } from '@vue/test-utils'
import ChakraUIVuePlugin from '@chakra-ui/vue-next'
import { theme } from '@/theme'

// Configure Vue Test Utils to use Chakra UI
config.global.plugins = [
  [
    ChakraUIVuePlugin,
    {
      extendTheme: theme,
      resetCSS: false, // Disable in tests
    },
  ],
]

// Global test setup
beforeEach(() => {
  // Reset any global state before each test
  console.warn = vi.fn()
  console.error = vi.fn()
})

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Extend Vitest's expect with additional matchers
expect.extend({
  // Add custom matchers if needed
})

// Mock environment variables for tests
vi.mock('~/env', () => ({
  VITE_API_BASE_URL: 'http://localhost:8080/api/v1',
  VITE_KEYCLOAK_URL: 'http://localhost:9000',
  VITE_KEYCLOAK_REALM: 'gocommerce',
  VITE_KEYCLOAK_CLIENT_ID: 'gocommerce-admin-console',
}))

// Mock Keycloak for tests to avoid authentication in test environment
vi.mock('keycloak-js', () => {
  return {
    default: vi.fn(() => ({
      init: vi.fn().mockResolvedValue(true),
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      updateToken: vi.fn().mockResolvedValue(true),
      authenticated: true,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      tokenParsed: {
        sub: 'test-user-id',
        preferred_username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
      },
      hasRealmRole: vi.fn().mockReturnValue(true),
      hasResourceRole: vi.fn().mockReturnValue(true),
      realmAccess: { roles: ['platform-admin'] },
      resourceAccess: {
        'gocommerce-admin-console': { roles: ['admin'] },
      },
    })),
  }
})

// Global test utilities and mocks can be added here
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver for components that might use it
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Copilot: This file may have been generated or refactored by GitHub Copilot.
