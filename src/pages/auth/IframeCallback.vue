<template>
  <div class="iframe-callback">
    <div class="processing" v-if="!completed && !error">
      <div class="spinner" />
      <p>Processing authentication...</p>
    </div>
    <div class="success" v-else-if="completed && !error">
      <div class="checkmark">✓</div>
      <p>Authentication successful!</p>
    </div>
    <div class="error" v-else-if="error">
      <div class="error-icon">✗</div>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { logger } from '@/utils/logger'

  const route = useRoute()
  const { handleOAuthCallback } = useAuth()

  const completed = ref(false)
  const error = ref<string | null>(null)

  /**
   * Process OAuth2 callback within iframe context
   */
  async function processIframeCallback(): Promise<void> {
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

      logger.info('Processing iframe OAuth2 callback', {
        hasCode: !!code,
        hasState: !!state,
      })

      // Parse state to get context
      let stateData: any = {}
      try {
        stateData = JSON.parse(atob(state))
      } catch (err) {
        logger.warn('Failed to parse state parameter:', err)
      }

      // Handle OAuth callback
      const result = await handleOAuthCallback(code, state)

      if (result) {
        completed.value = true

        // Notify parent window of successful authentication
        const message = {
          type: 'KEYCLOAK_AUTH_SUCCESS',
          code,
          state,
          timestamp: Date.now(),
          success: true,
        }

        // Send message to parent window (multiple attempts with different origins)
        const origins = [
          window.location.origin,
          'http://localhost:5173',
          '*', // Fallback, but less secure
        ]

        for (const origin of origins) {
          try {
            window.parent.postMessage(message, origin)
            logger.debug('Sent success message to parent window', { origin })
          } catch (err) {
            logger.debug('Failed to send message to origin:', { origin, error: err })
          }
        }

        // Also try with top window if different from parent
        if (window.top && window.top !== window.parent) {
          for (const origin of origins) {
            try {
              window.top.postMessage(message, origin)
              logger.debug('Sent success message to top window', { origin })
            } catch (err) {
              logger.debug('Failed to send message to top window:', { origin, error: err })
            }
          }
        }
      } else {
        throw new Error('Authentication failed')
      }
    } catch (err: any) {
      logger.error('Iframe OAuth2 callback processing failed:', err)
      error.value = err.message || 'Authentication failed'

      // Notify parent window of error
      const errorMessage = {
        type: 'KEYCLOAK_AUTH_ERROR',
        error: error.value,
        timestamp: Date.now(),
        success: false,
      }

      const origins = [window.location.origin, 'http://localhost:5173', '*']

      for (const origin of origins) {
        try {
          window.parent.postMessage(errorMessage, origin)
          if (window.top && window.top !== window.parent) {
            window.top.postMessage(errorMessage, origin)
          }
        } catch (msgErr) {
          logger.debug('Failed to send error message:', msgErr)
        }
      }
    }
  }

  // Process callback on mount
  onMounted(() => {
    // Small delay to ensure iframe is fully loaded
    setTimeout(() => {
      processIframeCallback()
    }, 100)
  })
</script>

<style scoped>
  .iframe-callback {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  }

  .processing,
  .success,
  .error {
    text-align: center;
    padding: 2rem;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    max-width: 300px;
    width: 100%;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .checkmark {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #38a169;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 18px;
    font-weight: bold;
  }

  .error-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e53e3e;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 18px;
    font-weight: bold;
  }

  .processing p {
    color: #718096;
    margin: 0;
    font-size: 14px;
  }

  .success p {
    color: #38a169;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  .error p {
    color: #e53e3e;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  /* Make sure iframe content is responsive */
  @media (max-width: 480px) {
    .iframe-callback {
      padding: 0.5rem;
    }

    .processing,
    .success,
    .error {
      padding: 1.5rem;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
