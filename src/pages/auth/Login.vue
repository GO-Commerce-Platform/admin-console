<template>
  <div class="login-container">
    <div class="login-card">
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
        <p class="login-description">
          Sign in to access the GO Commerce Administration Console
        </p>

        <!-- Error Alert -->
        <c-alert 
          v-if="error" 
          status="error" 
          variant="subtle"
          class="error-alert"
        >
          <c-alert-icon />
          <c-alert-title>Authentication Error</c-alert-title>
          <c-alert-description>{{ error }}</c-alert-description>
        </c-alert>

        <!-- Login Form -->
        <div class="login-form">
          <c-button
            size="lg"
            color-scheme="blue"
            :is-loading="isLoading"
            loading-text="Redirecting to login..."
            width="100%"
            @click="handleLogin"
          >
            <c-icon name="lock" mr="2" />
            Sign In with Keycloak
          </c-button>

          <!-- Help Text -->
          <div class="help-text">
            <c-text font-size="sm" color="gray.600" text-align="center">
              Secure authentication powered by Keycloak
            </c-text>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <c-text font-size="xs" color="gray.500" text-align="center">
          © {{ currentYear }} GO Commerce Platform. All rights reserved.
        </c-text>
      </div>
    </div>

    <!-- Background Pattern -->
    <div class="background-pattern"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  CButton,
  CAlert,
  CAlertIcon,
  CAlertTitle,
  CAlertDescription,
  CText,
  CIcon,
} from '@chakra-ui/vue-next';
import { useAuth, useAuthLoading } from '@/composables/useAuth';
import { logger } from '@/utils/logger';

/**
 * Login Page Component
 * Handles user authentication through Keycloak with loading states and error handling
 */

const router = useRouter();
const route = useRoute();

// Authentication composables
const { login, isAuthenticated } = useAuth();
const { isLoading, hasAuthError, error: authError } = useAuthLoading();

// Local state
const error = ref<string | null>(null);
const isLoginInProgress = ref(false);

// Computed properties
const isLoading = computed(() => isLoginInProgress.value || isLoading.value);
const currentYear = computed(() => new Date().getFullYear());

// Get redirect URL from query params
const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string;
  return redirect && redirect !== '/login' ? redirect : '/dashboard';
});

// Get error reason from query params
const errorReason = computed(() => route.query.reason as string);

/**
 * Handle login button click
 */
async function handleLogin(): Promise<void> {
  try {
    error.value = null;
    isLoginInProgress.value = true;

    logger.info('Initiating login process', { 
      redirectUrl: redirectUrl.value 
    });

    // Prepare redirect URI
    const currentOrigin = window.location.origin;
    const redirectUri = `${currentOrigin}${redirectUrl.value}`;

    // Initiate Keycloak login (this will redirect)
    await login(redirectUri);

    // This code might not execute if login redirects immediately
    logger.debug('Login initiated successfully');

  } catch (err: any) {
    error.value = err?.message || 'Failed to initiate login. Please try again.';
    logger.error('Login failed:', err);
  } finally {
    isLoginInProgress.value = false;
  }
}

/**
 * Handle authentication error messages
 */
function handleAuthErrors(): void {
  // Clear previous errors
  error.value = null;

  // Handle auth error from composable
  if (hasAuthError.value && authError.value) {
    error.value = authError.value;
  }

  // Handle error reasons from query params
  if (errorReason.value) {
    switch (errorReason.value) {
      case 'authentication_required':
        error.value = 'Please sign in to access this page.';
        break;
      case 'session_expired':
        error.value = 'Your session has expired. Please sign in again.';
        break;
      case 'logout_complete':
        error.value = null; // Don't show error for successful logout
        break;
      default:
        error.value = 'Authentication is required to continue.';
    }
  }
}

/**
 * Check if user is already authenticated and redirect
 */
function checkAuthAndRedirect(): void {
  if (isAuthenticated.value) {
    logger.info('User already authenticated, redirecting', {
      to: redirectUrl.value,
    });

    // Redirect to intended destination
    router.replace(redirectUrl.value);
  }
}

// Watch for authentication changes
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    checkAuthAndRedirect();
  }
});

// Watch for auth errors
watch([hasAuthError, authError], () => {
  handleAuthErrors();
});

// Initialize on mount
onMounted(() => {
  handleAuthErrors();
  
  // Small delay to allow auth initialization
  setTimeout(() => {
    checkAuthAndRedirect();
  }, 100);
});
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
  background-position: 0 0, 25px 25px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

.help-text {
  margin-top: 0.5rem;
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

/* Hover animation */
.login-form :deep(.chakra-button:hover:not([disabled])) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
  transition: all 0.2s ease-in-out;
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
