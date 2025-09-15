<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- Left section: Logo and mobile menu toggle -->
      <div class="app-header__left">
        <!-- Mobile menu toggle -->
        <button
          class="app-header__mobile-toggle"
          @click="toggleMobileMenu"
          @keydown="handleMobileToggleKeydown"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
        >
          <span class="app-header__mobile-toggle-icon">
            <span />
            <span />
            <span />
          </span>
        </button>

        <!-- Logo -->
        <router-link to="/"
class="app-header__logo">
          <div class="app-header__logo-icon">
            <span class="app-header__logo-text">GO</span>
          </div>
          <div class="app-header__logo-title">
            <span class="app-header__logo-brand">Commerce</span>
            <span class="app-header__logo-subtitle">Admin Console</span>
          </div>
        </router-link>
      </div>

      <!-- Center section: Search (desktop only) -->
      <div v-if="!isMobile"
class="app-header__center">
        <div class="app-header__search">
          <div class="app-header__search-input-wrapper">
            <input
              v-model="searchQuery"
              type="text"
              class="app-header__search-input"
              placeholder="Search navigation, orders, customers..."
              @focus="showSearchResults = true"
              @blur="hideSearchResults"
              @input="handleSearchInput"
            />
            <div class="app-header__search-icon">🔍</div>
          </div>

          <!-- Search results dropdown -->
          <Transition name="search-dropdown">
            <div
              v-if="showSearchResults && (searchResults.length > 0 || searchQuery)"
              class="app-header__search-results"
            >
              <div v-if="searchResults.length > 0"
class="app-header__search-results-list">
                <div
                  v-for="result in searchResults"
                  :key="result.item.id || result.item.label"
                  class="app-header__search-result-item"
                  @mousedown="selectSearchResult(result)"
                >
                  <div class="app-header__search-result-content">
                    <div class="app-header__search-result-title" v-html="result.highlightedLabel" />
                    <div class="app-header__search-result-section">{{ result.section.title }}</div>
                  </div>
                </div>
              </div>
              <div v-else-if="searchQuery"
class="app-header__search-no-results">
                No results found for "{{ searchQuery }}"
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Right section: Notifications and user menu -->
      <div class="app-header__right">
        <!-- Notifications -->
        <button
          class="app-header__notification-button"
          @click="toggleNotifications"
          @keydown="handleNotificationKeydown"
          :aria-expanded="notificationsOpen"
          aria-label="View notifications"
        >
          <div class="app-header__notification-icon">
            🔔
            <span v-if="effectiveUnreadCount > 0" class="app-header__notification-badge">
              {{ effectiveUnreadCount > 99 ? '99+' : effectiveUnreadCount }}
            </span>
          </div>
        </button>

        <!-- User menu -->
        <div class="app-header__user-menu">
          <button
            class="app-header__user-button"
            @click="toggleUserMenu"
            @keydown="handleUserMenuKeydown"
            :aria-expanded="userMenuOpen"
            :aria-haspopup="true"
            aria-label="User menu"
          >
            <div class="app-header__user-avatar">
              {{ userInitials }}
            </div>
            <div v-if="!isMobile"
class="app-header__user-info">
              <div class="app-header__user-name">{{ userName }}</div>
              <div class="app-header__user-role">{{ userRole }}</div>
            </div>
            <ChevronDownIcon class="app-header__user-chevron" />
          </button>

          <!-- User menu dropdown -->
          <Transition name="user-menu">
            <div v-if="userMenuOpen"
class="app-header__user-dropdown">
              <div class="app-header__user-dropdown-header">
                <div class="app-header__user-dropdown-avatar">{{ userInitials }}</div>
                <div class="app-header__user-dropdown-info">
                  <div class="app-header__user-dropdown-name">{{ userName }}</div>
                  <div class="app-header__user-dropdown-email">{{ user?.email }}</div>
                </div>
              </div>

              <div class="app-header__user-dropdown-menu">
                <NavLink to="/profile" class="app-header__user-menu-item"
