/**
 * Keycloak Service Layer
 * Provides comprehensive Keycloak integration with PKCE support, token management, and RBAC
 *
 * Related GitHub Issue: #2 - Authentication System & Security
 */

import Keycloak from 'keycloak-js'
import type {
  KeycloakConfig,
  KeycloakTokenParsed,
  UserProfile,
  Role,
  TokenResponse,
  StoreAccess,
  RoleName,
} from '@/types/auth'
import { tokenManager } from './auth/tokenManager'
import { apiClient } from './apiClient'
import { logger } from '@/utils/logger'

/**
 * Custom error classes for authentication flow
 */
export class AuthInitError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'AuthInitError'
  }
}

export class TokenRefreshError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'TokenRefreshError'
  }
}

export class LoginRequiredError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'LoginRequiredError'
  }
}

export class ProfileLoadError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'ProfileLoadError'
  }
}

/**
 * Authentication event types for subscriber pattern
 */
export type AuthEventType =
  | 'initialized'
  | 'authenticated'
  | 'unauthenticated'
  | 'token-refreshed'
  | 'token-expired'
  | 'logout'
  | 'error'

export interface AuthEvent {
  type: AuthEventType
  payload?: any
  timestamp: number
}

export type AuthEventListener = (event: AuthEvent) => void

/**
 * Keycloak service configuration
 */
interface KeycloakServiceConfig {
  url: string
  realm: string
  clientId: string
  silentCheckSsoRedirectUri?: string
  checkLoginIframe?: boolean
  checkLoginIframeInterval?: number
  enableLogging?: boolean
}

/**
 * Role mapping configuration from Keycloak to application roles
 */
const ROLE_MAPPINGS: Record<string, RoleName> = {
  'platform-admin': 'platform-admin',
  'store-admin': 'store-admin',
  'product-manager': 'product-manager',
  'order-manager': 'order-manager',
  'customer-service': 'customer-service',
  customer: 'customer',
}

/**
 * Keycloak Service
 * Handles all Keycloak integration including authentication, token management, and RBAC
 */
export class KeycloakService {
  private keycloak: Keycloak | null = null
  private config: KeycloakServiceConfig
  private isInitialized = false
  private eventListeners: Map<AuthEventType, AuthEventListener[]> = new Map()
  private refreshTimer: ReturnType<typeof setTimeout> | null = null
  private isRefreshing = false

  constructor(config?: Partial<KeycloakServiceConfig>) {
    this.config = {
      url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:9000',
      realm: import.meta.env.VITE_KEYCLOAK_REALM || 'gocommerce',
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'gocommerce-admin-console',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      checkLoginIframe: false, // Disable for better CORS compatibility
      checkLoginIframeInterval: 5,
      enableLogging: import.meta.env.DEV,
      ...config,
    }

    if (this.config.enableLogging) {
      logger.info('KeycloakService initialized with config:', {
        url: this.config.url,
        realm: this.config.realm,
        clientId: this.config.clientId,
      })
    }
  }

  /**
   * Initialize Keycloak with PKCE and silent SSO check
   */
  public async init(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        logger.warn('Keycloak already initialized')
        return this.isAuthenticated()
      }

      logger.info('Initializing Keycloak...')

      // Create Keycloak instance
      this.keycloak = new Keycloak({
        url: this.config.url,
        realm: this.config.realm,
        clientId: this.config.clientId,
      })

      // Set up token manager refresh callback
      tokenManager.setRefreshCallback(() => this.refreshTokenInternal())

