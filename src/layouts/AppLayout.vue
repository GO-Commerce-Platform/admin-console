<template>
  <div class="app-layout">
    <!-- Header -->
    <AppHeader
      :mobile-menu-open="mobileMenuOpen"
      :navigation-config="navigationConfig"
      :unread-count="unreadNotifications"
      @toggle-mobile-menu="toggleMobileMenu"
      @toggle-notifications="handleToggleNotifications"
      @search-result-selected="handleSearchResultSelected"
    />

    <!-- Sidebar -->
    <AppSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileMenuOpen"
      :navigation="navigationConfig"
      :available-stores="availableStores"
      :selected-store-id="selectedStoreId"
      :stores-loading="storesLoading"
      :app-version="appVersion"
      @toggle-collapsed="toggleSidebarCollapsed"
      @close-mobile="closeMobileMenu"
      @store-selected="handleStoreSelected"
      @platform-selected="handlePlatformSelected"
    />

    <!-- Main content area -->
    <main
      :class="[
        'app-layout__main',
        {
          'app-layout__main--sidebar-collapsed': sidebarCollapsed,
          'app-layout__main--mobile-menu-open': mobileMenuOpen
        }
      ]"
    >
      <!-- Breadcrumb navigation -->
      <div v-if="showBreadcrumbs && breadcrumbs.length > 0" class="app-layout__breadcrumbs">
        <nav aria-label="Breadcrumb">
          <ol class="app-layout__breadcrumb-list">
            <li
              v-for="(breadcrumb, index) in breadcrumbs"
              :key="index"
              class="app-layout__breadcrumb-item"
            >
              <NavLink
                v-if="breadcrumb.to && index < breadcrumbs.length - 1"
                :to="breadcrumb.to"
                class="app-layout__breadcrumb-link"
              >
                {{ breadcrumb.label }}
              </NavLink>
              <span
                v-else
                :class="[
                  'app-layout__breadcrumb-current',
                  { 'app-layout__breadcrumb-current--disabled': breadcrumb.disabled }
                ]"
              >
                {{ breadcrumb.label }}
              </span>
              <span
                v-if="index < breadcrumbs.length - 1"
                class="app-layout__breadcrumb-separator"
                aria-hidden="true"
              >
                /
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Page content -->
      <div class="app-layout__content">
        <router-view />
      </div>
    </main>

    <!-- Notification panel (slide-out) -->
    <Transition name="notification-panel">
      <div
        v-if="notificationPanelOpen"
        class="app-layout__notification-panel"
      >
        <div class="app-layout__notification-header">
          <h3 class="app-layout__notification-title">Notifications</h3>
          <button
            class="app-layout__notification-close"
            @click="closeNotificationPanel"
            aria-label="Close notifications"
          >
            ✕
          </button>
        </div>
        <div class="app-layout__notification-content">
          <!-- Placeholder for notification content -->
          <div class="app-layout__notification-empty">
            <p>No notifications at this time.</p>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Notification panel backdrop -->
    <div
      v-if="notificationPanelOpen"
      class="app-layout__notification-backdrop"
      @click="closeNotificationPanel"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppSidebar from '@/components/organisms/AppSidebar.vue'
import NavLink from '@/components/atoms/NavLink.vue'
import type { 
  NavigationConfig, 
  NavigationSearchResult, 
  StoreOption, 
  BreadcrumbList 
} from '@/types/navigation'

