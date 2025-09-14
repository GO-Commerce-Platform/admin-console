/**
 * Store Management Pinia Store
 * Manages state for store CRUD operations, filtering, and caching
 *
 * Related GitHub Issue: #5 - Store Management System
 * Based on specifications in WARP.md and PLAN.md
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { storeService, type StoreListParams, type StoreStatistics } from '@/services/storeService'
import type {
  StoreDto,
  CreateStoreDto,
  UpdateStoreDto,
  StoreStatus,
  StoreTemplate,
  StoreTemplateCategory,
} from '@/types/store'
import type { PaginatedResponse } from '@/types/api'

/**
 * Store management state interface
 */
interface StoreState {
  stores: StoreDto[]
  currentStore: StoreDto | null
  templates: StoreTemplate[]
  statistics: StoreStatistics | null
  
  // Pagination state
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  
  // Filter and search state
  filters: {
    search: string
    status: StoreStatus | null
    templateCategory: StoreTemplateCategory | null
    sortBy: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'revenue'
    sortOrder: 'asc' | 'desc'
  }
  
  // Loading states
  loading: {
    stores: boolean
    currentStore: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    templates: boolean
    statistics: boolean
    bulkOperation: boolean
  }
  
  // Error states
  errors: {
    stores: string | null
    currentStore: string | null
    create: string | null
    update: string | null
    delete: string | null
    templates: string | null
    statistics: string | null
    bulkOperation: string | null
  }
  
  // Cache timestamps for data freshness
  cache: {
    storesLastFetch: number | null
    templatesLastFetch: number | null
    statisticsLastFetch: number | null
  }
  
  // Bulk selection state
  selectedStoreIds: Set<string>
  
  // Optimistic updates tracking
  optimisticUpdates: Map<string, Partial<StoreDto>>
}

/**
 * Store Management Pinia Store
 */
