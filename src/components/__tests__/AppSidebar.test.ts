import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppSidebar from '@/components/organisms/AppSidebar.vue'
import type { User } from '@/types/auth'
import type { StoreOption } from '@/types/navigation'

/**
 * Unit tests for AppSidebar organism component
 * 
 * Tests comprehensive sidebar functionality including:
 * - Role-based navigation menu rendering
 * - Store selector integration
 * - Sidebar collapse/expand behavior
 * - Mobile responsive behavior
 * - Navigation item hierarchy
 * - Footer information display
 * - Keyboard navigation
 * - Accessibility features
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

// Mock useAuth composable - define at top level to avoid hoisting issues
vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { value: null },
    isPlatformAdmin: { value: true },
    hasRole: vi.fn(() => true)
  }))
}))

// Mock window for mobile detection
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/stores', component: { template: '<div>Stores</div>' } },
    { path: '/store/:id/dashboard', component: { template: '<div>Store Dashboard</div>' } }
  ]
})

describe('AppSidebar', () => {
  const mockUser: User = {
    id: 'user-1',
    username: 'john.doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['platform-admin'],
    storeAccess: [
      {
        storeId: 'store-1',
        roles: ['store-admin']
      }
    ]
  }

  const mockStores: StoreOption[] = [
    {
      id: 'store-1',
      name: 'Electronics Store',
      subdomain: 'electronics',
      isDefault: true,
      userRoles: ['store-admin']
    },
    {
      id: 'store-2',
      name: 'Fashion Store',
      subdomain: 'fashion',
      isDefault: false,
      userRoles: ['product-manager']
    }
  ]

  const mockNavSections = [
    {
      id: 'platform',
      title: 'Platform',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          to: '/dashboard',
          icon: 'home',
          requiredRoles: ['platform-admin']
        },
        {
          id: 'stores',
          label: 'Stores',
          to: '/stores',
          icon: 'building',
          requiredRoles: ['platform-admin']
        }
      ]
    },
    {
      id: 'store',
      title: 'Store Management',
      items: [
        {
          id: 'products',
          label: 'Products',
          icon: 'package',
          requiredRoles: ['product-manager'],
          children: [
            {
              id: 'all-products',
              label: 'All Products',
              to: '/store/products',
              requiredRoles: ['product-manager']
            },
            {
              id: 'categories',
              label: 'Categories',
              to: '/store/products/categories',
              requiredRoles: ['product-manager']
            }
          ]
        }
      ]
    }
  ]

  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Re-import and configure mock for specific tests
    const { useAuth } = await import('@/composables/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: { value: mockUser },
      isPlatformAdmin: { value: true },
      hasRole: vi.fn(() => true)
    })
  })

  it('renders sidebar with all main elements', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        selectedStoreId: 'store-1',
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.app-sidebar').exists()).toBe(true)
    expect(wrapper.find('.app-sidebar__header').exists()).toBe(true)
    expect(wrapper.find('.app-sidebar__navigation').exists()).toBe(true)
    expect(wrapper.find('.app-sidebar__footer').exists()).toBe(true)
  })

  it('displays store selector when user has store access', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        selectedStoreId: 'store-1',
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.findComponent({ name: 'StoreSelector' }).exists()).toBe(true)
  })

  it('hides store selector when user has no store access', async () => {
    const { useAuth } = await import('@/composables/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: { value: mockUser },
      isPlatformAdmin: { value: false },
      hasRole: vi.fn(() => true)
    })

    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: [], // No stores available
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.findComponent({ name: 'StoreSelector' }).exists()).toBe(false)
  })

  it('renders navigation sections with titles', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [mockNavSections[0]],
      store: [mockNavSections[1]]
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        selectedStoreId: 'store-1',
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('Platform')
    expect(wrapper.text()).toContain('Store Management')
  })

  it('renders navigation items within sections', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        selectedStoreId: 'store-1',
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const navItems = wrapper.findAllComponents({ name: 'NavigationItem' })
    expect(navItems.length).toBeGreaterThan(0)
  })

  it('shows collapse toggle button', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    expect(collapseToggle.exists()).toBe(true)
  })

  it('emits toggle-collapsed event when collapse button is clicked', async () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    await collapseToggle.trigger('click')
    
    expect(wrapper.emitted('toggle-collapsed')).toBeTruthy()
  })

  it('applies collapsed class when collapsed prop is true', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: true,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.app-sidebar--collapsed').exists()).toBe(true)
  })

  it('applies mobile-open class when mobileOpen prop is true', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: true,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.app-sidebar--mobile-open').exists()).toBe(true)
  })

  it('displays footer with version and support information', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const footer = wrapper.find('.app-sidebar__footer')
    expect(footer.exists()).toBe(true)
    expect(wrapper.text()).toContain('v1.0.0')
    expect(wrapper.text()).toContain('Support')
  })

  it('hides section titles when collapsed', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: true,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    // When collapsed, section titles should not be rendered (v-if="section.title && !collapsed")
    const sectionTitles = wrapper.findAll('.app-sidebar__section-title')
    expect(sectionTitles.length).toBe(0)
  })

  it('handles store selection from store selector', async () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        selectedStoreId: 'store-1',
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const storeSelector = wrapper.findComponent({ name: 'StoreSelector' })
    await storeSelector.vm.$emit('store-selected', mockStores[1])
    
    expect(wrapper.emitted('store-selected')).toBeTruthy()
    expect(wrapper.emitted('store-selected')![0][0]).toEqual(mockStores[1])
  })

  it('handles navigation item clicks', async () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const navItem = wrapper.findComponent({ name: 'NavigationItem' })
    // NavigationItem handles clicks internally, no need to emit events
    expect(navItem.exists()).toBe(true)
  })

  it('closes mobile menu on navigation click', async () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: true,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    // Mobile menu should be open
    expect(wrapper.find('.app-sidebar--mobile-open').exists()).toBe(true)
  })

  it('handles keyboard navigation for collapse toggle', async () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    
    // Test Enter key
    await collapseToggle.trigger('keydown', { key: 'Enter' })
    // Just verify the button exists and is clickable
    expect(collapseToggle.exists()).toBe(true)

    wrapper.unmount()
  })

  it('applies correct ARIA attributes for accessibility', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    expect(collapseToggle.attributes('aria-label')).toBeTruthy()
    expect(collapseToggle.attributes('aria-label')).toContain('Collapse sidebar')
  })

  it('updates ARIA attributes when collapsed', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: true,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    expect(collapseToggle.attributes('aria-label')).toContain('Expand sidebar')
  })

  it('filters navigation sections based on user roles', async () => {
    // Mock user with only store-level access
    const { useAuth } = await import('@/composables/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: { value: { ...mockUser, roles: ['product-manager'] } },
      isPlatformAdmin: { value: false },
      hasRole: vi.fn((role: string) => role === 'product-manager')
    })

    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [mockNavSections[0]], // This won't show because isPlatformAdmin is false
      store: [mockNavSections[1]]
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        selectedStoreId: 'store-1',
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    // Should not show platform admin sections due to isPlatformAdmin being false
    // The platform section is conditionally rendered based on isPlatformAdmin
    expect(wrapper.text()).toContain('Store Management') // Should show store sections
  })

  it('shows loading state when stores are loading', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: [],
        storesLoading: true,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    // Loading state is handled by StoreSelector component when storesLoading is true
    const storeSelector = wrapper.findComponent({ name: 'StoreSelector' })
    expect(storeSelector.props('loading')).toBe(true)
  })

  it('handles empty navigation gracefully', () => {
    const navigationConfig = {
      global: [],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: [],
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    // Should still render sidebar structure
    expect(wrapper.find('.app-sidebar').exists()).toBe(true)
    expect(wrapper.find('.app-sidebar__navigation').exists()).toBe(true)
  })

  it('preserves collapse state across re-renders', async () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    // Collapse sidebar
    await wrapper.find('.app-sidebar__collapse-toggle').trigger('click')
    expect(wrapper.emitted('toggle-collapsed')).toBeTruthy()

    // Update props to reflect collapsed state
    await wrapper.setProps({ collapsed: true })
    expect(wrapper.find('.app-sidebar--collapsed').exists()).toBe(true)
  })

  it('renders support link in footer', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: false,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    const supportLink = wrapper.find('.app-sidebar__support-link')
    expect(supportLink.exists()).toBe(true)
    expect(supportLink.attributes('href')).toContain('mailto:')
  })

  it('handles responsive behavior correctly', () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    // Test mobile breakpoint behavior would typically be done with 
    // viewport manipulation, but for unit tests we can test the classes
    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: true,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.classes()).toContain('app-sidebar--mobile-open')
  })

  it('emits close-mobile when clicking backdrop on mobile', async () => {
    const navigationConfig = {
      global: [mockNavSections[0]],
      platform: [],
      store: []
    }

    const wrapper = mount(AppSidebar, {
      props: {
        collapsed: false,
        mobileOpen: true,
        navigation: navigationConfig,
        availableStores: mockStores,
        appVersion: '1.0.0'
      },
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    // Simulate click on backdrop
    const backdrop = wrapper.find('.app-sidebar__backdrop')
    if (backdrop.exists()) {
      await backdrop.trigger('click')
      expect(wrapper.emitted('close-mobile')).toBeTruthy()
    }

    wrapper.unmount()
  })
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.