/**
 * AppLayout - Main application layout component
 * 
 * Features:
 * - Responsive layout with header and sidebar
 * - Role-based navigation configuration
 * - Multi-tenant store management
 * - Mobile-optimized navigation
 * - Breadcrumb navigation
 * - Notification panel
 * - Search integration
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

const route = useRoute()
const router = useRouter()
const { user, selectedStoreId, isPlatformAdmin, logout } = useAuth()

// Local state
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const notificationPanelOpen = ref(false)
const unreadNotifications = ref(0)
const storesLoading = ref(false)
const appVersion = ref('1.0.0')

// Mock data - in real app, this would come from stores/services
const availableStores = ref<StoreOption[]>([
  {
    id: 'store-1',
    name: 'Electronics Store',
    subdomain: 'electronics',
    isDefault: true,
    userRoles: ['store-admin']
  },
  {
    id: 'store-2', 
    name: 'Fashion Boutique',
    subdomain: 'fashion',
    isDefault: false,
    userRoles: ['product-manager']
  }
])

// Navigation configuration
const navigationConfig = computed<NavigationConfig>(() => ({
  global: [
    {
      id: 'main',
      title: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          to: '/dashboard',
          scope: 'global'
        }
      ]
    }
  ],
  platform: [
    {
      id: 'platform-management',
      title: 'Platform Management',
      items: [
        {
          id: 'platform-dashboard',
          label: 'Platform Dashboard',
          to: '/platform/dashboard',
          scope: 'platform',
          requiredRoles: ['platform-admin']
        },
        {
          id: 'stores',
          label: 'Stores',
          to: '/platform/stores',
          scope: 'platform',
          requiredRoles: ['platform-admin']
        },
        {
          id: 'users',
          label: 'Users',
          to: '/platform/users',
          scope: 'platform',
          requiredRoles: ['platform-admin']
        }
      ]
    }
  ],
  store: [
    {
      id: 'store-management',
      title: 'Store Management',
      items: [
        {
          id: 'store-dashboard',
          label: 'Store Dashboard',
          to: `/store/${selectedStoreId.value}/dashboard`,
          scope: 'store',
          requiredRoles: ['store-admin', 'product-manager', 'order-manager']
        },
        {
          id: 'products',
          label: 'Products',
          to: `/store/${selectedStoreId.value}/products`,
          scope: 'store',
          requiredRoles: ['store-admin', 'product-manager']
        },
        {
          id: 'orders',
          label: 'Orders',
          to: `/store/${selectedStoreId.value}/orders`,
          scope: 'store',
          requiredRoles: ['store-admin', 'order-manager', 'customer-service']
        },
        {
          id: 'customers',
          label: 'Customers',
          to: `/store/${selectedStoreId.value}/customers`,
          scope: 'store',
          requiredRoles: ['store-admin', 'customer-service']
        }
      ]
    }
  ]
}))

// Computed properties
const showBreadcrumbs = computed(() => {
  // Hide breadcrumbs on authentication pages
  return !route.path.startsWith('/auth') && !route.path.startsWith('/login')
})

const breadcrumbs = computed<BreadcrumbList>(() => {
  const crumbs: BreadcrumbList = []
  const pathSegments = route.path.split('/').filter(Boolean)
  
  // Build breadcrumbs based on current route
  if (pathSegments.length === 0) {
    return [{ label: 'Dashboard' }]
  }
  
  // Handle different route structures
  if (pathSegments[0] === 'platform') {
    crumbs.push({ label: 'Platform', to: '/platform' })
    if (pathSegments[1]) {
      const label = pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)
      crumbs.push({ label })
    }
  } else if (pathSegments[0] === 'store' && pathSegments[1]) {
    const store = availableStores.value.find(s => s.id === pathSegments[1])
    const storeName = store?.name || 'Store'
    crumbs.push({ label: storeName, to: `/store/${pathSegments[1]}` })
    
    if (pathSegments[2]) {
      const label = pathSegments[2].charAt(0).toUpperCase() + pathSegments[2].slice(1)
      crumbs.push({ label })
    }
  } else {
    // Default breadcrumb handling
    pathSegments.forEach((segment, index) => {
      const label = segment.charAt(0).toUpperCase() + segment.slice(1)
      const isLast = index === pathSegments.length - 1
      const to = isLast ? undefined : '/' + pathSegments.slice(0, index + 1).join('/')
      crumbs.push({ label, to })
    })
  }
  
  return crumbs
})

// Methods
function toggleSidebarCollapsed() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function handleToggleNotifications() {
  notificationPanelOpen.value = !notificationPanelOpen.value
}

function closeNotificationPanel() {
  notificationPanelOpen.value = false
}

function handleSearchResultSelected(result: NavigationSearchResult) {
  // Handle search result selection
  if (result.item.to) {
    router.push(result.item.to)
  }
}

function handleStoreSelected(store: StoreOption) {
  // Handle store selection - in real app, this would update auth store
  console.log('Store selected:', store)
  closeMobileMenu()
}

function handlePlatformSelected() {
  // Handle platform selection
  router.push('/platform')
  closeMobileMenu()
}

// Persist sidebar collapsed state
onMounted(() => {
  const saved = localStorage.getItem('sidebar-collapsed')
  if (saved) {
    sidebarCollapsed.value = JSON.parse(saved)
  }
})

watch(sidebarCollapsed, (collapsed) => {
  localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed))
})

// Close mobile menu on route change
watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8fafc;
}

.app-layout__main {
  flex: 1;
  margin-top: 64px; /* Header height */
  margin-left: 280px; /* Sidebar width */
  transition: margin-left 0.3s ease-in-out;
  position: relative;
  z-index: 10;
}

.app-layout__main--sidebar-collapsed {
  margin-left: 72px; /* Collapsed sidebar width */
}

/* Breadcrumbs */
.app-layout__breadcrumbs {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 24px;
}

.app-layout__breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-layout__breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-layout__breadcrumb-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
}

.app-layout__breadcrumb-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.app-layout__breadcrumb-current {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
}

.app-layout__breadcrumb-current--disabled {
  color: #9ca3af;
}

.app-layout__breadcrumb-separator {
  color: #d1d5db;
  font-weight: 500;
  user-select: none;
}

/* Content */
.app-layout__content {
  flex: 1;
  padding: 24px;
  min-height: calc(100vh - 64px - 49px); /* Viewport - header - breadcrumbs */
}

/* Notification panel */
.app-layout__notification-panel {
  position: fixed;
  top: 64px; /* Header height */
  right: 0;
  bottom: 0;
  width: 380px;
  background: white;
  border-left: 1px solid #e5e7eb;
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.app-layout__notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.app-layout__notification-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.app-layout__notification-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
}

.app-layout__notification-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.app-layout__notification-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.app-layout__notification-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 14px;
}

.app-layout__notification-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 40;
}

/* Notification panel animations */
.notification-panel-enter-active,
.notification-panel-leave-active {
  transition: all 0.3s ease-in-out;
}

.notification-panel-enter-from,
.notification-panel-leave-to {
  transform: translateX(100%);
}

/* Mobile styles */
@media (max-width: 768px) {
  .app-layout__main {
    margin-left: 0;
    margin-top: 64px;
  }

  .app-layout__main--sidebar-collapsed {
    margin-left: 0;
  }

  .app-layout__main--mobile-menu-open {
    /* Prevent scrolling when mobile menu is open */
    overflow: hidden;
  }

  .app-layout__breadcrumbs {
    padding: 12px 16px;
  }

  .app-layout__content {
    padding: 16px;
    min-height: calc(100vh - 64px - 45px); /* Adjusted for mobile */
  }

  .app-layout__notification-panel {
    width: 100%;
    top: 0;
  }

  .app-layout__notification-header {
    padding-top: 80px; /* Account for mobile header */
  }
}

/* Print styles */
@media print {
  .app-layout__main {
    margin-left: 0 !important;
    margin-top: 0 !important;
  }
  
  .app-layout__breadcrumbs {
    display: none;
  }
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->