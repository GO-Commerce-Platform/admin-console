<!--
  Store Listing Page
  Provides comprehensive store management interface for platform administrators
  
  Related GitHub Issue: #5 - Store Management System
  Based on specifications in WARP.md and PLAN.md
-->
<template>
  <div class="stores-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            Store Management
          </h1>
          <p class="page-description">
            Manage all stores across the platform
          </p>
        </div>
        <div class="header-right">
          <CButton
            variant="primary"
            size="md"
            left-icon="plus"
            @click="openCreateStoreModal"
          :disabled="loading.value.creating"
          >
            Create Store
          </CButton>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div
      v-if="statistics.value"
      class="statistics-section"
    >
      <CSimpleGrid
        :columns="4"
        :spacing="6"
        :min-child-width="'250px'"
      >
        <MetricCard
          title="Total Stores"
          :value="statistics.value.totalStores"
          :trend="null"
          icon="building-storefront"
        />
        <MetricCard
          title="Active Stores"
          :value="statistics.value.activeStores"
          :trend="null"
          icon="check-circle"
        />
        <MetricCard
          title="New This Month"
          :value="statistics.value.newStoresThisMonth"
          :trend="null"
          icon="trending-up"
        />
        <MetricCard
          title="Total Revenue"
          :value="formatCurrency(statistics.value.totalRevenue)"
          :trend="statistics.value.revenueGrowth"
          icon="currency-dollar"
        />
      </CSimpleGrid>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <CStack
        direction="row"
        spacing="4"
        :align="'center'"
        :justify="'space-between'"
      >
        <!-- Search and Filters -->
        <CStack
          direction="row"
          spacing="4"
          :align="'center'"
        >
          <CInputGroup
            size="md"
            max-width="300px"
          >
            <CInputLeftElement>
              <CIcon
                name="search"
                color="gray.400"
              />
            </CInputLeftElement>
            <CInput
              v-model="searchTerm"
              placeholder="Search stores..."
              @input="debouncedSearch"
            />
          </CInputGroup>

          <CBox max-width="150px">
            <select
              v-model="selectedStatus"
              class="chakra-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </CBox>

          <CBox max-width="150px">
            <select
              v-model="selectedCategory"
              class="chakra-select"
            >
              <option value="">All Categories</option>
              <option value="fashion">Fashion</option>
              <option value="electronics">Electronics</option>
              <option value="food_beverage">Food & Beverage</option>
              <option value="beauty">Beauty</option>
              <option value="home_garden">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
              <option value="generic">Generic</option>
            </select>
          </CBox>
        </CStack>

        <!-- Bulk Actions -->
        <CStack
          v-if="hasSelectedStores.value"
          direction="row"
          spacing="2"
          :align="'center'"
        >
          <CText
            font-size="sm"
            color="gray.600"
          >
            {{ selectedStores.value.length }} selected
          </CText>
          <CStack direction="row" spacing="2">
            <CButton
              variant="outline"
              size="sm"
              @click="handleBulkOperation('activate')"
            >
              <CIcon name="check-circle" mr="2" />
              Activate
            </CButton>
            <CButton
              variant="outline"
              size="sm"
              @click="handleBulkOperation('deactivate')"
            >
              <CIcon name="x-circle" mr="2" />
              Deactivate
            </CButton>
            <CButton
              variant="outline"
              size="sm"
              @click="handleBulkOperation('suspend')"
            >
              <CIcon name="pause" mr="2" />
              Suspend
            </CButton>
            <CButton
              variant="outline"
              size="sm"
              color-scheme="red"
              @click="handleBulkOperation('delete')"
            >
              <CIcon name="trash" mr="2" />
              Delete
            </CButton>
          </CStack>
        </CStack>
      </CStack>
    </div>

    <!-- Data Table -->
    <div class="table-section">
      <CBox
        bg="white"
        shadow="sm"
        border-radius="lg"
        overflow="hidden"
      >
        <!-- Table Header -->
        <CBox
          px="6"
          py="4"
          border-bottom="1px"
          border-color="gray.200"
        >
          <CStack
            direction="row"
            spacing="4"
            :align="'center'"
            :justify="'space-between'"
          >
            <CText
              font-weight="medium"
              color="gray.900"
            >
              Stores ({{ pagination.total }})
            </CText>
            <CStack
              direction="row"
              spacing="2"
              :align="'center'"
            >
              <CText
                font-size="sm"
                color="gray.600"
              >
                Show:
              </CText>
              <CSelect
                v-model="pageSize"
                size="sm"
                max-width="80px"
                @change="handlePageSizeChange"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </CSelect>
            </CStack>
          </CStack>
        </CBox>

        <!-- Loading State -->
        <div
          v-if="loading.stores"
          class="table-loading"
        >
          <CSpinner size="xl" />
          <CText
            mt="4"
            color="gray.600"
          >
            Loading stores...
          </CText>
        </div>

        <!-- Error State -->
        <div
          v-else-if="errors.stores"
          class="table-error"
        >
          <CAlert
            status="error"
            variant="subtle"
          >
            <CAlertIcon />
            <CAlertTitle>Error Loading Stores</CAlertTitle>
            <CAlertDescription>{{ errors.stores }}</CAlertDescription>
          </CAlert>
          <CButton
            mt="4"
            variant="outline"
            @click="refreshStores"
          >
            Try Again
          </CButton>
        </div>

        <!-- Data Table -->
        <CTable
          v-else-if="stores.length > 0"
          variant="simple"
        >
          <CThead>
            <CTr>
              <CTh width="50px">
                <CCheckbox
                  :is-checked="isAllSelected"
                  :is-indeterminate="isPartiallySelected"
                  @change="handleSelectAll"
                />
              </CTh>
              <CTh @click="handleSort('name')">
                <CStack
                  direction="row"
                  spacing="1"
                  :align="'center'"
                >
                  <CText>Store Name</CText>
                  <CIcon
                    v-if="filters.value.sortBy === 'name'"
                    :name="filters.value.sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'"
                    size="sm"
                  />
                </CStack>
              </CTh>
              <CTh>Subdomain</CTh>
              <CTh @click="handleSort('status')">
                <CStack
                  direction="row"
                  spacing="1"
                  :align="'center'"
                >
                  <CText>Status</CText>
                  <CIcon
                    v-if="filters.value.sortBy === 'status'"
                    :name="filters.value.sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'"
                    size="sm"
                  />
                </CStack>
              </CTh>
              <CTh>Owner</CTh>
              <CTh @click="handleSort('createdAt')">
                <CStack
                  direction="row"
                  spacing="1"
                  :align="'center'"
                >
                  <CText>Created</CText>
                  <CIcon
                    v-if="filters.value.sortBy === 'createdAt'"
                    :name="filters.value.sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'"
                    size="sm"
                  />
                </CStack>
              </CTh>
              <CTh width="100px">Actions</CTh>
            </CTr>
          </CThead>
          <CTbody>
            <CTr
              v-for="store in stores.value"
              :key="store.id"
            >
              <CTd>
                <CCheckbox
                  :is-checked="selectedStoreIds.value.has(store.id)"
                  @change="toggleStoreSelection(store.id)"
                />
              </CTd>
              <CTd>
                <CStack
                  direction="column"
                  spacing="1"
                >
                  <CText
                    font-weight="medium"
                    color="gray.900"
                  >
                    {{ store.name }}
                  </CText>
                  <CText
                    font-size="sm"
                    color="gray.600"
                  >
                    {{ store.description || 'No description' }}
                  </CText>
                </CStack>
              </CTd>
              <CTd>
                <CLink
                  :href="store.fullDomain"
                  is-external
                  color="blue.500"
                >
                  {{ store.subdomain }}
                  <CIcon
                    name="external-link"
                    mx="1"
                    size="xs"
                  />
                </CLink>
              </CTd>
              <CTd>
                <CBadge
                  :color-scheme="getStatusColor(store.status)"
                  variant="subtle"
                >
                  {{ store.status.charAt(0).toUpperCase() + store.status.slice(1) }}
                </CBadge>
              </CTd>
              <CTd>
                <CText
                  font-size="sm"
                  color="gray.900"
                >
                  {{ store.ownerId }}
                </CText>
              </CTd>
              <CTd>
                <CText
                  font-size="sm"
                  color="gray.600"
                >
                  {{ formatDate(store.createdAt) }}
                </CText>
              </CTd>
              <CTd>
                <CStack
                  direction="row"
                  spacing="1"
                >
                  <CIconButton
                    aria-label="Edit store"
                    icon="edit"
                    size="sm"
                    variant="ghost"
                    @click="openEditStoreModal(store)"
                  />
                  <CIconButton
                    aria-label="Delete store"
                    icon="trash"
                    size="sm"
                    variant="ghost"
                    color-scheme="red"
                    @click="confirmDeleteStore(store)"
                  />
                </CStack>
              </CTd>
            </CTr>
          </CTbody>
        </CTable>

        <!-- Empty State -->
        <div
          v-else
          class="table-empty"
        >
          <CIcon
            name="building-storefront"
            size="4xl"
            color="gray.300"
          />
          <CText
            mt="4"
            font-size="lg"
            font-weight="medium"
            color="gray.900"
          >
            No stores found
          </CText>
          <CText
            color="gray.600"
            mt="2"
          >
            {{ searchTerm || selectedStatus || selectedCategory ? 'Try adjusting your filters' : 'Get started by creating your first store' }}
          </CText>
          <CButton
            v-if="!searchTerm && !selectedStatus && !selectedCategory"
            mt="6"
            variant="primary"
            @click="openCreateStoreModal"
          >
            Create Store
          </CButton>
        </div>

        <!-- Pagination -->
        <div
          v-if="stores.value.length > 0"
          class="pagination-section"
        >
          <CBox
            px="6"
            py="4"
            border-top="1px"
            border-color="gray.200"
          >
            <CStack
              direction="row"
              spacing="4"
              :align="'center'"
              :justify="'space-between'"
            >
              <CText
                font-size="sm"
                color="gray.600"
              >
                Showing {{ (pagination.value.page - 1) * pagination.value.size + 1 }} to 
                {{ Math.min(pagination.value.page * pagination.value.size, pagination.value.total) }} 
                of {{ pagination.value.total }} results
              </CText>
              
              <CStack
                direction="row"
                spacing="2"
                :align="'center'"
              >
                <CButton
                  size="sm"
                  variant="outline"
                  :disabled="!pagination.value.hasPrev"
                  @click="goToPage(pagination.value.page - 1)"
                >
                  Previous
                </CButton>
                
                <CStack
                  direction="row"
                  spacing="1"
                >
                  <CButton
                    v-for="page in visiblePages"
                    :key="page"
                    size="sm"
                    :variant="page === pagination.value.page ? 'solid' : 'ghost'"
                    :color-scheme="page === pagination.value.page ? 'blue' : 'gray'"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </CButton>
                </CStack>
                
                <CButton
                  size="sm"
                  variant="outline"
                  :disabled="!pagination.value.hasNext"
                  @click="goToPage(pagination.value.page + 1)"
                >
                  Next
                </CButton>
              </CStack>
            </CStack>
          </CBox>
        </div>
      </CBox>
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

    <!-- Delete Confirmation Dialog -->
    <CAlertDialog
      :is-open="showDeleteDialog"
      least-destructive-ref="cancelDeleteRef"
      @close="closeDeleteDialog"
    >
      <CAlertDialogOverlay>
        <CAlertDialogContent>
          <CAlertDialogHeader>Delete Store</CAlertDialogHeader>
          <CAlertDialogBody>
            Are you sure you want to delete "{{ storeToDelete?.name }}"? 
            This action cannot be undone and will permanently remove all store data.
          </CAlertDialogBody>
          <CAlertDialogFooter>
            <CButton
              ref="cancelDeleteRef"
              @click="closeDeleteDialog"
            >
              Cancel
            </CButton>
            <CButton
              color-scheme="red"
              :is-loading="loading.value.deleting"
              @click="handleDeleteStore"
              ml="3"
            >
              Delete
            </CButton>
          </CAlertDialogFooter>
        </CAlertDialogContent>
      </CAlertDialogOverlay>
    </CAlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  CButton,
  CBox,
  CStack,
  CText,
  CIcon,
  CSimpleGrid,
  CInputGroup,
  CInputLeftElement,
  CInput,
  CCheckbox,
  CBadge,
  CLink,
  CIconButton,
  CAlertDialog,
  CAlertDialogOverlay,
  CAlertDialogContent,
  CAlertDialogHeader,
  CAlertDialogBody,
  CAlertDialogFooter
} from '@chakra-ui/vue-next'
import { useStoresStore } from '@/stores/stores'
import { useAuth } from '@/composables/useAuth'
import { useDebounce } from '@/composables/useDebounce'
import MetricCard from '@/components/molecules/MetricCard.vue'
import CreateStoreModal from '@/components/organisms/CreateStoreModal.vue'
import EditStoreModal from '@/components/organisms/EditStoreModal.vue'
import type { StoreDto, StoreStatus, StoreTemplateCategory } from '@/types/store'

