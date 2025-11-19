<template>
  <NaiveUIProvider>
    <div id="app">
      <!-- Show content when app is ready -->
      <div v-if="appReady" class="app-content">
        <router-view />
      </div>
      
      <!-- Loading state during initialization -->
      <div v-else class="app-loading">
        <div class="app-loading__spinner"></div>
        <p>Initializing application...</p>
      </div>
    </div>
  </NaiveUIProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import NaiveUIProvider from '@/components/providers/NaiveUIProvider.vue'

/**
 * Main Application Component
 * 
 * Handles global application display and routing.
 * Authentication is handled by the router guards and services.
 * 
 * The actual layout is handled by individual route components
 * that use AppLayout for authenticated areas.
 * 
 * Related GitHub Issue: #3 - Layout, Navigation & Routing System
 */

const { isInitializing } = useAuth()

// App is ready when authentication initialization is complete
const appReady = computed(() => !isInitializing.value)
</script>

<style scoped>
#app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1f2937;
  background: #f8fafc;
}

.app-content {
  min-height: 100vh;
}

.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
  color: #6b7280;
}

.app-loading__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.app-loading p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  line-height: 1.6;
}

/* Focus styles for accessibility */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Remove default focus styles and add custom ones */
*:focus {
  outline: none;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
