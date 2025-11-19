<template>
  <div class="logout-container">
    <div class="logout-card">
      <!-- Logo and Title -->
      <div class="logout-header">
        <div class="logo">
          <h1 class="logo-text">GO Commerce</h1>
          <p class="logo-subtitle">Administration Console</p>
        </div>
      </div>

      <!-- Logout Content -->
      <div class="logout-content">
        <!-- Loading State -->
        <div v-if="isLoggingOut" class="logout-loading">
          <NSpin size="large" />
          <h2 class="logout-title">Signing Out...</h2>
          <p class="logout-description">Please wait while we securely log you out.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="logoutComplete" class="logout-success">
          <div class="success-icon">
            <NIcon size="48" color="#10b981">
              <CheckCircle />
            </NIcon>
          </div>
          <h2 class="logout-title">Signed Out Successfully</h2>
          <p class="logout-description">
            You have been securely logged out from GO Commerce Administration Console.
          </p>

          <div class="logout-actions">
            <NButton type="primary" size="large" @click="goToLogin">
              <template #icon>
                <NIcon><ArrowRight /></NIcon>
              </template>
              Sign In Again
            </NButton>

            <NButton quaternary size="large" @click="goToHome">
              Go to Homepage
            </NButton>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="logout-error">
          <div class="error-icon">
            <NIcon size="48" color="#f87171">
              <ExclamationTriangle />
            </NIcon>
          </div>
          <h2 class="logout-title">Logout Error</h2>
          <p class="logout-description">
            {{ error }}
          </p>

          <div class="logout-actions">
            <NButton type="error" size="large" :loading="isLoggingOut" @click="retryLogout">
              <template #icon>
                <NIcon><Repeat /></NIcon>
              </template>
              Try Again
            </NButton>

            <NButton quaternary size="large" @click="forceLogout">
              Clear Session & Go to Login
            </NButton>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="logout-footer">
        <NText size="small" depth="3" style="text-align: center;">
          © {{ currentYear }} GO Commerce Platform. All rights reserved.
        </NText>
      </div>
    </div>

    <!-- Background Pattern -->
    <div class="background-pattern" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { NSpin, NButton, NText, NIcon } from 'naive-ui'
  import { CheckCircle, ArrowRight, ExclamationTriangle, Repeat } from '@vicons/tabler'
  import { useAuth } from '@/composables/useAuth'
  import { logger } from '@/utils/logger'

  /**
   * Logout Page Component
   * Handles user logout with proper state management and user feedback
   */

  const router = useRouter()

  // Authentication composable
  const { logout, isAuthenticated } = useAuth()

  // Local state
  const isLoggingOut = ref(false)
  const logoutComplete = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const currentYear = computed(() => new Date().getFullYear())

  /**
   * Perform logout operation
   */
  async function performLogout(): Promise<void> {
    try {
      isLoggingOut.value = true
      error.value = null

      logger.info('Initiating logout process')

      // Perform logout
      await logout()

      // Set success state
      logoutComplete.value = true
      logger.info('Logout completed successfully')
    } catch (err: any) {
      error.value = err?.message || 'Failed to logout properly. Please try again.'
      logger.error('Logout failed:', err)
    } finally {
      isLoggingOut.value = false
    }
  }

  /**
   * Retry logout operation
   */
  async function retryLogout(): Promise<void> {
    await performLogout()
  }

  /**
   * Force logout by clearing local state
   */
  function forceLogout(): void {
    logger.info('Forcing logout - clearing local state')

    try {
      // Clear any local storage or session data
      localStorage.clear()
      sessionStorage.clear()

      // Navigate to login
      goToLogin()
    } catch (err) {
      logger.error('Error during force logout:', err)
      // Still navigate even if clearing fails
      goToLogin()
    }
  }

  /**
   * Navigate to login page
   */
  function goToLogin(): void {
    router.replace({
      name: 'Login',
      query: {
        reason: 'logout_complete',
      },
    })
  }

  /**
   * Navigate to homepage
   */
  function goToHome(): void {
    // For now, redirect to the origin or a public homepage
    window.location.href = window.location.origin
  }

  /**
   * Check initial authentication state and perform logout
   */
  function initializeLogout(): void {
    if (isAuthenticated.value) {
      // User is authenticated, perform logout
      performLogout()
    } else {
      // User is already logged out, show success message
      logoutComplete.value = true
      logger.info('User was already logged out')
    }
  }

  // Initialize on mount
  onMounted(() => {
    // Small delay to allow for proper initialization
    setTimeout(() => {
      initializeLogout()
    }, 500)
  })
</script>

<style scoped>
  .logout-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
    position: relative;
    overflow: hidden;
  }

  .background-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    background-image:
      radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
      radial-gradient(circle at 75% 75%, white 2px, transparent 2px);
    background-size: 50px 50px;
    background-position:
      0 0,
      25px 25px;
  }

  .logout-card {
    background: white;
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 500px;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .logout-header {
    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
    color: white;
    padding: 2rem;
    text-align: center;
  }

  .logo-text {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    letter-spacing: -0.025em;
  }

  .logo-subtitle {
    font-size: 0.875rem;
    margin: 0;
    opacity: 0.9;
    font-weight: 500;
  }

  .logout-content {
    padding: 3rem 2rem;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .logout-loading,
  .logout-success,
  .logout-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .logout-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: #2d3748;
  }

  .logout-description {
    color: #718096;
    margin: 0;
    line-height: 1.5;
    max-width: 400px;
  }

  .success-icon,
  .error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .logout-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 300px;
  }

  .logout-footer {
    padding: 1rem 2rem;
    border-top: 1px solid #e2e8f0;
    background-color: #f7fafc;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .logout-container {
      padding: 0.5rem;
    }

    .logout-card {
      max-width: 100%;
    }

    .logout-header {
      padding: 1.5rem;
    }

    .logout-content {
      padding: 2rem 1.5rem;
    }

    .logo-text {
      font-size: 1.5rem;
    }
  }

  /* Animations */
  .logout-loading {
    animation: fadeIn 0.5s ease-in-out;
  }

  .logout-success {
    animation: slideIn 0.6s ease-out;
  }

  .logout-error {
    animation: slideIn 0.6s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Button animations */
  .logout-actions :deep(.n-button:hover:not(.n-button--disabled)) {
    transform: translateY(-1px);
    transition: all 0.2s ease-in-out;
  }

  .logout-actions :deep(.n-button:active) {
    transform: translateY(0);
  }

  /* Focus styles */
  .logout-actions :deep(.n-button:focus-visible) {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.6);
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
