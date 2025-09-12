/**
 * Pinia Store Utilities
 * Helper functions and utilities for store management
 *
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import { ref, computed, watch, unref, type Ref } from 'vue'
import type {
  BaseStoreState,
  PaginationState,
  SortState,
  FilterState,
  ResetOptions,
  PersistenceConfig,
  LoadingState,
  ErrorState,
} from './types'
import { isApiError } from '@/services/errors/apiError'

/**
 * Create a base store state with default values
 */
export function createBaseState(): BaseStoreState {
  return {
    loading: false,
    error: null,
    lastUpdated: null,
  }
}

/**
 * Create pagination state with default values
 */
export function createPaginationState(): PaginationState {
  return {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  }
}

/**
 * Create sort state with default values
 */
export function createSortState(): SortState {
  return {
    field: '',
    direction: 'asc',
  }
}

/**
 * Create filter state
 */
export function createFilterState(): FilterState {
  return {}
}

/**
 * Create loading states object
 */
export function createLoadingStates(): LoadingState {
  return {}
}

/**
 * Create error states object
 */
export function createErrorStates(): ErrorState {
  return {}
}

/**
 * Update pagination state from API response
 */
export function updatePaginationFromResponse(
  pagination: PaginationState,
  response: {
    page: number
    limit: number
    total: number
    totalPages?: number
  }
): void {
  pagination.page = response.page
  pagination.limit = response.limit
  pagination.total = response.total
  pagination.totalPages = response.totalPages || Math.ceil(response.total / response.limit)
  pagination.hasMore = pagination.page < pagination.totalPages
}

/**
 * Reset state to initial values
 */
export function resetState<T extends Record<string, any>>(
  state: T,
  initialState: Partial<T>,
  options: ResetOptions = {}
): void {
  Object.keys(state).forEach(key => {
    if (options.preserveAuth && key.includes('auth')) {
      return
    }
    if (options.preserveSettings && key.includes('settings')) {
      return
    }

    if (initialState.hasOwnProperty(key)) {
      ;(state as any)[key] = (initialState as any)[key]
    }
  })
}

/**
 * Merge partial state with existing state
 */
export function mergeState<T extends Record<string, any>>(state: T, updates: Partial<T>): void {
  Object.keys(updates).forEach(key => {
    const value = (updates as any)[key]
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Deep merge for objects
        ;(state as any)[key] = {
          ...(state as any)[key],
          ...value,
        }
      } else {
        // Direct assignment for primitives and arrays
        ;(state as any)[key] = value
      }
    }
  })
}

/**
 * Create a reactive loading state manager
 */
export function createLoadingManager() {
  const loadingStates = ref<LoadingState>({})

  const setLoading = (key: string, value: boolean) => {
    loadingStates.value[key] = value
  }

  const isLoading = (key?: string) => {
    if (key) {
      return loadingStates.value[key] || false
    }
    return Object.values(loadingStates.value).some(Boolean)
  }

  const clearLoading = () => {
    loadingStates.value = {}
  }

  return {
    loadingStates: loadingStates.value,
    setLoading,
    isLoading,
    clearLoading,
  }
}

/**
 * Create a reactive error state manager
 */
export function createErrorManager() {
  const errorStates = ref<ErrorState>({})

  const setError = (key: string, error: string | null) => {
    errorStates.value[key] = error
  }

  const getError = (key: string) => {
    return errorStates.value[key] || null
  }

  const hasError = (key?: string) => {
    if (key) {
      return !!errorStates.value[key]
    }
    return Object.values(errorStates.value).some(error => !!error)
  }

  const clearError = (key: string) => {
    delete errorStates.value[key]
  }

  const clearAllErrors = () => {
    errorStates.value = {}
  }

  const handleError = (key: string, error: any) => {
    let message = 'An unexpected error occurred'

    if (isApiError(error)) {
      message = error.getUserMessage()
    } else if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    setError(key, message)

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`[Store Error] ${key}:`, error)
    }
  }

  return {
    errorStates: errorStates.value,
    setError,
    getError,
    hasError,
    clearError,
    clearAllErrors,
    handleError,
  }
}

/**
 * Create pagination utilities
 */
export function createPaginationUtils(pagination: Ref<PaginationState>) {
  const setPage = (page: number) => {
    pagination.value.page = Math.max(1, Math.min(page, pagination.value.totalPages))
  }

  const nextPage = () => {
    if (pagination.value.hasMore) {
      setPage(pagination.value.page + 1)
    }
  }

  const prevPage = () => {
    if (pagination.value.page > 1) {
      setPage(pagination.value.page - 1)
    }
  }

  const setLimit = (limit: number) => {
    pagination.value.limit = Math.max(1, Math.min(limit, 100)) // Max 100 items per page
    pagination.value.page = 1 // Reset to first page
  }

  const hasPrevPage = computed(() => pagination.value.page > 1)
  const hasNextPage = computed(() => pagination.value.hasMore)

  return {
    setPage,
    nextPage,
    prevPage,
    setLimit,
    hasPrevPage,
    hasNextPage,
  }
}

/**
 * Create sort utilities
 */
export function createSortUtils(sort: Ref<SortState>) {
  const setSort = (field: string, direction: 'asc' | 'desc' = 'asc') => {
    // Toggle direction if same field
    if (sort.value.field === field) {
      sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value.field = field
      sort.value.direction = direction
    }
  }

  const clearSort = () => {
    sort.value.field = ''
    sort.value.direction = 'asc'
  }

  const isSortedBy = (field: string) => sort.value.field === field
  const getSortDirection = (field: string) =>
    sort.value.field === field ? sort.value.direction : null

  return {
    setSort,
    clearSort,
    isSortedBy,
    getSortDirection,
  }
}

