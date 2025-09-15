<template>
  <div class="unauthorized-container">
    <div class="unauthorized-card">
      <!-- Header -->
      <div class="unauthorized-header">
        <div class="error-icon">
          <CIcon name="warning-2" size="4rem"
color="red.500" />
        </div>
        <h1 class="error-title">Access Denied</h1>
      </div>

      <!-- Content -->
      <div class="unauthorized-content">
        <!-- Error Message -->
        <div class="error-message">
          <h2 class="message-title">{{ messageTitle }}</h2>
          <p class="message-description">{{ messageDescription }}</p>
        </div>

        <!-- Context Information -->
        <div v-if="showContext" class="context-info">
          <!-- Role Requirements -->
          <CAlert v-if="requiredRoles && requiredRoles.length > 0" status="info"
variant="subtle">
            <CAlertIcon />
            <CAlertTitle>Required Roles</CAlertTitle>
            <CAlertDescription>
              This page requires one of the following roles:
              <CTag
                v-for="role in requiredRoles"
                :key="role"
                size="sm"
                color-scheme="blue"
                variant="subtle"
                ml="1"
              >
                {{ formatRoleName(role) }}
              </CTag>
            </CAlertDescription>
          </CAlert>

          <!-- Current Roles -->
          <CAlert v-if="currentRoles && currentRoles.length > 0" status="warning"
variant="subtle">
            <CAlertIcon />
            <CAlertTitle>Your Current Roles</CAlertTitle>
            <CAlertDescription>
              You currently have the following roles:
              <CTag
                v-for="role in currentRoles"
                :key="role"
                size="sm"
                color-scheme="orange"
                variant="subtle"
                ml="1"
              >
                {{ formatRoleName(role) }}
              </CTag>
            </CAlertDescription>
          </CAlert>

          <!-- Store Information -->
          <CAlert v-if="storeId" status="error"
variant="subtle">
            <CAlertIcon />
            <CAlertTitle>Store Access Required</CAlertTitle>
            <CAlertDescription>
              Access to store <CCode>{{ storeId }}</CCode> is required for this page.
            </CAlertDescription>
          </CAlert>

          <!-- Available Stores -->
          <div v-if="availableStores && availableStores.length > 0" class="store-selection">
            <CText font-weight="semibold"
mb="2">Available Stores:</CText>
            <div class="store-list">
              <CButton
                v-for="store in availableStores"
                :key="store.id"
                size="sm"
                variant="outline"
                color-scheme="blue"
                @click="selectStore(store.id)"
              >
                {{ store.name }}
              </CButton>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="unauthorized-actions">
          <!-- Primary Actions -->
          <div class="primary-actions">
            <CButton v-if="canGoBack" size="lg"
color-scheme="blue" @click="goBack">
              <CIcon name="arrow-back"
mr="2" />
              Go Back
            </CButton>

            <CButton v-else size="lg"
color-scheme="blue" @click="goToDashboard">
              <CIcon name="home"
mr="2" />
              Go to Dashboard
            </CButton>
          </div>

          <!-- Secondary Actions -->
          <div class="secondary-actions">
            <CButton v-if="!isAuthenticated" variant="outline"
size="lg" @click="goToLogin">
              <CIcon name="lock"
mr="2" />
              Sign In
            </CButton>

            <CButton
              v-if="availableStores && availableStores.length > 1"
              variant="outline"
              size="lg"
              @click="goToStoreSelection"
            >
              <CIcon name="building-store"
mr="2" />
              Select Store
            </CButton>

            <CButton variant="ghost" size="lg"
@click="contactSupport">
              <CIcon name="question"
mr="2" />
              Contact Support
            </CButton>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="unauthorized-footer">
        <CText font-size="sm"
