/**
 * Authentication and User Management Type Definitions
 * Based on the technical specifications in PLAN.md and WARP.md
 */

export interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
  roles: Role[]
  storeAccess: StoreAccess[]
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  name: RoleName
  scope: 'platform' | 'store'
  permissions: Permission[]
  storeId?: string // Only for store-scoped roles
}

export type RoleName =
  | 'platform-admin'
  | 'store-admin'
  | 'product-manager'
  | 'order-manager'
  | 'customer-service'
  | 'customer'

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export interface StoreAccess {
  storeId: string
  storeName: string
  roles: RoleName[]
  isDefault: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  defaultStore?: string
  dashboardLayout: Record<string, unknown>
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
  scope: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface CreateUserDto {
  username: string
  email: string
  firstName: string
  lastName: string
  password?: string
  roles: RoleName[]
  storeAccess: Omit<StoreAccess, 'storeName'>[]
  sendPasswordEmail?: boolean
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  email?: string
  roles?: RoleName[]
  storeAccess?: Omit<StoreAccess, 'storeName'>[]
  preferences?: Partial<UserPreferences>
}

// Authentication state and error types
export interface AuthState {
  user: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  lastLoginAt: Date | null
}

export interface AuthError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface LoginResponse {
  user: UserProfile
  tokens: TokenResponse
  requiresPasswordChange?: boolean
  requiresMfa?: boolean
}

// Keycloak-specific types
export interface KeycloakConfig {
  url: string
  realm: string
  clientId: string
}

export interface KeycloakTokenParsed {
  sub: string
  preferred_username: string
  email: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  roles?: string[]
  realm_access?: {
    roles: string[]
  }
  resource_access?: Record<string, { roles: string[] }>
  exp: number
  iat: number
  iss: string
  aud: string
}

// Password and security types
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordRequest {
  email: string
  redirectUri?: string
}

export interface MfaSetupRequest {
  method: 'totp' | 'sms' | 'email'
  phoneNumber?: string
}

export interface MfaVerifyRequest {
  code: string
  backupCode?: string
}

// Session and activity types
export interface UserSession {
  id: string
  userId: string
  deviceInfo: string
  ipAddress: string
  userAgent: string
  createdAt: Date
  lastActivityAt: Date
  expiresAt: Date
  isActive: boolean
}

export interface UserActivity {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata: Record<string, unknown>
  ipAddress: string
  userAgent: string
  timestamp: Date
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.