// Composables
const router = useRouter()
const storesStore = useStoresStore()
const { hasRole, isPlatformAdmin } = useAuth()

// Store state - access store properties directly instead of destructuring
const stores = computed(() => storesStore.stores)
const statistics = computed(() => storesStore.statistics)
const pagination = computed(() => storesStore.state.pagination)
const filters = computed(() => storesStore.state.filters)
const loading = computed(() => storesStore.state.loading)
const errors = computed(() => storesStore.state.errors)
const selectedStoreIds = computed(() => storesStore.state.selectedStoreIds)
const hasSelectedStores = computed(() => storesStore.hasSelectedStores)
const selectedStores = computed(() => storesStore.selectedStores)

// Local state
const searchTerm = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const pageSize = ref(10)

// Modal states
const showCreateStoreModal = ref(false)
const showEditStoreModal = ref(false)
const selectedStore = ref<StoreDto | null>(null)

// Delete dialog state
const showDeleteDialog = ref(false)
const storeToDelete = ref<StoreDto | null>(null)
const cancelDeleteRef = ref<HTMLElement | null>(null)

// Computed
const isAllSelected = computed(() => 
  stores.value.length > 0 && stores.value.every(store => selectedStoreIds.value.has(store.id))
)

const isPartiallySelected = computed(() => 
  selectedStoreIds.value.size > 0 && !isAllSelected.value
)