/**
 * Create filter utilities
 */
export function createFilterUtils(filters: Ref<FilterState>) {
  const setFilter = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') {
      delete filters.value[key]
    } else {
      filters.value[key] = value
    }
  }

  const removeFilter = (key: string) => {
    delete filters.value[key]
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const hasFilters = computed(() => Object.keys(filters.value).length > 0)
  const filterCount = computed(() => Object.keys(filters.value).length)

  return {
    setFilter,
    removeFilter,
    clearFilters,
    hasFilters,
    filterCount,
  }
}

/**
 * Create a debounced function for API calls
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  let timeoutId: number | null = null

  return ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }) as T
}

/**
 * Create a cache manager for store data
 */
export function createCacheManager<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const cache = new Map<string, { data: T; timestamp: number }>()

  const set = (cacheKey: string, data: T) => {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })
  }

  const get = (cacheKey: string): T | null => {
    const entry = cache.get(cacheKey)
    if (!entry) return null

    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(cacheKey)
      return null
    }

    return entry.data
  }

  const has = (cacheKey: string): boolean => {
    return !!get(cacheKey)
  }

  const clear = (cacheKey?: string) => {
    if (cacheKey) {
      cache.delete(cacheKey)
    } else {
      cache.clear()
    }
  }

  const cleanup = () => {
    const now = Date.now()
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > ttl) {
        cache.delete(key)
      }
    }
  }

  // Auto cleanup every 5 minutes
  setInterval(cleanup, 5 * 60 * 1000)

  return {
    set,
    get,
    has,
    clear,
    cleanup,
  }
}

/**
 * Create persistence utilities
 */
export function createPersistenceUtils(config: PersistenceConfig) {
  const storage = config.storage === 'localStorage' ? localStorage : sessionStorage
  const storageKey = `gocommerce_${config.key}`

  const save = <T>(data: T) => {
    try {
      let dataToSave = data

      // Filter data if pick/omit options are provided
      if (config.pick || config.omit) {
        const filtered: any = {}
        const dataObj = data as any

        if (config.pick) {
          config.pick.forEach(key => {
            if (dataObj.hasOwnProperty(key)) {
              filtered[key] = dataObj[key]
            }
          })
          dataToSave = filtered
        } else if (config.omit) {
          Object.keys(dataObj).forEach(key => {
            if (!config.omit!.includes(key)) {
              filtered[key] = dataObj[key]
            }
          })
          dataToSave = filtered
        }
      }

      const payload = {
        data: dataToSave,
        timestamp: Date.now(),
        expire: config.expire ? Date.now() + config.expire : null,
      }

      storage.setItem(storageKey, JSON.stringify(payload))
    } catch (error) {
      console.warn(`Failed to persist store data for key "${config.key}":`, error)
    }
  }

  const load = <T>(): T | null => {
    try {
      const stored = storage.getItem(storageKey)
      if (!stored) return null

      const payload = JSON.parse(stored)

      // Check if data has expired
      if (payload.expire && Date.now() > payload.expire) {
        remove()
        return null
      }

      return payload.data
    } catch (error) {
      console.warn(`Failed to load persisted data for key "${config.key}":`, error)
      return null
    }
  }

  const remove = () => {
    try {
      storage.removeItem(storageKey)
    } catch (error) {
      console.warn(`Failed to remove persisted data for key "${config.key}":`, error)
    }
  }

  const exists = (): boolean => {
    try {
      return storage.getItem(storageKey) !== null
    } catch (error) {
      return false
    }
  }

  return {
    save,
    load,
    remove,
    exists,
  }
}

/**
 * Create a store subscription helper
 */
export function createStoreSubscription<T>(
  store: any,
  callback: (mutation: any, state: T) => void
) {
  const unsubscribe = store.$subscribe(callback)

  // Auto-unsubscribe on component unmount if used in a component
  if (typeof window !== 'undefined' && 'onUnmounted' in window) {
    const { onUnmounted } = window as any
    onUnmounted(() => {
      unsubscribe()
    })
  }

  return unsubscribe
}

/**
 * Compose multiple store utilities
 */
export function composeStoreUtils<T extends BaseStoreState>(initialState: T) {
  const loadingManager = createLoadingManager()
  const errorManager = createErrorManager()

  const state = ref(initialState)
  const pagination = ref(createPaginationState())
  const sort = ref(createSortState())
  const filters = ref(createFilterState())

  const paginationUtils = createPaginationUtils(pagination)
  const sortUtils = createSortUtils(sort)
  const filterUtils = createFilterUtils(filters)

  const updateLastUpdated = () => {
    state.value.lastUpdated = Date.now()
  }

  const reset = (options: ResetOptions = {}) => {
    resetState(state.value, initialState, options)
    pagination.value = createPaginationState()
    sort.value = createSortState()
    filters.value = createFilterState()
    loadingManager.clearLoading()
    errorManager.clearAllErrors()
  }

  return {
    // State
    state,
    pagination,
    sort,
    filters,

    // Managers
    ...loadingManager,
    ...errorManager,

    // Utils
    ...paginationUtils,
    ...sortUtils,
    ...filterUtils,

    // Actions
    updateLastUpdated,
    reset,
  }
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.
