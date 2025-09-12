/**
 * Authentication Token Manager
 * Handles secure token storage, lifecycle management, and automatic refresh
 *
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import type { TokenResponse } from '@/types/auth'

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'gocommerce_access_token',
  REFRESH_TOKEN: 'gocommerce_refresh_token',
  TOKEN_EXPIRES_AT: 'gocommerce_token_expires_at',
  TOKEN_TYPE: 'gocommerce_token_type',
} as const

/**
 * Token storage interface for different storage mechanisms
 */
interface TokenStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * Secure token storage implementation
 * Uses sessionStorage for access tokens and localStorage for refresh tokens
 */
class SecureTokenStorage implements TokenStorage {
  getItem(key: string): string | null {
    try {
      // Use sessionStorage for access tokens (more secure, cleared on tab close)
      if (
        key === TOKEN_KEYS.ACCESS_TOKEN ||
        key === TOKEN_KEYS.TOKEN_EXPIRES_AT ||
        key === TOKEN_KEYS.TOKEN_TYPE
      ) {
        return sessionStorage.getItem(key)
      }
      // Use localStorage for refresh tokens (persistent across sessions)
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('Failed to read from storage:', error)
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      // Use sessionStorage for access tokens
      if (
        key === TOKEN_KEYS.ACCESS_TOKEN ||
        key === TOKEN_KEYS.TOKEN_EXPIRES_AT ||
        key === TOKEN_KEYS.TOKEN_TYPE
      ) {
        sessionStorage.setItem(key, value)
      } else {
        // Use localStorage for refresh tokens
        localStorage.setItem(key, value)
      }
    } catch (error) {
      console.warn('Failed to write to storage:', error)
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from storage:', error)
    }
  }
}

/**
 * Token refresh status to handle concurrent requests
 */
interface RefreshStatus {
  isRefreshing: boolean
  promise: Promise<TokenResponse> | null
}

/**
 * Authentication Token Manager
 * Provides secure token storage and automatic refresh functionality
 */
export class TokenManager {
  private storage: TokenStorage
  private refreshStatus: RefreshStatus
  private refreshCallback?: () => Promise<TokenResponse>

  constructor(storage: TokenStorage = new SecureTokenStorage()) {
    this.storage = storage
    this.refreshStatus = {
      isRefreshing: false,
      promise: null,
    }
  }

  /**
   * Set the token refresh callback function
   * This should be provided by the Keycloak service or auth service
   */
  public setRefreshCallback(callback: () => Promise<TokenResponse>): void {
    this.refreshCallback = callback
  }

  /**
   * Store authentication tokens securely
   */
  public storeTokens(tokenResponse: TokenResponse): void {
    const expiresAt = new Date(Date.now() + tokenResponse.expiresIn * 1000).getTime()

    this.storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokenResponse.accessToken)
    this.storage.setItem(TOKEN_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString())
    this.storage.setItem(TOKEN_KEYS.TOKEN_TYPE, tokenResponse.tokenType || 'Bearer')