export const useStoresStore = defineStore('stores', () => {
  // State
  const state = ref<StoreState>({
    stores: [],
    currentStore: null,
    templates: [],
    statistics: null,
    
    pagination: {
      page: 1,
      size: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    
    filters: {
      search: '',
      status: null,
      templateCategory: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    
    loading: {
      stores: false,
      currentStore: false,
      creating: false,
      updating: false,
      deleting: false,
      templates: false,
      statistics: false,
      bulkOperation: false,
    },
    
    errors: {
      stores: null,
      currentStore: null,
      create: null,
      update: null,
      delete: null,
      templates: null,
      statistics: null,
      bulkOperation: null,
    },
    
    cache: {
      storesLastFetch: null,
      templatesLastFetch: null,
      statisticsLastFetch: null,
    },
    
    selectedStoreIds: new Set(),
    optimisticUpdates: new Map(),
  })

  // Getters
  const stores = computed(() => {
    return state.value.stores.map(store => {
      const optimisticUpdate = state.value.optimisticUpdates.get(store.id)
      return optimisticUpdate ? { ...store, ...optimisticUpdate } : store
    })
  })

  const filteredStores = computed(() => {
    let filtered = stores.value

    // Apply search filter
    if (state.value.filters.search) {
      const searchTerm = state.value.filters.search.toLowerCase()
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm) ||
        store.subdomain.toLowerCase().includes(searchTerm) ||
        store.email.toLowerCase().includes(searchTerm)
      )
    }

    // Apply status filter
    if (state.value.filters.status) {
      filtered = filtered.filter(store => store.status === state.value.filters.status)
    }

    return filtered
  })

  const isDataStale = computed(() => {
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    return !state.value.cache.storesLastFetch || 
           (Date.now() - state.value.cache.storesLastFetch) > CACHE_DURATION
  })

  const hasSelectedStores = computed(() => state.value.selectedStoreIds.size > 0)

  const selectedStores = computed(() => 
    stores.value.filter(store => state.value.selectedStoreIds.has(store.id))
  )

  const isLoading = computed(() => Object.values(state.value.loading).some(Boolean))

  const hasErrors = computed(() => Object.values(state.value.errors).some(Boolean))

  // Actions
  const clearErrors = () => {
    Object.keys(state.value.errors).forEach(key => {
      state.value.errors[key as keyof typeof state.value.errors] = null
    })
  }

  const clearError = (errorType: keyof typeof state.value.errors) => {
    state.value.errors[errorType] = null
  }

  const setFilters = (filters: Partial<typeof state.value.filters>) => {
    state.value.filters = { ...state.value.filters, ...filters }
    // Reset pagination when filters change
    state.value.pagination.page = 1
  }

  const setPagination = (page: number, size?: number) => {
    state.value.pagination.page = page
    if (size) {
      state.value.pagination.size = size
    }
  }

  const toggleStoreSelection = (storeId: string) => {
    if (state.value.selectedStoreIds.has(storeId)) {
      state.value.selectedStoreIds.delete(storeId)
    } else {
      state.value.selectedStoreIds.add(storeId)
    }
  }

  const selectAllStores = () => {
    stores.value.forEach(store => {
      state.value.selectedStoreIds.add(store.id)
    })
  }

  const clearStoreSelection = () => {
    state.value.selectedStoreIds.clear()
  }

  const addOptimisticUpdate = (storeId: string, update: Partial<StoreDto>) => {
    state.value.optimisticUpdates.set(storeId, update)
  }

  const removeOptimisticUpdate = (storeId: string) => {
    state.value.optimisticUpdates.delete(storeId)
  }

  const clearOptimisticUpdates = () => {
    state.value.optimisticUpdates.clear()
  }

  // Fetch stores with caching and error handling
  const fetchStores = async (forceRefresh = false) => {
    if (!forceRefresh && !isDataStale.value) {
      return // Use cached data
    }

    state.value.loading.stores = true
    state.value.errors.stores = null

    try {
      const params: StoreListParams = {
        page: state.value.pagination.page,
        size: state.value.pagination.size,
        search: state.value.filters.search || undefined,
        status: state.value.filters.status || undefined,
        templateCategory: state.value.filters.templateCategory || undefined,
        sortBy: state.value.filters.sortBy,
        sortOrder: state.value.filters.sortOrder,
      }

      const response: PaginatedResponse<StoreDto> = await storeService.getStores(params)

      state.value.stores = response.data
      state.value.pagination = response.pagination
      state.value.cache.storesLastFetch = Date.now()

      // Clear optimistic updates after successful fetch
      clearOptimisticUpdates()
    } catch (error) {
      state.value.errors.stores = error instanceof Error ? error.message : 'Failed to fetch stores'
      console.error('Failed to fetch stores:', error)
    } finally {
      state.value.loading.stores = false
    }
  }

  // Fetch single store
  const fetchStore = async (storeId: string) => {
    state.value.loading.currentStore = true
    state.value.errors.currentStore = null

    try {
      const store = await storeService.getStore(storeId, true)
      state.value.currentStore = store

      // Update store in the list if it exists
      const index = state.value.stores.findIndex(s => s.id === storeId)
      if (index !== -1) {
        state.value.stores[index] = store
      }
    } catch (error) {
      state.value.errors.currentStore = error instanceof Error ? error.message : 'Failed to fetch store'
      console.error('Failed to fetch store:', error)
    } finally {
      state.value.loading.currentStore = false
    }
  }

  // Create new store
  const createStore = async (storeData: CreateStoreDto): Promise<StoreDto | null> => {
    state.value.loading.creating = true
    state.value.errors.create = null

    try {
      const newStore = await storeService.createStore(storeData)
      
      // Add to stores list
      state.value.stores.unshift(newStore)
      state.value.pagination.total += 1
      
      // Update statistics if loaded
      if (state.value.statistics) {
        state.value.statistics.totalStores += 1
        state.value.statistics.newStoresThisMonth += 1
      }

      return newStore
    } catch (error) {
      state.value.errors.create = error instanceof Error ? error.message : 'Failed to create store'
      console.error('Failed to create store:', error)
      return null
    } finally {
      state.value.loading.creating = false
    }
  }

  // Update existing store with optimistic updates
  const updateStore = async (storeId: string, updateData: UpdateStoreDto): Promise<boolean> => {
    state.value.loading.updating = true
    state.value.errors.update = null

    // Apply optimistic update
    addOptimisticUpdate(storeId, updateData)

    try {
      const updatedStore = await storeService.updateStore(storeId, updateData)
      
      // Update store in the list
      const index = state.value.stores.findIndex(s => s.id === storeId)
      if (index !== -1) {
        state.value.stores[index] = updatedStore
      }

      // Update current store if it's the same one
      if (state.value.currentStore?.id === storeId) {
        state.value.currentStore = updatedStore
      }

      // Remove optimistic update
      removeOptimisticUpdate(storeId)

      return true
    } catch (error) {
      // Remove optimistic update on error
      removeOptimisticUpdate(storeId)
      
      state.value.errors.update = error instanceof Error ? error.message : 'Failed to update store'
      console.error('Failed to update store:', error)
      return false
    } finally {
      state.value.loading.updating = false
    }
  }

  // Delete store
  const deleteStore = async (storeId: string, reason?: string): Promise<boolean> => {
    state.value.loading.deleting = true
    state.value.errors.delete = null

    try {
      await storeService.deleteStore(storeId, reason)
      
      // Remove from stores list
      state.value.stores = state.value.stores.filter(s => s.id !== storeId)
      state.value.pagination.total -= 1

      // Clear current store if it was deleted
      if (state.value.currentStore?.id === storeId) {
        state.value.currentStore = null
      }

      // Remove from selection
      state.value.selectedStoreIds.delete(storeId)
      
      // Update statistics if loaded
      if (state.value.statistics) {
        state.value.statistics.totalStores -= 1
      }

      return true
    } catch (error) {
      state.value.errors.delete = error instanceof Error ? error.message : 'Failed to delete store'
      console.error('Failed to delete store:', error)
      return false
    } finally {
      state.value.loading.deleting = false
    }
  }

  // Bulk operations
  const bulkOperation = async (
    operation: 'activate' | 'deactivate' | 'suspend' | 'delete',
    storeIds?: string[],
    reason?: string
  ): Promise<{ success: string[]; failed: Array<{ storeId: string; error: string }> }> => {
    const targetIds = storeIds || Array.from(state.value.selectedStoreIds)
    
    if (targetIds.length === 0) {
      throw new Error('No stores selected for bulk operation')
    }

    state.value.loading.bulkOperation = true
    state.value.errors.bulkOperation = null

    try {
      const result = await storeService.bulkStoreOperation({
        storeIds: targetIds,
        operation,
        reason,
      })

      // Refresh stores list to reflect changes
      await fetchStores(true)
      
      // Clear selection after successful operation
      clearStoreSelection()

      return result
    } catch (error) {
      state.value.errors.bulkOperation = error instanceof Error ? error.message : 'Bulk operation failed'
      console.error('Bulk operation failed:', error)
      throw error
    } finally {
      state.value.loading.bulkOperation = false
    }
  }

  // Fetch store templates
  const fetchTemplates = async (category?: StoreTemplateCategory) => {
    state.value.loading.templates = true
    state.value.errors.templates = null

    try {
      const templates = await storeService.getStoreTemplates(category)
      state.value.templates = templates
      state.value.cache.templatesLastFetch = Date.now()
    } catch (error) {
      state.value.errors.templates = error instanceof Error ? error.message : 'Failed to fetch templates'
      console.error('Failed to fetch templates:', error)
    } finally {
      state.value.loading.templates = false
    }
  }

  // Fetch store statistics
  const fetchStatistics = async () => {
    state.value.loading.statistics = true
    state.value.errors.statistics = null

    try {
      const statistics = await storeService.getStoreStatistics()
      state.value.statistics = statistics
      state.value.cache.statisticsLastFetch = Date.now()
    } catch (error) {
      state.value.errors.statistics = error instanceof Error ? error.message : 'Failed to fetch statistics'
      console.error('Failed to fetch statistics:', error)
    } finally {
      state.value.loading.statistics = false
    }
  }

  // Check subdomain availability
  const checkSubdomainAvailability = async (subdomain: string) => {
    try {
      return await storeService.checkSubdomainAvailability(subdomain)
    } catch (error) {
      console.error('Failed to check subdomain availability:', error)
      throw error
    }
  }

  // Reset store state
  const resetState = () => {
    state.value = {
      stores: [],
      currentStore: null,
      templates: [],
      statistics: null,
      
      pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      
      filters: {
        search: '',
        status: null,
        templateCategory: null,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      
      loading: {
        stores: false,
        currentStore: false,
        creating: false,
        updating: false,
        deleting: false,
        templates: false,
        statistics: false,
        bulkOperation: false,
      },
      
      errors: {
        stores: null,
        currentStore: null,
        create: null,
        update: null,
        delete: null,
        templates: null,
        statistics: null,
        bulkOperation: null,
      },
      
      cache: {
        storesLastFetch: null,
        templatesLastFetch: null,
        statisticsLastFetch: null,
      },
      
      selectedStoreIds: new Set(),
      optimisticUpdates: new Map(),
    }
  }

  return {
    // State
    state: readonly(state),
    
    // Getters
    stores,
    filteredStores,
    isDataStale,
    hasSelectedStores,
    selectedStores,
    isLoading,
    hasErrors,
    
    // Actions
    clearErrors,
    clearError,
    setFilters,
    setPagination,
    toggleStoreSelection,
    selectAllStores,
    clearStoreSelection,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    clearOptimisticUpdates,
    fetchStores,
    fetchStore,
    createStore,
    updateStore,
    deleteStore,
    bulkOperation,
    fetchTemplates,
    fetchStatistics,
    checkSubdomainAvailability,
    resetState,
  }
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.