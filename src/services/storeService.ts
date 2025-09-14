/**
 * Store Management Service
 * Provides API endpoints for store CRUD operations and management
 *
 * Related GitHub Issue: #5 - Store Management System
 * Based on specifications in WARP.md and PLAN.md
 */

import { apiClient } from './apiClient'
import type {
  StoreDto,
  CreateStoreDto,
  UpdateStoreDto,
  StoreStatus,
  StoreValidationResult,
  SubdomainAvailabilityCheck,
  StoreTemplate,
  StoreTemplateCategory,
  StoreBackup,
  StoreExportRequest,
  StoreDataType,
  StoreMetrics,
} from '@/types/store'
import type { PaginationParams, PaginatedResponse } from '@/types/api'

/**
 * Store listing and filtering parameters
 */
export interface StoreListParams extends PaginationParams {
  search?: string
  status?: StoreStatus
  ownerId?: string
  templateCategory?: StoreTemplateCategory
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'revenue'
  sortOrder?: 'asc' | 'desc'
  includeMetrics?: boolean
}

/**
 * Store statistics for dashboard
 */
export interface StoreStatistics {
  totalStores: number
  activeStores: number
  inactiveStores: number
  suspendedStores: number
  pendingStores: number
  totalRevenue: number
  revenueGrowth: number
  newStoresThisMonth: number
  storesByTemplate: Record<StoreTemplateCategory, number>
}

/**
 * Store bulk operation parameters
 */
export interface StoreBulkOperation {
  storeIds: string[]
  operation: 'activate' | 'deactivate' | 'suspend' | 'delete'
  reason?: string
}

/**
 * Store Service Class
 * Handles all store-related API operations
 */
export class StoreService {
  /**
   * Get paginated list of stores
   * @param params - Pagination and filtering parameters
   * @returns Promise with paginated store list
   */
  async getStores(params: StoreListParams = {}): Promise<PaginatedResponse<StoreDto>> {
    const {
      page = 1,
      size = 10,
      search,
      status,
      ownerId,
      templateCategory,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeMetrics = false,
    } = params

    const response = await apiClient.get<PaginatedResponse<StoreDto>>('/platform/stores', {
      params: {
        page,
        size,
        search,
        status,
        ownerId,
        templateCategory,
        sortBy,
        sortOrder,
        includeMetrics,
      },
    })

    return response.data
  }

  /**
   * Get a single store by ID
   * @param id - Store ID
   * @param includeMetrics - Whether to include store metrics
   * @returns Promise with store details
   */
  async getStore(id: string, includeMetrics = false): Promise<StoreDto> {
    const response = await apiClient.get<StoreDto>(`/platform/stores/${id}`, {
      params: { includeMetrics },
    })

    return response.data
  }

  /**
   * Create a new store
   * @param storeData - Store creation data
   * @returns Promise with created store
   */
  async createStore(storeData: CreateStoreDto): Promise<StoreDto> {
    const response = await apiClient.post<StoreDto>('/platform/stores', storeData)
    return response.data
  }

  /**
   * Update an existing store
   * @param id - Store ID
   * @param updateData - Store update data
   * @returns Promise with updated store
   */
  async updateStore(id: string, updateData: UpdateStoreDto): Promise<StoreDto> {
    const response = await apiClient.put<StoreDto>(`/platform/stores/${id}`, updateData)
    return response.data
  }

  /**
   * Delete a store
   * @param id - Store ID
   * @param reason - Optional deletion reason
   * @returns Promise indicating success
   */
  async deleteStore(id: string, reason?: string): Promise<void> {
    await apiClient.delete(`/platform/stores/${id}`, {
      data: { reason },
    })
  }

  /**
   * Validate store data before creation/update
   * @param storeData - Store data to validate
   * @returns Promise with validation result
   */
  async validateStore(storeData: Partial<CreateStoreDto>): Promise<StoreValidationResult> {
    const response = await apiClient.post<StoreValidationResult>(
      '/platform/stores/validate',
      storeData
    )

    return response.data
  }

  /**
   * Check subdomain availability
   * @param subdomain - Subdomain to check
   * @returns Promise with availability status and suggestions
   */
  async checkSubdomainAvailability(subdomain: string): Promise<SubdomainAvailabilityCheck> {
    const response = await apiClient.get<SubdomainAvailabilityCheck>(
      `/platform/stores/check-subdomain/${encodeURIComponent(subdomain)}`
    )

    return response.data
  }

  /**
   * Get available store templates
   * @param category - Optional template category filter
   * @returns Promise with template list
   */
  async getStoreTemplates(category?: StoreTemplateCategory): Promise<StoreTemplate[]> {
    const response = await apiClient.get<StoreTemplate[]>('/platform/store-templates', {
      params: { category },
    })

    return response.data
  }

