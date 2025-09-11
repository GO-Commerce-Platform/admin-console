<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">GO Commerce Admin Dashboard</h1>
      <p class="dashboard-subtitle">Welcome to the administration console</p>
    </div>

    <div class="dashboard-content">
      <!-- User Info Card -->
      <c-box 
        bg="white" 
        p="6" 
        rounded="lg" 
        shadow="md" 
        border-width="1px"
        border-color="gray.200"
      >
        <c-heading size="md" mb="4">User Information</c-heading>
        <c-vstack align="start" spacing="2">
          <c-text><strong>Name:</strong> {{ user?.firstName }} {{ user?.lastName }}</c-text>
          <c-text><strong>Email:</strong> {{ user?.email }}</c-text>
          <c-text><strong>Roles:</strong> 
            <c-tag 
              v-for="role in roles" 
              :key="role" 
              size="sm" 
              color-scheme="blue" 
              variant="subtle" 
              ml="1"
            >
              {{ formatRoleName(role) }}
            </c-tag>
          </c-text>
          <c-text v-if="selectedStoreName">
            <strong>Selected Store:</strong> {{ selectedStoreName }}
          </c-text>
          <c-text v-else-if="isPlatformAdmin">
            <strong>Access Level:</strong> Platform Administrator
          </c-text>
        </c-vstack>
      </c-box>

      <!-- Quick Actions -->
      <c-box 
        bg="white" 
        p="6" 
        rounded="lg" 
        shadow="md" 
        border-width="1px"
        border-color="gray.200"
        mt="6"
      >
        <c-heading size="md" mb="4">Quick Actions</c-heading>
        <c-wrap spacing="4">
          <!-- Platform Admin Actions -->
          <template v-if="isPlatformAdmin">
            <c-wrapitem>
              <c-button color-scheme="blue" @click="navigateTo('/platform/dashboard')">
                Platform Dashboard
              </c-button>
            </c-wrapitem>
            <c-wrapitem>
              <c-button variant="outline" @click="navigateTo('/platform/stores')">
                Manage Stores
              </c-button>
            </c-wrapitem>
            <c-wrapitem>
              <c-button variant="outline" @click="navigateTo('/platform/users')">
                Manage Users
              </c-button>
            </c-wrapitem>
          </template>

          <!-- Store Admin Actions -->
          <template v-else-if="selectedStoreId">
            <c-wrapitem>
              <c-button color-scheme="green" @click="navigateToStore('dashboard')">
                Store Dashboard
              </c-button>
            </c-wrapitem>
            <c-wrapitem v-if="canManageProducts">
              <c-button variant="outline" @click="navigateToStore('products')">
                Manage Products
              </c-button>
            </c-wrapitem>
            <c-wrapitem v-if="canManageOrders">
              <c-button variant="outline" @click="navigateToStore('orders')">
                Manage Orders
              </c-button>
            </c-wrapitem>
            <c-wrapitem v-if="canManageCustomers">
              <c-button variant="outline" @click="navigateToStore('customers')">
                Manage Customers
              </c-button>
            </c-wrapitem>
          </template>

          <!-- Store Selection -->
          <template v-else-if="availableStores.length > 1">
            <c-wrapitem>
              <c-button color-scheme="purple" @click="navigateTo('/store-selection')">
                Select Store
              </c-button>
            </c-wrapitem>
          </template>

          <!-- Logout Action -->
          <c-wrapitem>
            <c-button variant="ghost" color-scheme="red" @click="handleLogout">
              Sign Out
            </c-button>
          </c-wrapitem>
        </c-wrap>
      </c-box>

      <!-- Debug Info (Development Only) -->
      <c-box 
        v-if="isDevelopment" 
        bg="gray.50" 
        p="4" 
        rounded="lg" 
        border-width="1px"
        border-color="gray.200"
        mt="6"
      >
        <c-heading size="sm" mb="3" color="gray.600">Debug Information</c-heading>
        <c-accordion allow-toggle>
          <c-accordion-item>
            <c-accordion-button>
              <c-box flex="1" text-align="left">
                Authentication Status
              </c-box>
              <c-accordion-icon />
            </c-accordion-button>
            <c-accordion-panel pb="4">
              <pre>{{ JSON.stringify(debugStatus, null, 2) }}</pre>
            </c-accordion-panel>
          </c-accordion-item>
        </c-accordion>
      </c-box>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  CBox,
  CHeading,
  CText,
  CButton,
  CVStack,
  CTag,
  CWrap,
  CWrapItem,
  CAccordion,
  CAccordionItem,
  CAccordionButton,
  CAccordionPanel,
  CAccordionIcon,
} from '@chakra-ui/vue-next';
import { 
  useAuth, 
  useProductManager, 
  useOrderManager, 
  useCustomerService 
} from '@/composables/useAuth';

/**
 * Dashboard Page Component
 * Main dashboard for authenticated users with role-based quick actions
 * 
 * Related GitHub Issue: #2 - Authentication System & Security
 */

const router = useRouter();

// Authentication composables
const { 
  user, 
  roles, 
  selectedStoreId, 
  selectedStoreName, 
  availableStores,
  isPlatformAdmin,
  logout,
  getDebugStatus 
} = useAuth();

// Role-specific composables
const { canManageProducts } = useProductManager();
const { canManageOrders } = useOrderManager();
const { canManageCustomers } = useCustomerService();

// Computed properties
const isDevelopment = computed(() => import.meta.env.DEV);
const debugStatus = computed(() => getDebugStatus());

/**
 * Format role name for display
 */
function formatRoleName(role: string): string {
  return role
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Navigate to a specific route
 */
function navigateTo(path: string): void {
  router.push(path);
}

/**
 * Navigate to store-scoped route
 */
function navigateToStore(section: string): void {
  if (selectedStoreId.value) {
    router.push(`/store/${selectedStoreId.value}/${section}`);
  }
}

/**
 * Handle logout
 */
async function handleLogout(): Promise<void> {
  try {
    await logout();
    // Navigation will be handled by the logout process
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  padding: 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-subtitle {
    font-size: 1rem;
  }
}

/* Debug panel styling */
:deep(.chakra-accordion-panel pre) {
  font-size: 0.75rem;
  color: #4a5568;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