@click="closeUserMenu">
                  <span class="app-header__user-menu-icon">👤</span>
                  Profile Settings
                </NavLink>

                <NavLink
                  v-if="isPlatformAdmin"
                  to="/platform"
                  class="app-header__user-menu-item"
                  @click="closeUserMenu"
                >
                  <span class="app-header__user-menu-icon">⚡</span>
                  Platform Admin
                </NavLink>

                <button
                  class="app-header__user-menu-item app-header__user-menu-item--button"
                  @click="handleLogout"
                >
                  <span class="app-header__user-menu-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { useNotifications } from '@/composables/useNotifications'
  import NavLink from '@/components/atoms/NavLink.vue'
  import ChevronDownIcon from '@/components/atoms/icons/ChevronDownIcon.vue'
  import type { NavigationSearchResult, NavigationConfig } from '@/types/navigation'

  /**
   * AppHeader - Main application header component
   *
   * Features:
   * - Logo and branding
   * - Global search with navigation results
   * - Notification center
   * - User profile menu with logout
   * - Mobile-responsive design
   * - Accessibility support
   *
   * Related GitHub Issue: #3 - Layout, Navigation & Routing System
   */

  interface Props {
    /** Whether mobile menu is open */
    mobileMenuOpen?: boolean
    /** Navigation configuration for search */
    navigationConfig?: NavigationConfig
    /** Number of unread notifications */
    unreadCount?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    mobileMenuOpen: false,
    unreadCount: 0,
  })

  const emit = defineEmits<{
    'toggle-mobile-menu': []
    'toggle-notifications': []
    'search-result-selected': [result: NavigationSearchResult]
  }>()

  const router = useRouter()
  const { user, logout, isPlatformAdmin } = useAuth()
  const { unreadCount: notificationCount } = useNotifications()

  // Local state
  const searchQuery = ref('')
  const showSearchResults = ref(false)
  const searchResults = ref<NavigationSearchResult[]>([])
  const notificationsOpen = ref(false)
  const userMenuOpen = ref(false)
  const isMobile = ref(window.innerWidth <= 768)

  // Computed properties
  const effectiveUnreadCount = computed(() => {
    return props.unreadCount || notificationCount?.value || 0
  })

  const userInitials = computed(() => {
    if (!user.value) return '??'
    const firstName = user.value.firstName?.[0] || ''
    const lastName = user.value.lastName?.[0] || ''
    return (firstName + lastName).toUpperCase() || user.value.username?.[0]?.toUpperCase() || '??'
  })

  const userName = computed(() => {
    if (!user.value) return 'Unknown User'
    return (
      `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.username
    )
  })

  const userRole = computed(() => {
    if (!user.value?.roles?.length) return 'User'

    // Show the most relevant role
    const roles = user.value.roles.map(r => r.name)
    if (roles.includes('platform-admin')) return 'Platform Admin'
    if (roles.includes('store-admin')) return 'Store Admin'
    if (roles.includes('product-manager')) return 'Product Manager'
    if (roles.includes('order-manager')) return 'Order Manager'
    if (roles.includes('customer-service')) return 'Customer Service'

    return roles[0] || 'User'
  })

  // Methods
  function toggleMobileMenu() {
    emit('toggle-mobile-menu')
  }

  function toggleNotifications() {
    notificationsOpen.value = !notificationsOpen.value
    userMenuOpen.value = false
    emit('toggle-notifications')
  }

  function toggleUserMenu() {
    userMenuOpen.value = !userMenuOpen.value
    notificationsOpen.value = false
  }

  function closeUserMenu() {
    userMenuOpen.value = false
  }

  function handleSearchInput() {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }

    // Focus input after typing
    const searchInput = document.querySelector('.app-header__search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }

    // Simple search implementation - in real app, this would use a search service
    searchResults.value = performNavSearch(searchQuery.value)
  }

  function performNavSearch(query: string): NavigationSearchResult[] {
    const results: NavigationSearchResult[] = []
    const lowerQuery = query.toLowerCase()

    // This is a simplified search - in real implementation, this would be more sophisticated
    if (props.navigationConfig) {
      const allSections = [
        ...props.navigationConfig.platform,
        ...props.navigationConfig.store,
        ...props.navigationConfig.global,
      ]

      for (const section of allSections) {
        for (const item of section.items) {
          if (item.label.toLowerCase().includes(lowerQuery)) {
            const score = calculateSearchScore(item.label, query)
            const highlightedLabel = highlightSearchTerm(item.label, query)

            results.push({
              item,
              section,
              score,
              highlightedLabel,
            })
          }
        }
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 5)
  }

  function calculateSearchScore(label: string, query: string): number {
    const lowerLabel = label.toLowerCase()
    const lowerQuery = query.toLowerCase()

    if (lowerLabel === lowerQuery) return 1.0
    if (lowerLabel.startsWith(lowerQuery)) return 0.9
    if (lowerLabel.includes(` ${lowerQuery}`)) return 0.8
    if (lowerLabel.includes(lowerQuery)) return 0.7

    return 0.5
  }

  function highlightSearchTerm(label: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi')
    return label.replace(regex, '<mark>$1</mark>')
  }

  function selectSearchResult(result: NavigationSearchResult) {
    searchQuery.value = ''
    showSearchResults.value = false
    emit('search-result-selected', result)

    if (result.item.to) {
      router.push(result.item.to)
    }
  }

  function hideSearchResults() {
    // Delay hiding to allow for click events
    setTimeout(() => {
      showSearchResults.value = false
    }, 150)
  }

  async function handleLogout() {
    closeUserMenu()
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Keyboard navigation handlers
  function handleMobileToggleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleMobileMenu()
    }
  }

  function handleNotificationKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleNotifications()
    }
  }

  function handleUserMenuKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleUserMenu()
    } else if (event.key === 'Escape' && userMenuOpen.value) {
      event.preventDefault()
      closeUserMenu()
    }
  }

  // Handle clicks outside to close menus
  function handleClickOutside(event: Event) {
    const target = event.target as HTMLElement

    // Close user menu
    if (userMenuOpen.value && !target.closest('.app-header__user-menu')) {
      userMenuOpen.value = false
    }

    // Close notifications
    if (notificationsOpen.value && !target.closest('.app-header__notification-button')) {
      notificationsOpen.value = false
    }
  }

  // Handle window resize for mobile detection
  function handleResize() {
    isMobile.value = window.innerWidth <= 768
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', handleResize)
  })
</script>

<style scoped>
  .app-header {
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    height: 64px;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 40;
  }

  .app-header__container {
    width: 100%;
    max-width: none;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Left section */
  .app-header__left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .app-header__mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s ease-in-out;
  }

  .app-header__mobile-toggle:hover {
    background: #f3f4f6;
  }

  .app-header__mobile-toggle-icon {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 20px;
  }

  .app-header__mobile-toggle-icon span {
    height: 2px;
    background: #6b7280;
    border-radius: 1px;
    transition: all 0.3s ease-in-out;
  }

  .app-header__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    transition: opacity 0.2s ease-in-out;
  }

  .app-header__logo:hover {
    opacity: 0.8;
  }

  .app-header__logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 8px;
  }

  .app-header__logo-text {
    font-size: 16px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
  }

  .app-header__logo-title {
    display: flex;
    flex-direction: column;
  }

  .app-header__logo-brand {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
    letter-spacing: -0.5px;
  }

  .app-header__logo-subtitle {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    line-height: 1;
  }

  /* Center section */
  .app-header__center {
    flex: 1;
    max-width: 480px;
    position: relative;
  }

  .app-header__search {
    position: relative;
  }

  .app-header__search-input-wrapper {
    position: relative;
  }

  .app-header__search-input {
    width: 100%;
    height: 40px;
    padding: 0 44px 0 16px;
    border: 1px solid #d1d5db;
    border-radius: 20px;
    background: #f9fafb;
    font-size: 14px;
    transition: all 0.2s ease-in-out;
  }

  .app-header__search-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .app-header__search-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 16px;
  }

  .app-header__search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: 8px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    max-height: 320px;
    overflow-y: auto;
  }

  .app-header__search-results-list {
    padding: 4px 0;
  }

  .app-header__search-result-item {
    padding: 12px 16px;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    transition: background-color 0.2s ease-in-out;
  }

  .app-header__search-result-item:hover {
    background: #f3f4f6;
  }

  .app-header__search-result-title {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .app-header__search-result-title :deep(mark) {
    background: #fef3c7;
    color: #92400e;
    padding: 0 2px;
    border-radius: 2px;
  }

  .app-header__search-result-section {
    font-size: 12px;
    color: #6b7280;
  }

  .app-header__search-no-results {
    padding: 16px;
    text-align: center;
    color: #6b7280;
    font-size: 14px;
  }

  /* Right section */
  .app-header__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .app-header__notification-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s ease-in-out;
  }

  .app-header__notification-button:hover {
    background: #f3f4f6;
  }

  .app-header__notification-icon {
    position: relative;
    font-size: 20px;
  }

  .app-header__notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 600;
    border-radius: 9px;
    line-height: 1;
  }

  .app-header__user-menu {
    position: relative;
  }

  .app-header__user-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px 6px 6px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s ease-in-out;
  }

  .app-header__user-button:hover {
    background: #f3f4f6;
  }

  .app-header__user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    font-size: 14px;
    font-weight: 600;
    border-radius: 50%;
  }

  .app-header__user-info {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .app-header__user-name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.2;
  }

  .app-header__user-role {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.2;
  }

  .app-header__user-chevron {
    color: #9ca3af;
    width: 16px;
    height: 16px;
  }

  .app-header__user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 50;
    margin-top: 8px;
    width: 280px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .app-header__user-dropdown-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
  }

  .app-header__user-dropdown-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-radius: 50%;
  }

  .app-header__user-dropdown-info {
    flex: 1;
  }

  .app-header__user-dropdown-name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.3;
  }

  .app-header__user-dropdown-email {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.3;
  }

  .app-header__user-dropdown-menu {
    padding: 8px 0;
  }

  .app-header__user-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 16px;
    border: none;
    background: none;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease-in-out;
  }

  .app-header__user-menu-item:hover {
    background: #f3f4f6;
  }

  .app-header__user-menu-icon {
    font-size: 16px;
    width: 20px;
    display: flex;
    justify-content: center;
  }

  /* Animations */
  .search-dropdown-enter-active,
  .search-dropdown-leave-active {
    transition: all 0.2s ease-in-out;
  }

  .search-dropdown-enter-from,
  .search-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  .user-menu-enter-active,
  .user-menu-leave-active {
    transition: all 0.2s ease-in-out;
  }

  .user-menu-enter-from,
  .user-menu-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .app-header__container {
      padding: 0 12px;
    }

    .app-header__left {
      gap: 12px;
    }

    .app-header__logo-title {
      display: none;
    }

    .app-header__center {
      display: none;
    }

    .app-header__right {
      gap: 4px;
    }

    .app-header__user-dropdown {
      width: 260px;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
