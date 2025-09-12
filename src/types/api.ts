/**
 * API Utility Types and Interfaces
 * Based on the technical specifications in PLAN.md and WARP.md
 */

// Pagination and filtering
export interface PaginationParams {
  page: number
  size: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
  meta?: Record<string, unknown>
}

export interface PaginationInfo {
  page: number
  size: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | Date | null | undefined
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: ApiError[]
  meta?: Record<string, unknown>
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}

export interface ValidationError extends ApiError {
  field: string
  value?: unknown
  constraints: string[]
}

export interface BusinessLogicError extends ApiError {
  businessRule: string
  context: Record<string, unknown>
}

// HTTP Client Configuration
export interface ApiClientConfig {
  baseURL: string
  timeout: number
  withCredentials: boolean
  headers: Record<string, string>
  retryAttempts?: number
  retryDelay?: number
}

export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  skipAuth?: boolean
  skipErrorHandling?: boolean
}

// Time series and analytics data
export interface TimeSeriesData {
  timestamp: Date
  value: number
  label?: string
  metadata?: Record<string, unknown>
}

export interface TimeRange {
  start: Date
  end: Date
  period: TimePeriod
  comparison?: ComparisonType
}

export enum TimePeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum ComparisonType {
  PREVIOUS_PERIOD = 'previous_period',
  PREVIOUS_YEAR = 'previous_year',
  CUSTOM = 'custom',
}

// Search and filtering
export interface SearchParams extends PaginationParams {
  query?: string
  filters?: FilterParams
  sort?: SortParams
  include?: string[]
  exclude?: string[]
}

export interface SearchResult<T> {
  items: T[]
  total: number
  query: string
  filters: FilterParams
  suggestions?: string[]
  facets?: SearchFacet[]
}

export interface SearchFacet {
  field: string
  values: SearchFacetValue[]
}

export interface SearchFacetValue {
  value: string
  count: number
  selected: boolean
}

// File upload and media
export interface FileUploadRequest {
  file: File
  path?: string
  metadata?: Record<string, unknown>
  onProgress?: (progress: number) => void
}

export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
  metadata?: Record<string, unknown>
}

export interface MediaAsset {
  id: string
  url: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  width?: number
  height?: number
  alt?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Bulk operations
export interface BulkOperation<T> {
  action: BulkActionType
  items: string[] | T[]
  parameters?: Record<string, unknown>
  dryRun?: boolean
}

export enum BulkActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
}

export interface BulkOperationResult {
  successful: number
  failed: number
  skipped: number
  errors: BulkOperationError[]
  warnings: BulkOperationWarning[]
  summary: string
}

export interface BulkOperationError {
  itemId: string
  error: ApiError
}

export interface BulkOperationWarning {
  itemId: string
  warning: string
}

// Import/Export
export interface ImportRequest {
  file: File
  format: ImportFormat
  mapping?: Record<string, string>
  options?: ImportOptions
}

export enum ImportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
  JSON = 'json',
  XML = 'xml',
}

export interface ImportOptions {
  skipDuplicates?: boolean
  updateExisting?: boolean
  validateOnly?: boolean
  batchSize?: number
  delimiter?: string
  hasHeader?: boolean
}

export interface ImportResult {
  id: string
  status: ImportStatus
  totalRows: number
  processedRows: number
  successfulRows: number
  failedRows: number
  errors: ImportError[]
  createdAt: Date
  completedAt?: Date
}

export enum ImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ImportError {
  row: number
  field?: string
  value?: string
  error: string
}

export interface ExportRequest {
  format: ExportFormat
  fields?: string[]
  filters?: FilterParams
  sort?: SortParams
}

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
  PDF = 'pdf',
  JSON = 'json',
}

// WebSocket and real-time updates
export interface WebSocketMessage<T = unknown> {
  type: string
  payload: T
  timestamp: Date
  correlation?: string
}

export interface RealTimeUpdate<T = unknown> {
  entityType: string
  entityId: string
  action: 'created' | 'updated' | 'deleted'
  data: T
  userId?: string
  timestamp: Date
}

// Health check and system status
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  checks: HealthCheckResult[]
  timestamp: Date
}

export interface HealthCheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  duration: number
  output?: string
  metadata?: Record<string, unknown>
}

// Feature flags and configuration
export interface FeatureFlag {
  name: string
  enabled: boolean
  description?: string
  conditions?: FeatureFlagCondition[]
  metadata?: Record<string, unknown>
}

export interface FeatureFlagCondition {
  field: string
  operator: 'eq' | 'ne' | 'in' | 'contains'
  value: unknown
}

export interface AppConfig {
  app: {
    name: string
    version: string
    environment: string
  }
  api: {
    baseUrl: string
    timeout: number
  }
  auth: {
    provider: string
    clientId: string
    realm: string
  }
  features: FeatureFlag[]
  ui: {
    theme: string
    locale: string
    timezone: string
  }
}

// Rate limiting and throttling
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

// API versioning
export interface ApiVersion {
  version: string
  status: 'current' | 'deprecated' | 'legacy'
  deprecationDate?: Date
  sunsetDate?: Date
  migrationGuide?: string
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.
