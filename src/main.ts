/**
 * GO Commerce Administration Console - Main Entry Point
 *
 * Related GitHub Issue: #2 - Authentication System & Security
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

// Naive UI configuration
import { create, NConfigProvider } from 'naive-ui'
import { naiveTheme, themeOverrides } from '@/theme/naive'

// Router configuration
import router from '@/router'
import { setupRouterGuards } from '@/router/guards'

// Authentication store - temporarily disabled
// import { useAuthStore } from '@/stores/auth'

// Global styles
import './style.css'

// Logger
import { logger } from '@/utils/logger'

/**
 * Bootstrap services and configurations
 */
async function bootstrap(): Promise<void> {
  logger.info('Bootstrapping GO Commerce Admin Console...')

  try {
    // Skip all authentication initialization for debugging
    logger.info('Skipping authentication system for debugging...')
    logger.info('Bootstrap completed successfully')
  } catch (error) {
    logger.error('Failed to bootstrap services:', error)
    // Don't throw the error, just log it for now
    logger.warn('Continuing with limited functionality...')
  }
}

/**
 * Initialize and mount the Vue application
 */
async function initializeApp(): Promise<void> {
  try {
    logger.info('Starting GO Commerce Admin Console...')

    // Create Pinia store
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)

    // Create Vue application
    const app = createApp(App)

    // Setup Pinia store management
    app.use(pinia)

    // Setup Vue Router
    app.use(router)

    // Setup router guards - temporarily disabled for debugging
    // setupRouterGuards(router)

    // Setup Naive UI with custom theme
    const naive = create({
      components: [],
      theme: naiveTheme,
      themeOverrides: themeOverrides,
    })
    app.use(naive)

    // Global error handler with proper logging
    app.config.errorHandler = (error: any, instance: any, info: string) => {
      logger.error('[Vue Error]', {
        error: error?.message || error,
        component: instance?.$options?.name || 'Unknown',
        info,
        stack: error?.stack,
      })

      // In development, also log to console for debugging
      if (import.meta.env.DEV) {
        console.error('[Vue Error]', error, instance, info)
      }
    }

    // Global warning handler
    app.config.warnHandler = (msg: string, instance: any, trace: string) => {
      logger.warn('[Vue Warning]', {
        message: msg,
        component: instance?.$options?.name || 'Unknown',
        trace: trace || 'No trace available',
      })
    }

    // Bootstrap services (must be done after Pinia is available)
    await bootstrap()

    // Mount the application
    app.mount('#app')

    logger.info('Application mounted successfully')
  } catch (error) {
    logger.error('Failed to initialize application:', error)

    // Show user-friendly error message
    showErrorScreen(error as Error)
  }
}

/**
 * Show error screen when app fails to initialize
 */
function showErrorScreen(error: Error): void {
  const errorMessage = error?.message || 'Unknown error occurred'
  const isDev = import.meta.env.DEV

  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 32px;
      max-width: 600px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    ">
      <div style="
        width: 64px;
        height: 64px;
        background: #dc2626;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        color: white;
        font-size: 24px;
        font-weight: bold;
      ">!</div>
      
      <h1 style="
        margin: 0 0 16px;
        color: #dc2626;
        font-size: 28px;
        font-weight: 600;
      ">Application Error</h1>
      
      <p style="
        margin: 0 0 24px;
        color: #374151;
        font-size: 16px;
        line-height: 1.5;
      ">Unable to start GO Commerce Admin Console. This may be due to authentication or network issues.</p>
      
      <div style="
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin: 0 0 24px;
        text-align: left;
      ">
        <h3 style="
          margin: 0 0 8px;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
        ">Error Details:</h3>
        <p style="
          margin: 0;
          color: #6b7280;
          font-size: 12px;
          font-family: 'Monaco', 'Courier New', monospace;
          word-break: break-all;
        ">${errorMessage}</p>
        ${
          isDev && error.stack
            ? `
          <details style="margin-top: 12px;">
            <summary style="
              color: #6b7280;
              font-size: 12px;
              cursor: pointer;
              font-weight: 500;
            ">Stack Trace</summary>
            <pre style="
              margin: 8px 0 0;
              color: #6b7280;
              font-size: 11px;
              white-space: pre-wrap;
              word-break: break-all;
              max-height: 200px;
              overflow-y: auto;
            ">${error.stack}</pre>
          </details>
        `
            : ''
        }
      </div>
      
      <div style="
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      ">
        <button onclick="window.location.reload()" style="
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">Reload Application</button>
        
        <button onclick="window.location.href = window.location.origin" style="
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">Go to Home</button>
      </div>
      
      <p style="
        margin: 24px 0 0;
        color: #9ca3af;
        font-size: 12px;
      ">If this problem persists, please contact your system administrator.</p>
    </div>
  `
}

// Initialize application
initializeApp().catch(error => {
  console.error('Critical application error:', error)
})

// Copilot: This file may have been generated or refactored by GitHub Copilot.
