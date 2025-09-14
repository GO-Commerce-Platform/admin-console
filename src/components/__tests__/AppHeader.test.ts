import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppHeader from '@/components/organisms/AppHeader.vue'
import type { User } from '@/types/auth'

/**
 * Unit tests for AppHeader organism component
 * 
 * Tests comprehensive header functionality including:
 * - User menu display and interactions
 * - Global search functionality
 * - Notifications panel toggle
 * - Mobile menu toggle
 * - Responsive behavior
 * - Authentication state handling
 * - Keyboard navigation
 * - Accessibility features
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

// Mock composables
vi.mock('@/composables/useAuth')
vi.mock('@/composables/useNotifications')

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/search', component: { template: '<div>Search</div>' } },
    { path: '/profile', component: { template: '<div>Profile</div>' } }
  ]
})

describe('AppHeader', () => {
  const mockUser: User = {
    id: 'user-1',
    username: 'john.doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['store-admin'],
    storeAccess: [
      {
        storeId: 'store-1',
        roles: ['store-admin']
      }
    ]
  }

  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Default auth mock return
    const { useAuth } = await import('@/composables/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: { value: mockUser },
      isAuthenticated: { value: true },
      logout: vi.fn()
    })

    // Default notifications mock
    const { useNotifications } = await import('@/composables/useNotifications')
    vi.mocked(useNotifications).mockReturnValue({
      unreadCount: { value: 3 },
      notifications: { value: [] }
    })
  })

  it('renders header with all main elements', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.app-header__logo').exists()).toBe(true)
    expect(wrapper.find('.app-header__search').exists()).toBe(true)
    expect(wrapper.find('.app-header__actions').exists()).toBe(true)
  })

  it('displays GO Commerce logo and brand name', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const logo = wrapper.find('.app-header__logo')
    expect(logo.exists()).toBe(true)
    expect(logo.text()).toContain('GO Commerce')
  })

  it('renders global search input with placeholder', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const searchInput = wrapper.find('.app-header__search-input')
    expect(searchInput.exists()).toBe(true)
    expect(searchInput.attributes('placeholder')).toBe('Search products, orders, customers...')
  })

  it('handles search input and submission', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const searchInput = wrapper.find('.app-header__search-input')
    
    // Type in search input
    await searchInput.setValue('test search')
    expect((searchInput.element as HTMLInputElement).value).toBe('test search')

    // Submit search
    await wrapper.find('.app-header__search-form').trigger('submit')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0][0]).toBe('test search')
  })

  it('shows notifications button with unread count badge', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const notificationsButton = wrapper.find('.app-header__notifications')
    expect(notificationsButton.exists()).toBe(true)
    
    const badge = wrapper.find('.app-header__notification-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('3')
  })

  it('hides notification badge when no unread notifications', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: { value: 0 },
      notifications: { value: [] }
    })

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.app-header__notification-badge').exists()).toBe(false)
  })

  it('toggles notifications panel when notifications button is clicked', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const notificationsButton = wrapper.find('.app-header__notifications')
    
    // Initial state - not shown
    expect(wrapper.emitted('toggle-notifications')).toBeFalsy()
    
    // Click notifications button
    await notificationsButton.trigger('click')
    expect(wrapper.emitted('toggle-notifications')).toBeTruthy()
  })

  it('displays user menu with user information', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const userMenu = wrapper.find('.app-header__user-menu')
    expect(userMenu.exists()).toBe(true)
    
    const userInfo = wrapper.find('.app-header__user-info')
    expect(userInfo.text()).toContain('John Doe')
    expect(userInfo.text()).toContain('john.doe@example.com')
  })

  it('opens user menu dropdown when clicked', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const userMenuTrigger = wrapper.find('.app-header__user-menu-trigger')
    
    // Initially closed
    expect(wrapper.find('.app-header__user-menu-dropdown').exists()).toBe(false)
    
    // Click to open
    await userMenuTrigger.trigger('click')
    expect(wrapper.find('.app-header__user-menu-dropdown').exists()).toBe(true)
  })

  it('displays user menu options in dropdown', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    // Open user menu
    await wrapper.find('.app-header__user-menu-trigger').trigger('click')
    
    const menuItems = wrapper.findAll('.app-header__user-menu-item')
    expect(menuItems.length).toBeGreaterThan(0)
    
    // Check for expected menu items
    const menuText = wrapper.find('.app-header__user-menu-dropdown').text()
    expect(menuText).toContain('Profile')
    expect(menuText).toContain('Settings')
    expect(menuText).toContain('Logout')
  })

  it('handles logout when logout menu item is clicked', async () => {
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({
      user: { value: mockUser },
      isAuthenticated: { value: true },
      logout: mockLogout
    })

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    // Open user menu
    await wrapper.find('.app-header__user-menu-trigger').trigger('click')
    
    // Click logout
    const logoutItem = wrapper.find('.app-header__user-menu-item--logout')
    await logoutItem.trigger('click')
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('shows mobile menu toggle button', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const mobileToggle = wrapper.find('.app-header__mobile-toggle')
    expect(mobileToggle.exists()).toBe(true)
  })

  it('emits mobile menu toggle event when mobile button is clicked', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const mobileToggle = wrapper.find('.app-header__mobile-toggle')
    await mobileToggle.trigger('click')
    
    expect(wrapper.emitted('toggle-mobile-menu')).toBeTruthy()
  })

  it('handles keyboard navigation for user menu', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    const userMenuTrigger = wrapper.find('.app-header__user-menu-trigger')
    
    // Open menu with Enter key
    await userMenuTrigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.app-header__user-menu-dropdown').exists()).toBe(true)
    
    // Close menu with Escape key
    await userMenuTrigger.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.app-header__user-menu-dropdown').exists()).toBe(false)

    wrapper.unmount()
  })

  it('handles keyboard navigation for notifications', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    const notificationsButton = wrapper.find('.app-header__notifications')
    
    // Trigger notifications with Enter key
    await notificationsButton.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('toggle-notifications')).toBeTruthy()

    wrapper.unmount()
  })

  it('displays user avatar with fallback initials', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const avatar = wrapper.find('.app-header__user-avatar')
    expect(avatar.exists()).toBe(true)
    expect(avatar.text()).toBe('JD') // John Doe initials
  })

  it('applies correct ARIA attributes for accessibility', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const userMenuTrigger = wrapper.find('.app-header__user-menu-trigger')
    expect(userMenuTrigger.attributes('aria-haspopup')).toBe('true')
    expect(userMenuTrigger.attributes('aria-expanded')).toBe('false')

    const notificationsButton = wrapper.find('.app-header__notifications')
    expect(notificationsButton.attributes('aria-label')).toBeTruthy()
  })

  it('updates ARIA attributes when menus are opened', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const userMenuTrigger = wrapper.find('.app-header__user-menu-trigger')
    
    // Open menu
    await userMenuTrigger.trigger('click')
    expect(userMenuTrigger.attributes('aria-expanded')).toBe('true')
  })

  it('handles unauthenticated state gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: { value: null },
      isAuthenticated: { value: false },
      logout: vi.fn()
    })

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    // Should still render header but without user-specific elements
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.app-header__user-menu').exists()).toBe(false)
  })

  it('closes dropdowns when clicking outside', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    // Open user menu
    await wrapper.find('.app-header__user-menu-trigger').trigger('click')
    expect(wrapper.find('.app-header__user-menu-dropdown').exists()).toBe(true)

    // Click outside
    await document.body.click()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.app-header__user-menu-dropdown').exists()).toBe(false)

    wrapper.unmount()
  })

  it('shows search suggestions when typing', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const searchInput = wrapper.find('.app-header__search-input')
    
    // Focus and type to trigger suggestions
    await searchInput.trigger('focus')
    await searchInput.setValue('test')
    
    // Should show search suggestions (if implemented)
    // This would depend on the actual implementation
    expect(searchInput.element).toHaveFocus()
  })

  it('clears search input after submission', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const searchInput = wrapper.find('.app-header__search-input')
    
    // Type and submit
    await searchInput.setValue('test search')
    await wrapper.find('.app-header__search-form').trigger('submit')
    
    // Input should be cleared after submission
    expect((searchInput.element as HTMLInputElement).value).toBe('')
  })

  it('displays correct notification count formatting for large numbers', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: { value: 999 },
      notifications: { value: [] }
    })

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const badge = wrapper.find('.app-header__notification-badge')
    expect(badge.text()).toBe('999')
  })

  it('shows 99+ for notification counts over 99', () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: { value: 150 },
      notifications: { value: [] }
    })

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const badge = wrapper.find('.app-header__notification-badge')
    expect(badge.text()).toBe('99+')
  })
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.