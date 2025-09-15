<template>
  <aside
    :class="[
      'app-sidebar',
      {
        'app-sidebar--collapsed': collapsed,
        'app-sidebar--mobile-open': mobileOpen,
      },
    ]"
  >
    <!-- Mobile backdrop -->
    <div v-if="isMobile && mobileOpen"
class="app-sidebar__backdrop" @click="closeMobileSidebar" />

    <div class="app-sidebar__container">
      <!-- Sidebar header -->
      <div class="app-sidebar__header">
        <!-- Store selector -->
        <div v-if="showStoreSelector"
class="app-sidebar__store-selector">
          <StoreSelector
            :available-stores="availableStores"
            :current-store-id="selectedStoreId"
            :loading="storesLoading"
            @store-selected="handleStoreSelected"
            @platform-selected="handlePlatformSelected"
          />
        </div>

        <!-- Sidebar controls -->
        <div class="app-sidebar__controls">
          <!-- Collapse toggle (desktop only) -->
          <button
            v-if="!isMobile"
            class="app-sidebar__collapse-toggle"
            @click="toggleCollapsed"
            :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            <ChevronLeftIcon v-if="!collapsed" />
            <ChevronRightIcon v-else />
          </button>

          <!-- Close button (mobile only) -->
          <button
            v-if="isMobile"
            class="app-sidebar__close-button"
            @click="closeMobileSidebar"
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Navigation sections -->
      <nav class="app-sidebar__navigation">
        <div class="app-sidebar__sections">
          <!-- Global navigation -->
          <div v-if="navigation.global.length > 0" class="app-sidebar__section">
            <div
              v-for="section in navigation.global"
              :key="section.id"
              class="app-sidebar__section-group"
            >
              <div v-if="section.title && !collapsed" class="app-sidebar__section-title">
                {{ section.title }}
              </div>

              <div class="app-sidebar__section-items">
                <NavigationItem
                  v-for="item in section.items"
                  :key="item.id || item.label"
                  :item="item"
                  :current-user="user"
                  :current-store-id="selectedStoreId"
                />
              </div>
            </div>
          </div>

          <!-- Platform navigation (for platform-admin) -->
          <div
            v-if="isPlatformAdmin && navigation.platform.length > 0"
            class="app-sidebar__section"
          >
            <div
              v-for="section in navigation.platform"
              :key="section.id"
              class="app-sidebar__section-group"
            >
              <div v-if="section.title && !collapsed" class="app-sidebar__section-title">
                {{ section.title }}
              </div>

              <div class="app-sidebar__section-items">
                <NavigationItem
                  v-for="item in section.items"
                  :key="item.id || item.label"
                  :item="item"
                  :current-user="user"
                  :current-store-id="selectedStoreId"
                />
              </div>
            </div>
          </div>

          <!-- Store navigation (for store-scoped users) -->
          <div v-if="selectedStoreId && navigation.store.length > 0" class="app-sidebar__section">
            <div
              v-for="section in navigation.store"
              :key="section.id"
              class="app-sidebar__section-group"
            >
              <div v-if="section.title && !collapsed" class="app-sidebar__section-title">
                {{ section.title }}
              </div>

              <div class="app-sidebar__section-items">
                <NavigationItem
                  v-for="item in section.items"
                  :key="item.id || item.label"
                  :item="item"
                  :current-user="user"
                  :current-store-id="selectedStoreId"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Sidebar footer -->
      <div class="app-sidebar__footer">
        <div v-if="!collapsed"
