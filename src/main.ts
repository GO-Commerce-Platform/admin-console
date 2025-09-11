/**
 * Main application entry point
 * Configures and bootstraps the GO Commerce Administration Console
 * 
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import { createApp } from 'vue'
import App from './App.vue'

// Chakra UI Vue components and theme
import { ChakraProvider } from '@chakra-ui/vue-next'
import theme from '@/theme'

// Pinia store configuration
import { setupStores, StoreManager } from '@/stores'

// Router configuration
import router from '@/router'

// HTTP client and services
import { apiClient } from '@/services/apiClient'
import { tokenManager } from '@/services/auth/tokenManager'
import { keycloakService } from '@/services/keycloakService'

// Utilities and logging
import { logger, DevTools, Environment, FeatureFlags } from '@/utils/logger'

// Global styles
import './style.css'

/**
 * Bootstrap application services and configurations
 */
async function bootstrap(): Promise<void> {
  logger.info('Bootstrapping GO Commerce Administration Console...');
  
  try {
    // Load environment configuration
    Environment.loadConfig();
    logger.info('Environment configuration loaded', Environment.getAll());
    
    // Load feature flags
    await FeatureFlags.loadFlags();
    logger.info('Feature flags loaded', FeatureFlags.getAllFlags());
    
    // Initialize authentication services (but don't block on it)
    logger.info('Services will be initialized after Vue app setup');
    
  } catch (error) {
    logger.error('Failed to bootstrap application:', error);
    throw error;
  }
}

/**
 * Initialize and mount the Vue application
 */
async function initializeApp(): Promise<void> {
  try {
    // Bootstrap services
    await bootstrap();
    
    // Create Vue application
    const app = createApp(App);
    
    // Setup Pinia stores
    const pinia = setupStores(app);
    StoreManager.setPinia(pinia);
    
    // Setup Vue Router
    app.use(router);
    
    // Setup Chakra UI with custom theme
    app.use(ChakraProvider, { theme });
    
    // Global error handler
    app.config.errorHandler = (error: any, instance: any, info: string) => {
      logger.error('Vue application error:', {
        error: {
          message: error?.message || 'Unknown error',
          stack: error?.stack,
        },
        component: instance?.$options.name || 'Unknown component',
        info,
      });
      
      // In development, also log to console for debugging
      if (Environment.isDevelopment()) {
        console.error('[Vue Error]', error, instance, info);
      }
    };
    
    // Global warning handler (development only)
    if (Environment.isDevelopment()) {
      app.config.warnHandler = (msg: string, instance: any, trace: string) => {
        logger.warn('Vue warning:', {
          message: msg,
          component: instance?.$options.name || 'Unknown component',
          trace,
        });
      };
    }
    
    // Add global properties for development
    if (Environment.isDevelopment()) {
      app.config.globalProperties.$logger = logger;
      app.config.globalProperties.$apiClient = apiClient;
      app.config.globalProperties.$tokenManager = tokenManager;
      
      // Enable development tools
      DevTools.enableGlobalDebug();
      StoreManager.enableDevMode();
    }
    
    // Setup token manager refresh callback (will be set by auth service later)
    // This is a placeholder - the actual callback will be set when Keycloak service is initialized
    tokenManager.setRefreshCallback(async () => {
      throw new Error('Token refresh callback not implemented yet');
    });
    
    // Mount the application
    app.mount('#app');
    
    logger.info('Application mounted successfully', {
      version: Environment.get('VERSION'),
      environment: Environment.get('ENVIRONMENT'),
      buildTime: Environment.get('BUILD_TIME'),
    });
    
  } catch (error) {
    logger.fatal('Failed to initialize application:', error);
    
    // Show error message to user
    const errorContainer = document.createElement('div');
    errorContainer.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fee2e2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 24px;
        max-width: 500px;
        font-family: system-ui, sans-serif;
        text-align: center;
      ">
        <h2 style="margin: 0 0 16px; color: #dc2626; font-size: 24px;">Application Error</h2>
        <p style="margin: 0 0 16px; color: #374051;">Failed to initialize the application. Please refresh the page or contact support.</p>
        <button onclick="window.location.reload()" style="
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
        ">Reload Page</button>
      </div>
    `;
    document.body.appendChild(errorContainer);
    
    throw error;
  }
}

// Health check for application startup
function performHealthChecks(): void {
  const checks = {
    environment: Environment.isDevelopment() || Environment.isProduction(),
    apiClient: !!apiClient,
    tokenManager: !!tokenManager,
    theme: !!theme,
  };
  
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([check]) => check);
  
  if (failedChecks.length > 0) {
    logger.error('Health check failed for:', failedChecks);
    throw new Error(`Health check failed: ${failedChecks.join(', ')}`);
  }
  
  logger.info('All health checks passed');
}

// Initialize application
performHealthChecks();
initializeApp().catch(error => {
  logger.fatal('Application initialization failed:', error);
});

// Copilot: This file may have been generated or refactored by GitHub Copilot.
