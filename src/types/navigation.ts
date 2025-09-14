import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

/**
 * Navigation Types
 * 
 * Defines the structure and types for the navigation system
 * including menu items, permissions, and user context.
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

// Re-export from auth types to avoid circular dependencies
export interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: Role[]
  storeAccess: StoreAccess[]
}

export interface Role {
  name: string
  scope: 'platform' | 'store'
  permissions: string[]
}

export interface StoreAccess {
  storeId: string
  storeName: string
  roles: string[]
  isDefault: boolean
}

// Navigation-specific types
export type NavigationScope = 'platform' | 'store' | 'global'

export interface NavigationItemType {
  /** Unique identifier for the navigation item */
  id?: string
  /** Display label */
  label: string
  /** Route path or external URL */
  to?: RouteLocationRaw | string
  /** Icon component to display */
  icon?: Component
  /** Badge text/number for notifications */
  badge?: string | number
  /** Whether the item is disabled */
  disabled?: boolean
  /** Navigation scope (platform/store/global) */
  scope?: NavigationScope
  /** Required roles to see this item */
  requiredRoles?: string[]
  /** Whether to match route exactly or allow partial matches */
  exactMatch?: boolean
  /** Child navigation items for hierarchical menus */
  children?: NavigationItemType[]
  /** Additional metadata */
  meta?: Record<string, any>
}

export interface NavigationSection {
  /** Section identifier */
  id: string
  /** Section title */
  title: string
  /** Navigation items in this section */
  items: NavigationItemType[]
  /** Whether section is collapsible */
  collapsible?: boolean
  /** Default collapsed state */
  defaultCollapsed?: boolean
}

export interface NavigationConfig {
  /** Platform-level navigation (for platform-admin) */
  platform: NavigationSection[]
  /** Store-level navigation (for store-scoped users) */
  store: NavigationSection[]
  /** Global navigation (always visible) */
  global: NavigationSection[]
}

export interface StoreOption {
  /** Store ID */
  id: string
  /** Store display name */
  name: string
  /** Store subdomain */
  subdomain: string
  /** Whether this is the user's default store */
  isDefault: boolean
  /** User's roles in this store */
  userRoles: string[]
}

// Navigation state interfaces
export interface NavigationState {
  /** Whether sidebar is collapsed */
  sidebarCollapsed: boolean
  /** Currently selected store ID */
  selectedStoreId?: string
  /** Available stores for current user */
  availableStores: StoreOption[]
  /** Navigation configuration */
  config: NavigationConfig
}

// Breadcrumb interfaces
export interface BreadcrumbItem {
  /** Display label */
  label: string
  /** Route path (optional for last item) */
  to?: RouteLocationRaw
  /** Whether item is disabled */
  disabled?: boolean
}

export type BreadcrumbList = BreadcrumbItem[]

// Search interfaces for navigation
export interface NavigationSearchResult {
  /** Item that matched */
  item: NavigationItemType
  /** Section containing the item */
  section: NavigationSection
  /** Match score (0-1) */
  score: number
  /** Highlighted label with search term */
  highlightedLabel: string
}

// Mobile navigation state
export interface MobileNavigationState {
  /** Whether mobile menu is open */
  isOpen: boolean
  /** Current navigation level (for hierarchical mobile nav) */
  currentLevel: number
  /** Breadcrumb trail for mobile navigation */
  breadcrumb: NavigationItemType[]
}

// Helper types for navigation guards
export type NavigationGuardResult = boolean | string | RouteLocationRaw

export interface RouteGuardContext {
  /** Current user profile */
  user: UserProfile | null
  /** Whether user is authenticated */
  isAuthenticated: boolean
  /** Currently selected store ID */
  storeId?: string
  /** User's roles in current context */
  contextRoles: string[]
}

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->