  /**
   * Get store statistics for dashboard
   * @returns Promise with store statistics
   */
  async getStoreStatistics(): Promise<StoreStatistics> {
    const response = await apiClient.get<StoreStatistics>('/platform/stores/statistics')
    return response.data
  }

  /**
   * Get store metrics for analytics
   * @param storeId - Store ID
   * @param timeRange - Time range for metrics
   * @returns Promise with store metrics
   */
  async getStoreMetrics(
    storeId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<StoreMetrics> {
    const response = await apiClient.get<StoreMetrics>(`/stores/${storeId}/metrics`, {
      params: {
        start: timeRange?.start?.toISOString(),
        end: timeRange?.end?.toISOString(),
      },
      storeId,
    })

    return response.data
  }

  /**
   * Perform bulk operations on stores
   * @param operation - Bulk operation parameters
   * @returns Promise with operation results
   */
  async bulkStoreOperation(operation: StoreBulkOperation): Promise<{
    success: string[]
    failed: Array<{ storeId: string; error: string }>
  }> {
    const response = await apiClient.post<{
      success: string[]
      failed: Array<{ storeId: string; error: string }>
    }>('/platform/stores/bulk', operation)

    return response.data
  }

  /**
   * Create store backup
   * @param storeId - Store ID
   * @param options - Backup options
   * @returns Promise with backup details
   */
  async createStoreBackup(
    storeId: string,
    options: {
      includeProducts?: boolean
      includeCustomers?: boolean
      includeOrders?: boolean
      includeSettings?: boolean
    } = {}
  ): Promise<StoreBackup> {
    const response = await apiClient.post<StoreBackup>(
      `/stores/${storeId}/backup`,
      {
        includeProducts: options.includeProducts ?? true,
        includeCustomers: options.includeCustomers ?? true,
        includeOrders: options.includeOrders ?? true,
        includeSettings: options.includeSettings ?? true,
      },
      { storeId }
    )

    return response.data
  }

  /**
   * Export store data
   * @param request - Export request parameters
   * @returns Promise with export download URL
   */
  async exportStoreData(request: StoreExportRequest): Promise<{ downloadUrl: string }> {
    const response = await apiClient.post<{ downloadUrl: string }>(
      `/stores/${request.storeId}/export`,
      {
        dataTypes: request.dataTypes,
        format: request.format,
        dateRange: request.dateRange
          ? {
              start: request.dateRange.start.toISOString(),
              end: request.dateRange.end.toISOString(),
            }
          : undefined,
      },
      { storeId: request.storeId }
    )

    return response.data
  }

  /**
   * Get store backups list
   * @param storeId - Store ID
   * @returns Promise with backups list
   */
  async getStoreBackups(storeId: string): Promise<StoreBackup[]> {
    const response = await apiClient.get<StoreBackup[]>(`/stores/${storeId}/backups`, {
      storeId,
    })

    return response.data
  }

  /**
   * Restore store from backup
   * @param storeId - Store ID
   * @param backupId - Backup ID
   * @returns Promise indicating success
   */
  async restoreStoreBackup(storeId: string, backupId: string): Promise<void> {
    await apiClient.post(
      `/stores/${storeId}/restore`,
      { backupId },
      { storeId }
    )
  }

  /**
   * Duplicate an existing store
   * @param sourceStoreId - Source store ID to duplicate
   * @param newStoreData - New store basic information
   * @returns Promise with created store
   */
  async duplicateStore(
    sourceStoreId: string,
    newStoreData: Pick<CreateStoreDto, 'name' | 'subdomain' | 'email' | 'ownerId'>
  ): Promise<StoreDto> {
    const response = await apiClient.post<StoreDto>(
      `/platform/stores/${sourceStoreId}/duplicate`,
      newStoreData
    )

    return response.data
  }

  /**
   * Transfer store ownership
   * @param storeId - Store ID
   * @param newOwnerId - New owner user ID
   * @param transferNote - Optional transfer note
   * @returns Promise indicating success
   */
  async transferStoreOwnership(
    storeId: string,
    newOwnerId: string,
    transferNote?: string
  ): Promise<void> {
    await apiClient.post(`/platform/stores/${storeId}/transfer`, {
      newOwnerId,
      transferNote,
    })
  }

  /**
   * Get store activity log
   * @param storeId - Store ID
   * @param params - Pagination parameters
   * @returns Promise with activity log
   */
  async getStoreActivityLog(
    storeId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<{
    id: string
    action: string
    userId: string
    userName: string
    details: Record<string, unknown>
    timestamp: Date
  }>> {
    const response = await apiClient.get(
      `/stores/${storeId}/activity`,
      {
        params,
        storeId,
      }
    )

    return response.data
  }
}

// Export singleton instance
export const storeService = new StoreService()

// Export types for use in other modules
export type {
  StoreListParams,
  StoreStatistics,
  StoreBulkOperation,
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.