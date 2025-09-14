<template>
  <div
    :class="[
      'navigation-item',
      {
        'navigation-item--expanded': expanded,
        'navigation-item--has-children': hasChildren,
        'navigation-item--active': isActive
      }
    ]"
  >
    <NavLink
      :to="item.to"
      :icon="item.icon"
      :label="item.label"
      :badge="item.badge"
      :disabled="item.disabled || !hasPermission"
      :class="[
        'navigation-item__link',
        {
          'navigation-item__link--parent': hasChildren
        }
      ]"
      @click="handleClick"
    >
      <template v-if="hasChildren">
        <span class="navigation-item__expand-icon">
          <ChevronDownIcon v-if="expanded" />
          <ChevronRightIcon v-else />
        </span>
      </template>
    </NavLink>

    <!-- Sub-navigation items -->
    <Transition name="slide-down">
      <div v-if="hasChildren && expanded" class="navigation-item__children">
        <NavigationItem
          v-for="child in item.children"
          :key="child.id || child.label"
          :item="child"
          :current-user="currentUser"
          :current-store-id="currentStoreId"
          class="navigation-item__child"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import NavLink from '@/components/atoms/NavLink.vue'
import ChevronDownIcon from '@/components/atoms/icons/ChevronDownIcon.vue'
import ChevronRightIcon from '@/components/atoms/icons/ChevronRightIcon.vue'
import type { NavigationItemType, UserProfile } from '@/types/navigation'

/**
 * NavigationItem - Molecular component for navigation menu items
 * 
 * Features:
 * - Role-based visibility and permission checking
 * - Hierarchical navigation with expand/collapse
 * - Active state detection for current route
 * - Store context awareness
 * - Responsive design
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

interface Props {
  /** Navigation item configuration */
  item: NavigationItemType
  /** Current authenticated user */
  currentUser?: UserProfile | null
  /** Current store ID for store-scoped items */
  currentStoreId?: string
  /** Force expanded state */
  forceExpanded?: boolean
}

const props = defineProps<Props>()

const route = useRoute()
const { hasRole, canAccessStore } = useAuth()

// Local state for expansion
const expanded = ref(false)

// Computed properties
const hasChildren = computed(() => 
  props.item.children && props.item.children.length > 0
)

const hasPermission = computed(() => {
  // Check if item requires specific roles
  if (props.item.requiredRoles && props.item.requiredRoles.length > 0) {
    const hasRequiredRole = props.item.requiredRoles.some(role => hasRole(role))
    if (!hasRequiredRole) return false
  }

  // Check store access for store-scoped items
  if (props.item.scope === 'store' && props.currentStoreId) {
    return canAccessStore(props.currentStoreId)
  }

  // Platform-scoped items require platform-admin role
  if (props.item.scope === 'platform') {
    return hasRole('platform-admin')
  }

  return true
})

const isActive = computed(() => {
  if (!props.item.to) return false
  
  const currentPath = route.path
  
  // Check if current item is active
  if (typeof props.item.to === 'string') {
    if (currentPath === props.item.to) return true
    if (props.item.exactMatch === false && currentPath.startsWith(props.item.to)) {
      return true
    }
  }
  
  // Check if any child item is active
  if (hasChildren.value && props.item.children) {
    return props.item.children.some(child => {
      if (typeof child.to === 'string') {
        if (currentPath === child.to) return true
        if (child.exactMatch === false && currentPath.startsWith(child.to)) {
          return true
        }
      }
      return false
    })
  }
  
  return false
})

// Methods
function handleClick() {
  if (hasChildren.value) {
    expanded.value = !expanded.value
  }
}

// Auto-expand if active item is child
if (isActive.value && hasChildren.value) {
  expanded.value = true
}
</script>

<style scoped>
.navigation-item {
  margin-bottom: 2px;
}

.navigation-item__link {
  width: 100%;
  justify-content: flex-start;
  position: relative;
}

.navigation-item__link--parent {
  padding-right: 40px;
}

.navigation-item__expand-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  transition: color 0.2s ease-in-out;
}

.navigation-item:hover .navigation-item__expand-icon {
  color: #64748b;
}

.navigation-item--active > .navigation-item__link .navigation-item__expand-icon {
  color: #1d4ed8;
}

.navigation-item__children {
  margin-left: 12px;
  border-left: 1px solid #e2e8f0;
  padding-left: 12px;
  margin-top: 4px;
}

.navigation-item__child {
  margin-bottom: 1px;
}

.navigation-item__child .navigation-item__link {
  font-size: 13px;
  padding: 6px 12px;
  min-height: 32px;
}

/* Hide items without permission */
.navigation-item:has(.nav-link--disabled) {
  display: none;
}

/* Slide down animation for children */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .navigation-item__children {
    margin-left: 8px;
    padding-left: 8px;
  }
  
  .navigation-item__child .navigation-item__link {
    padding: 10px 12px;
    min-height: 40px;
  }
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->