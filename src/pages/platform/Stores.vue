<!--
  Store Management Page
  
  Provides comprehensive store management interface for platform administrators
  
  Related GitHub Issue: #5 - Store Management System
-->
<template>
  <div class="stores-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">Store Management</h1>
          <p class="page-description">Manage all stores across the platform</p>
        </div>
        <div class="header-right">
          <NButton
            type="primary"
            size="medium"
            @click="openCreateStoreModal"
            :loading="loading"
          >
            <template #icon>
              <NIcon>
                <Plus />
              </NIcon>
            </template>
            Create Store
          </NButton>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics" class="statistics-section">
      <NGrid
        :cols="4"
        :x-gap="24"
        :y-gap="24"
        responsive="screen"
        :collapsed-rows="2"
      >
        <NGridItem>
          <MetricCard
            title="Total Stores"
            :value="statistics.total"
            icon="BuildingStore"
          />
        </NGridItem>
        <NGridItem>
          <MetricCard
            title="Active Stores"
            :value="statistics.active"
            icon="CircleCheck"
          />
        </NGridItem>
        <NGridItem>
          <MetricCard
            title="Pending Stores"
            :value="statistics.pending"
            icon="TrendingUp"
          />
        </NGridItem>
        <NGridItem>
          <MetricCard
            title="Total Revenue"
            :value="formatCurrency(statistics.totalRevenue)"
            :trend="statistics.revenueGrowth"
            icon="CurrencyDollar"
          />
        </NGridItem>
      </NGrid>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <NCard size="small">
        <NFlex justify="space-between" align="center" :wrap="false">
          <!-- Search and Filters -->
          <NFlex align="center" :wrap="false" :size="16">
            <NInputGroup>
              <template #prefix>
                <NIcon>
                  <Search />
                </NIcon>
              </template>
              <NInput
                v-model:value="searchTerm"
                placeholder="Search stores..."
                clearable
                @input="debouncedSearch"
                style="width: 300px;"
              />
            </NInputGroup>

            <NSelect
              v-model:value="selectedStatus"
              placeholder="All Status"
              clearable
              style="width: 150px;"
              :options="statusOptions"
              @update:value="applyFilters"
            />

            <NSelect
              v-model:value="selectedCategory"
              placeholder="All Categories"
              clearable
              style="width: 150px;"
              :options="categoryOptions"
              @update:value="applyFilters"
            />
          </NFlex>

          <!-- Bulk Actions -->
          <NFlex v-if="hasSelectedStores" align="center" :wrap="false" :size="8">
            <NText depth="3">{{ selectedStores.length }} selected</NText>
            <NFlex :size="8">
              <NButton size="small" @click="handleBulkOperation('activate')">
                <template #icon>
                  <NIcon><CircleCheck /></NIcon>
                </template>
                Activate
              </NButton>
              <NButton size="small" @click="handleBulkOperation('deactivate')">
                <template #icon>
                  <NIcon><X /></NIcon>
                </template>
                Deactivate
              </NButton>
              <NButton size="small" @click="handleBulkOperation('suspend')">
                <template #icon>
                  <NIcon><Pause /></NIcon>
                </template>
                Suspend
              </NButton>
              <NButton 
                size="small" 
                type="error" 
                @click="handleBulkOperation('delete')"
              >
                <template #icon>
                  <NIcon><Trash /></NIcon>
                </template>
                Delete
              </NButton>
            </NFlex>
          </NFlex>
        </NFlex>
      </NCard>
    </div>

    <!-- Data Table -->
    <div class="table-section">
      <NCard size="small">
        <!-- Table Header -->
        <template #header>
          <NFlex justify="space-between" align="center">
            <NText strong>Stores ({{ pagination.total }})</NText>
            <NFlex align="center" :size="8">
              <NText depth="3">Show:</NText>
              <NSelect
                v-model:value="pageSize"
                size="small"
                style="width: 80px;"
                :options="pageSizeOptions"
                @update:value="handlePageSizeChange"
              />
            </NFlex>
          </NFlex>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="table-loading">
          <NSpin size="large" />
          <NText style="margin-top: 16px;">Loading stores...</NText>
        </div>

        <!-- Error State -->
        <div v-else-if="errors" class="table-error">
          <NResult status="error" title="Error Loading Stores" :description="errors">
            <template #footer>
              <NButton @click="refreshStores">Try Again</NButton>
            </template>
          </NResult>
        </div>

        <!-- Data Table -->
        <NDataTable
          v-else-if="stores.length > 0"
          :columns="columns"
          :data="stores"
          :row-key="(row) => row.id"
          :loading="loading"
          @update:checked-row-keys="handleSelectionChange"
          :checked-row-keys="selectedStoreIds"
        />

        <!-- Empty State -->
        <div v-else class="table-empty">
          <NResult status="info" title="No stores found" description="No stores match your current filters.">
            <template #footer>
              <NButton @click="openCreateStoreModal">Create First Store</NButton>
            </template>
          </NResult>
        </div>

        <!-- Pagination -->
        <template #footer>
          <NFlex v-if="stores.length > 0" justify="space-between" align="center">
            <NText depth="3">
              Showing {{ (pagination.page - 1) * pagination.size + 1 }} to 
              {{ Math.min(pagination.page * pagination.size, pagination.total) }} 
              of {{ pagination.total }} results
            </NText>
            
            <NPagination
              v-model:page="pagination.page"
              :page-count="pagination.totalPages"
              :page-size="pagination.size"
              show-size-picker
              show-quick-jumper
              @update:page="goToPage"
            />
          </NFlex>
        </template>
      </NCard>
    </div>

    <!-- Delete Confirmation -->
    <NModal
      v-model:show="showDeleteDialog"
      preset="dialog"
      title="Delete Store"
      content="Are you sure you want to delete this store? This action cannot be undone and will permanently remove all store data."
      positive-text="Delete"
      negative-text="Cancel"
      @positive-click="handleDeleteStore"
      @negative-click="closeDeleteDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NButton,
  NCard,
  NFlex,
  NText,
  NIcon,
  NGrid,
  NGridItem,
  NInput,
  NCheckbox,
  NBadge,
  NModal,
  NDataTable,
  NSelect,
  NPagination,
  NSpin,
  NResult,
  NInputGroup,
  NPopconfirm
} from 'naive-ui'
import { 
  Plus, 
  Search, 
  CircleCheck, 
  X, 
  Pause, 
  Trash, 
  Edit, 
  ExternalLink,
  BuildingStore,
  TrendingUp,
  CurrencyDollar
} from '@vicons/tabler'
import { useStoresStore } from '@/stores/stores'
import { useAuth } from '@/composables/useAuth'
import { useDebounce } from '@/composables/useDebounce'
import MetricCard from '@/components/molecules/MetricCard.vue'
// TODO: Create modal components
// import CreateStoreModal from '@/components/organisms/CreateStoreModal.vue'
// import EditStoreModal from '@/components/organisms/EditStoreModal.vue'
import type { StoreDto, StoreStatus, StoreTemplateCategory } from '@/types/store'
import type { DataTableColumns } from 'naive-ui'

