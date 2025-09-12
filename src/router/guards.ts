/**
 * Vue Router Guards
 * Provides authentication, role-based access control, and store context validation
 *
 * Related GitHub Issue: #2 - Authentication System & Security
 */

import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router'
import {
  useAuthStore,
  AuthenticationError,
  AuthorizationError,
  StoreAccessError,
} from '@/stores/auth'
import type { RoleName } from '@/types/auth'
import { logger } from '@/utils/logger'

/**
 * Route meta interface for authentication and authorization
 */
export interface RouteMeta {
  requiresAuth?: boolean
  roles?: RoleName[]
  storeScoped?: boolean
  public?: boolean
  guestOnly?: boolean
}

/**
 * Enhanced route location with typed meta
 */
interface TypedRouteLocation extends RouteLocationNormalized {
  meta: RouteMeta
}

/**
 * Guard execution result
 */
type GuardResult = boolean | string | { name: string; params?: any; query?: any }

/**
 * Authentication guard
 * Ensures user is authenticated before accessing protected routes
 */
export function authGuard(
  to: TypedRouteLocation,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore()

  // Handle guest-only routes (redirect authenticated users away)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    const redirectPath = '/dashboard'
    logger.info('Authenticated user accessing guest-only page, redirecting', {
      from: to.path,
      to: redirectPath,
      isAuthenticated: authStore.isAuthenticated,
      isPlatformAdmin: authStore.isPlatformAdmin
    })
    next(redirectPath)
    return
  }

  // Skip auth for public routes
  if (to.meta.public) {
    next()
    return
  }

  // Skip auth for routes that don't require it
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // Check if auth is still initializing
  if (authStore.isInitializing) {
    // Wait for auth initialization to complete
    const unwatch = authStore.$subscribe((mutation, state) => {
      if (!state.isInitializing) {
        unwatch() // Stop watching

        if (state.isAuthenticated) {
          next()
        } else {
          redirectToLogin(to, next)
        }
      }
    })
    return
  }

  // Check authentication status
  if (!authStore.isAuthenticated) {
    redirectToLogin(to, next)
    return
  }

  next()
}

/**
 * Role-based access control guard
 * Ensures user has required roles for accessing specific routes
 */
export function rolesGuard(
  to: TypedRouteLocation,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore()

  // Skip for routes without role requirements
  if (!to.meta.roles || to.meta.roles.length === 0) {
    next()
    return
  }

  // Must be authenticated first
  if (!authStore.isAuthenticated) {
    redirectToLogin(to, next)
    return
  }

  // Check if user has any of the required roles
  if (!authStore.hasAnyRole(to.meta.roles)) {
    logger.warn('Access denied - insufficient roles', {
      requiredRoles: to.meta.roles,
      userRoles: authStore.roles,
      route: to.path,
    })

    redirectToUnauthorized(to, next, {
      reason: 'insufficient_roles',
      requiredRoles: to.meta.roles,
      userRoles: authStore.roles,
    })
    return
  }

  next()
}

/**
 * Store access guard
 * Ensures proper store context for store-scoped routes
 */
export function storeAccessGuard(
  to: TypedRouteLocation,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore()

  // Skip for routes that are not store-scoped
  if (!to.meta.storeScoped) {
    next()
    return
  }

  // Must be authenticated first
  if (!authStore.isAuthenticated) {
    redirectToLogin(to, next)
    return
  }

  // Platform admins can access any store-scoped route
  if (authStore.isPlatformAdmin) {
    next()
    return
  }

  // Check if a store ID is provided in route params
  const storeId = to.params.storeId as string

  if (storeId) {
    // Validate access to the specific store
    if (!authStore.canAccessStore(storeId)) {
      logger.warn('Access denied - no store access', {
        storeId,
        availableStores: authStore.availableStores.map(s => s.storeId),
        route: to.path,
      })

      redirectToUnauthorized(to, next, {
        reason: 'store_access_denied',
        storeId,
        availableStores: authStore.availableStores.map(s => ({
          id: s.storeId,
          name: s.storeName,
        })),
      })
      return
    }

    // Set store context if not already set
    if (authStore.selectedStoreId !== storeId) {
      authStore.setSelectedStore(storeId)
    }

    next()
    return
  }

  // No store ID in route, check if user has a selected store
  if (!authStore.selectedStoreId) {
    // If user has only one store, auto-select it
    if (authStore.availableStores.length === 1) {
      const store = authStore.availableStores[0]
      authStore.setSelectedStore(store.storeId)

      // Redirect to the same route with store ID
      next({
        ...to,
        params: { ...to.params, storeId: store.storeId },
      })
      return
    }

    // Multiple stores available, redirect to store selection
    if (authStore.availableStores.length > 1) {
      next({
        name: 'StoreSelection',
        query: {
          redirect: to.fullPath,
        },
      })
      return
    }

    // No stores available
    redirectToUnauthorized(to, next, {
      reason: 'no_store_access',
      message: 'No store access available',
    })
    return
  }

  // User has selected store, validate access
  if (!authStore.canAccessStore(authStore.selectedStoreId)) {
    redirectToUnauthorized(to, next, {
      reason: 'store_access_denied',
      storeId: authStore.selectedStoreId,
    })
    return
  }

  next()
}

/**
 * Combined authentication and authorization guard
 * Runs all necessary guards in sequence
 */
export function authAndRoleGuard(
  to: TypedRouteLocation,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  // Run guards in sequence
  authGuard(to, from, result => {
    if (result !== true && result !== undefined) {
      next(result)
      return
    }

    rolesGuard(to, from, result => {
      if (result !== true && result !== undefined) {
        next(result)
        return
      }

      storeAccessGuard(to, from, result => {
        next(result)
      })
    })
  })
}

