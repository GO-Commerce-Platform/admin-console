/**
 * Authentication Store
 * Manages authentication state, user profiles, roles, and store context using Pinia
 *
 * Related GitHub Issue: #2 - Authentication System & Security
 */

import { defineStore } from 'pinia'
import type { UserProfile, Role, RoleName, StoreAccess } from '@/types/auth'
import { keycloakService, type AuthEvent } from '@/services/keycloakService'
import { apiClient } from '@/services/apiClient'
import { tokenManager } from '@/services/auth/tokenManager'
import { logger } from '@/utils/logger'

/**
 * Authentication status states
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error'

/**
 * Authentication store state interface
 */
interface AuthState {
  status: AuthStatus
  isAuthenticated: boolean
  user: UserProfile | null
  roles: RoleName[]
  selectedStoreId: string | null
  error: string | null
  isInitializing: boolean
}

/**
 * Custom errors for authentication operations
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly requiredRoles?: RoleName[]
  ) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class StoreAccessError extends Error {
  constructor(
    message: string,
    public readonly storeId?: string
  ) {
    super(message)
    this.name = 'StoreAccessError'
  }
}

/**
 * Authentication Store
 * Manages all authentication-related state and operations
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    status: 'idle',
    isAuthenticated: false,
    user: null,
    roles: [],
    selectedStoreId: null,
    error: null,
    isInitializing: true,
  }),

  getters: {
    /**
     * Check if the current user is a platform administrator
     */
    isPlatformAdmin: (state): boolean => {
      return state.roles.includes('platform-admin')
    },

    /**
     * Check if the current user is store-scoped (not platform admin)
     */
    isStoreScopedUser: (state): boolean => {
      return !state.roles.includes('platform-admin') && state.roles.length > 0
    },

    /**
     * Get available stores for the current user
     */
    availableStores: (state): StoreAccess[] => {
      return state.user?.storeAccess || []
    },

    /**
     * Get effective roles for display and debugging
     */
    effectiveRoles: (state): Role[] => {
      return state.user?.roles || []
    },

    /**
     * Check if authentication is in a loading state
     */
    isLoadingAuth: (state): boolean => {
      return state.status === 'loading' || state.isInitializing
    },

    /**
     * Get current store name if selected
     */
    selectedStoreName: (state): string | null => {
      if (!state.selectedStoreId || !state.user?.storeAccess) {
        return null
      }

      const store = state.user.storeAccess.find(s => s.storeId === state.selectedStoreId)
      return store?.storeName || null
    },

    /**
     * Check if user can access store-scoped features
     */
    canAccessStoreFeatures: (state): boolean => {
      return state.isPlatformAdmin || !!state.selectedStoreId
    },
  },

  actions: {
    /**
     * Initialize authentication system
     */
    async init(): Promise<boolean> {
      try {
        this.status = 'loading'
        this.isInitializing = true
        this.error = null

        logger.info('Initializing authentication...')

        // Set up Keycloak event listeners
        this.setupKeycloakEventListeners()

        // Initialize Keycloak
        const isAuthenticated = await keycloakService.init()

        if (isAuthenticated) {
          await this.loadProfile()
          this.setAuthenticated()
        } else {
          this.setUnauthenticated()
        }

        this.isInitializing = false
        logger.info('Authentication initialized', { isAuthenticated })

        return isAuthenticated
      } catch (error) {
        this.handleAuthError('Failed to initialize authentication', error)
        this.isInitializing = false
        return false
      }
    },

    /**
     * Set up Keycloak event listeners
     */
    setupKeycloakEventListeners(): void {
      keycloakService.on('authenticated', () => {
        this.loadProfile().then(() => {
          this.setAuthenticated()
        })
      })

      keycloakService.on('unauthenticated', () => {
        this.setUnauthenticated()
      })

      keycloakService.on('token-refreshed', () => {
        // Token refreshed, no need to reload profile unless specifically needed
        logger.debug('Token refreshed successfully')
      })

      keycloakService.on('token-expired', () => {
        // Token expired, this is handled by the service automatically
        logger.warn('Token expired')
      })

      keycloakService.on('logout', () => {
        this.clearAuthState()
      })

      keycloakService.on('error', (event: AuthEvent) => {
        this.handleAuthError('Authentication error', event.payload?.error)
      })
    },

    /**
     * Perform login
     */
    async login(redirectUri?: string): Promise<void> {
      try {
        this.status = 'loading'
        this.error = null

        logger.info('Initiating login...')
        await keycloakService.login(redirectUri)
      } catch (error) {
        this.handleAuthError('Login failed', error)
        throw error
      }
    },

    /**
     * Perform logout
     */
    async logout(redirectUri?: string): Promise<void> {
      try {
        this.status = 'loading'
        this.error = null

        logger.info('Initiating logout...')

        // Clear local state first
        this.clearAuthState()

        // Logout from Keycloak
        await keycloakService.logout(redirectUri)
      } catch (error) {
        this.handleAuthError('Logout failed', error)
        throw error
      }
    },

    /**
     * Refresh authentication token
     */
    async refresh(): Promise<string | null> {
      try {
        logger.info('Refreshing authentication token...')

        const token = await keycloakService.refreshToken()

        if (token) {
          // Optionally reload profile if needed
          logger.debug('Token refreshed successfully')
        }

        return token
      } catch (error) {
        this.handleAuthError('Token refresh failed', error)
        throw error
      }
    },

    /**
     * Handle OAuth2 callback for iframe authentication
     */
    async handleOAuthCallback(code: string, state: string): Promise<boolean> {
      try {
        this.status = 'loading'
        this.error = null

        logger.info('Processing OAuth2 callback', { hasCode: !!code, hasState: !!state })

        // Get PKCE code verifier from session storage
        const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
        if (!codeVerifier) {
          throw new Error('Missing PKCE code verifier')
        }

        // Exchange authorization code for tokens
        const tokenResponse = await this.exchangeCodeForTokens(code, codeVerifier, state)
        
        if (tokenResponse) {
          // Store tokens
          tokenManager.storeTokens(tokenResponse)
          
          // Load user profile
          await this.loadProfile()
          
          // Set authenticated state
          this.setAuthenticated()
          
          // Clean up PKCE verifier
          sessionStorage.removeItem('pkce_code_verifier')
          
          logger.info('OAuth2 callback processed successfully')
          return true
        }
        
        return false
      } catch (error) {
        this.handleAuthError('OAuth2 callback processing failed', error)
        sessionStorage.removeItem('pkce_code_verifier')
        return false
      }
    },

    /**
     * Exchange authorization code for tokens using PKCE
     */
    async exchangeCodeForTokens(code: string, codeVerifier: string, state: string): Promise<any> {
      // Use direct Keycloak URL for token exchange to avoid proxy issues
      const baseUrl = import.meta.env.VITE_KEYCLOAK_DIRECT_URL || keycloakService.getKeycloakUrl()
      const realm = keycloakService.getRealm()
      const clientId = keycloakService.getClientId()
      const redirectUri = `${window.location.origin}/auth/iframe-callback`

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      })

      const response = await fetch(`${baseUrl}/realms/${realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error_description || 'Token exchange failed')
      }

      const tokenData = await response.json()
      
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type || 'Bearer',
        scope: tokenData.scope || ''
      }
    },

    /**
     * Load user profile from backend
     */
    async loadProfile(): Promise<void> {
      try {
        logger.info('Loading user profile...')

        // Get user profile from backend
        const userProfile = await keycloakService.getUserProfile()

        // Update state
        this.user = userProfile
        this.roles = userProfile.roles.map(role => role.name)

        // Set default store if not already set
        if (!this.selectedStoreId && userProfile.storeAccess.length > 0) {
          const defaultStore = userProfile.storeAccess.find(store => store.isDefault)
          if (defaultStore) {
            this.selectedStoreId = defaultStore.storeId
          } else if (userProfile.storeAccess.length === 1) {
            // If only one store, select it automatically
            this.selectedStoreId = userProfile.storeAccess[0].storeId
          }
        }

        logger.info('User profile loaded successfully', {
          userId: userProfile.id,
          roles: this.roles,
          storeAccess: userProfile.storeAccess.length,
          selectedStoreId: this.selectedStoreId,
        })
      } catch (error) {
        this.handleAuthError('Failed to load user profile', error)
        throw error
      }
    },

    /**
     * Set selected store context
     */
    setSelectedStore(storeId: string): void {
      if (!this.canAccessStore(storeId)) {
        throw new StoreAccessError(`Access denied to store: ${storeId}`, storeId)
      }

      this.selectedStoreId = storeId
      logger.info('Store context changed', { storeId })
    },

    /**
     * Clear selected store context
     */
    clearSelectedStore(): void {
      this.selectedStoreId = null
      logger.info('Store context cleared')
    },

    /**
     * Check if user has specific role
     */
    hasRole(role: RoleName): boolean {
      return this.roles.includes(role)
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles: RoleName[]): boolean {
      return roles.some(role => this.hasRole(role))
    },

    /**
     * Check if user can access specific store
     */
    canAccessStore(storeId: string): boolean {
      // Platform admins can access any store
      if (this.isPlatformAdmin) {
        return true
      }

      // Check if user has access to the specific store
      return this.user?.storeAccess.some(store => store.storeId === storeId) || false
    },

    /**
     * Ensure user is authenticated
     */
    ensureAuthenticated(): void {
      if (!this.isAuthenticated) {
        throw new AuthenticationError('Authentication required')
      }
    },

    /**
     * Ensure user has required roles
     */
    ensureRoles(requiredRoles: RoleName[]): void {
      this.ensureAuthenticated()

      if (!this.hasAnyRole(requiredRoles)) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${requiredRoles.join(', ')}`,
          requiredRoles
        )
      }
    },

    /**
     * Ensure user has access to specific store
     */
    ensureStoreAccess(storeId: string): void {
      this.ensureAuthenticated()

      if (!this.canAccessStore(storeId)) {
        throw new StoreAccessError(`Access denied to store: ${storeId}`, storeId)
      }
    },

    /**
     * Set authenticated state
     */
    setAuthenticated(): void {
      this.status = 'authenticated'
      this.isAuthenticated = true
      this.error = null
      
      logger.info('Authentication state changed to authenticated', {
        isAuthenticated: this.isAuthenticated,
        isPlatformAdmin: this.isPlatformAdmin,
        userId: this.user?.id,
        roles: this.roles,
        currentRoute: window.location.pathname
      })
    },

    /**
     * Set unauthenticated state
     */
    setUnauthenticated(): void {
      this.status = 'idle'
      this.isAuthenticated = false
      this.user = null
      this.roles = []
      this.error = null
      // Keep selectedStoreId for post-login restoration
    },

    /**
     * Clear all authentication state
     */
    clearAuthState(): void {
      this.status = 'idle'
      this.isAuthenticated = false
      this.user = null
      this.roles = []
      this.selectedStoreId = null
      this.error = null
      this.isInitializing = false
    },

    /**
     * Handle authentication errors
     */
    handleAuthError(message: string, error: any): void {
      this.status = 'error'
      this.error = message
      this.isAuthenticated = false

      logger.error(message, error)

      // Clear tokens on authentication errors
      tokenManager.clearTokens()
    },

    /**
     * Get authentication status for debugging
     */
    getDebugStatus(): {
      status: AuthStatus
      isAuthenticated: boolean
      isInitializing: boolean
      userId: string | null
      roles: RoleName[]
      selectedStoreId: string | null
      availableStores: number
      isPlatformAdmin: boolean
      keycloakStatus: any
      tokenStatus: any
    } {
      return {
        status: this.status,
        isAuthenticated: this.isAuthenticated,
        isInitializing: this.isInitializing,
        userId: this.user?.id || null,
        roles: this.roles,
        selectedStoreId: this.selectedStoreId,
        availableStores: this.availableStores.length,
        isPlatformAdmin: this.isPlatformAdmin,
        keycloakStatus: keycloakService.getStatus(),
        tokenStatus: tokenManager.getTokenInfo(),
      }
    },
  },

  persist: {
    // Only persist lightweight user metadata and store selection
    // Never persist tokens or sensitive data
    key: 'gocommerce_auth',
    storage: localStorage,
    pick: ['selectedStoreId'],
    debug: import.meta.env.DEV,
  },
})

/**
 * Export types for external use
 */
export type { AuthStatus, AuthState }

// Copilot: This file may have been generated or refactored by GitHub Copilot.