// Composables
const router = useRouter()
const storesStore = useStoresStore()
const { hasRole, isPlatformAdmin } = useAuth()

// Store state
const stores = computed(() => storesStore.stores)
const statistics = computed(() => storesStore.statistics)
const pagination = computed(() => storesStore.state.pagination)
const filters = computed(() => storesStore.state.filters)
const loading = computed(() => storesStore.state.loading)
const errors = computed(() => storesStore.state.error)
const selectedStoreIds = computed(() => Array.from(storesStore.state.selectedStoreIds))
const hasSelectedStores = computed(() => storesStore.hasSelectedStores)
const selectedStores = computed(() => storesStore.selectedStores)

// Local state
const searchTerm = ref('')
const selectedStatus = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const pageSize = ref(10)

// Modal states
const showCreateStoreModal = ref(false)
const showEditStoreModal = ref(false)
const selectedStore = ref<StoreDto | null>(null)

// Delete dialog state
const showDeleteDialog = ref(false)
const storeToDelete = ref<StoreDto | null>(null)

// Options for selects
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Pending', value: 'pending' }
]

const categoryOptions = [
  { label: 'Fashion', value: 'fashion' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Food & Beverage', value: 'food_beverage' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Home & Garden', value: 'home_garden' },
  { label: 'Sports', value: 'sports' },
  { label: 'Books', value: 'books' },
  { label: 'Generic', value: 'generic' }
]

const pageSizeOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

