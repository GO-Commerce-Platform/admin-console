<!-- 
  Badge Atom Component
  
  A reusable badge component with bright colors and status indicators
  for the GO Commerce Administration Console.
  
  Related GitHub Issue: #11 - Component Library & Design System
-->
<template>
  <CBadge
    :variant="computedVariant"
    :size="size"
    :class="['gocommerce-badge', glowClass]"
    v-bind="$attrs"
  >
    <slot />
  </CBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CBadge } from '@chakra-ui/vue-next'

/**
 * Badge Component Props
 */
interface BadgeProps {
  /** Badge visual variant based on status or color */
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'neutral'
  /** Badge size */
  size?: 'sm' | 'md' | 'lg'
  /** Enable glow effect */
  glow?: boolean
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'neutral',
  size: 'md',
  glow: false,
})

/**
 * Computed Properties
 */
const computedVariant = computed(() => {
  // Map our custom variants to Chakra UI variants
  const variantMap = {
    success: 'success',
    warning: 'warning', 
    error: 'error',
    info: 'info',
    primary: 'solid',
    secondary: 'subtle',
    neutral: 'subtle',
  }
  
  return variantMap[props.variant] || 'subtle'
})

const glowClass = computed(() => {
  return props.glow ? 'badge-glow' : ''
})
</script>

<style scoped>
.gocommerce-badge {
  /* Custom badge styles are handled by theme */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Glow effect for badges */
.badge-glow {
  position: relative;
}

.badge-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(45deg, 
    rgba(99, 102, 241, 0.6),
    rgba(168, 85, 247, 0.6),
    rgba(236, 72, 153, 0.6),
    rgba(6, 182, 212, 0.6)
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  animation: badge-glow-animation 3s ease-in-out infinite;
}

@keyframes badge-glow-animation {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Status-specific colors */
.gocommerce-badge[data-variant="success"] {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.gocommerce-badge[data-variant="warning"] {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

.gocommerce-badge[data-variant="error"] {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

.gocommerce-badge[data-variant="info"] {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.gocommerce-badge[data-variant="primary"] {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
}

.gocommerce-badge[data-variant="secondary"] {
  background: rgba(71, 85, 105, 0.6);
  color: #cbd5e1;
  border: 1px solid rgba(71, 85, 105, 0.3);
  backdrop-filter: blur(12px);
}
</style>

<!-- 
Copilot: This file may have been generated or refactored by GitHub Copilot.
-->