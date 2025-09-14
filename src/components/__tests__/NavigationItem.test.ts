import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import NavigationItem from '@/components/molecules/NavigationItem.vue'
import type { NavigationItem as NavItem } from '@/types/navigation'

/**
 * Unit tests for NavigationItem molecular component
 * 
 * Tests hierarchical navigation functionality including:
 * - Single navigation items rendering
 * - Hierarchical submenu behavior
 * - Role and permission checking
 * - Active state detection
 * - Icon and badge display
 * - Keyboard navigation
 * - Accessibility features
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

// Mock useAuth composable
const mockUseAuth = vi.fn(() => ({
  user: { value: null },
  hasRole: vi.fn(() => true),
  hasPermission: vi.fn(() => true)
}))

vi.mock('@/composables/useAuth', () => ({
  useAuth: mockUseAuth
}))

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/products', component: { template: '<div>Products</div>' } },
    { path: '/products/categories', component: { template: '<div>Categories</div>' } },
    { path: '/orders', component: { template: '<div>Orders</div>' } }
  ]
})

describe('NavigationItem', () => {
  const simpleNavItem: NavItem = {
    id: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'home',
    requiredRoles: ['store-admin']
  }

  const hierarchicalNavItem: NavItem = {
    id: 'products',
    label: 'Products',
    icon: 'package',
    requiredRoles: ['product-manager'],
    children: [
      {
        id: 'all-products',
        label: 'All Products',
        to: '/products',
        requiredRoles: ['product-manager']
      },
      {
        id: 'categories',
        label: 'Categories',
        to: '/products/categories',
        requiredRoles: ['product-manager']
      }
    ]
  }

  const navItemWithBadge: NavItem = {
    id: 'orders',
    label: 'Orders',
    to: '/orders',
    icon: 'shopping-cart',
    badge: {
      content: '5',
      variant: 'warning'
    },
    requiredRoles: ['order-manager']
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Default auth mock return
    mockUseAuth.mockReturnValue({
      user: { value: { id: '1', roles: ['store-admin'] } },
      hasRole: vi.fn(() => true),
      hasPermission: vi.fn(() => true)
    })
  })

  it('renders simple navigation item correctly', () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: simpleNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.navigation-item').exists()).toBe(true)
    expect(wrapper.find('.navigation-item__label').text()).toBe('Dashboard')
    expect(wrapper.find('a[href="/dashboard"]').exists()).toBe(true)
  })

  it('renders hierarchical navigation item with children', () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: hierarchicalNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.navigation-item--has-children').exists()).toBe(true)
    expect(wrapper.find('.navigation-item__expand-toggle').exists()).toBe(true)
    expect(wrapper.text()).toContain('Products')
  })

  it('expands and collapses submenu when toggle is clicked', async () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: hierarchicalNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    // Initially collapsed
    expect(wrapper.find('.navigation-item__submenu').exists()).toBe(false)

    // Click expand toggle
    await wrapper.find('.navigation-item__expand-toggle').trigger('click')
    
    // Should be expanded
    expect(wrapper.find('.navigation-item__submenu').exists()).toBe(true)
    expect(wrapper.find('.navigation-item--expanded').exists()).toBe(true)
  })

  it('displays all child items when expanded', async () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: hierarchicalNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    // Expand submenu
    await wrapper.find('.navigation-item__expand-toggle').trigger('click')
    
    const childItems = wrapper.findAll('.navigation-item__submenu .navigation-item')
    expect(childItems).toHaveLength(2)
    expect(childItems[0].text()).toContain('All Products')
    expect(childItems[1].text()).toContain('Categories')
  })

  it('renders badge when provided', () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: navItemWithBadge,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    const badge = wrapper.find('.navigation-item__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
    expect(badge.classes()).toContain('navigation-item__badge--warning')
  })

  it('applies correct depth styling', () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: simpleNavItem,
        depth: 2
      },
      global: {
        plugins: [router]
      }
    })

    const navItem = wrapper.find('.navigation-item')
    expect(navItem.attributes('style')).toContain('--nav-depth: 2')
  })

  it('does not render when user lacks required role', () => {
    mockUseAuth.mockReturnValue({
      user: { value: { id: '1', roles: ['customer'] } },
      hasRole: vi.fn(() => false),
      hasPermission: vi.fn(() => true)
    })

    const wrapper = mount(NavigationItem, {
      props: {
        item: simpleNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.navigation-item').exists()).toBe(false)
  })

  it('filters child items based on role requirements', async () => {
    const itemWithMixedPermissions: NavItem = {
      id: 'mixed',
      label: 'Mixed Access',
      icon: 'settings',
      children: [
        {
          id: 'allowed',
          label: 'Allowed Item',
          to: '/allowed',
          requiredRoles: ['store-admin']
        },
        {
          id: 'restricted',
          label: 'Restricted Item',
          to: '/restricted',
          requiredRoles: ['platform-admin']
        }
      ]
    }

    // Mock hasRole to only allow store-admin
    mockUseAuth.mockReturnValue({
      user: { value: { id: '1', roles: ['store-admin'] } },
      hasRole: vi.fn((role: string) => role === 'store-admin'),
      hasPermission: vi.fn(() => true)
    })

    const wrapper = mount(NavigationItem, {
      props: {
        item: itemWithMixedPermissions,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    // Expand submenu
    await wrapper.find('.navigation-item__expand-toggle').trigger('click')
    
    const childItems = wrapper.findAll('.navigation-item__submenu .navigation-item')
    expect(childItems).toHaveLength(1)
    expect(childItems[0].text()).toContain('Allowed Item')
  })

  it('applies active state to current route', async () => {
    // Navigate to dashboard route
    await router.push('/dashboard')

    const wrapper = mount(NavigationItem, {
      props: {
        item: simpleNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.navigation-item--active').exists()).toBe(true)
  })

  it('handles keyboard navigation correctly', async () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: hierarchicalNavItem,
        depth: 0
      },
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    const toggleButton = wrapper.find('.navigation-item__expand-toggle')

    // Test Enter key
    await toggleButton.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.navigation-item--expanded').exists()).toBe(true)

    // Test Escape key to collapse
    await toggleButton.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.navigation-item--expanded').exists()).toBe(false)

    wrapper.unmount()
  })

  it('handles space key for toggle activation', async () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: hierarchicalNavItem,
        depth: 0
      },
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    const toggleButton = wrapper.find('.navigation-item__expand-toggle')

    // Test Space key
    await toggleButton.trigger('keydown', { key: ' ' })
    expect(wrapper.find('.navigation-item--expanded').exists()).toBe(true)

    wrapper.unmount()
  })

  it('renders icon when provided', () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: simpleNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.navigation-item__icon').exists()).toBe(true)
  })

  it('applies correct ARIA attributes for accessibility', () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: hierarchicalNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    const toggleButton = wrapper.find('.navigation-item__expand-toggle')
    expect(toggleButton.attributes('aria-expanded')).toBe('false')
    expect(toggleButton.attributes('aria-controls')).toBeTruthy()
  })

  it('updates ARIA attributes when expanded', async () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: hierarchicalNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    const toggleButton = wrapper.find('.navigation-item__expand-toggle')
    
    // Expand
    await toggleButton.trigger('click')
    
    expect(toggleButton.attributes('aria-expanded')).toBe('true')
  })

  it('does not render expand toggle for items without children', () => {
    const wrapper = mount(NavigationItem, {
      props: {
        item: simpleNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.navigation-item__expand-toggle').exists()).toBe(false)
  })

  it('renders as button when no route is provided', () => {
    const buttonNavItem: NavItem = {
      id: 'logout',
      label: 'Logout',
      icon: 'log-out'
    }

    const wrapper = mount(NavigationItem, {
      props: {
        item: buttonNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('emits click event for button items', async () => {
    const buttonNavItem: NavItem = {
      id: 'logout',
      label: 'Logout',
      icon: 'log-out'
    }

    const wrapper = mount(NavigationItem, {
      props: {
        item: buttonNavItem,
        depth: 0
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('item-click')).toBeTruthy()
    expect(wrapper.emitted('item-click')![0][0]).toEqual(buttonNavItem)
  })

  it('respects maxDepth prop for nested items', () => {
    const deepNavItem: NavItem = {
      id: 'deep',
      label: 'Deep Item',
      children: [
        {
          id: 'level-1',
          label: 'Level 1',
          children: [
            {
              id: 'level-2',
              label: 'Level 2',
              to: '/level-2'
            }
          ]
        }
      ]
    }

    const wrapper = mount(NavigationItem, {
      props: {
        item: deepNavItem,
        depth: 0,
        maxDepth: 1
      },
      global: {
        plugins: [router]
      }
    })

    // Should render the first level
    expect(wrapper.find('.navigation-item').exists()).toBe(true)
    
    // But nested items beyond maxDepth should not render expand toggles
    const level1Item = wrapper.find('.navigation-item')
    expect(level1Item.exists()).toBe(true)
  })
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.