// Table columns configuration
const columns: DataTableColumns<StoreDto> = [
  {
    type: 'selection'
  },
  {
    title: 'Store Name',
    key: 'name',
    sorter: true,
    render: (row: StoreDto) => {
      return h('div', [
        h(NText, { strong: true }, { default: () => row.name }),
        h(NText, { depth: 3, style: 'display: block; font-size: 12px;' }, { 
          default: () => row.description || 'No description' 
        })
      ])
    }
  },
  {
    title: 'Subdomain',
    key: 'subdomain',
    render: (row: StoreDto) => {
      return h(NText, {
        style: 'color: #3b82f6; cursor: pointer;',
        onClick: () => window.open(row.fullDomain, '_blank')
      }, { default: () => row.subdomain })
    }
  },
  {
    title: 'Status',
    key: 'status',
    sorter: true,
    render: (row: StoreDto) => {
      return h(NBadge, {
        type: getStatusType(row.status),
        show: true
      }, { default: () => row.status.charAt(0).toUpperCase() + row.status.slice(1) })
    }
  },
  {
    title: 'Owner',
    key: 'ownerId',
    render: (row: StoreDto) => row.ownerId
  },
  {
    title: 'Created',
    key: 'createdAt',
    sorter: true,
    render: (row: StoreDto) => formatDate(row.createdAt)
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row: StoreDto) => {
      return h(NFlex, { size: 4 }, {
        default: () => [
          h(NButton, {
            size: 'small',
            quaternary: true,
            onClick: () => openEditStoreModal(row)
          }, { icon: () => h(NIcon, () => h(Edit)) }),
          h(NButton, {
            size: 'small',
            quaternary: true,
            type: 'error',
            onClick: () => confirmDeleteStore(row)
          }, { icon: () => h(NIcon, () => h(Trash)) })
        ]
      })
    }
  }
]

// Debounced search
const debouncedSearch = useDebounce(() => {
  applyFilters()
}, 300)

// Methods
const applyFilters = () => {
  storesStore.setFilters({
    search: searchTerm.value,
    status: selectedStatus.value as StoreStatus || null,
    templateCategory: selectedCategory.value as StoreTemplateCategory || null,
  })
  fetchStores()
}

const handleSelectionChange = (keys: Array<string | number>) => {
  storesStore.setSelectedStoreIds(new Set(keys as string[]))
}

const goToPage = (page: number) => {
  storesStore.setPagination(page)
  fetchStores()
}

const handlePageSizeChange = (size: number) => {
  storesStore.setPagination(1, size)
  fetchStores()
}

const fetchStores = () => {
  storesStore.fetchStores()
}

const refreshStores = () => {
  storesStore.fetchStores(true)
}

// Modal handlers - TODO: Implement modal components
const openCreateStoreModal = () => {
  if (!isPlatformAdmin.value) {
    return
  }
  // TODO: Implement CreateStoreModal component
  console.log('Create Store modal - Coming Soon!')
  // showCreateStoreModal.value = true
}

const closeCreateStoreModal = () => {
  showCreateStoreModal.value = false
}

const handleStoreCreated = (store: StoreDto) => {
  closeCreateStoreModal()
  refreshStores()
}

const openEditStoreModal = (store: StoreDto) => {
  // TODO: Implement EditStoreModal component
  console.log('Edit Store modal - Coming Soon!', store.name)
  // selectedStore.value = store
  // showEditStoreModal.value = true
}

const closeEditStoreModal = () => {
  showEditStoreModal.value = false
  selectedStore.value = null
}

const handleStoreUpdated = (store: StoreDto) => {
  closeEditStoreModal()
  refreshStores()
}

// Delete handlers
const confirmDeleteStore = (store: StoreDto) => {
  storeToDelete.value = store
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  storeToDelete.value = null
}

const handleDeleteStore = async () => {
  if (!storeToDelete.value) return
  
  const success = await storesStore.deleteStore(storeToDelete.value.id)
  if (success) {
    closeDeleteDialog()
    refreshStores()
  }
}

// Bulk operations
const handleBulkOperation = async (operation: 'activate' | 'deactivate' | 'suspend' | 'delete') => {
  try {
    await storesStore.bulkOperation(operation)
  } catch (error) {
    // Error is handled in the store
  }
}

// Utility methods
const getStatusType = (status: StoreStatus): 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'info'
    case 'suspended':
      return 'error'
    case 'pending':
      return 'warning'
    default:
      return 'info'
  }
}

const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Watchers
watch([selectedStatus, selectedCategory], () => {
  applyFilters()
})

// Lifecycle
onMounted(async () => {
  // Check permissions
  if (!isPlatformAdmin.value) {
    router.push('/unauthorized')
    return
  }

  // Load initial data
  await Promise.all([
    storesStore.fetchStores(),
    storesStore.fetchStatistics(),
  ])
})
</script>

<style scoped>
/* Store Management Page - Following GO Commerce Design System */
.stores-page {
  padding: 24px;
  max-width: 100%;
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* Page Header - Glassmorphism Design */
.page-header {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.5),
    transparent
  );
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-description {
  color: #94a3b8;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.header-right {
  flex-shrink: 0;
}

/* Statistics Section - Grid Layout */
.statistics-section {
  margin-bottom: 32px;
}

