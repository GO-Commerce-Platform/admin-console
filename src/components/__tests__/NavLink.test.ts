import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import NavLink from '@/components/atoms/NavLink.vue'

/**
 * Unit tests for NavLink atomic component
 * 
 * Tests core functionality including:
 * - Router link integration and active states
 * - External link handling
 * - Disabled state behavior
 * - Icon and badge display
 * - Click event handling
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

// Mock router for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/products', component: { template: '<div>Products</div>' } }
  ]
})

describe('NavLink', () => {
  it('renders correctly with label', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Dashboard',
        to: '/dashboard'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.find('.nav-link__text').exists()).toBe(true)
  })

  it('renders as router-link when "to" prop is provided', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Dashboard',
        to: '/dashboard'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('router-link').exists()).toBe(true)
  })

  it('renders as anchor tag when "href" prop is provided', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'External Link',
        href: 'https://example.com'
      },
      global: {
        plugins: [router]
      }
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com')
  })

  it('renders as button when neither "to" nor "href" is provided', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Button Link'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('applies disabled class when disabled prop is true', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Disabled Link',
        to: '/dashboard',
        disabled: true
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.classes()).toContain('nav-link--disabled')
  })

  it('shows icon when icon prop is provided', () => {
    const mockIcon = {
      template: '<svg data-testid="mock-icon"><path /></svg>'
    }

    const wrapper = mount(NavLink, {
      props: {
        label: 'Dashboard',
        to: '/dashboard',
        icon: mockIcon
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.nav-link__icon').exists()).toBe(true)
    expect(wrapper.find('[data-testid="mock-icon"]').exists()).toBe(true)
  })

  it('shows badge when badge prop is provided', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Notifications',
        to: '/notifications',
        badge: '5'
      },
      global: {
        plugins: [router]
      }
    })

    const badge = wrapper.find('.nav-link__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
  })

  it('hides text when iconOnly prop is true', () => {
    const mockIcon = {
      template: '<svg data-testid="mock-icon"><path /></svg>'
    }

    const wrapper = mount(NavLink, {
      props: {
        label: 'Dashboard',
        to: '/dashboard',
        icon: mockIcon,
        iconOnly: true
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.nav-link__icon').exists()).toBe(true)
    expect(wrapper.find('.nav-link__text').exists()).toBe(false)
    expect(wrapper.classes()).toContain('nav-link--icon-only')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Dashboard',
        to: '/dashboard'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('prevents click event when disabled', async () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Disabled Link',
        disabled: true
      },
      global: {
        plugins: [router]
      }
    })

    const clickSpy = vi.spyOn(wrapper.vm, 'handleClick')
    await wrapper.trigger('click')
    
    // Should not emit click event when disabled
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('applies force active class when forceActive is true', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Dashboard',
        to: '/dashboard',
        forceActive: true
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.classes()).toContain('nav-link--active')
  })

  it('renders slot content when provided', () => {
    const wrapper = mount(NavLink, {
      props: {
        to: '/dashboard'
      },
      slots: {
        default: '<span>Custom Content</span>'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.html()).toContain('<span>Custom Content</span>')
  })

  it('handles numeric badge values correctly', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Messages',
        to: '/messages',
        badge: 42
      },
      global: {
        plugins: [router]
      }
    })

    const badge = wrapper.find('.nav-link__badge')
    expect(badge.text()).toBe('42')
  })

  it('applies correct classes for different states', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Dashboard',
        to: '/dashboard',
        disabled: false,
        iconOnly: false,
        forceActive: false
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.classes()).toContain('nav-link')
    expect(wrapper.classes()).not.toContain('nav-link--disabled')
    expect(wrapper.classes()).not.toContain('nav-link--icon-only')
    expect(wrapper.classes()).not.toContain('nav-link--active')
  })
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.