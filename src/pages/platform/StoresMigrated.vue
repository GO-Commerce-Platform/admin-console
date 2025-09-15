<!--
  Store Management Page (Migrated to Naive UI)
  
  Provides comprehensive store management interface for platform administrators
  This is the migrated version from Chakra UI to Naive UI
  
  Related GitHub Issue: #25 - UI Migration from Chakra UI to Naive UI
  Original Issue: #5 - Store Management System
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
            :loading="loading.creating"
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
            :value="statistics.totalStores"
            icon="BuildingStorefront"
          />
        </NGridItem>
        <NGridItem>
          <MetricCard
            title="Active Stores"
            :value="statistics.activeStores"
            icon="CheckCircle"
          />
        </NGridItem>
        <NGridItem>
          <MetricCard
            title="New This Month"
            :value="statistics.newStoresThisMonth"
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
                  <NIcon><CheckCircle /></NIcon>
                </template>
                Activate
              </NButton>
              <NButton size="small" @click="handleBulkOperation('deactivate')">
                <template #icon>
                  <NIcon><XCircle /></NIcon>
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
        <div v-if="loading.stores" class="table-loading">
          <NSpin size="large" />
          <NText style="margin-top: 16px;">Loading stores...</NText>
        </div>

        <!-- Error State -->
        <div v-else-if="errors.stores" class="table-error">
          <NResult status="error" title="Error Loading Stores" :description="errors.stores">
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
          :loading="loading.stores"
          @update:checked-row-keys="handleSelectionChange"
          :checked-row-keys="selectedStoreIds"
        />

        <!-- Empty State -->
        <div v-else class="table-empty">
          <NResult
            status="info"
            title="No stores found"
            :description="searchTerm || selectedStatus || selectedCategory ? 'Try adjusting your filters' : 'Get started by creating your first store'"
          >
            <template #icon>
              <NIcon size="64">
                <BuildingStorefront />
              </NIcon>
            </template>
            <template #footer>
              <NButton
                v-if="!searchTerm && !selectedStatus && !selectedCategory"
                type="primary"
                @click="openCreateStoreModal"
              >
                Create Store
              </NButton>
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

    <!-- Modals -->
    <CreateStoreModal
      v-if="showCreateStoreModal"
      @close="closeCreateStoreModal"
      @created="handleStoreCreated"
    />

    <EditStoreModal
      v-if="showEditStoreModal && selectedStore"
      :store="selectedStore"
      @close="closeEditStoreModal"
      @updated="handleStoreUpdated"
    />

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
  CheckCircle, 
  XCircle, 
  Pause, 
  Trash, 
  Edit, 
  ExternalLink,
  BuildingStorefront,
  TrendingUp,
  CurrencyDollar
} from '@vicons/tabler'
import { useStoresStore } from '@/stores/stores'
import { useAuth } from '@/composables/useAuth'
import { useDebounce } from '@/composables/useDebounce'
import MetricCard from '@/components/molecules/MetricCard.vue'
import CreateStoreModal from '@/components/organisms/CreateStoreModal.vue'
import EditStoreModal from '@/components/organisms/EditStoreModal.vue'
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
const errors = computed(() => storesStore.state.errors)
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

// Modal handlers
const openCreateStoreModal = () => {
  if (!isPlatformAdmin.value) {
    return
  }
  showCreateStoreModal.value = true
}

const closeCreateStoreModal = () => {
  showCreateStoreModal.value = false
}

const handleStoreCreated = (store: StoreDto) => {
  closeCreateStoreModal()
  refreshStores()
}

const openEditStoreModal = (store: StoreDto) => {
  selectedStore.value = store
  showEditStoreModal.value = true
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
.stores-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin: -24px -24px 0 -24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 4px 0;
}

.page-description {
  color: #94a3b8;
  margin: 0;
}

.statistics-section {
  margin-bottom: 8px;
}

.filters-section,
.table-section {
  margin-bottom: 8px;
}

.table-loading,
.table-error,
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-header {
    margin: -16px -16px 0 -16px;
    padding: 16px;
  }
  
  .stores-page {
    gap: 16px;
  }
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->