color="gray.600" text-align="center">
          If you believe this is an error, please contact your administrator.
        </CText>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import {
    CButton,
    CAlert,
    CAlertIcon,
    CAlertTitle,
    CAlertDescription,
    CText,
    CIcon,
    CTag,
    CCode,
  } from '@chakra-ui/vue-next'
  import { useAuth } from '@/composables/useAuth'
  import type { RoleName } from '@/types/auth'
  import { logger } from '@/utils/logger'

  /**
   * Unauthorized Access Page Component
   * Displays context-aware error messages and provides appropriate navigation options
   */

  const router = useRouter()
  const route = useRoute()

  // Authentication composable
  const { isAuthenticated, roles, availableStores: userStores, setSelectedStore } = useAuth()

  // Extract query parameters
  const reason = computed(() => route.query.reason as string)
  const requiredRolesParam = computed(() => route.query.requiredRoles as string)
  const storeId = computed(() => route.query.storeId as string)
  const fromPath = computed(() => route.query.from as string)
  const customMessage = computed(() => route.query.message as string)

  // Parse required roles
  const requiredRoles = computed(() => {
    if (!requiredRolesParam.value) return []
    return requiredRolesParam.value.split(',') as RoleName[]
  })

  // Get current user roles
  const currentRoles = computed(() => roles.value)

  // Get available stores
  const availableStores = computed(() => {
    return userStores.value.map(store => ({
      id: store.storeId,
      name: store.storeName,
    }))
  })

  // Check if we can go back
  const canGoBack = computed(() => {
    return fromPath.value && fromPath.value !== route.path
  })

  // Show context information
  const showContext = computed(() => {
    return (
      requiredRoles.value.length > 0 ||
      currentRoles.value.length > 0 ||
      storeId.value ||
      availableStores.value.length > 0
    )
  })

  // Dynamic message based on reason
  const messageTitle = computed(() => {
    switch (reason.value) {
      case 'insufficient_roles':
        return 'Insufficient Permissions'
      case 'platform_admin_required':
        return 'Platform Administrator Access Required'
      case 'store_access_denied':
        return 'Store Access Denied'
      case 'no_store_access':
        return 'No Store Access'
      case 'store_selection_required':
        return 'Store Selection Required'
      default:
        return 'Access Denied'
    }
  })

  const messageDescription = computed(() => {
    if (customMessage.value) {
      return customMessage.value
    }

    switch (reason.value) {
      case 'insufficient_roles':
        return 'You do not have the required permissions to access this page. Please contact your administrator if you believe this is an error.'
      case 'platform_admin_required':
        return 'This page is restricted to platform administrators only. You need platform-level access to view this content.'
      case 'store_access_denied':
        return 'You do not have access to the requested store. Please select a store you have access to or contact your administrator.'
      case 'no_store_access':
        return 'You do not have access to any stores. Please contact your administrator to be granted store access.'
      case 'store_selection_required':
        return 'Please select a store to access store-specific features. You can choose from the available stores below.'
      default:
        return 'You do not have permission to access this page. Please check your access level or contact your administrator.'
    }
  })

  /**
   * Format role name for display
   */
  function formatRoleName(role: string): string {
    return role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Select a store and redirect
   */
  function selectStore(selectedStoreId: string): void {
    try {
      setSelectedStore(selectedStoreId)

      logger.info('Store selected from unauthorized page', { selectedStoreId })

      // Try to redirect to the original path if it exists
      if (fromPath.value && fromPath.value !== route.path) {
        router.replace(fromPath.value)
      } else {
        goToDashboard()
      }
    } catch (error) {
      logger.error('Failed to select store:', error)
      // Still redirect to dashboard on error
      goToDashboard()
    }
  }

  /**
   * Go back to previous page
   */
  function goBack(): void {
    if (fromPath.value && fromPath.value !== route.path) {
      router.replace(fromPath.value)
    } else {
      router.go(-1)
    }
  }

  /**
   * Go to dashboard
   */
  function goToDashboard(): void {
    router.replace('/dashboard')
  }

  /**
   * Go to login page
   */
  function goToLogin(): void {
    router.replace({
      name: 'Login',
      query: {
        redirect: fromPath.value || '/dashboard',
        reason: 'authentication_required',
      },
    })
  }

  /**
   * Go to store selection page
   */
  function goToStoreSelection(): void {
    router.replace({
      name: 'StoreSelection',
      query: {
        redirect: fromPath.value || '/dashboard',
      },
    })
  }

  /**
   * Contact support (placeholder)
   */
  function contactSupport(): void {
    // For now, this could open a mailto link or external support system
    const supportEmail = 'support@gocommerce.example.com'
    const subject = encodeURIComponent('Access Issue - GO Commerce Admin Console')
    const body = encodeURIComponent(
      `
Hello Support Team,

I encountered an access issue on the GO Commerce Administration Console.

Details:
- Page: ${fromPath.value || 'Unknown'}
- Reason: ${reason.value || 'Unknown'}
- User Roles: ${currentRoles.value.join(', ') || 'None'}
- Required Roles: ${requiredRoles.value.join(', ') || 'None'}

Please help resolve this access issue.

Thank you.
  `.trim()
    )

    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`)
  }

  // Log unauthorized access attempt
  onMounted(() => {
    logger.warn('Unauthorized access attempt', {
      reason: reason.value,
      fromPath: fromPath.value,
      requiredRoles: requiredRoles.value,
      currentRoles: currentRoles.value,
      storeId: storeId.value,
      isAuthenticated: isAuthenticated.value,
    })
  })
</script>

<style scoped>
  .unauthorized-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
    padding: 1rem;
  }

  .unauthorized-card {
    background: white;
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 600px;
    overflow: hidden;
  }

  .unauthorized-header {
    padding: 3rem 2rem 2rem;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
  }

  .error-icon {
    margin-bottom: 1.5rem;
  }

  .error-title {
    font-size: 2rem;
    font-weight: 700;
    color: #e53e3e;
    margin: 0;
  }

  .unauthorized-content {
    padding: 2rem;
  }

  .error-message {
    text-align: center;
    margin-bottom: 2rem;
  }

  .message-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 1rem 0;
  }

  .message-description {
    color: #718096;
    line-height: 1.6;
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .context-info {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .store-selection {
    padding: 1rem;
    background-color: #f7fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .store-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .unauthorized-actions {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .primary-actions,
  .secondary-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .unauthorized-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e2e8f0;
    background-color: #f7fafc;
    text-align: center;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .unauthorized-container {
      padding: 0.5rem;
    }

    .unauthorized-card {
      max-width: 100%;
    }

    .unauthorized-header {
      padding: 2rem 1.5rem 1.5rem;
    }

    .unauthorized-content {
      padding: 1.5rem;
    }

    .error-title {
      font-size: 1.5rem;
    }

    .message-title {
      font-size: 1.25rem;
    }

    .primary-actions,
    .secondary-actions {
      flex-direction: column;
      width: 100%;
    }

    .primary-actions :deep(.chakra-button),
    .secondary-actions :deep(.chakra-button) {
      width: 100%;
    }
  }

  /* Animation */
  .unauthorized-card {
    animation: slideIn 0.6s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Button hover effects */
  .unauthorized-actions :deep(.chakra-button:hover:not([disabled])) {
    transform: translateY(-1px);
    transition: all 0.2s ease-in-out;
  }

  .store-list :deep(.chakra-button:hover:not([disabled])) {
    transform: translateY(-1px);
    transition: all 0.2s ease-in-out;
  }

  /* Focus styles */
  .unauthorized-actions :deep(.chakra-button:focus),
  .store-list :deep(.chakra-button:focus) {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.6);
  }

  /* Alert spacing */
  .context-info :deep(.chakra-alert) {
    text-align: left;
  }

  .context-info :deep(.chakra-alert-description) {
    margin-top: 0.5rem;
  }

  .context-info :deep(.chakra-tag) {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