class="app-sidebar__footer-content">
          <div class="app-sidebar__version">GO Commerce v{{ appVersion }}</div>
          <div class="app-sidebar__support">
            <NavLink href="mailto:support@gocommerce.com" class="app-sidebar__support-link">
              <span class="app-sidebar__support-icon">💬</span>
              <span v-if="!collapsed">Support</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import NavigationItem from '@/components/molecules/NavigationItem.vue'
  import StoreSelector from '@/components/molecules/StoreSelector.vue'
  import NavLink from '@/components/atoms/NavLink.vue'
  import ChevronLeftIcon from '@/components/atoms/icons/ChevronLeftIcon.vue'
  import ChevronRightIcon from '@/components/atoms/icons/ChevronRightIcon.vue'
  import type { NavigationConfig, StoreOption } from '@/types/navigation'

  /**
   * AppSidebar - Main navigation sidebar component
   *
   * Features:
   * - Role-based navigation menu sections
   * - Store selector for multi-tenant navigation
   * - Collapsible sidebar (desktop) and slide-out (mobile)
   * - Hierarchical navigation with expand/collapse
   * - Responsive design with mobile overlay
   * - Navigation persistence across route changes
   *
   * Related GitHub Issue: #3 - Layout, Navigation & Routing System
   */

  interface Props {
    /** Whether sidebar is collapsed */
    collapsed?: boolean
    /** Whether mobile sidebar is open */
    mobileOpen?: boolean
    /** Navigation configuration */
    navigation: NavigationConfig
    /** Available stores for current user */
    availableStores?: StoreOption[]
    /** Currently selected store ID */
    selectedStoreId?: string
    /** Whether stores are loading */
    storesLoading?: boolean
    /** Application version */
    appVersion?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    collapsed: false,
    mobileOpen: false,
    availableStores: () => [],
    storesLoading: false,
    appVersion: '1.0.0',
  })

  const emit = defineEmits<{
    'toggle-collapsed': []
    'close-mobile': []
    'store-selected': [store: StoreOption]
    'platform-selected': []
  }>()

  const router = useRouter()
  const route = useRoute()
  const { user, isPlatformAdmin, hasRole } = useAuth()

  // Local state
  const isMobile = ref(window.innerWidth <= 768)

  // Computed properties
  const showStoreSelector = computed(() => {
    // Show store selector if user has access to multiple stores or any store
    return props.availableStores.length > 0 || isPlatformAdmin.value
  })

  // Methods
  function toggleCollapsed() {
    emit('toggle-collapsed')
  }

  function closeMobileSidebar() {
    emit('close-mobile')
  }

  function handleStoreSelected(store: StoreOption) {
    emit('store-selected', store)
  }

  function handlePlatformSelected() {
    emit('platform-selected')
  }

  // Handle window resize for mobile detection
  function handleResize() {
    isMobile.value = window.innerWidth <= 768
  }

  // Close mobile sidebar when route changes
  function handleRouteChange() {
    if (isMobile.value && props.mobileOpen) {
      closeMobileSidebar()
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  // Watch for route changes to close mobile sidebar
  router.afterEach(handleRouteChange)
</script>

<style scoped>
  .app-sidebar {
    position: fixed;
    top: 64px; /* Height of header */
    left: 0;
    bottom: 0;
    width: 280px;
    background: #ffffff;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease-in-out;
    z-index: 30;
  }

  .app-sidebar--collapsed {
    width: 72px;
  }

  .app-sidebar__backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 20;
    transition: opacity 0.3s ease-in-out;
  }

  .app-sidebar__container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Header */
  .app-sidebar__header {
    padding: 20px 16px;
    border-bottom: 1px solid #f3f4f6;
    flex-shrink: 0;
  }

  .app-sidebar__store-selector {
    margin-bottom: 16px;
  }

  .app-sidebar__controls {
    display: flex;
    justify-content: flex-end;
  }

  .app-sidebar__collapse-toggle,
  .app-sidebar__close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
  }

  .app-sidebar__collapse-toggle:hover,
  .app-sidebar__close-button:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .app-sidebar__close-button {
    font-size: 18px;
    font-weight: 500;
  }

  /* Navigation */
  .app-sidebar__navigation {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 0;
  }

  .app-sidebar__sections {
    padding: 0 8px;
  }

  .app-sidebar__section {
    margin-bottom: 24px;
  }

  .app-sidebar__section:last-child {
    margin-bottom: 0;
  }

  .app-sidebar__section-group {
    margin-bottom: 16px;
  }

  .app-sidebar__section-group:last-child {
    margin-bottom: 0;
  }

  .app-sidebar__section-title {
    padding: 8px 12px 4px;
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .app-sidebar__section-items {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /* Footer */
  .app-sidebar__footer {
    padding: 16px;
    border-top: 1px solid #f3f4f6;
    flex-shrink: 0;
  }

  .app-sidebar__footer-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .app-sidebar__version {
    font-size: 11px;
    color: #9ca3af;
    text-align: center;
  }

  .app-sidebar__support {
    display: flex;
    justify-content: center;
  }

  .app-sidebar__support-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    color: #6b7280;
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    transition: all 0.2s ease-in-out;
  }

  .app-sidebar__support-link:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .app-sidebar__support-icon {
    font-size: 14px;
  }

  /* Collapsed state adjustments */
  .app-sidebar--collapsed .app-sidebar__header {
    padding: 20px 8px;
  }

  .app-sidebar--collapsed .app-sidebar__sections {
    padding: 0 4px;
  }

  .app-sidebar--collapsed .app-sidebar__section-title {
    display: none;
  }

  .app-sidebar--collapsed .app-sidebar__footer {
    padding: 16px 8px;
  }

  .app-sidebar--collapsed .app-sidebar__version,
  .app-sidebar--collapsed .app-sidebar__support-link span:not(.app-sidebar__support-icon) {
    display: none;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .app-sidebar {
      top: 0;
      width: 320px;
      transform: translateX(-100%);
      z-index: 40;
    }

    .app-sidebar--mobile-open {
      transform: translateX(0);
    }

    .app-sidebar__header {
      padding-top: 80px; /* Account for mobile header height */
    }

    .app-sidebar__controls {
      justify-content: flex-start;
    }

    .app-sidebar__close-button {
      margin-left: -4px;
    }
  }

  /* Scrollbar styling */
  .app-sidebar__navigation::-webkit-scrollbar {
    width: 4px;
  }

  .app-sidebar__navigation::-webkit-scrollbar-track {
    background: transparent;
  }

  .app-sidebar__navigation::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }

  .app-sidebar__navigation::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  /* Transitions for mobile */
  .app-sidebar {
    transition: transform 0.3s ease-in-out;
  }

  @media (max-width: 768px) {
    .app-sidebar--mobile-open ~ .app-sidebar__backdrop {
      opacity: 1;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
