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

// Mock useAuth composable
vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { value: null },
    isPlatformAdmin: { value: false },
    hasRole: vi.fn(() => true),
    hasPermission: vi.fn(() => true)
  }))
}))

// Mock useNavigation composable
vi.mock('@/composables/useNavigation', () => ({
  useNavigation: vi.fn(() => ({
    navigationSections: { value: [] },
    availableStores: { value: [] },
    currentStoreId: { value: null }
  }))
}))

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
    
    // Import mocked composables to reset them
    const { useAuth } = await import('@/composables/useAuth')
    const { useNavigation } = await import('@/composables/useNavigation')
    
    // Default auth mock return
    vi.mocked(useAuth).mockReturnValue({
      user: { value: mockUser },
      isPlatformAdmin: { value: true },
      hasRole: vi.fn(() => true),
      hasPermission: vi.fn(() => true)
    })

    // Default navigation mock
    vi.mocked(useNavigation).mockReturnValue({
      navigationSections: { value: mockNavSections },
      availableStores: { value: mockStores },
      currentStoreId: { value: 'store-1' }
    })
  })

  it('renders sidebar with all main elements', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
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
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.findComponent({ name: 'StoreSelector' }).exists()).toBe(true)
  })

  it('hides store selector when user has no store access', () => {
    mockUseNavigation.mockReturnValue({
      navigationSections: { value: mockNavSections },
      availableStores: { value: [] },
      currentStoreId: { value: null }
    })

    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.findComponent({ name: 'StoreSelector' }).exists()).toBe(false)
  })

  it('renders navigation sections with titles', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const sections = wrapper.findAll('.app-sidebar__section')
    expect(sections.length).toBe(2)
    
    expect(wrapper.text()).toContain('Platform')
    expect(wrapper.text()).toContain('Store Management')
  })

  it('renders navigation items within sections', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const navItems = wrapper.findAllComponents({ name: 'NavigationItem' })
    expect(navItems.length).toBeGreaterThan(0)
  })

  it('shows collapse toggle button', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    expect(collapseToggle.exists()).toBe(true)
  })

  it('emits toggle-collapse event when collapse button is clicked', async () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    await collapseToggle.trigger('click')
    
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()
  })

  it('applies collapsed class when isCollapsed prop is true', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: true,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.app-sidebar--collapsed').exists()).toBe(true)
  })

  it('applies mobile-open class when isMobileMenuOpen prop is true', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: true
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.app-sidebar--mobile-open').exists()).toBe(true)
  })

  it('displays footer with version and support information', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const footer = wrapper.find('.app-sidebar__footer')
    expect(footer.exists()).toBe(true)
    expect(footer.text()).toContain('v1.0.0')
    expect(footer.text()).toContain('Support')
  })

  it('hides section titles when collapsed', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: true,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const sectionTitles = wrapper.findAll('.app-sidebar__section-title')
    sectionTitles.forEach(title => {
      expect(title.classes()).toContain('app-sidebar__section-title--hidden')
    })
  })

  it('handles store selection from store selector', async () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
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
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const navItem = wrapper.findComponent({ name: 'NavigationItem' })
    const mockItem = { id: 'test-item', label: 'Test Item' }
    await navItem.vm.$emit('item-click', mockItem)
    
    expect(wrapper.emitted('navigation-click')).toBeTruthy()
    expect(wrapper.emitted('navigation-click')![0][0]).toEqual(mockItem)
  })

  it('closes mobile menu on navigation click', async () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: true
      },
      global: {
        plugins: [router]
      }
    })

    const navItem = wrapper.findComponent({ name: 'NavigationItem' })
    const mockItem = { id: 'test-item', label: 'Test Item', to: '/test' }
    await navItem.vm.$emit('item-click', mockItem)
    
    expect(wrapper.emitted('close-mobile-menu')).toBeTruthy()
  })

  it('handles keyboard navigation for collapse toggle', async () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    
    // Test Enter key
    await collapseToggle.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()

    wrapper.unmount()
  })

  it('applies correct ARIA attributes for accessibility', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const sidebar = wrapper.find('.app-sidebar')
    expect(sidebar.attributes('role')).toBe('navigation')
    expect(sidebar.attributes('aria-label')).toBe('Main navigation')

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    expect(collapseToggle.attributes('aria-label')).toBeTruthy()
    expect(collapseToggle.attributes('aria-expanded')).toBe('true')
  })

  it('updates ARIA attributes when collapsed', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: true,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    const collapseToggle = wrapper.find('.app-sidebar__collapse-toggle')
    expect(collapseToggle.attributes('aria-expanded')).toBe('false')
  })

  it('filters navigation sections based on user roles', () => {
    // Mock user with only store-level access
    mockUseAuth.mockReturnValue({
      user: { value: { ...mockUser, roles: ['product-manager'] } },
      isPlatformAdmin: { value: false },
      hasRole: vi.fn((role: string) => role === 'product-manager'),
      hasPermission: vi.fn(() => true)
    })

    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    // Should not show platform admin sections
    expect(wrapper.text()).not.toContain('Platform')
  })

  it('shows loading state when navigation is loading', () => {
    mockUseNavigation.mockReturnValue({
      navigationSections: { value: [] },
      availableStores: { value: [] },
      currentStoreId: { value: null },
      isLoading: { value: true }
    })

    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.app-sidebar__loading').exists()).toBe(true)
  })

  it('handles empty navigation gracefully', () => {
    mockUseNavigation.mockReturnValue({
      navigationSections: { value: [] },
      availableStores: { value: [] },
      currentStoreId: { value: null }
    })

    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
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
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
      },
      global: {
        plugins: [router]
      }
    })

    // Collapse sidebar
    await wrapper.find('.app-sidebar__collapse-toggle').trigger('click')
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()

    // Update props to reflect collapsed state
    await wrapper.setProps({ isCollapsed: true })
    expect(wrapper.find('.app-sidebar--collapsed').exists()).toBe(true)
  })

  it('renders support link in footer', () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: false
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
    // Test mobile breakpoint behavior would typically be done with 
    // viewport manipulation, but for unit tests we can test the classes
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: true
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.classes()).toContain('app-sidebar--mobile-open')
  })

  it('emits close-mobile-menu when clicking outside on mobile', async () => {
    const wrapper = mount(AppSidebar, {
      props: {
        isCollapsed: false,
        isMobileMenuOpen: true
      },
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    // Simulate click outside sidebar
    const overlay = wrapper.find('.app-sidebar__overlay')
    if (overlay.exists()) {
      await overlay.trigger('click')
      expect(wrapper.emitted('close-mobile-menu')).toBeTruthy()
    }

    wrapper.unmount()
  })
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.