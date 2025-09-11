/**
 * Compatibility utilities for handling missing exports from dependencies
 * 
 * This module provides polyfills and wrappers for functions that are missing
 * from the current versions of dependencies but are expected by other packages.
 */

// Re-export from @chakra-ui/styled-system with correct name mapping
export { isStylePropFn as isStyleProp } from '@chakra-ui/styled-system'

/**
 * Check if a value is a function
 * 
 * This was removed from @vueuse/shared in newer versions but is still
 * expected by some packages like @vueuse/motion.
 * 
 * @param val - The value to check
 * @returns True if the value is a function
 */
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

/**
 * Type guard for checking if a value is defined (not null or undefined)
 * 
 * @param val - The value to check
 * @returns True if the value is defined
 */
export function isDefined<T>(val: T): val is NonNullable<T> {
  return val !== null && val !== undefined
}

/**
 * Check if a value is a string
 * 
 * @param val - The value to check
 * @returns True if the value is a string
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

/**
 * Check if a value is a number
 * 
 * @param val - The value to check
 * @returns True if the value is a number and not NaN
 */
export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val)
}

/**
 * Check if a value is a boolean
 * 
 * @param val - The value to check
 * @returns True if the value is a boolean
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

/**
 * Check if a value is an object (excluding null and arrays)
 * 
 * @param val - The value to check
 * @returns True if the value is a plain object
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}