/* Content Sections */
.filters-section,
.table-section {
  margin-bottom: 24px;
}

/* Filters Card */
.filters-section :deep(.n-card) {
  background: rgba(30, 41, 59, 0.6) !important;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Data Table Card */
.table-section :deep(.n-card) {
  background: rgba(30, 41, 59, 0.6) !important;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Loading, Error, and Empty States */
.table-loading,
.table-error,
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  min-height: 200px;
}

.table-loading :deep(.n-spin) {
  color: #6366f1;
}

.table-error,
.table-empty {
  color: #94a3b8;
}

/* Button Styling */
.stores-page :deep(.n-button--primary-type) {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
  border: 1px solid rgba(99, 102, 241, 0.3) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stores-page :deep(.n-button--primary-type:hover) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.2);
}

.stores-page :deep(.n-button--primary-type:active) {
  transform: translateY(-1px);
}

/* Input Styling */
.stores-page :deep(.n-input) {
  background: rgba(51, 65, 85, 0.5) !important;
  border: 1px solid rgba(71, 85, 105, 0.3) !important;
  border-radius: 8px;
  color: #f1f5f9 !important;
}

.stores-page :deep(.n-input:focus) {
  border-color: rgba(99, 102, 241, 0.6) !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
}

.stores-page :deep(.n-input input) {
  color: #f1f5f9 !important;
}

.stores-page :deep(.n-input input::placeholder) {
  color: #94a3b8 !important;
}

/* Select Styling */
.stores-page :deep(.n-select) {
  background: rgba(51, 65, 85, 0.5) !important;
}

.stores-page :deep(.n-base-selection) {
  background: rgba(51, 65, 85, 0.5) !important;
  border: 1px solid rgba(71, 85, 105, 0.3) !important;
  border-radius: 8px;
}

.stores-page :deep(.n-base-selection:focus) {
  border-color: rgba(99, 102, 241, 0.6) !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
}

/* Data Table Styling */
.stores-page :deep(.n-data-table) {
  background: transparent !important;
}

.stores-page :deep(.n-data-table-thead) {
  background: rgba(51, 65, 85, 0.3) !important;
}

.stores-page :deep(.n-data-table-th) {
  background: transparent !important;
  color: #e2e8f0 !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3) !important;
}

.stores-page :deep(.n-data-table-td) {
  background: transparent !important;
  color: #f1f5f9 !important;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2) !important;
}

.stores-page :deep(.n-data-table-tr:hover .n-data-table-td) {
  background: rgba(51, 65, 85, 0.3) !important;
}

/* Badge Styling */
.stores-page :deep(.n-badge) {
  border-radius: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 11px;
}

.stores-page :deep(.n-badge--success-type) {
  background: rgba(16, 185, 129, 0.2) !important;
  color: #34d399 !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
}

.stores-page :deep(.n-badge--warning-type) {
  background: rgba(245, 158, 11, 0.2) !important;
  color: #fbbf24 !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
}

.stores-page :deep(.n-badge--error-type) {
  background: rgba(239, 68, 68, 0.2) !important;
  color: #f87171 !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
}

.stores-page :deep(.n-badge--info-type) {
  background: rgba(59, 130, 246, 0.2) !important;
  color: #60a5fa !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
}

/* Text Styling */
.stores-page :deep(.n-text) {
  color: #f1f5f9;
}

.stores-page :deep(.n-text[data-depth="3"]) {
  color: #94a3b8;
}

/* Pagination Styling */
.stores-page :deep(.n-pagination) {
  justify-content: center;
}

.stores-page :deep(.n-pagination .n-pagination-item) {
  background: rgba(51, 65, 85, 0.5) !important;
  border: 1px solid rgba(71, 85, 105, 0.3) !important;
  color: #f1f5f9 !important;
}

.stores-page :deep(.n-pagination .n-pagination-item--active) {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
  border-color: rgba(99, 102, 241, 0.6) !important;
  color: white !important;
}

/* Page Animation */
.stores-page {
  animation: page-entrance 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes page-entrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stores-page {
    padding: 20px;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .page-title {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .stores-page {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .statistics-section,
  .filters-section,
  .table-section {
    margin-bottom: 20px;
  }
}

@media (max-width: 640px) {
  .page-header {
    border-radius: 12px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .stores-page :deep(.n-grid-item) {
    margin-bottom: 16px;
  }
}

/* Focus and Accessibility */
.stores-page :deep(*:focus-visible) {
  outline: 2px solid #6366f1 !important;
  outline-offset: 2px;
}

/* Smooth Scrolling */
.stores-page {
  scroll-behavior: smooth;
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
