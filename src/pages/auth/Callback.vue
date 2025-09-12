<template>
  <div class="callback-container">
    <div class="callback-content">
      <div class="spinner"></div>
      <h2 class="callback-title">Processing Authentication</h2>
      <p class="callback-description" v-if="!error">
        {{ status }}
      </p>
      <div v-if="error" class="error-content">
        <h3>Authentication Error</h3>
        <p>{{ error }}</p>
        <router-link to="/login" class="retry-button">
          Try Again
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { logger } from '@/utils/logger'

  const router = useRouter()
  const route = useRoute()
  const { handleOAuthCallback } = useAuth()

  const status = ref('Processing authentication...')
  const error = ref<string | null>(null)

  /**
   * Handle OAuth2 callback
   */
  async function processCallback(): Promise<void> {
    try {
      // Get URL parameters
      const code = route.query.code as string
      const state = route.query.state as string
      const errorParam = route.query.error as string
      const errorDescription = route.query.error_description as string

      if (errorParam) {
        throw new Error(errorDescription || errorParam)
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state parameter')
      }

      logger.info('Processing OAuth2 callback', { 
        hasCode: !!code, 
        hasState: !!state 
      })

      // Parse state to determine callback context
      let stateData: any
      try {
        stateData = JSON.parse(atob(state))
      } catch (err) {
        logger.warn('Failed to parse state parameter:', err)
        stateData = {}
      }

      // Update status
      status.value = 'Exchanging authorization code...'

      // Handle callback through auth composable
      const result = await handleOAuthCallback(code, state)

      if (result) {
        status.value = 'Authentication successful! Redirecting...'
        
        // If this was an iframe callback, notify parent window
        if (stateData.mode === 'iframe') {
          try {
            // Send success message to parent window (iframe context)
            window.parent.postMessage({
              type: 'KEYCLOAK_AUTH_SUCCESS',
              code,
              state,
              timestamp: Date.now()
            }, window.location.origin)
          } catch (err) {
            logger.debug('Failed to send message to parent window:', err)
          }
        }

        // Redirect to dashboard after short delay
        setTimeout(() => {
          const redirectTo = stateData.redirect || '/dashboard'
          router.replace(redirectTo)
        }, 1500)
      } else {
        throw new Error('Authentication failed')
      }

    } catch (err: any) {
      logger.error('OAuth2 callback processing failed:', err)
      error.value = err.message || 'Authentication failed'

      // Notify parent window of error if iframe context
      try {
        const stateData = route.query.state ? JSON.parse(atob(route.query.state as string)) : {}
        if (stateData.mode === 'iframe') {
          window.parent.postMessage({
            type: 'KEYCLOAK_AUTH_ERROR',
            error: error.value,
            timestamp: Date.now()
          }, window.location.origin)
        }
      } catch (parseErr) {
        logger.debug('Failed to notify parent window of error:', parseErr)
      }
    }
  }

  // Process callback on mount
  onMounted(() => {
    processCallback()
  })
</script>

<style scoped>
  .callback-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }

  .callback-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    padding: 3rem;
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 2rem auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .callback-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #2d3748;
  }

  .callback-description {
    color: #718096;
    margin: 0;
    line-height: 1.5;
  }

  .error-content {
    margin-top: 1rem;
  }

  .error-content h3 {
    color: #c53030;
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
  }

  .error-content p {
    color: #c53030;
    margin: 0 0 1.5rem 0;
  }

  .retry-button {
    display: inline-block;
    background: #3182ce;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
  }

  .retry-button:hover {
    background: #2b77cb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .callback-container {
      padding: 1rem;
    }

    .callback-content {
      padding: 2rem;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
