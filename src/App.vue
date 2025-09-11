<template>
  <div id="app">
    <!-- Authentication Loading Screen -->
    <div v-if="isInitializing" class="auth-loading">
      <div class="loading-container">
        <c-spinner size="xl" color="blue.500" thickness="3px" />
        <c-text mt="4" font-size="lg" color="gray.600">
          Initializing GO Commerce Admin Console...
        </c-text>
      </div>
    </div>
    
    <!-- Application Content -->
    <div v-else class="app-content">
      <!-- Router View for Page Content -->
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { CSpinner, CText } from '@chakra-ui/vue-next';
import { useAuth } from '@/composables/useAuth';
import { StoreManager } from '@/stores';
import { logger } from '@/utils/logger';

/**
 * Main Application Component
 * Handles authentication initialization and provides router view
 * 
 * Related GitHub Issue: #2 - Authentication System & Security
 */

// Authentication composable
const { isInitializing } = useAuth();

/**
 * Initialize authentication system
 */
async function initializeAuth(): Promise<void> {
  try {
    logger.info('Initializing authentication system...');
    
    // Get auth store
    const authStore = StoreManager.getStore('auth');
    if (!authStore) {
      logger.error('Auth store not found');
      return;
    }
    
    // Initialize authentication
    await authStore.init();
    
    logger.info('Authentication system initialized');
  } catch (error) {
    logger.error('Failed to initialize authentication:', error);
  }
}

// Initialize authentication on mount
onMounted(() => {
  // Small delay to ensure stores are properly set up
  setTimeout(() => {
    initializeAuth();
  }, 100);
});
</script>

<style scoped>
#app {
  min-height: 100vh;
  width: 100%;
}

.auth-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 300px;
}

.app-content {
  min-height: 100vh;
  width: 100%;
}

/* Global styles */
:deep(body) {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:deep(#app) {
  color: #2c3e50;
}

/* Loading animation */
.loading-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