const visiblePages = computed(() => {
  const pages = []
  const total = pagination.value.totalPages
  const current = pagination.value.page
  const delta = 2

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    pages.push(i)
  }

  if (current - delta > 2) {
    pages.unshift('...')
  }
  if (current + delta < total - 1) {
    pages.push('...')
  }

  pages.unshift(1)
  if (total > 1) {
    pages.push(total)
  }

  return pages.filter((page, index) => pages.indexOf(page) === index)
})

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

const handleSort = (field: string) => {
  const currentField = filters.value.sortBy
  const currentOrder = filters.value.sortOrder
  
  let newOrder: 'asc' | 'desc' = 'asc'
  if (field === currentField && currentOrder === 'asc') {
    newOrder = 'desc'
  }
  
  storesStore.setFilters({
    sortBy: field as any,
    sortOrder: newOrder,
  })
  fetchStores()
}

const handleSelectAll = () => {
  if (isAllSelected.value) {
    storesStore.clearStoreSelection()
  } else {
    storesStore.selectAllStores()
  }
}

const toggleStoreSelection = (storeId: string) => {
  storesStore.toggleStoreSelection(storeId)
}

const goToPage = (page: number) => {
  storesStore.setPagination(page)
  fetchStores()
}

const handlePageSizeChange = () => {
  storesStore.setPagination(1, pageSize.value)
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
    // Show permission error
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
    // Success is handled in the store
  } catch (error) {
    // Error is handled in the store
  }
}

// Utility methods
const getStatusColor = (status: StoreStatus): string => {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'gray'
    case 'suspended':
      return 'red'
    case 'pending':
      return 'yellow'
    default:
      return 'gray'
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
  @apply space-y-6;
}

.page-header {
  @apply bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-6;
}

.header-content {
  @apply flex items-center justify-between;
}

.page-title {
  @apply text-2xl font-semibold text-gray-900;
}

.page-description {
  @apply text-gray-600 mt-1;
}

.statistics-section {
  @apply space-y-4;
}

.filters-section {
  @apply bg-white rounded-lg border border-gray-200 p-4;
}

.table-section {
  @apply bg-white rounded-lg border border-gray-200 overflow-hidden;
}

.table-loading,
.table-error,
.table-empty {
  @apply flex flex-col items-center justify-center py-16;
}

.pagination-section {
  @apply bg-gray-50 border-t border-gray-200;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content {
    @apply flex-col space-y-4 items-start;
  }
  
  .filters-section .chakra-stack {
    @apply flex-col items-start space-y-4;
  }
  
  .table-section {
    @apply overflow-x-auto;
  }
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
