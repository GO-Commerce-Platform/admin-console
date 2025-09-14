import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import StoreSelector from '@/components/molecules/StoreSelector.vue'
import type { StoreOption } from '@/types/navigation'

/**
 * Unit tests for StoreSelector molecular component
 * 
 * Tests core functionality including:
 * - Store list display and selection
 * - Multi-store dropdown behavior
 * - Single store display
 * - Loading and empty states
 * - Platform admin access
 * - Event emission
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

// Mock useAuth composable
vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { value: null },
    isPlatformAdmin: { value: false }
  }))
}))

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/store/:id/dashboard', component: { template: '<div>Store Dashboard</div>' } }
  ]
})

describe('StoreSelector', () => {
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
      name: 'Fashion Boutique',
      subdomain: 'fashion',
      isDefault: false,
      userRoles: ['product-manager']
    },
    {
      id: 'store-3',
      name: 'Home & Garden',
      subdomain: 'home-garden',
      isDefault: false,
      userRoles: ['customer-service']
    }
  ]

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  it('renders dropdown for multiple stores', () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.store-selector__dropdown').exists()).toBe(true)
    expect(wrapper.find('.store-selector__trigger').exists()).toBe(true)
  })

  it('displays current store name correctly', () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.store-selector__store-name').text()).toBe('Electronics Store')
    expect(wrapper.find('.store-selector__store-subdomain').text()).toBe('electronics.gocommerce.com')
  })

  it('renders single store display when only one store available', () => {
    const singleStore = [mockStores[0]]
    
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: singleStore,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.store-selector__single').exists()).toBe(true)
    expect(wrapper.find('.store-selector__dropdown').exists()).toBe(false)
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: [],
        loading: true
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.store-selector__loading').exists()).toBe(true)
    expect(wrapper.find('.store-selector__loading-spinner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading stores...')
  })

  it('shows empty state when no stores available', () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: [],
        loading: false
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.store-selector__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('No stores available')
  })

  it('opens dropdown menu when trigger is clicked', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.store-selector__trigger').trigger('click')
    expect(wrapper.find('.store-selector__menu').exists()).toBe(true)
  })

  it('displays all available stores in dropdown menu', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.store-selector__trigger').trigger('click')
    
    const menuItems = wrapper.findAll('.store-selector__menu-item')
    expect(menuItems).toHaveLength(3)
    
    // Check store names
    expect(menuItems[0].text()).toContain('Electronics Store')
    expect(menuItems[1].text()).toContain('Fashion Boutique')
    expect(menuItems[2].text()).toContain('Home & Garden')
  })

  it('highlights current store in menu', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-2'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.store-selector__trigger').trigger('click')
    
    const activeItem = wrapper.find('.store-selector__menu-item--active')
    expect(activeItem.exists()).toBe(true)
    expect(activeItem.text()).toContain('Fashion Boutique')
  })

  it('shows default badge for default store', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.store-selector__trigger').trigger('click')
    
    const defaultBadge = wrapper.find('.store-selector__default-badge')
    expect(defaultBadge.exists()).toBe(true)
    expect(defaultBadge.text()).toBe('Default')
  })

  it('displays user roles for each store', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.store-selector__trigger').trigger('click')
    
    const roleElements = wrapper.findAll('.store-selector__menu-item-roles')
    expect(roleElements[0].text()).toBe('store-admin')
    expect(roleElements[1].text()).toBe('product-manager')
    expect(roleElements[2].text()).toBe('customer-service')
  })

  it('emits store-selected event when store is clicked', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.store-selector__trigger').trigger('click')
    await wrapper.findAll('.store-selector__menu-item')[1].trigger('click')
    
    expect(wrapper.emitted('store-selected')).toBeTruthy()
    expect(wrapper.emitted('store-selected')![0][0]).toEqual(mockStores[1])
  })

  it('does not emit store-selected event when clicking current store', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.store-selector__trigger').trigger('click')
    await wrapper.findAll('.store-selector__menu-item')[0].trigger('click')
    
    expect(wrapper.emitted('store-selected')).toBeFalsy()
  })

  it('closes dropdown when store is selected', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    // Open dropdown
    await wrapper.find('.store-selector__trigger').trigger('click')
    expect(wrapper.find('.store-selector__menu').exists()).toBe(true)

    // Select different store
    await wrapper.findAll('.store-selector__menu-item')[1].trigger('click')
    
    // Dropdown should close
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.store-selector__menu').exists()).toBe(false)
  })

  it('displays check icon for current store', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-2'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.store-selector__trigger').trigger('click')
    
    const checkIcon = wrapper.find('.store-selector__check-icon')
    expect(checkIcon.exists()).toBe(true)
    expect(checkIcon.text()).toBe('✓')
  })

  it('disables trigger when loading', () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1',
        loading: true
      },
      global: {
        plugins: [router]
      }
    })

    const trigger = wrapper.find('.store-selector__trigger')
    expect(trigger.attributes('disabled')).toBeDefined()
  })

  it('rotates chevron when dropdown is open', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router]
      }
    })

    // Initially not rotated
    expect(wrapper.classes()).not.toContain('store-selector__dropdown--open')

    // Click to open
    await wrapper.find('.store-selector__trigger').trigger('click')
    
    // Should have open class
    expect(wrapper.find('.store-selector__dropdown').classes()).toContain('store-selector__dropdown--open')
  })

  it('handles keyboard events properly', async () => {
    const wrapper = mount(StoreSelector, {
      props: {
        availableStores: mockStores,
        currentStoreId: 'store-1'
      },
      global: {
        plugins: [router],
        attachTo: document.body
      }
    })

    // Open dropdown
    await wrapper.find('.store-selector__trigger').trigger('click')
    expect(wrapper.find('.store-selector__menu').exists()).toBe(true)

    // Simulate escape key
    await wrapper.trigger('keydown', { key: 'Escape' })
    
    // Should close dropdown
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.store-selector__menu').exists()).toBe(false)

    wrapper.unmount()
  })
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.