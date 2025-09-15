<!-- 
  AnimatedNumber Component
  
  An animated number component that smoothly transitions between values
  with formatting options for currency, percentages, etc.
  
  Related GitHub Issue: #11 - Component Library & Design System
-->
<template>
  <span :class="['animated-number', animationClass]">
    {{ displayValue }}
  </span>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'

  /**
   * AnimatedNumber Component Props
   */
  interface AnimatedNumberProps {
    /** Target number value */
    value: number
    /** Animation duration in milliseconds */
    duration?: number
    /** Number format type */
    format?: 'currency' | 'percentage' | 'decimal' | 'integer'
    /** Currency symbol for currency format */
    currency?: string
    /** Decimal places for decimal format */
    decimals?: number
    /** Animate on value change */
    animate?: boolean
  }

  const props = withDefaults(defineProps<AnimatedNumberProps>(), {
    duration: 1000,
    format: 'integer',
    currency: '$',
    decimals: 2,
    animate: true,
  })

  /**
   * Reactive State
   */
  const currentValue = ref(0)
  const isAnimating = ref(false)

  /**
   * Computed Properties
   */
  const displayValue = computed(() => {
    return formatNumber(currentValue.value, props.format, props.currency, props.decimals)
  })

  const animationClass = computed(() => {
    return isAnimating.value ? 'animating' : ''
  })

  /**
   * Number formatting function
   */
  const formatNumber = (
    num: number,
    format: string,
    currency: string,
    decimals: number
  ): string => {
    switch (format) {
      case 'currency':
        return `${currency}${num.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}`

      case 'percentage':
        return `${num.toFixed(decimals)}%`

      case 'decimal':
        return num.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })

      case 'integer':
      default:
        return num.toLocaleString('en-US', {
          maximumFractionDigits: 0,
        })
    }
  }

  /**
   * Animation function using easing
   */
  const animateToValue = (targetValue: number) => {
    if (!props.animate) {
      currentValue.value = targetValue
      return
    }

    isAnimating.value = true
    const startValue = currentValue.value
    const difference = targetValue - startValue
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / props.duration, 1)

      // Easing function (ease-out-cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      currentValue.value = startValue + difference * easedProgress

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        currentValue.value = targetValue
        isAnimating.value = false
      }
    }

    requestAnimationFrame(animate)
  }

  /**
   * Watchers
   */
  watch(
    () => props.value,
    newValue => {
      animateToValue(newValue)
    }
  )

  /**
   * Lifecycle
   */
  onMounted(() => {
    // Start animation from 0 to target value
    animateToValue(props.value)
  })
</script>

<style scoped>
  .animated-number {
    display: inline-block;
    font-variant-numeric: tabular-nums;
    transition: color 0.2s ease;
  }

  .animated-number.animating {
    color: #6366f1; /* Primary color during animation */
  }

  /* Add a subtle glow effect during animation */
  .animated-number.animating {
    text-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
  }
</style>

<!-- 
Copilot: This file may have been generated or refactored by GitHub Copilot.
-->
