<template>
  <component
    :is="computedTag"
    :to="computedTo"
    :href="href"
    :class="[
      'nav-link',
      {
        'nav-link--active': isActive,
        'nav-link--disabled': disabled,
        'nav-link--icon-only': iconOnly,
      },
    ]"
    @click="handleClick"
  >
    <span v-if="icon"
class="nav-link__icon">
      <component :is="icon" />
    </span>
    <span v-if="!iconOnly"
class="nav-link__text">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="badge"
class="nav-link__badge">{{ badge }}</span>
  </component>
</template>

<script setup lang="ts">
  import { computed, type Component } from 'vue'
  import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'

  /**
   * NavLink - Atomic component for navigation links
   *
   * Provides consistent styling and behavior for all navigation links
   * throughout the application with support for:
   * - Vue Router integration
   * - External links
   * - Active state detection
   * - Disabled state
   * - Icon support
   * - Badge notifications
   *
   * Related GitHub Issue: #3 - Layout, Navigation & Routing System
   */

  interface Props {
    /** Route path for Vue Router or URL for external links */
    to?: RouteLocationRaw | string
    /** External URL (will render as anchor tag) */
    href?: string
    /** Link text label */
    label?: string
    /** Icon component to display */
    icon?: Component
    /** Badge text/number to show */
    badge?: string | number
    /** Whether the link is disabled */
    disabled?: boolean
    /** Show only icon, hide text */
    iconOnly?: boolean
    /** Force active state */
    forceActive?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    iconOnly: false,
    forceActive: false,
  })

  const emit = defineEmits<{
    click: [event: Event]
  }>()

  const route = useRoute()
  const router = useRouter()

  // Determine which component to render (router-link vs a tag)
  const computedTag = computed(() => {
    if (props.href) return 'a'
    if (props.to) return 'router-link'
    return 'button'
  })

  // Compute the 'to' prop for router-link
  const computedTo = computed(() => {
    if (props.href) return undefined
    return props.to
  })

  // Determine if link is active
  const isActive = computed(() => {
    if (props.forceActive) return true
    if (props.href || !props.to) return false

    // For router links, check if current route matches
    if (typeof props.to === 'string') {
      return route.path === props.to || route.path.startsWith(props.to)
    }

    // For route objects, do basic matching
    if (typeof props.to === 'object' && props.to.path) {
      return route.path === props.to.path || route.path.startsWith(props.to.path)
    }

    return false
  })

  function handleClick(event: Event) {
    if (props.disabled) {
      event.preventDefault()
      return
    }
    emit('click', event)
  }
</script>

<style scoped>
  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    color: #64748b;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    border: none;
    background: none;
    min-height: 36px;
  }

  .nav-link:hover:not(.nav-link--disabled) {
    background-color: #f1f5f9;
    color: #1e293b;
  }

  .nav-link--active {
    background-color: #dbeafe;
    color: #1d4ed8;
    font-weight: 600;
  }

  .nav-link--disabled {
    color: #cbd5e1;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .nav-link--icon-only {
    padding: 8px;
    min-width: 36px;
    justify-content: center;
  }

  .nav-link__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .nav-link__text {
    flex: 1;
    text-align: left;
  }

  .nav-link__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background-color: #ef4444;
    color: white;
    font-size: 12px;
    font-weight: 600;
    border-radius: 10px;
    line-height: 1;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .nav-link {
      padding: 12px 16px;
      min-height: 44px;
    }

    .nav-link--icon-only {
      padding: 12px;
      min-width: 44px;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
