/**
 * useDebounce Composable
 * Provides debounced function execution for performance optimization
 *
 * Related GitHub Issue: #5 - Store Management System
 */

import { ref } from 'vue'

/**
 * Creates a debounced version of a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): T {
  const timeoutRef = ref<NodeJS.Timeout | null>(null)

  const debouncedFn = ((...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
    }

    // Set new timeout
    timeoutRef.value = setTimeout(() => {
      fn(...args)
      timeoutRef.value = null
    }, delay)
  }) as T

  return debouncedFn
}

/**
 * Creates a debounced ref that updates after a delay
 * @param initialValue - Initial value
 * @param delay - Delay in milliseconds
 * @returns Object with debounced value and immediate setter
 */
export function useDebouncedRef<T>(initialValue: T, delay = 300) {
  const immediate = ref<T>(initialValue)
  const debounced = ref<T>(initialValue)
  const timeoutRef = ref<NodeJS.Timeout | null>(null)

  const updateDebounced = () => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
    }

    timeoutRef.value = setTimeout(() => {
      debounced.value = immediate.value
      timeoutRef.value = null
    }, delay)
  }

  return {
    immediate,
    debounced,
    updateDebounced,
  }
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.