import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import NavLink from '@/components/atoms/NavLink.vue'

/**
 * Simplified unit tests for NavLink atomic component
 * 
 * Tests core functionality without complex mocks:
 * - Basic rendering and props
 * - Click events
 * - CSS classes
 * - Content rendering
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

// Simple router for tests
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/test', component: { template: '<div>Test</div>' } }
  ]
})

describe('NavLink (Simplified)', () => {
  it('renders with basic props', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Test Link'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('Test Link')
  })

  it('renders as button when no navigation props provided', () => {
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

  it('renders as anchor when href provided', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'External Link',
        href: 'https://example.com'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('a[href="https://example.com"]').exists()).toBe(true)
  })

  it('shows icon when provided', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Icon Link',
        icon: 'test-icon'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.nav-link__icon').exists()).toBe(true)
  })

  it('shows badge when provided', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Badge Link',
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

  it('applies disabled class when disabled', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Disabled Link',
        disabled: true
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.classes()).toContain('nav-link--disabled')
  })

  it('emits click event', async () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Clickable Link'
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('prevents click when disabled', async () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Disabled Link',
        disabled: true
      },
      global: {
        plugins: [router]
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders slot content', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Slot Link'
      },
      slots: {
        default: '<span class="custom-content">Custom Content</span>'
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.custom-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom Content')
  })

  it('applies icon-only class when iconOnly is true', () => {
    const wrapper = mount(NavLink, {
      props: {
        label: 'Icon Only',
        icon: 'test-icon',
        iconOnly: true
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.classes()).toContain('nav-link--icon-only')
  })
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.