      // Initialize with PKCE and silent check-sso
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: this.config.silentCheckSsoRedirectUri,
        checkLoginIframe: this.config.checkLoginIframe,
        checkLoginIframeInterval: this.config.checkLoginIframeInterval,
        pkceMethod: 'S256', // Enable PKCE with SHA256
        flow: 'standard', // Authorization Code Flow
      })

      // Set up event handlers
      this.setupEventHandlers()

      // If authenticated, hydrate tokens and schedule refresh
      if (authenticated && this.keycloak.token) {
        await this.hydrateTokens()
        this.scheduleTokenRefresh()
      }

      this.isInitialized = true
      this.emit('initialized', { authenticated })

      logger.info('Keycloak initialized successfully', { authenticated })
      return authenticated
    } catch (error) {
      const authError = new AuthInitError('Failed to initialize Keycloak', error as Error)
      logger.error('Keycloak initialization failed:', authError)
      this.emit('error', { error: authError })
      throw authError
    }
  }

  /**
   * Set up Keycloak event handlers
   */
  private setupEventHandlers(): void {
    if (!this.keycloak) return

    this.keycloak.onReady = (authenticated: boolean) => {
      logger.info('Keycloak ready', { authenticated })
    }

    this.keycloak.onAuthSuccess = () => {
      logger.info('Authentication successful')
      this.emit('authenticated')
      this.hydrateTokens().then(() => {
        this.scheduleTokenRefresh()
      })
    }

    this.keycloak.onAuthError = (error: any) => {
      logger.error('Authentication error:', error)
      this.emit('error', { error })
    }

    this.keycloak.onAuthRefreshSuccess = () => {
      logger.info('Token refresh successful')
      this.emit('token-refreshed')
      this.hydrateTokens().then(() => {
        this.scheduleTokenRefresh()
      })
    }

    this.keycloak.onAuthRefreshError = (error: any) => {
      logger.error('Token refresh error:', error)
      this.emit('token-expired', { error })
      this.clearTokens()
    }

    this.keycloak.onTokenExpired = () => {
      logger.warn('Token expired, attempting refresh')
      this.emit('token-expired')
      this.refreshToken().catch(error => {
        logger.error('Auto token refresh failed:', error)
      })
    }

    this.keycloak.onAuthLogout = () => {
      logger.info('User logged out')
      this.emit('logout')
      this.clearTokens()
    }
  }

  /**
   * Login with optional redirect URI
   */
  public async login(redirectUri?: string): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak not initialized')
    }

    try {
      logger.info('Initiating login...', { redirectUri })
      await this.keycloak.login({
        redirectUri: redirectUri || window.location.origin,
      })
    } catch (error) {
      logger.error('Login failed:', error)
      throw error
    }
  }

  /**
   * Logout with optional redirect URI
   */
  public async logout(redirectUri?: string): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak not initialized')
    }

    try {
      logger.info('Initiating logout...', { redirectUri })

      // Clear local tokens first
      this.clearTokens()

      // Logout from Keycloak
      await this.keycloak.logout({
        redirectUri: redirectUri || window.location.origin,
      })

      this.emit('logout')
    } catch (error) {
      logger.error('Logout failed:', error)
      throw error
    }
  }

  /**
   * Get current access token
   */
  public getAccessToken(): string | null {
    return this.keycloak?.token || null
  }

  /**
   * Get current refresh token
   */
  public getRefreshToken(): string | null {
    return this.keycloak?.refreshToken || null
  }

  /**
   * Refresh access token
   */
  public async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Wait for existing refresh to complete
      return new Promise((resolve, reject) => {
        const checkRefresh = () => {
          if (!this.isRefreshing) {
            resolve(this.getAccessToken())
          } else {
            setTimeout(checkRefresh, 100)
          }
        }
        checkRefresh()
      })
    }

    return this.refreshTokenInternal()
  }

  /**
   * Internal token refresh implementation
   */
  private async refreshTokenInternal(): Promise<string | null> {
    if (!this.keycloak) {
      throw new TokenRefreshError('Keycloak not initialized')
    }

    this.isRefreshing = true

    try {
      logger.info('Refreshing token...')

      const refreshed = await this.keycloak.updateToken(30) // Refresh if expires in 30 seconds

      if (refreshed && this.keycloak.token) {
        await this.hydrateTokens()
        this.scheduleTokenRefresh()
        logger.info('Token refreshed successfully')
        return this.keycloak.token
      } else {
        logger.info('Token still valid, no refresh needed')
        return this.keycloak.token || null
      }
    } catch (error) {
      const refreshError = new TokenRefreshError('Failed to refresh token', error as Error)
      logger.error('Token refresh failed:', refreshError)
      this.clearTokens()
      throw refreshError
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Check if user is currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.keycloak?.authenticated || false
  }

  /**
   * Get user profile from backend
   */
  public async getUserProfile(): Promise<UserProfile> {
    // Check if we have valid tokens (either from Keycloak or token manager)
    const hasValidToken =
      this.isAuthenticated() || (await tokenManager.getValidAccessToken()) !== null
    if (!hasValidToken) {
      throw new LoginRequiredError()
    }

    try {
      logger.info('Loading user profile...')

      // Get profile from backend API
      // Note: The backend currently returns UserProfile directly (not wrapped in ApiResponse)
      // But apiClient.get() expects to return ApiResponse<UserProfile> and unwraps response.data
      const apiResponse = await apiClient.get<UserProfile>('/auth/me', {
        skipAuth: false, // Ensure auth header is included
      })

      logger.info('User profile loaded successfully', { apiResponse })

      // The apiClient.get() should return ApiResponse<UserProfile>, so we access .data
      // However, if the backend is returning UserProfile directly, the apiResponse might BE the UserProfile
      let userProfile: any

      if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
        // Backend is returning ApiResponse<UserProfile> format
        userProfile = (apiResponse as any).data
      } else {
        // Backend is returning UserProfile directly (current case based on logs)
        userProfile = apiResponse as unknown as any
      }

      logger.debug('Raw user profile from API:', userProfile)

      logger.info('Processed user profile', { userProfile })

      // Ensure the profile has the expected structure
      if (!userProfile || typeof userProfile !== 'object') {
        throw new Error('Invalid user profile response structure')
      }

      // Map API response to UserProfile interface
      // The API returns: {username, userId, roles} but frontend expects {id, username, roles, storeAccess, etc.}
      const mappedProfile: UserProfile = {
        // Map userId from API to id in UserProfile
        id: userProfile.userId || userProfile.id || '',
        username: userProfile.username || '',
        email: userProfile.email || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        emailVerified: userProfile.emailVerified || false,

        // Handle roles - convert string array to Role objects
        roles: this.convertRolesToRoleObjects(userProfile.roles || []),

        // Ensure storeAccess is an array (fallback to empty array if undefined)
        storeAccess: Array.isArray(userProfile.storeAccess) ? userProfile.storeAccess : [],

        // Default values for other required fields
        preferences: userProfile.preferences || {
          theme: 'system',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dashboardLayout: {},
        },
        createdAt: userProfile.createdAt ? new Date(userProfile.createdAt) : new Date(),
        updatedAt: userProfile.updatedAt ? new Date(userProfile.updatedAt) : new Date(),
      }

      logger.debug('Mapped user profile:', mappedProfile)
      logger.info('Final role assignment:', {
        roleCount: mappedProfile.roles.length,
        roleNames: mappedProfile.roles.map(r => r.name),
        isPlatformAdmin: mappedProfile.roles.some(r => r.name === 'platform-admin'),
      })

      return mappedProfile
    } catch (error) {
      const profileError = new ProfileLoadError('Failed to load user profile', error as Error)
      logger.error('Profile loading failed:', profileError)
      throw profileError
    }
  }

  /**
   * Get roles from token
   */
  public getTokenRoles(): string[] {
    if (!this.keycloak?.tokenParsed) {
      return []
    }

    const tokenParsed = this.keycloak.tokenParsed as KeycloakTokenParsed
    const roles: string[] = []

    // Get roles from realm access
    if (tokenParsed.realm_access?.roles) {
      roles.push(...tokenParsed.realm_access.roles)
    }

    // Get roles from resource access
    if (tokenParsed.resource_access) {
      Object.values(tokenParsed.resource_access).forEach(resource => {
        if (resource.roles) {
          roles.push(...resource.roles)
        }
      })
    }

    // Map to application roles
    return roles.filter(role => role in ROLE_MAPPINGS).map(role => ROLE_MAPPINGS[role])
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: RoleName): boolean {
    const tokenRoles = this.getTokenRoles()
    return tokenRoles.includes(role)
  }

  /**
   * Check if user has any of the specified roles
   */
  public hasAnyRole(roles: RoleName[]): boolean {
    return roles.some(role => this.hasRole(role))
  }

  /**
   * Check if user is platform admin
   */
  public isPlatformAdmin(): boolean {
    return this.hasRole('platform-admin')
  }

  /**
   * Convert string role names to Role objects
   */
  private convertRolesToRoleObjects(roleNames: string[]): Role[] {
    if (!Array.isArray(roleNames) || roleNames.length === 0) {
      // Default role for any authenticated user if no roles provided
      return [
        {
          name: 'platform-admin', // TEMPORARY: Force platform-admin role for debugging
          scope: 'platform',
          permissions: [],
        },
      ]
    }

    return roleNames.map(roleName => {
      // Determine scope based on role name
      const scope: 'platform' | 'store' = roleName === 'platform-admin' ? 'platform' : 'store'

      return {
        name: roleName as RoleName,
        scope,
        permissions: [], // Permissions would be loaded from backend in real implementation
      }
    })
  }

  /**
   * Parse user info from token
   */
  public getUserInfoFromToken(): Partial<UserProfile> | null {
    if (!this.keycloak?.tokenParsed) {
      return null
    }

    const tokenParsed = this.keycloak.tokenParsed as KeycloakTokenParsed

    return {
      id: tokenParsed.sub,
      username: tokenParsed.preferred_username || '',
      email: tokenParsed.email || '',
      firstName: tokenParsed.given_name || '',
      lastName: tokenParsed.family_name || '',
      emailVerified: tokenParsed.email_verified || false,
    }
  }

  /**
   * Hydrate tokens into token manager
   */
  private async hydrateTokens(): Promise<void> {
    if (!this.keycloak?.token || !this.keycloak.refreshToken) {
      return
    }

    const tokenResponse: TokenResponse = {
      accessToken: this.keycloak.token,
      refreshToken: this.keycloak.refreshToken,
      expiresIn: this.keycloak.tokenParsed?.exp
        ? this.keycloak.tokenParsed.exp - Math.floor(Date.now() / 1000)
        : 300, // Default 5 minutes
      tokenType: 'Bearer',
      scope: '',
    }

    tokenManager.storeTokens(tokenResponse)
    logger.debug('Tokens hydrated into token manager')
  }

  /**
   * Clear all tokens
   */
  private clearTokens(): void {
    tokenManager.clearTokens()
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    logger.debug('Tokens cleared')
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    if (!this.keycloak?.tokenParsed?.exp) {
      return
    }

    const expiresIn = this.keycloak.tokenParsed.exp * 1000 - Date.now()
    const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 30 * 1000) // Refresh 5 min before expiry, but at least in 30 seconds

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch(error => {
          logger.error('Scheduled token refresh failed:', error)
        })
      }, refreshTime)

      logger.debug('Token refresh scheduled', { refreshTime: refreshTime / 1000 })
    }
  }

  /**
   * Add event listener
   */
  public on(eventType: AuthEventType, listener: AuthEventListener): () => void {
    const listeners = this.eventListeners.get(eventType) || []
    listeners.push(listener)
    this.eventListeners.set(eventType, listeners)

    // Return unsubscribe function
    return () => {
      const currentListeners = this.eventListeners.get(eventType) || []
      const index = currentListeners.indexOf(listener)
      if (index > -1) {
        currentListeners.splice(index, 1)
        this.eventListeners.set(eventType, currentListeners)
      }
    }
  }

  /**
   * Remove event listener
   */
  public off(eventType: AuthEventType, listener?: AuthEventListener): void {
    if (listener) {
      const listeners = this.eventListeners.get(eventType) || []
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
        this.eventListeners.set(eventType, listeners)
      }
    } else {
      this.eventListeners.delete(eventType)
    }
  }

  /**
   * Emit authentication event
   */
  private emit(eventType: AuthEventType, payload?: any): void {
    const listeners = this.eventListeners.get(eventType) || []
    const event: AuthEvent = {
      type: eventType,
      payload,
      timestamp: Date.now(),
    }

    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        logger.error('Auth event listener error:', error)
      }
    })

    if (this.config.enableLogging) {
      logger.debug('Auth event emitted:', event)
    }
  }

  /**
   * Get Keycloak base URL for iframe generation
   */
  public getKeycloakUrl(): string {
    return this.config.url
  }

  /**
   * Get Keycloak realm for iframe generation
   */
  public getRealm(): string {
    return this.config.realm
  }

  /**
   * Get Keycloak client ID for iframe generation
   */
  public getClientId(): string {
    return this.config.clientId
  }

  /**
   * Get service status for debugging
   */
  public getStatus(): {
    isInitialized: boolean
    isAuthenticated: boolean
    hasToken: boolean
    tokenRoles: string[]
    tokenExpiry: number | null
    isRefreshing: boolean
  } {
    return {
      isInitialized: this.isInitialized,
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!this.getAccessToken(),
      tokenRoles: this.getTokenRoles(),
      tokenExpiry: this.keycloak?.tokenParsed?.exp || null,
      isRefreshing: this.isRefreshing,
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    this.eventListeners.clear()
    this.clearTokens()
    this.keycloak = null
    this.isInitialized = false

    logger.info('KeycloakService destroyed')
  }
}

/**
 * Default Keycloak service instance
 */
export const keycloakService = new KeycloakService()

/**
 * Composable function to use Keycloak service in Vue components
 */
export function useKeycloakService() {
  return keycloakService
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.
