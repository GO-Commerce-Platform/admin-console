<!-- 
  Button Atom Component
  
  A reusable button component with glassmorphism styling and multiple variants
  for the GO Commerce Administration Console.
  
  Related GitHub Issue: #11 - Component Library & Design System
-->
<template>
  <NButton
    :type="naiveVariant"
    :size="naiveSize"
    :loading="loading"
    :disabled="disabled"
    :class="['gocommerce-button', glassClass]"
    v-bind="$attrs"
    @click="handleClick"
  >
    <template v-if="leftIcon" #icon>
      <NIcon><component :is="leftIcon" /></NIcon>
    </template>
    <slot />
    <template v-if="rightIcon" #suffix>
      <NIcon><component :is="rightIcon" /></NIcon>
    </template>
  </NButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'

/**
 * Button Component Props
 */
interface ButtonProps {
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Loading state */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Left icon */
  leftIcon?: string
  /** Right icon */
  rightIcon?: string
  /** Enable glassmorphism effect */
  glass?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  glass: false,
})

/**
 * Button Component Events
 */
interface ButtonEmits {
  /** Click event handler */
  (event: 'click', payload: Event): void
}

const emit = defineEmits<ButtonEmits>()

/**
 * Computed Properties
 */
const naiveVariant = computed(() => {
  const variantMap = {
    primary: 'primary',
    secondary: 'default', 
    ghost: 'tertiary',
    danger: 'error'
  }
  return variantMap[props.variant] || 'primary'
})

const naiveSize = computed(() => {
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'large'
  }
  return sizeMap[props.size] || 'medium'
})

const glassClass = computed(() => {
  return props.glass ? 'naive-glass' : ''
})

/**
 * Event Handlers
 */
const handleClick = (event: Event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.gocommerce-button {
  /* Custom button styles are handled by theme */
  position: relative;
  overflow: hidden;
}

.gocommerce-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.gocommerce-button:hover::before {
  left: 100%;
}

/* Glassmorphism enhancement */
.naive-glass.gocommerce-button {
  position: relative;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
}
</style>

<!-- 
Copilot: This file may have been generated or refactored by GitHub Copilot.
-->