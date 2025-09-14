/**
 * GO Commerce Administration Console Component Library
 * 
 * Atomic Design Component exports for easy importing throughout the application.
 * Components are organized by atomic design principles: Atoms, Molecules, Organisms
 * 
 * Related GitHub Issue: #11 - Component Library & Design System
 */

// ============================================
// ATOMS - Basic building blocks
// ============================================

export { default as Button } from './atoms/Button.vue'
export { default as Input } from './atoms/Input.vue'
export { default as Badge } from './atoms/Badge.vue'

// ============================================
// MOLECULES - Composed components
// ============================================

export { default as MetricCard } from './molecules/MetricCard.vue'
export { default as AnimatedNumber } from './molecules/AnimatedNumber.vue'

// ============================================
// ORGANISMS - Complex components
// ============================================

// Note: Organisms will be added in future phases
// export { default as DataTable } from './organisms/DataTable.vue'
// export { default as DashboardLayout } from './organisms/DashboardLayout.vue'
// export { default as NavigationSidebar } from './organisms/NavigationSidebar.vue'

// ============================================
// COMPONENT TYPES - TypeScript interfaces
// ============================================

/**
 * Button component prop types
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  leftIcon?: string
  rightIcon?: string
  glass?: boolean
}

/**
 * Input component prop types
 */
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  helper?: string
  error?: string
  modelValue?: string | number
  glass?: boolean
}

/**
 * Badge component prop types
 */
export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

/**
 * MetricCard component prop types
 */
export interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  iconBg?: string
  trend?: number
  format?: 'currency' | 'percentage' | 'decimal' | 'integer'
  progress?: number
  progressMax?: number
  progressLabel?: string
  animationDuration?: number
  glass?: boolean
}

/**
 * AnimatedNumber component prop types
 */
export interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: 'currency' | 'percentage' | 'decimal' | 'integer'
  currency?: string
  decimals?: number
  animate?: boolean
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get component variant based on status
 */
export const getStatusVariant = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning',
    error: 'error',
    draft: 'neutral',
    archived: 'neutral',
  }
  
  return statusMap[status.toLowerCase()] || 'neutral'
}

/**
 * Get trend color based on value
 */
export const getTrendColor = (trend: number): string => {
  if (trend > 0) return 'accent.green'
  if (trend < 0) return 'accent.red'
  return 'text.secondary'
}

/**
 * Format number with appropriate suffix (K, M, B)
 */
export const formatNumberWithSuffix = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Get icon name based on metric type
 */
export const getMetricIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    revenue: 'dollar-sign',
    orders: 'shopping-bag',
    customers: 'users',
    products: 'package',
    growth: 'trending-up',
    conversion: 'target',
    visitors: 'eye',
    sales: 'credit-card',
  }
  
  return iconMap[type.toLowerCase()] || 'bar-chart'
}

// ============================================
// THEME UTILITIES
// ============================================

/**
 * Get glassmorphism CSS properties
 */
export const getGlassmorphismStyles = () => ({
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  background: 'rgba(30, 41, 59, 0.6)',
  border: '1px solid rgba(71, 85, 105, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
})

/**
 * Get hover transition styles
 */
export const getHoverTransition = () => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'translateY(-2px)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2)',
})

// ============================================
// COMPONENT REGISTRY
// ============================================

/**
 * Component registry for dynamic imports and documentation
 */
export const componentRegistry = {
  atoms: {
    Button: {
      component: 'Button',
      description: 'Reusable button with glassmorphism styling',
      props: ['variant', 'size', 'loading', 'disabled', 'glass'],
    },
    Input: {
      component: 'Input',
      description: 'Form input with validation and dark theme styling',
      props: ['type', 'label', 'placeholder', 'size', 'required', 'error', 'glass'],
    },
    Badge: {
      component: 'Badge',
      description: 'Status badge with bright colors and glow effects',
      props: ['variant', 'size', 'glow'],
    },
  },
  molecules: {
    MetricCard: {
      component: 'MetricCard',
      description: 'Dashboard metric card with animations and trends',
      props: ['title', 'value', 'icon', 'trend', 'format', 'progress'],
    },
    AnimatedNumber: {
      component: 'AnimatedNumber',
      description: 'Animated number counter with formatting',
      props: ['value', 'duration', 'format', 'currency', 'animate'],
    },
  },
  organisms: {
    // To be added in future phases
  },
} as const

export default {
  // Re-export all components
  Button,
  Input, 
  Badge,
  MetricCard,
  AnimatedNumber,
  
  // Export utilities
  getStatusVariant,
  getTrendColor,
  formatNumberWithSuffix,
  getMetricIcon,
  getGlassmorphismStyles,
  getHoverTransition,
  componentRegistry,
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.