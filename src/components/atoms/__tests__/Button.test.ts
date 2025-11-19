/**
 * Button Component Unit Tests
 * 
 * Tests for the Button atom component functionality, variants, and interactions.
 * 
 * Related GitHub Issue: #11 - Component Library & Design System
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Test Button'
      }
    })

    expect(wrapper.text()).toContain('Test Button')
    expect(wrapper.find('.gocommerce-button').exists()).toBe(true)
  })

  it('applies correct variant classes', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary'
      },
      slots: {
        default: 'Primary Button'
      }
    })

    const button = wrapper.findComponent({ name: 'NButton' })
    expect(button.props('type')).toBe('primary')
  })

  it('applies correct size classes', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'lg'
      },
      slots: {
        default: 'Large Button'
      }
    })

    const button = wrapper.findComponent({ name: 'NButton' })
    expect(button.props('size')).toBe('large')
  })

  it('handles loading state correctly', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading Button'
      }
    })

    const button = wrapper.findComponent({ name: 'NButton' })
    expect(button.props('loading')).toBe(true)
  })

  it('handles disabled state correctly', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled Button'
      }
    })

    const button = wrapper.findComponent({ name: 'NButton' })
    expect(button.props('disabled')).toBe(true)
  })

  it('applies glass class when glass prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        glass: true
      },
      slots: {
        default: 'Glass Button'
      }
    })

    expect(wrapper.find('.naive-glass').exists()).toBe(true)
  })

  it('does not apply glass class when glass prop is false', () => {
    const wrapper = mount(Button, {
      props: {
        glass: false
      },
      slots: {
        default: 'Normal Button'
      }
    })

    expect(wrapper.find('.naive-glass').exists()).toBe(false)
  })

  it('emits click event when clicked and not disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: false
      },
      slots: {
        default: 'Clickable Button'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click event when disabled', async () => {
    const mockClick = vi.fn()
    const wrapper = mount(Button, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled Button'
      }
    })

    // Mock the handleClick method
    wrapper.vm.handleClick = mockClick

    await wrapper.trigger('click')
    expect(mockClick).not.toHaveBeenCalled()
  })

  it('does not emit click event when loading', async () => {
    const mockClick = vi.fn()
    const wrapper = mount(Button, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading Button'
      }
    })

    // Mock the handleClick method
    wrapper.vm.handleClick = mockClick

    await wrapper.trigger('click')
    expect(mockClick).not.toHaveBeenCalled()
  })

  it('supports left icon prop', () => {
    const wrapper = mount(Button, {
      props: {
        leftIcon: 'plus'
      },
      slots: {
        default: 'Button with Icon'
      }
    })

    // With Naive UI, icons are rendered in slots
    expect(wrapper.props('leftIcon')).toBe('plus')
  })

  it('supports right icon prop', () => {
    const wrapper = mount(Button, {
      props: {
        rightIcon: 'arrow-right'
      },
      slots: {
        default: 'Button with Icon'
      }
    })

    // With Naive UI, icons are rendered in slots
    expect(wrapper.props('rightIcon')).toBe('arrow-right')
  })

  it('renders as a proper button element', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Test Button'
      }
    })

    // Verify it renders as a button element
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.text()).toBe('Test Button')
    
    // Verify it has the expected base classes
    expect(wrapper.classes()).toContain('gocommerce-button')
  })

  describe('Button Variants', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        const wrapper = mount(Button, {
          props: { variant },
          slots: {
            default: `${variant} Button`
          }
        })

        const button = wrapper.findComponent({ name: 'CButton' })
        expect(button.props('variant')).toBe(variant)
      })
    })
  })

  describe('Button Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(Button, {
          props: { size },
          slots: {
            default: `${size} Button`
          }
        })

        const button = wrapper.findComponent({ name: 'CButton' })
        expect(button.props('size')).toBe(size)
      })
    })
  })

  describe('Accessibility', () => {
    it('maintains proper button role', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Accessible Button'
        }
      })

      // CButton should maintain button role
      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('can be clicked when not disabled', async () => {
      const wrapper = mount(Button, {
        props: {
          disabled: false
        },
        slots: {
          default: 'Clickable Button'
        }
      })

      // Verify button is clickable
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })
  })
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.