    if (tokenResponse.refreshToken) {
      this.storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokenResponse.refreshToken)
    }
  }

  /**
   * Retrieve the current access token
   */
  public getAccessToken(): string | null {
    return this.storage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
  }

  /**
   * Retrieve the current refresh token
   */
  public getRefreshToken(): string | null {
    return this.storage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
  }

  /**
   * Get the token type (usually 'Bearer')
   */
  public getTokenType(): string {
    return this.storage.getItem(TOKEN_KEYS.TOKEN_TYPE) || 'Bearer'
  }

  /**
   * Get the token expiration timestamp
   */
  public getTokenExpiresAt(): number | null {
    const expiresAt = this.storage.getItem(TOKEN_KEYS.TOKEN_EXPIRES_AT)
    return expiresAt ? parseInt(expiresAt, 10) : null
  }

  /**
   * Check if the access token exists
   */
  public hasAccessToken(): boolean {
    return !!this.getAccessToken()
  }

  /**
   * Check if the access token is expired
   */
  public isTokenExpired(): boolean {
    const expiresAt = this.getTokenExpiresAt()
    if (!expiresAt) return true

    // Consider token expired if it expires within the next 30 seconds
    const bufferTime = 30 * 1000 // 30 seconds
    return Date.now() + bufferTime >= expiresAt
  }

  /**
   * Check if the access token is valid (exists and not expired)
   */
  public isTokenValid(): boolean {
    return this.hasAccessToken() && !this.isTokenExpired()
  }

  /**
   * Get the time until token expiration in milliseconds
   */
  public getTimeUntilExpiration(): number {
    const expiresAt = this.getTokenExpiresAt()
    if (!expiresAt) return 0

    return Math.max(0, expiresAt - Date.now())
  }

  /**
   * Get a valid access token, refreshing if necessary
   * This method handles concurrent refresh requests
   */
  public async getValidAccessToken(): Promise<string | null> {
    // If token is valid, return it
    if (this.isTokenValid()) {
      return this.getAccessToken()
    }

    // If no refresh callback is set, we can't refresh
    if (!this.refreshCallback) {
      return null
    }

    // If already refreshing, wait for the existing refresh to complete
    if (this.refreshStatus.isRefreshing && this.refreshStatus.promise) {
      try {
        await this.refreshStatus.promise
        return this.getAccessToken()
      } catch (error) {
        return null
      }
    }

    // Start a new refresh
    return this.refreshAccessToken()
  }

  /**
   * Refresh the access token using the refresh token
   */
  public async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshCallback) {
      throw new Error('No refresh callback set')
    }

    // If already refreshing, return the existing promise
    if (this.refreshStatus.isRefreshing && this.refreshStatus.promise) {
      try {
        await this.refreshStatus.promise
        return this.getAccessToken()
      } catch (error) {
        throw error
      }
    }

    // Start the refresh process
    this.refreshStatus.isRefreshing = true
    this.refreshStatus.promise = this.refreshCallback()

    try {
      const tokenResponse = await this.refreshStatus.promise
      this.storeTokens(tokenResponse)
      return tokenResponse.accessToken
    } catch (error) {
      // If refresh fails, clear all tokens
      this.clearTokens()
      throw error
    } finally {
      // Reset refresh status
      this.refreshStatus.isRefreshing = false
      this.refreshStatus.promise = null
    }
  }

  /**
   * Clear all stored tokens (used on logout or when refresh fails)
   */
  public clearTokens(): void {
    this.storage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
    this.storage.removeItem(TOKEN_KEYS.REFRESH_TOKEN)
    this.storage.removeItem(TOKEN_KEYS.TOKEN_EXPIRES_AT)
    this.storage.removeItem(TOKEN_KEYS.TOKEN_TYPE)

    // Reset refresh status
    this.refreshStatus.isRefreshing = false
    this.refreshStatus.promise = null
  }

  /**
   * Get the Authorization header value for API requests
   */
  public getAuthorizationHeader(): string | null {
    const token = this.getAccessToken()
    if (!token) return null

    const tokenType = this.getTokenType()
    return `${tokenType} ${token}`
  }

  /**
   * Get all token information for debugging
   */
  public getTokenInfo(): {
    hasAccessToken: boolean
    hasRefreshToken: boolean
    tokenType: string
    expiresAt: number | null
    isExpired: boolean
    timeUntilExpiration: number
    isRefreshing: boolean
  } {
    return {
      hasAccessToken: this.hasAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      tokenType: this.getTokenType(),
      expiresAt: this.getTokenExpiresAt(),
      isExpired: this.isTokenExpired(),
      timeUntilExpiration: this.getTimeUntilExpiration(),
      isRefreshing: this.refreshStatus.isRefreshing,
    }
  }

  /**
   * Schedule automatic token refresh
   * Refreshes the token when it's about to expire
   */
  public scheduleTokenRefresh(): void {
    if (!this.refreshCallback) {
      return
    }

    const timeUntilExpiration = this.getTimeUntilExpiration()
    const refreshTime = timeUntilExpiration - 5 * 60 * 1000 // Refresh 5 minutes before expiration

    if (refreshTime > 0) {
      setTimeout(() => {
        this.refreshAccessToken().catch(error => {
          console.warn('Automatic token refresh failed:', error)
        })
      }, refreshTime)
    }
  }
}

/**
 * Default token manager instance
 */
export const tokenManager = new TokenManager()

/**
 * Token validation utilities
 */
export class TokenValidator {
  /**
   * Decode JWT payload (without verification - for client-side info only)
   * WARNING: This does not verify the token signature
   */
  public static decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      const payload = parts[1]
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decodedPayload)
    } catch (error) {
      return null
    }
  }

  /**
   * Get token expiration from JWT payload
   */
  public static getTokenExpiration(token: string): number | null {
    const payload = TokenValidator.decodeJwtPayload(token)
    return payload?.exp ? payload.exp * 1000 : null // Convert to milliseconds
  }

  /**
   * Get user roles from JWT token
   */
  public static getUserRoles(token: string): string[] {
    const payload = TokenValidator.decodeJwtPayload(token)

    // Check common JWT claim locations for roles
    const roles =
      payload?.realm_access?.roles || payload?.resource_access?.roles || payload?.roles || []

    return Array.isArray(roles) ? roles : []
  }

  /**
   * Get user information from JWT token
   */
  public static getUserInfo(token: string): {
    sub?: string
    email?: string
    name?: string
    preferred_username?: string
    given_name?: string
    family_name?: string
    roles?: string[]
  } | null {
    const payload = TokenValidator.decodeJwtPayload(token)
    if (!payload) return null

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      preferred_username: payload.preferred_username,
      given_name: payload.given_name,
      family_name: payload.family_name,
      roles: TokenValidator.getUserRoles(token),
    }
  }

  /**
   * Check if token has a specific role
   */
  public static hasRole(token: string, role: string): boolean {
    const roles = TokenValidator.getUserRoles(token)
    return roles.includes(role)
  }
}

// Export types and interfaces
export type { TokenStorage, TokenResponse }

// Copilot: This file may have been generated or refactored by GitHub Copilot.
