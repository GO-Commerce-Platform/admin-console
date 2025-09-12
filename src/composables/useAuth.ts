/**
 * Authentication Composable
 * Provides reactive authentication state and role-based utilities for Vue components
 *
 * Related GitHub Issue: #2 - Authentication System & Security
 */

import { computed, type ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore, type AuthStatus } from '@/stores/auth'
import type { RoleName, UserProfile, StoreAccess } from '@/types/auth'

/**
 * Authentication composable return type
 */
interface UseAuthReturn {
  // State
  status: ComputedRef<AuthStatus>
  isAuthenticated: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isInitializing: ComputedRef<boolean>
  user: ComputedRef<UserProfile | null>
  roles: ComputedRef<RoleName[]>
  selectedStoreId: ComputedRef<string | null>
  selectedStoreName: ComputedRef<string | null>
  availableStores: ComputedRef<StoreAccess[]>
  error: ComputedRef<string | null>

  // Computed flags
  isPlatformAdmin: ComputedRef<boolean>
  isStoreScopedUser: ComputedRef<boolean>
  canAccessStoreFeatures: ComputedRef<boolean>

  // Actions
  login: (redirectUri?: string) => Promise<void>
  logout: (redirectUri?: string) => Promise<void>
  refresh: () => Promise<string | null>
  handleOAuthCallback: (code: string, state: string) => Promise<boolean>
  setSelectedStore: (storeId: string) => void
  clearSelectedStore: () => void

  // Role helpers
  hasRole: (role: RoleName) => boolean
  hasAnyRole: (roles: RoleName[]) => boolean
  canAccessStore: (storeId: string) => boolean

  // Validation helpers (throw errors)
  ensureAuthenticated: () => void
  ensureRoles: (requiredRoles: RoleName[]) => void
  ensureStoreAccess: (storeId: string) => void

  // Debug
  getDebugStatus: () => any
}

/**
 * Authentication composable
 *
 * @example
 * ```typescript
 * <script setup>
 * import { useAuth } from '@/composables/useAuth';
 *
 * const {
 *   isAuthenticated,
 *   user,
 *   hasRole,
 *   login,
 *   logout
 * } = useAuth();
 *
 * const canManageProducts = hasRole('product-manager');
 * </script>
 * ```
 */
export function useAuth(): UseAuthReturn {
  const authStore = useAuthStore()

  // Get reactive state from store
  const {
    status,
    isAuthenticated,
    user,
    roles,
    selectedStoreId,
    selectedStoreName,
    availableStores,
    error,
    isPlatformAdmin,
    isStoreScopedUser,
    canAccessStoreFeatures,
    isLoadingAuth,
    isInitializing,
  } = storeToRefs(authStore)

  // Computed properties
  const isLoading = computed(() => isLoadingAuth.value)

  // Action methods
  const login = async (redirectUri?: string): Promise<void> => {
    return authStore.login(redirectUri)
  }

  const logout = async (redirectUri?: string): Promise<void> => {
    return authStore.logout(redirectUri)
  }

  const refresh = async (): Promise<string | null> => {
    return authStore.refresh()
  }

  const handleOAuthCallback = async (code: string, state: string): Promise<boolean> => {
    return authStore.handleOAuthCallback(code, state)
  }

  const setSelectedStore = (storeId: string): void => {
    return authStore.setSelectedStore(storeId)
  }

  const clearSelectedStore = (): void => {
    return authStore.clearSelectedStore()
  }

  // Role helper methods
  const hasRole = (role: RoleName): boolean => {
    return authStore.hasRole(role)
  }

  const hasAnyRole = (roles: RoleName[]): boolean => {
    return authStore.hasAnyRole(roles)
  }

  const canAccessStore = (storeId: string): boolean => {
    return authStore.canAccessStore(storeId)
  }

  // Validation helper methods (throw errors for guards)
  const ensureAuthenticated = (): void => {
    return authStore.ensureAuthenticated()
  }

  const ensureRoles = (requiredRoles: RoleName[]): void => {
    return authStore.ensureRoles(requiredRoles)
  }

  const ensureStoreAccess = (storeId: string): void => {
    return authStore.ensureStoreAccess(storeId)
  }

  // Debug helper
  const getDebugStatus = () => {
    return authStore.getDebugStatus()
  }

  return {
    // State
    status,
    isAuthenticated,
    isLoading,
    isInitializing,
    user,
    roles,
    selectedStoreId,
    selectedStoreName,
    availableStores,
    error,

    // Computed flags
    isPlatformAdmin,
    isStoreScopedUser,
    canAccessStoreFeatures,

    // Actions
    login,
    logout,
    refresh,
    handleOAuthCallback,
    setSelectedStore,
    clearSelectedStore,

    // Role helpers
    hasRole,
    hasAnyRole,
    canAccessStore,

    // Validation helpers
    ensureAuthenticated,
    ensureRoles,
    ensureStoreAccess,

    // Debug
    getDebugStatus,
  }
}

/**
 * Role-specific composables for common use cases
 */

/**
 * Platform admin composable
 * Provides utilities specific to platform administrators
 */
