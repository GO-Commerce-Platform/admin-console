/**
 * Pinia Store Types and Interfaces
 * Common types and interfaces used across all stores
 *
 * Related GitHub Issue: #1 - Core Infrastructure
 */

/**
 * Base state interface for all stores
 */
export interface BaseStoreState {
  loading: boolean
  error: string | null
  lastUpdated: number | null
}

/**
 * API loading states for async operations
 */
export interface LoadingState {
  [key: string]: boolean
}

/**
 * Error state management
 */
export interface ErrorState {
  [key: string]: string | null
}

/**
 * Pagination state for list-based stores
 */
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/**
 * Sorting state for list-based stores
 */
export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

/**
 * Filtering state for list-based stores
 */
export interface FilterState {
  [key: string]: any
}

/**
 * Search state for searchable stores
 */
export interface SearchState {
  query: string
  results: any[]
  isSearching: boolean
  lastSearchTime: number | null
}

/**
 * Cache configuration for store data
 */
export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  key: string // Cache key
  enabled: boolean
}

/**
 * Store persistence configuration
 */
export interface PersistenceConfig {
  key: string
  storage: 'localStorage' | 'sessionStorage'
  pick?: string[] // Properties to persist
  omit?: string[] // Properties to exclude from persistence
  expire?: number // Expiration time in milliseconds
}

/**
 * Store subscription callback
 */
export type StoreSubscription<T = any> = (
  mutation: { type: string; payload: any },
  state: T
) => void

/**
 * Store action context for mutations
 */
export interface ActionContext<S = any, G = any> {
  state: S
  getters: G
  commit: (type: string, payload?: any) => void
  dispatch: (type: string, payload?: any) => Promise<any>
}

/**
 * Store hydration data for SSR/persistence
 */
export interface HydrationData {
  [storeName: string]: any
}

/**
 * Store reset options
 */
export interface ResetOptions {
  includeStorage?: boolean // Whether to clear persisted data
  preserveAuth?: boolean // Whether to preserve authentication state
  preserveSettings?: boolean // Whether to preserve user settings
}

/**
 * Store metrics for debugging and monitoring
 */
export interface StoreMetrics {
  actionCount: number
  mutationCount: number
  lastAction: string | null
  lastMutation: string | null
  lastActionTime: number | null
  lastMutationTime: number | null
  errors: Array<{
    type: string
    message: string
    timestamp: number
    stack?: string
  }>
}

/**
 * Store configuration options
 */
export interface StoreOptions {
  persistence?: PersistenceConfig
  cache?: CacheConfig
  debug?: boolean
  metrics?: boolean
  autoReset?: boolean // Auto reset on authentication changes
}

/**
 * Base store interface that all stores should implement
 */
export interface BaseStore<T extends BaseStoreState = BaseStoreState> {
  // State
  $state: T

  // Actions
  $reset(options?: ResetOptions): void
  $hydrate(data: any): void
  $persist(): void

  // Utilities
  setLoading(key: string, value: boolean): void
  setError(key: string, error: string | null): void
  clearErrors(): void
  updateLastUpdated(): void
}

/**
 * API store interface for stores that interact with APIs
 */
export interface ApiStore<T extends BaseStoreState = BaseStoreState> extends BaseStore<T> {
  // API state
  loadingStates: LoadingState
  errorStates: ErrorState

  // API actions
  handleApiError(action: string, error: any): void
  startLoading(action: string): void
  stopLoading(action: string): void
  isLoading(action?: string): boolean
  hasError(action?: string): boolean
  getError(action: string): string | null
}

/**
 * List store interface for stores that manage lists of items
 */
export interface ListStore<T extends BaseStoreState = BaseStoreState, I = any> extends ApiStore<T> {
  // List state
  items: I[]
  pagination: PaginationState
  sort: SortState
  filters: FilterState
  search: SearchState

  // List actions
  loadItems(options?: {
    page?: number
    limit?: number
    sort?: SortState
    filters?: FilterState
    search?: string
    refresh?: boolean
  }): Promise<void>

  addItem(item: I): void
  updateItem(id: string, updates: Partial<I>): void
  removeItem(id: string): void
  clearItems(): void

  // Pagination actions
  setPage(page: number): void
  setLimit(limit: number): void
  nextPage(): void
  prevPage(): void

  // Sort actions
  setSort(field: string, direction?: 'asc' | 'desc'): void
  clearSort(): void

  // Filter actions
  setFilter(key: string, value: any): void
  removeFilter(key: string): void
  clearFilters(): void

  // Search actions
  setSearchQuery(query: string): void
  clearSearch(): void
  search(query: string): Promise<void>

  // Getters
  sortedItems: I[]
  filteredItems: I[]
  searchResults: I[]
  selectedItems: I[]
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Entity store interface for stores that manage single entities
 */
export interface EntityStore<T extends BaseStoreState = BaseStoreState, E = any>
  extends ApiStore<T> {
  // Entity state
  entity: E | null
  entities: Record<string, E>
  selectedId: string | null

  // Entity actions
  loadEntity(id: string, options?: { refresh?: boolean }): Promise<E | null>
  createEntity(data: Partial<E>): Promise<E>
  updateEntity(id: string, data: Partial<E>): Promise<E>
  deleteEntity(id: string): Promise<void>

  setEntity(entity: E): void
  clearEntity(): void
  selectEntity(id: string): void

  // Getters
  currentEntity: E | null
  selectedEntity: E | null
  entityById: (id: string) => E | null
}

/**
 * Store factory function type
 */
export type StoreFactory<T extends BaseStoreState> = () => BaseStore<T>

/**
 * Store registry for managing multiple stores
 */
export interface StoreRegistry {
  [key: string]: StoreFactory<any>
}

/**
 * Store plugin interface
 */
export interface StorePlugin {
  install(store: any, options?: any): void
}

/**
 * Store middleware function type
 */
export type StoreMiddleware = (context: {
  store: any
  action: string
  payload: any
  next: () => any
}) => any

/**
 * Store event types
 */
export type StoreEventType =
  | 'action:before'
  | 'action:after'
  | 'action:error'
  | 'mutation:before'
  | 'mutation:after'
  | 'state:hydrate'
  | 'state:reset'
  | 'error'

/**
 * Store event listener
 */
export type StoreEventListener = (event: {
  type: StoreEventType
  payload: any
  timestamp: number
  storeName: string
}) => void

/**
 * Multi-tenant store interface
 */
export interface MultiTenantStore<T extends BaseStoreState = BaseStoreState> extends BaseStore<T> {
  currentStoreId: string | null
  storeData: Record<string, Partial<T>>

  setCurrentStore(storeId: string): void
  getStoreData(storeId: string): Partial<T> | null
  setStoreData(storeId: string, data: Partial<T>): void
  clearStoreData(storeId: string): void
  switchStore(storeId: string): Promise<void>
}

/**
 * Form store interface for form state management
 */
export interface FormStore<F = Record<string, any>> extends BaseStore {
  // Form state
  formData: F
  originalData: F
  validationErrors: Record<string, string[]>
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean

  // Form actions
  setFieldValue(field: keyof F, value: any): void
  setFormData(data: Partial<F>): void
  resetForm(): void
  validateField(field: keyof F): boolean
  validateForm(): boolean
  submitForm(): Promise<void>

  // Validation
  setFieldError(field: keyof F, errors: string[]): void
  clearFieldError(field: keyof F): void
  clearAllErrors(): void

  // Getters
  getFieldValue: (field: keyof F) => any
  getFieldError: (field: keyof F) => string[] | null
  hasFieldError: (field: keyof F) => boolean
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.
