<template>
  <div id="app">
    <div class="app-content">
      <!-- Debug Banner -->
      <div class="debug-banner">
        <p>🔧 DEBUG MODE: Authentication bypassed - Simple frontend version</p>
      </div>

      <!-- Navigation Header -->
      <header class="app-header">
        <h1>GO Commerce Admin Console</h1>
        <nav class="main-nav">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link to="/login" class="nav-link">Login</router-link>
        </nav>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'

  /**
   * Main Application Component
   * Handles authentication initialization and provides router view
   *
   * Related GitHub Issue: #2 - Authentication System & Security
   */

  onMounted(() => {
    console.log('App.vue loaded - simple frontend version')
  })
</script>

<style scoped>
  #app {
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }

  .app-content {
    min-height: 100vh;
  }

  .debug-banner {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    padding: 12px 20px;
    margin: 0;
  }

  .debug-banner p {
    margin: 0;
    font-size: 14px;
    color: #1976d2;
  }

  .app-header {
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .app-header h1 {
    margin: 0;
    font-size: 24px;
    color: #2c3e50;
    font-weight: 600;
  }

  .main-nav {
    display: flex;
    gap: 20px;
  }

  .nav-link {
    color: #666;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .nav-link:hover {
    background: #f5f5f5;
    color: #1976d2;
  }

  .nav-link.router-link-active {
    background: #e3f2fd;
    color: #1976d2;
    font-weight: 500;
  }

  .main-content {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
</style>

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
