<template>
  <div class="store-selector">
    <div
      v-if="availableStores.length > 1"
      :class="['store-selector__dropdown', { 'store-selector__dropdown--open': isOpen }]"
    >
      <button class="store-selector__trigger"
@click="toggleDropdown" :disabled="loading">
        <div class="store-selector__current">
          <div class="store-selector__store-info">
            <div class="store-selector__store-name">
              {{ currentStore?.name || 'Select Store' }}
            </div>
            <div v-if="currentStore" class="store-selector__store-subdomain">
              {{ currentStore.subdomain }}.gocommerce.com
            </div>
          </div>
        </div>
        <ChevronDownIcon class="store-selector__chevron" />
      </button>

      <Transition name="dropdown">
        <div v-if="isOpen" class="store-selector__menu">
          <div class="store-selector__menu-header">
            <span class="store-selector__menu-title">Switch Store</span>
          </div>

          <div class="store-selector__menu-items">
            <button
              v-for="store in availableStores"
              :key="store.id"
              :class="[
                'store-selector__menu-item',
                {
                  'store-selector__menu-item--active': store.id === currentStoreId,
                  'store-selector__menu-item--default': store.isDefault,
                },
              ]"
              @click="selectStore(store)"
            >
              <div class="store-selector__menu-item-content">
                <div class="store-selector__menu-item-name">
                  {{ store.name }}
                  <span v-if="store.isDefault" class="store-selector__default-badge">
                    Default
                  </span>
                </div>
                <div class="store-selector__menu-item-subdomain">
                  {{ store.subdomain }}.gocommerce.com
                </div>
                <div class="store-selector__menu-item-roles">
                  {{ store.userRoles.join(', ') }}
                </div>
              </div>
              <div v-if="store.id === currentStoreId"
class="store-selector__check-icon">✓</div>
            </button>
          </div>

          <div v-if="isPlatformAdmin" class="store-selector__menu-footer">
            <NavLink to="/platform"
class="store-selector__platform-link" @click="closeDropdown">
              <span class="store-selector__platform-icon">⚡</span>
              Platform Administration
            </NavLink>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Single store display -->
    <div v-else-if="availableStores.length === 1" class="store-selector__single">
      <div class="store-selector__store-info">
        <div class="store-selector__store-name">
          {{ availableStores[0].name }}
        </div>
        <div class="store-selector__store-subdomain">
          {{ availableStores[0].subdomain }}.gocommerce.com
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="store-selector__loading">
      <div class="store-selector__loading-spinner" />
      <span>Loading stores...</span>
    </div>

    <!-- No stores available -->
    <div v-else class="store-selector__empty">
      <span>No stores available</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import NavLink from '@/components/atoms/NavLink.vue'
  import ChevronDownIcon from '@/components/atoms/icons/ChevronDownIcon.vue'
  import type { StoreOption } from '@/types/navigation'

  /**
   * StoreSelector - Multi-tenant store selection component
   *
   * Features:
   * - Dropdown for multiple stores
   * - Store switching with context update
   * - Platform administration access for platform-admin users
   * - Responsive design
   * - Keyboard navigation support
   *
   * Related GitHub Issue: #3 - Layout, Navigation & Routing System
   */

  interface Props {
    /** Available stores for current user */
    availableStores: StoreOption[]
    /** Currently selected store ID */
    currentStoreId?: string
    /** Loading state */
    loading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
  })

  const emit = defineEmits<{
    'store-selected': [store: StoreOption]
    'platform-selected': []
  }>()

  const router = useRouter()
  const { user, isPlatformAdmin } = useAuth()

  // Local state
  const isOpen = ref(false)

  // Computed properties
  const currentStore = computed(() =>
    props.availableStores.find(store => store.id === props.currentStoreId)
  )

  // Methods
  function toggleDropdown() {
    isOpen.value = !isOpen.value
  }

  function closeDropdown() {
    isOpen.value = false
  }

  function selectStore(store: StoreOption) {
    if (store.id !== props.currentStoreId) {
      emit('store-selected', store)

      // Navigate to store dashboard
      router.push(`/store/${store.id}/dashboard`)
    }
    closeDropdown()
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: Event) {
    const target = event.target as HTMLElement
    const dropdown = document.querySelector('.store-selector__dropdown')

    if (dropdown && !dropdown.contains(target)) {
      closeDropdown()
    }
  }

  // Keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen.value) return

    switch (event.key) {
      case 'Escape':
        closeDropdown()
        break
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        // TODO: Implement keyboard navigation between items
        break
      case 'Enter':
        event.preventDefault()
        // TODO: Select focused item
        break
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
  })
</script>

<style scoped>
  .store-selector {
    width: 100%;
    position: relative;
  }

  .store-selector__dropdown {
    position: relative;
  }

  .store-selector__trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-align: left;
  }

  .store-selector__trigger:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .store-selector__trigger:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .store-selector__trigger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .store-selector__current {
    flex: 1;
  }

  .store-selector__store-info {
    display: flex;
    flex-direction: column;
  }

  .store-selector__store-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
  }

  .store-selector__store-subdomain {
    font-size: 12px;
    color: #64748b;
    line-height: 1.3;
  }

  .store-selector__chevron {
    color: #94a3b8;
    transition: transform 0.2s ease-in-out;
  }

  .store-selector__dropdown--open .store-selector__chevron {
    transform: rotate(180deg);
  }

  .store-selector__menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: 4px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    max-height: 320px;
    overflow-y: auto;
  }

  .store-selector__menu-header {
    padding: 12px 16px 8px;
    border-bottom: 1px solid #f1f5f9;
  }

  .store-selector__menu-title {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .store-selector__menu-items {
    padding: 4px 0;
  }

  .store-selector__menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease-in-out;
  }

  .store-selector__menu-item:hover {
    background: #f8fafc;
  }

  .store-selector__menu-item--active {
    background: #dbeafe;
  }

  .store-selector__menu-item-content {
    flex: 1;
  }

  .store-selector__menu-item-name {
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.4;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .store-selector__default-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    background: #f59e0b;
    color: white;
    font-size: 10px;
    font-weight: 600;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .store-selector__menu-item-subdomain {
    font-size: 12px;
    color: #64748b;
    line-height: 1.3;
  }

  .store-selector__menu-item-roles {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.3;
    margin-top: 2px;
  }

  .store-selector__check-icon {
    color: #10b981;
    font-weight: bold;
    font-size: 16px;
  }

  .store-selector__menu-footer {
    border-top: 1px solid #f1f5f9;
    padding: 8px;
  }

  .store-selector__platform-link {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #7c3aed;
  }

  .store-selector__platform-icon {
    font-size: 16px;
  }

  .store-selector__single {
    padding: 12px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .store-selector__loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    color: #64748b;
    font-size: 14px;
  }

  .store-selector__loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f1f5f9;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .store-selector__empty {
    padding: 12px 16px;
    color: #94a3b8;
    font-size: 14px;
    text-align: center;
  }

  /* Dropdown animation */
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: all 0.2s ease-in-out;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .store-selector__menu {
      max-height: 280px;
    }

    .store-selector__trigger,
    .store-selector__menu-item {
      padding: 14px 16px;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
