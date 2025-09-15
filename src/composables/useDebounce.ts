/**
 * Debounce Composable
 * Provides debounced execution of functions to optimize performance
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

import { ref, type Ref } from 'vue'

/**
 * Debounce function type
 */
type DebouncedFunction = (...args: any[]) => void

/**
 * Create a debounced function
 * 
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * ```typescript
 * const debouncedSearch = useDebounce(() => {
 *   performSearch(searchTerm.value)
 * }, 300)
 * 
 * // Call the debounced function
 * debouncedSearch()
 * ```
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      fn.apply(null, args)
    }, delay)
  }
}

/**
 * Reactive debounce composable
 * Returns a debounced function and reactive pending state
 * 
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Object with debounced function and pending state
 * 
 * @example
 * ```typescript
 * const { debouncedFn, isPending } = useReactiveDebounce(() => {
 *   performSearch(searchTerm.value)
 * }, 300)
 * ```
 */
export function useReactiveDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): {
  debouncedFn: (...args: Parameters<T>) => void
  isPending: Ref<boolean>
  cancel: () => void
} {
  const isPending = ref(false)
  let timeoutId: NodeJS.Timeout | null = null

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      isPending.value = false
    }
  }

  const debouncedFn = (...args: Parameters<T>) => {
    // Clear existing timeout
    cancel()

    // Set pending state
    isPending.value = true

    // Set new timeout
    timeoutId = setTimeout(() => {
      isPending.value = false
      fn.apply(null, args)
    }, delay)
  }

  return {
    debouncedFn,
    isPending,
    cancel
  }
}

/**
 * Debounced ref watcher
 * Watches a ref and executes callback with debounce
 * 
 * @param source Ref to watch
 * @param callback Callback function
 * @param delay Delay in milliseconds
 * @returns Stop function
 * 
 * @example
 * ```typescript
 * const searchTerm = ref('')
 * 
 * const stopWatcher = useDebouncedWatch(
 *   searchTerm,
 *   (newValue) => performSearch(newValue),
 *   300
 * )
 * ```
 */
export function useDebouncedWatch<T>(
  source: Ref<T>,
  callback: (value: T, oldValue: T) => void,
  delay = 300
): () => void {
  const { debouncedFn, cancel } = useReactiveDebounce(callback, delay)
  
  const stop = watchEffect(() => {
    const currentValue = source.value
    // Get the previous value (this is a simplified approach)
    debouncedFn(currentValue, currentValue)
  })

  return () => {
    stop()
    cancel()
  }
}

/**
 * Simple throttle function
 * Limits function execution to once per time period
 * 
 * @param fn Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let isThrottled = false

  return (...args: Parameters<T>) => {
    if (isThrottled) {
      return
    }

    fn.apply(null, args)
    isThrottled = true

    setTimeout(() => {
      isThrottled = false
    }, delay)
  }
}

// Import watchEffect for the watch functionality
import { watchEffect } from 'vue'

// Export default as the main useDebounce function
export default useDebounce

// Copilot: This file may have been generated or refactored by GitHub Copilot.