/**
 * Navigation Composable
 * 
 * Provides navigation state management and utilities for the GO Commerce Admin Console.
 * Handles navigation items, breadcrumbs, and navigation state for different user roles.
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

import { computed, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { NavigationItem, BreadcrumbItem } from '@/types/navigation'

interface NavigationState {
  isCollapsed: Ref<boolean>
  isMobileMenuOpen: Ref<boolean>
  currentPath: Ref<string>
  breadcrumbs: Ref<BreadcrumbItem[]>
}

interface NavigationActions {
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  navigateTo: (path: string) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
}

interface NavigationGetters {
  navigationItems: Ref<NavigationItem[]>
  platformNavigationItems: Ref<NavigationItem[]>
  storeNavigationItems: Ref<NavigationItem[]>
  isCurrentRoute: (path: string) => boolean
  hasAccess: (roles: string[]) => boolean
}

export type UseNavigation = NavigationState & NavigationActions & NavigationGetters

/**
 * Navigation composable hook
 */
export function useNavigation(): UseNavigation {
  const route = useRoute()
  const router = useRouter()
  const { user, roles, isPlatformAdmin } = useAuth()

  // Navigation state
  const isCollapsed = ref(false)
  const isMobileMenuOpen = ref(false)
  const currentPath = ref(route.path)
  const breadcrumbs = ref<BreadcrumbItem[]>([])

  // Platform admin navigation items
  const platformNavigationItems = computed<NavigationItem[]>(() => [
    {
      id: 'platform-dashboard',
      title: 'Dashboard',
      path: '/platform/dashboard',
      icon: 'dashboard',
      roles: ['platform-admin'],
      isActive: false,
      children: []
    },
    {
      id: 'platform-stores',
      title: 'Stores',
      path: '/platform/stores',
      icon: 'store',
      roles: ['platform-admin'],
      isActive: false,
      children: []
    },
    {
      id: 'platform-users',
      title: 'Users',
      path: '/platform/users',
      icon: 'users',
      roles: ['platform-admin'],
      isActive: false,
      children: []
    },
    {
      id: 'platform-analytics',
      title: 'Analytics',
      path: '/platform/analytics',
      icon: 'analytics',
      roles: ['platform-admin'],
      isActive: false,
      children: []
    }
  ])

  // Store admin navigation items
  const storeNavigationItems = computed<NavigationItem[]>(() => [
    {
      id: 'store-dashboard',
      title: 'Dashboard',
      path: '/store/:storeId/dashboard',
      icon: 'dashboard',
      roles: ['platform-admin', 'store-admin'],
      isActive: false,
      children: []
    },
    {
      id: 'store-products',
      title: 'Products',
      path: '/store/:storeId/products',
      icon: 'package',
      roles: ['platform-admin', 'store-admin', 'product-manager'],
      isActive: false,
      badge: { content: 'New', variant: 'success' },
      children: [
        {
          id: 'products-list',
          title: 'All Products',
          path: '/store/:storeId/products',
          roles: ['platform-admin', 'store-admin', 'product-manager']
        },
        {
          id: 'products-categories',
          title: 'Categories',
          path: '/store/:storeId/products/categories',
          roles: ['platform-admin', 'store-admin', 'product-manager']
        },
        {
          id: 'products-inventory',
          title: 'Inventory',
          path: '/store/:storeId/products/inventory',
          roles: ['platform-admin', 'store-admin', 'product-manager']
        }
      ]
    },
    {
      id: 'store-customers',
      title: 'Customers',
      path: '/store/:storeId/customers',
      icon: 'users',
      roles: ['platform-admin', 'store-admin', 'customer-service'],
      isActive: false,
      children: []
    },
    {
      id: 'store-orders',
      title: 'Orders',
      path: '/store/:storeId/orders',
      icon: 'shopping-bag',
      roles: ['platform-admin', 'store-admin', 'order-manager', 'customer-service'],
      isActive: false,
      badge: { content: '5', variant: 'warning' },
      children: []
    },
    {
      id: 'store-analytics',
      title: 'Analytics',
      path: '/store/:storeId/analytics',
      icon: 'analytics',
      roles: ['platform-admin', 'store-admin'],
      isActive: false,
      children: []
    },
    {
      id: 'store-settings',
      title: 'Settings',
      path: '/store/:storeId/settings',
      icon: 'settings',
      roles: ['platform-admin', 'store-admin'],
      isActive: false,
      children: []
    }
  ])

  // Combined navigation items based on user context
  const navigationItems = computed<NavigationItem[]>(() => {
    if (isPlatformAdmin.value) {
      return [...platformNavigationItems.value, ...storeNavigationItems.value]
    }
    return storeNavigationItems.value
  })

  // Actions
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
  }

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  const navigateTo = (path: string) => {
    router.push(path)
    closeMobileMenu()
  }

  const setBreadcrumbs = (newBreadcrumbs: BreadcrumbItem[]) => {
    breadcrumbs.value = newBreadcrumbs
  }

  // Getters
  const isCurrentRoute = (path: string): boolean => {
    return route.path === path || route.path.startsWith(path)
  }

  const hasAccess = (requiredRoles: string[]): boolean => {
    if (!requiredRoles.length) return true
    if (!roles.value.length) return false
    
    return requiredRoles.some(role => roles.value.includes(role))
  }

  // Update current path when route changes
  router.afterEach((to) => {
    currentPath.value = to.path
    
    // Auto-generate breadcrumbs based on route
    const pathSegments = to.path.split('/').filter(Boolean)
    const newBreadcrumbs: BreadcrumbItem[] = []
    
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      const title = segment.charAt(0).toUpperCase() + segment.slice(1)
      
      newBreadcrumbs.push({
        title,
        path,
        isActive: index === pathSegments.length - 1
      })
    })
    
    setBreadcrumbs(newBreadcrumbs)
  })

  return {
    // State
    isCollapsed,
    isMobileMenuOpen,
    currentPath,
    breadcrumbs,
    
    // Actions
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,
    navigateTo,
    setBreadcrumbs,
    
    // Getters
    navigationItems,
    platformNavigationItems,
    storeNavigationItems,
    isCurrentRoute,
    hasAccess
  }
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.