export function usePlatformAdmin() {
  const { isPlatformAdmin, ensureRoles } = useAuth()

  const ensurePlatformAdmin = () => {
    ensureRoles(['platform-admin'])
  }

  return {
    isPlatformAdmin,
    ensurePlatformAdmin,
  }
}

/**
 * Store admin composable
 * Provides utilities specific to store administrators
 */
export function useStoreAdmin() {
  const { hasRole, hasAnyRole, isPlatformAdmin, ensureRoles, selectedStoreId, ensureStoreAccess } =
    useAuth()

  const isStoreAdmin = computed(() => isPlatformAdmin.value || hasRole('store-admin'))

  const canManageStore = computed(() => isPlatformAdmin.value || hasAnyRole(['store-admin']))

  const ensureStoreAdmin = () => {
    ensureRoles(['platform-admin', 'store-admin'])
  }

  const ensureStoreContext = () => {
    if (!selectedStoreId.value) {
      throw new Error('Store context required')
    }
    ensureStoreAccess(selectedStoreId.value)
  }

  return {
    isStoreAdmin,
    canManageStore,
    ensureStoreAdmin,
    ensureStoreContext,
  }
}

/**
 * Product manager composable
 * Provides utilities specific to product managers
 */
export function useProductManager() {
  const { hasRole, hasAnyRole, isPlatformAdmin, ensureRoles, selectedStoreId, ensureStoreAccess } =
    useAuth()

  const isProductManager = computed(
    () => isPlatformAdmin.value || hasAnyRole(['store-admin', 'product-manager'])
  )

  const canManageProducts = computed(
    () => isPlatformAdmin.value || hasAnyRole(['store-admin', 'product-manager'])
  )

  const ensureProductManager = () => {
    ensureRoles(['platform-admin', 'store-admin', 'product-manager'])
  }

  const ensureStoreContext = () => {
    if (!selectedStoreId.value) {
      throw new Error('Store context required for product management')
    }
    ensureStoreAccess(selectedStoreId.value)
  }

  return {
    isProductManager,
    canManageProducts,
    ensureProductManager,
    ensureStoreContext,
  }
}

/**
 * Order manager composable
 * Provides utilities specific to order managers
 */
export function useOrderManager() {
  const { hasRole, hasAnyRole, isPlatformAdmin, ensureRoles, selectedStoreId, ensureStoreAccess } =
    useAuth()

  const isOrderManager = computed(
    () => isPlatformAdmin.value || hasAnyRole(['store-admin', 'order-manager'])
  )

  const canManageOrders = computed(
    () => isPlatformAdmin.value || hasAnyRole(['store-admin', 'order-manager', 'customer-service'])
  )

  const canProcessRefunds = computed(
    () => isPlatformAdmin.value || hasAnyRole(['store-admin', 'order-manager'])
  )

  const ensureOrderManager = () => {
    ensureRoles(['platform-admin', 'store-admin', 'order-manager'])
  }

  const ensureStoreContext = () => {
    if (!selectedStoreId.value) {
      throw new Error('Store context required for order management')
    }
    ensureStoreAccess(selectedStoreId.value)
  }

  return {
    isOrderManager,
    canManageOrders,
    canProcessRefunds,
    ensureOrderManager,
    ensureStoreContext,
  }
}

/**
 * Customer service composable
 * Provides utilities specific to customer service representatives
 */
export function useCustomerService() {
  const { hasRole, hasAnyRole, isPlatformAdmin, ensureRoles, selectedStoreId, ensureStoreAccess } =
    useAuth()

  const isCustomerService = computed(
    () => isPlatformAdmin.value || hasAnyRole(['store-admin', 'order-manager', 'customer-service'])
  )

  const canViewCustomers = computed(
    () => isPlatformAdmin.value || hasAnyRole(['store-admin', 'order-manager', 'customer-service'])
  )

  const canManageCustomers = computed(
    () => isPlatformAdmin.value || hasAnyRole(['store-admin', 'customer-service'])
  )

  const ensureCustomerService = () => {
    ensureRoles(['platform-admin', 'store-admin', 'order-manager', 'customer-service'])
  }

  const ensureStoreContext = () => {
    if (!selectedStoreId.value) {
      throw new Error('Store context required for customer service')
    }
    ensureStoreAccess(selectedStoreId.value)
  }

  return {
    isCustomerService,
    canViewCustomers,
    canManageCustomers,
    ensureCustomerService,
    ensureStoreContext,
  }
}

/**
 * Auth loading composable
 * Provides loading state utilities for authentication operations
 */
export function useAuthLoading() {
  const { status, isLoading, isInitializing, error } = useAuth()

  const isAuthReady = computed(() => !isInitializing.value && status.value !== 'loading')

  const hasAuthError = computed(() => status.value === 'error' && !!error.value)

  const isAuthenticating = computed(() => status.value === 'loading' && !isInitializing.value)

  return {
    isLoading,
    isInitializing,
    isAuthReady,
    hasAuthError,
    isAuthenticating,
    error,
  }
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.
