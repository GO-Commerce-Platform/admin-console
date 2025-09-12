<template>
  <div class="login-container">
    <div class="login-card" :class="{ 'iframe-mode': useIframe }">
      <!-- Logo and Title -->
      <div class="login-header">
        <div class="logo">
          <h1 class="logo-text">GO Commerce</h1>
          <p class="logo-subtitle">Administration Console</p>
        </div>
      </div>

      <!-- Login Content -->
      <div class="login-content">
        <h2 class="login-title">Welcome Back</h2>
        <p class="login-description">Sign in to access the GO Commerce Administration Console</p>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p class="loading-text">{{ loadingMessage }}</p>
        </div>

        <!-- Error Alert -->
        <div v-else-if="error" class="error-alert">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <h4>Authentication Error</h4>
            <p>{{ error }}</p>
            <div class="error-actions">
              <button 
                @click="handleRetry" 
                class="retry-button"
              >
                Retry
              </button>
              <button 
                v-if="useIframe"
                @click="fallbackToRedirect" 
                class="fallback-button"
              >
                Use Standard Login
              </button>
            </div>
          </div>
        </div>

        <!-- Iframe Login -->
        <div v-else-if="useIframe && !authCompleted" class="iframe-container">
          <div class="iframe-header">
            <p class="iframe-description">Sign in with your credentials</p>
            <button 
              @click="toggleLoginMode" 
              class="toggle-button"
              title="Switch to standard login"
            >
              ⇄
            </button>
          </div>
          <div class="iframe-wrapper">
            <iframe 
              ref="loginIframe"
              :src="iframeUrl"
              width="100%"
              height="100%"
              frameborder="0"
              @load="onIframeLoad"
              @error="onIframeError"
              title="Keycloak Login"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              class="login-iframe"
            ></iframe>
            <div v-if="iframeLoading" class="iframe-loading">
              <div class="spinner small"></div>
              <p>Loading login form...</p>
            </div>
          </div>
        </div>

        <!-- Standard Login Button -->
        <div v-else-if="!useIframe && !authCompleted" class="login-form">
          <button
            class="login-button"
            :class="{ 'loading': isLoginLoading }"
            :disabled="isLoginLoading"
            @click="handleLogin"
          >
            <span class="button-icon">🔒</span>
            <span v-if="isLoginLoading">Redirecting to login...</span>
            <span v-else>Sign In with Keycloak</span>
          </button>
          
          <div class="login-options">
            <button 
              @click="toggleLoginMode" 
              class="option-button"
            >
              Try embedded login
            </button>
          </div>

          <!-- Help Text -->
          <div class="help-text">
            <p>Secure authentication powered by Keycloak</p>
          </div>
        </div>

        <!-- Authentication Success -->
        <div v-else-if="authCompleted" class="success-state">
          <div class="spinner success"></div>
          <p class="success-text">Authentication successful! Redirecting...</p>
          
          <!-- Manual redirect button as fallback -->
          <button 
            class="manual-redirect-button"
            @click="manualRedirect"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer" v-if="!useIframe">
        <p class="footer-text">
          © {{ currentYear }} GO Commerce Platform. All rights reserved.
        </p>
      </div>
    </div>

    <!-- Background Pattern -->
    <div class="background-pattern" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'
  import { logger } from '@/utils/logger'
  import { useKeycloakService } from '@/services/keycloakService'

  /**
   * Login Page Component with Iframe Support
   * Handles user authentication through Keycloak with both iframe and redirect methods
   */

  const router = useRouter()
  const route = useRoute()
  const keycloakService = useKeycloakService()

  // Authentication composables
  const { login, isAuthenticated, isLoading, error: authError } = useAuth()
  const hasAuthError = computed(() => !!authError.value)

  // Local state
  const error = ref<string | null>(null)
  const loading = ref(false)
  const loadingMessage = ref('')
  const isLoginInProgress = ref(false)
  const authCompleted = ref(false)
  
  // Iframe-specific state
  const useIframe = ref(false)
  const iframeUrl = ref('')
  const iframeLoading = ref(false)
  const loginIframe = ref<HTMLIFrameElement | null>(null)
  const pollInterval = ref<NodeJS.Timeout | null>(null)

  // Computed properties
  const isLoginLoading = computed(() => isLoginInProgress.value || isLoading.value)
  const currentYear = computed(() => new Date().getFullYear())

  // Get redirect URL from query params
  const redirectUrl = computed(() => {
    const redirect = route.query.redirect as string
    return redirect && redirect !== '/login' ? redirect : '/dashboard'
  })

  // Get error reason from query params
  const errorReason = computed(() => route.query.reason as string)

  /**
   * Generate Keycloak login URL for iframe with PKCE
   */
  async function generateIframeLoginUrl(): Promise<string> {
    const baseUrl = keycloakService.getKeycloakUrl()
    const realm = keycloakService.getRealm()
    const clientId = keycloakService.getClientId()
    const currentOrigin = window.location.origin
    const state = btoa(JSON.stringify({ mode: 'iframe', timestamp: Date.now() }))
    const nonce = btoa(Math.random().toString(36))
    
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    // Store code verifier for later use in token exchange
    sessionStorage.setItem('pkce_code_verifier', codeVerifier)
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${currentOrigin}/auth/iframe-callback`,
      response_type: 'code',
      scope: 'openid profile email',
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      kc_idp_hint: 'keycloak'
    })

    return `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`
  }

  /**
   * Generate PKCE code verifier
   */
  function generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const hash = await crypto.subtle.digest('SHA-256', data)
    const hashArray = new Uint8Array(hash)
    return btoa(String.fromCharCode.apply(null, Array.from(hashArray)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  /**
   * Initialize iframe login
   */
  async function initializeIframeLogin(): Promise<void> {
    try {
      loading.value = true
      loadingMessage.value = 'Preparing login form...'
      error.value = null
      iframeLoading.value = true

      // Generate iframe URL with PKCE
      iframeUrl.value = await generateIframeLoginUrl()
      
      logger.info('Initializing iframe login', { iframeUrl: iframeUrl.value })
      
      // Start polling for authentication completion
      startAuthPolling()
      
    } catch (err: any) {
      logger.error('Failed to initialize iframe login:', err)
      error.value = 'Failed to load login form. Please try again.'
      fallbackToRedirect()
    } finally {
      loading.value = false
    }
  }

  /**
   * Handle iframe load event
   */
  function onIframeLoad(): void {
    iframeLoading.value = false
    logger.debug('Iframe loaded successfully')
    
    try {
      // Check if iframe content is accessible (same-origin policy)
      const iframe = loginIframe.value
      if (iframe?.contentWindow) {
        // Monitor iframe URL changes
        watchIframeNavigation()
      }
    } catch (err) {
      // Cross-origin - expected, continue with polling
      logger.debug('Cross-origin iframe - using polling method')
    }
  }

  /**
   * Handle iframe error event
   */
  function onIframeError(): void {
    logger.error('Iframe failed to load')
    error.value = 'Failed to load login form. Please try the standard login.'
    iframeLoading.value = false
  }

  /**
   * Watch iframe navigation for authentication completion
   */
  function watchIframeNavigation(): void {
    const iframe = loginIframe.value
    if (!iframe?.contentWindow) return

    try {
      // Listen for postMessage from iframe
      window.addEventListener('message', handleIframeMessage)
    } catch (err) {
      logger.debug('Cannot watch iframe navigation directly, using polling')
    }
  }

  /**
   * Handle messages from iframe
   */
  function handleIframeMessage(event: MessageEvent): void {
    // Accept messages from our own origin (the iframe callback page)
    const currentOrigin = window.location.origin
    if (event.origin !== currentOrigin) {
      logger.debug('Ignoring message from unknown origin:', event.origin)
      return
    }

    const data = event.data
    logger.info('Received iframe message:', data)
    
    if (data.type === 'KEYCLOAK_AUTH_SUCCESS') {
      logger.info('Authentication success message received from iframe')
      
      // Stop polling
      stopPolling()
      
      // Don't redirect here - let the authentication watcher handle it
      // This prevents multiple competing redirects
      logger.info('LOGIN.VUE: Iframe success detected, letting auth watcher handle redirect')
      
    } else if (data.type === 'KEYCLOAK_AUTH_ERROR') {
      logger.error('Authentication error message received:', data.error)
      handleAuthError(data.error)
    }
  }

  /**
   * Start polling for authentication completion
   */
  function startAuthPolling(): void {
    if (pollInterval.value) {
      clearInterval(pollInterval.value)
    }

    pollInterval.value = setInterval(async () => {
      try {
        // Check if we can detect authentication completion
        const iframe = loginIframe.value
        if (iframe?.contentWindow) {
          // Try to check iframe URL (will fail if cross-origin)
          try {
            const iframeUrl = iframe.contentWindow.location.href
            if (iframeUrl.includes('/auth/callback') || iframeUrl.includes('code=')) {
              // Authentication might be complete
              await checkAuthenticationStatus()
            }
          } catch (err) {
            // Expected cross-origin error, continue polling
          }
        }
        
        // Alternative: Check authentication status via API  
        if (await checkAuthenticationStatus()) {
          clearInterval(pollInterval.value!)
          logger.info('Authentication detected via polling - auth watcher will handle redirect')
          
          // Don't redirect here - let the authentication watcher handle it
          // The auth store will update and trigger the watcher
        }
      } catch (err) {
        // Continue polling
      }
    }, 2000) // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (pollInterval.value) {
        clearInterval(pollInterval.value)
        if (!authCompleted.value) {
          error.value = 'Login timeout. Please try again.'
        }
      }
    }, 300000) // 5 minutes
  }

  /**
   * Check if authentication was completed
   */
  async function checkAuthenticationStatus(): Promise<boolean> {
    try {
      // Check if tokens exist in storage or if keycloak is authenticated
      return await keycloakService.isAuthenticated()
    } catch (err) {
      return false
    }
  }

  /**
   * Handle successful authentication
   */
  function handleAuthSuccess(code: string, state: string): void {
    logger.info('Authentication success detected', { code: !!code, state })
    // This function is now handled by the iframe message handler above
    // No need to do additional redirects here to avoid conflicts
  }

  /**
   * Handle authentication error
   */
  function handleAuthError(errorMsg: string): void {
    logger.error('Authentication error:', errorMsg)
    error.value = errorMsg || 'Authentication failed. Please try again.'
    stopPolling()
  }

  /**
   * Handle authentication completion
   * NOTE: This function is deprecated - authentication watcher handles redirects
   */
  async function handleAuthenticationComplete(): Promise<void> {
    logger.info('Authentication completion detected', {
      redirectUrl: redirectUrl.value,
      currentPath: window.location.pathname,
      isAuthenticated: isAuthenticated.value
    })
    
    stopPolling()
    
    // Don't redirect here - let the authentication watcher handle it
    // This prevents race conditions and multiple navigation attempts
  }

  /**
   * Stop authentication polling
   */
  function stopPolling(): void {
    if (pollInterval.value) {
      clearInterval(pollInterval.value)
      pollInterval.value = null
    }
  }

  /**
   * Toggle between iframe and redirect login modes
   */
  function toggleLoginMode(): void {
    useIframe.value = !useIframe.value
    error.value = null
    
    if (useIframe.value) {
      initializeIframeLogin()
    } else {
      stopPolling()
      iframeUrl.value = ''
    }
  }

  /**
   * Fallback to standard redirect login
   */
  function fallbackToRedirect(): void {
    useIframe.value = false
    stopPolling()
    error.value = null
    logger.info('Falling back to redirect login method')
  }

  /**
   * Handle retry button click
   */
  function handleRetry(): void {
    error.value = null
    
    if (useIframe.value) {
      initializeIframeLogin()
    } else {
      handleLogin()
    }
  }

  /**
   * Handle login button click
   */
  async function handleLogin(): Promise<void> {
    try {
      error.value = null
      isLoginInProgress.value = true

      logger.info('Initiating login process', {
        redirectUrl: redirectUrl.value,
      })

      // Prepare redirect URI
      const currentOrigin = window.location.origin
      const redirectUri = `${currentOrigin}${redirectUrl.value}`

      // Initiate Keycloak login (this will redirect)
      await login(redirectUri)

      // This code might not execute if login redirects immediately
      logger.debug('Login initiated successfully')
    } catch (err: any) {
      error.value = err?.message || 'Failed to initiate login. Please try again.'
      logger.error('Login failed:', err)
    } finally {
      isLoginInProgress.value = false
    }
  }

  /**
   * Handle authentication error messages
   */
  function handleAuthErrors(): void {
    // Clear previous errors
    error.value = null

    // Handle auth error from composable
    if (hasAuthError.value && authError.value) {
      error.value = authError.value
    }

    // Handle error reasons from query params
    if (errorReason.value) {
      switch (errorReason.value) {
        case 'authentication_required':
          error.value = 'Please sign in to access this page.'
          break
        case 'session_expired':
          error.value = 'Your session has expired. Please sign in again.'
          break
        case 'logout_complete':
          error.value = null // Don't show error for successful logout
          break
        default:
          error.value = 'Authentication is required to continue.'
      }
    }
  }

  /**
   * Check if user is already authenticated
   * NOTE: Redirect is handled by authentication watcher
   */
  function checkAuthAndRedirect(): void {
    if (isAuthenticated.value) {
      logger.info('User already authenticated on mount', {
        to: redirectUrl.value,
      })

      // Don't redirect here - the authentication watcher will handle it
      // This prevents multiple competing navigation attempts
    }
  }

  // Watch for authentication changes - SINGLE SOURCE OF REDIRECT
  watch(isAuthenticated, (newValue, oldValue) => {
    logger.info('LOGIN.VUE: Authentication state changed', { 
      oldValue, 
      newValue,
      currentPath: window.location.pathname,
      authCompleted: authCompleted.value,
      timestamp: Date.now()
    })
    
    // Only redirect if:
    // 1. User became authenticated (newValue is true)
    // 2. We haven't already started redirect process
    // 3. We're still on login page
    if (newValue && !authCompleted.value && route.name === 'Login') {
      logger.info('LOGIN.VUE: Starting controlled redirect process')
      
      // Set completion state FIRST to prevent multiple redirects
      authCompleted.value = true
      loadingMessage.value = 'Authentication successful! Redirecting...'
      
      // Stop any polling
      stopPolling()
      
      // Delay slightly to allow UI state to update, then redirect
      setTimeout(() => {
        logger.info('LOGIN.VUE: Executing single navigation to dashboard')
        
        // Use router.push instead of replace to avoid potential conflicts
        router.push('/dashboard')
          .then(() => {
            logger.info('LOGIN.VUE: Navigation completed successfully')
          })
          .catch(err => {
            logger.error('LOGIN.VUE: Navigation failed, using fallback:', err)
            // Only use window.location as last resort
            window.location.href = '/dashboard'
          })
      }, 250) // Small delay to prevent race conditions
    }
  }, { immediate: false }) // Don't run immediately to avoid initial false triggers

  // Watch for auth errors
  watch([hasAuthError, authError], () => {
    handleAuthErrors()
  })

  // Initialize on mount
  onMounted(() => {
    handleAuthErrors()

    // Small delay to allow auth initialization
    setTimeout(() => {
      checkAuthAndRedirect()
      
      // Try iframe login by default if supported
      if (canUseIframe()) {
        useIframe.value = true
        initializeIframeLogin()
      }
    }, 100)
    
    // Add periodic authentication state monitoring (debug only)
    const monitorInterval = setInterval(() => {
      logger.debug('LOGIN.VUE: Periodic auth state check', {
        isAuthenticated: isAuthenticated.value,
        authCompleted: authCompleted.value,
        currentPath: window.location.pathname,
        routeName: route.name,
        timestamp: Date.now()
      })
      
      // Just monitor - don't redirect. Let the authentication watcher handle it.
      if (isAuthenticated.value && !authCompleted.value && route.name === 'Login') {
        logger.info('LOGIN.VUE: Monitoring detected auth change - watcher should handle redirect')
      }
    }, 3000) // Less frequent monitoring
    
    // Store interval for cleanup
    pollInterval.value = monitorInterval
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopPolling()
    window.removeEventListener('message', handleIframeMessage)
  })

  /**
   * Manual redirect function for testing
   */
  function manualRedirect(): void {
    logger.info('Manual redirect button clicked')
    logger.info('LOGIN.VUE: Manual redirect using window.location.href')
    window.location.href = '/dashboard'
  }

  /**
   * Check if iframe login is supported
   */
  function canUseIframe(): boolean {
    // Check for browser support and settings
    try {
      // Check if running in iframe itself
      if (window.self !== window.top) {
        return false
      }
      
      // Check for modern browser features
      return !!(window.postMessage && window.addEventListener)
    } catch (err) {
      return false
    }
  }
</script>

<style scoped>
  .login-container {
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

  .login-card {
    background: white;
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 400px;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .login-header {
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

  .login-content {
    padding: 2rem;
  }

  .login-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    text-align: center;
    color: #2d3748;
  }

  .login-description {
    color: #718096;
    text-align: center;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .error-alert {
    margin-bottom: 1.5rem;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .login-button {
    width: 100%;
    padding: 12px 24px;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .login-button:hover:not(:disabled) {
    background: #2b77cb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
  }

  .login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-button.loading {
    opacity: 0.8;
  }

  .button-icon {
    font-size: 18px;
  }

  .error-alert {
    background: #fed7d7;
    border: 1px solid #fc8181;
    border-radius: 6px;
    padding: 12px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .error-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .error-content h4 {
    margin: 0 0 4px 0;
    color: #c53030;
    font-size: 14px;
    font-weight: 600;
  }

  .error-content p {
    margin: 0;
    color: #c53030;
    font-size: 14px;
  }

  .help-text {
    margin-top: 8px;
    text-align: center;
  }

  .help-text p {
    margin: 0;
    font-size: 14px;
    color: #718096;
  }

  .footer-text {
    margin: 0;
    font-size: 12px;
    color: #a0aec0;
    text-align: center;
  }

  .login-footer {
    padding: 1rem 2rem;
    border-top: 1px solid #e2e8f0;
    background-color: #f7fafc;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .login-container {
      padding: 0.5rem;
    }

    .login-card {
      max-width: 100%;
    }

    .login-header {
      padding: 1.5rem;
    }

    .login-content {
      padding: 1.5rem;
    }

    .logo-text {
      font-size: 1.5rem;
    }
  }

  /* Loading animation */
  .login-form :deep(.chakra-button[data-loading]) {
    position: relative;
  }

  .login-form :deep(.chakra-button[data-loading] .chakra-spinner) {
    margin-right: 0.5rem;
  }

  /* Focus styles */
  .login-form :deep(.chakra-button:focus) {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.6);
  }

  /* Iframe-specific styles */
  .login-card.iframe-mode {
    max-width: 480px;
  }

  .iframe-container {
    margin-top: 1rem;
  }

  .iframe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem 0;
  }

  .iframe-description {
    margin: 0;
    font-size: 14px;
    color: #718096;
    flex: 1;
  }

  .toggle-button {
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 16px;
    color: #718096;
    transition: all 0.2s;
  }

  .toggle-button:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }

  .iframe-wrapper {
    position: relative;
    height: 400px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    background: #f7fafc;
  }

  .login-iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
  }

  .iframe-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 10;
  }

  .iframe-loading p {
    margin: 0.5rem 0 0 0;
    font-size: 14px;
    color: #718096;
  }

  /* Loading and success states */
  .loading-state, .success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .loading-text, .success-text {
    margin: 1rem 0 0 0;
    color: #718096;
    font-size: 14px;
  }

  .success-text {
    color: #38a169;
  }

  /* Spinner animations */
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner.small {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }

  .spinner.success {
    border-top-color: #38a169;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Error actions */
  .error-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .retry-button, .fallback-button {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .retry-button {
    background: #3182ce;
    color: white;
    border: none;
  }

  .retry-button:hover {
    background: #2b77cb;
  }

  .fallback-button {
    background: white;
    color: #718096;
    border: 1px solid #e2e8f0;
  }

  .fallback-button:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }

  /* Login options */
  .login-options {
    margin-top: 1rem;
    text-align: center;
  }

  .option-button {
    background: none;
    border: none;
    color: #3182ce;
    text-decoration: underline;
    cursor: pointer;
    font-size: 14px;
  }

  .option-button:hover {
    color: #2b77cb;
  }

  /* Manual redirect button */
  .manual-redirect-button {
    margin-top: 1rem;
    padding: 8px 16px;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .manual-redirect-button:hover {
    background: #2b77cb;
    transform: translateY(-1px);
  }

  /* Responsive adjustments for iframe */
  @media (max-width: 480px) {
    .iframe-wrapper {
      height: 350px;
    }

    .login-card.iframe-mode {
      max-width: 100%;
    }

    .iframe-header {
      flex-direction: column;
      gap: 0.5rem;
      align-items: stretch;
    }

    .iframe-description {
      text-align: center;
    }
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