/**
 * Redirect to login page with return URL
 */
function redirectToLogin(to: RouteLocationNormalized, next: NavigationGuardNext): void {
  logger.info('Redirecting to login', {
    from: to.path,
    requiresAuth: to.meta.requiresAuth,
  })

  next({
    name: 'Login',
    query: {
      redirect: to.fullPath,
      reason: 'authentication_required',
    },
  })
}

/**
 * Redirect to unauthorized page with context
 */
function redirectToUnauthorized(
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
  context: {
    reason: string
    requiredRoles?: RoleName[]
    userRoles?: RoleName[]
    storeId?: string
    availableStores?: Array<{ id: string; name: string }>
    message?: string
  }
): void {
  logger.warn('Redirecting to unauthorized', {
    from: to.path,
    context,
  })

  next({
    name: 'Unauthorized',
    query: {
      from: to.path,
      reason: context.reason,
      ...(context.requiredRoles && {
        requiredRoles: context.requiredRoles.join(','),
      }),
      ...(context.storeId && { storeId: context.storeId }),
      ...(context.message && { message: context.message }),
    },
  })
}

/**
 * Guest guard - redirects authenticated users away from guest-only pages
 */
export function guestGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore()

  // If auth is still initializing, wait for it to complete
  if (authStore.isInitializing) {
    logger.debug('Guest guard - auth initializing, waiting...')
    
    // Wait for auth initialization to complete
    const unwatch = authStore.$subscribe((mutation, state) => {
      if (!state.isInitializing) {
        unwatch() // Stop watching
        
        if (state.isAuthenticated) {
          const redirectPath = (to.query.redirect as string) || '/dashboard'
          logger.info('Guest guard - auth complete, authenticated user redirecting', {
            from: to.path,
            to: redirectPath
          })
          next(redirectPath)
        } else {
          next() // Allow access to guest page
        }
      }
    })
    return
  }

  // If user is authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    const redirectPath = (to.query.redirect as string) || '/dashboard'

    logger.info('Guest guard - authenticated user accessing guest page, redirecting', {
      from: to.path,
      to: redirectPath,
      isAuthenticated: authStore.isAuthenticated,
      isPlatformAdmin: authStore.isPlatformAdmin,
      roles: authStore.roles
    })

    next(redirectPath)
    return
  }

  logger.debug('Guest guard - user not authenticated, allowing access to guest page', {
    to: to.path,
    isAuthenticated: authStore.isAuthenticated,
    isInitializing: authStore.isInitializing
  })

  next()
}

/**
 * Platform admin guard - ensures user is platform admin
 */
export function platformAdminGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    redirectToLogin(to, next)
    return
  }

  if (!authStore.isPlatformAdmin) {
    redirectToUnauthorized(to, next, {
      reason: 'platform_admin_required',
      requiredRoles: ['platform-admin'],
      userRoles: authStore.roles,
    })
    return
  }

  next()
}

/**
 * Store admin guard - ensures user can manage stores
 */
export function storeAdminGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const typedTo = to as TypedRouteLocation

  // Set required roles for store admin
  typedTo.meta = {
    ...typedTo.meta,
    requiresAuth: true,
    roles: ['platform-admin', 'store-admin'],
  }

  authAndRoleGuard(typedTo, from, next)
}

/**
 * Navigation guard setup function
 * Registers all guards with the router
 */
export function setupRouterGuards(router: Router): void {
  // Global before guard
  router.beforeEach((to, from, next) => {
    const typedTo = to as TypedRouteLocation

    logger.debug('Route navigation started', {
      from: from.path,
      to: to.path,
      meta: to.meta,
    })

    // Run combined guard
    authAndRoleGuard(typedTo, from, next)
  })

  // Global after guard for logging
  router.afterEach((to, from, failure) => {
    if (failure) {
      logger.error('Route navigation failed', {
        from: from.path,
        to: to.path,
        failure,
      })
    } else {
      logger.debug('Route navigation completed', {
        from: from.path,
        to: to.path,
      })
    }
  })

  logger.info('Router guards setup completed')
}

/**
 * Helper function to check route access without navigation
 */
export function canAccessRoute(
  route: RouteLocationNormalized,
  authStore?: ReturnType<typeof useAuthStore>
): {
  canAccess: boolean
  reason?: string
  missingRoles?: RoleName[]
  redirectTo?: string
} {
  const auth = authStore || useAuthStore()
  const typedRoute = route as TypedRouteLocation

  // Public routes are always accessible
  if (typedRoute.meta.public) {
    return { canAccess: true }
  }

  // Check authentication
  if (typedRoute.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      canAccess: false,
      reason: 'authentication_required',
      redirectTo: '/login',
    }
  }

  // Check roles
  if (typedRoute.meta.roles && typedRoute.meta.roles.length > 0) {
    if (!auth.hasAnyRole(typedRoute.meta.roles)) {
      return {
        canAccess: false,
        reason: 'insufficient_roles',
        missingRoles: typedRoute.meta.roles,
        redirectTo: '/unauthorized',
      }
    }
  }

  // Check store access
  if (typedRoute.meta.storeScoped) {
    const storeId = route.params.storeId as string

    if (storeId && !auth.canAccessStore(storeId)) {
      return {
        canAccess: false,
        reason: 'store_access_denied',
        redirectTo: '/unauthorized',
      }
    }

    if (!storeId && !auth.selectedStoreId && auth.availableStores.length > 1) {
      return {
        canAccess: false,
        reason: 'store_selection_required',
        redirectTo: '/store-selection',
      }
    }
  }

  return { canAccess: true }
}

// Export types
export type { RouteMeta, TypedRouteLocation, GuardResult }

// Copilot: This file may have been generated or refactored by GitHub Copilot.
