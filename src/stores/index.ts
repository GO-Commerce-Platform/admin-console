/**
 * Pinia Store Configuration
 * Main store setup with plugins, persistence, and TypeScript support
 * 
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import { createPinia, type Pinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import type { App } from 'vue';
import type { StoreEventListener, StoreEventType } from './types';

/**
 * Store logging plugin for development
 * Logs all store actions and mutations in development mode
 */
function createLoggingPlugin() {
  return ({ store }: any) => {
    if (!import.meta.env.DEV) return;

    // Log store actions
    store.$onAction(({ name, args, after, onError }: any) => {
      const start = Date.now();
      
      console.log(`[Store Action] ${store.$id}.${name}`, {
        args,
        timestamp: new Date().toISOString(),
      });

      after((result: any) => {
        const duration = Date.now() - start;
        console.log(`[Store Action Complete] ${store.$id}.${name}`, {
          duration: `${duration}ms`,
          result,
        });
      });

      onError((error: any) => {
        const duration = Date.now() - start;
        console.error(`[Store Action Error] ${store.$id}.${name}`, {
          duration: `${duration}ms`,
          error,
          args,
        });
      });
    });

    // Log state changes
    store.$subscribe((mutation: any, state: any) => {
      console.log(`[Store Mutation] ${store.$id}`, {
        type: mutation.type,
        payload: mutation.payload,
        state: { ...state },
        timestamp: new Date().toISOString(),
      });
    });
  };
}

/**
 * Store performance monitoring plugin
 * Tracks store performance metrics
 */
function createPerformancePlugin() {
  const metrics = new Map<string, {
    actionCount: number;
    averageActionTime: number;
    totalActionTime: number;
    slowestActions: Array<{ name: string; time: number; timestamp: number }>;
  }>();

  return ({ store }: any) => {
    const storeId = store.$id;
    
    if (!metrics.has(storeId)) {
      metrics.set(storeId, {
        actionCount: 0,
        averageActionTime: 0,
        totalActionTime: 0,
        slowestActions: [],
      });
    }

    const storeMetrics = metrics.get(storeId)!;

    store.$onAction(({ name, after, onError }: any) => {
      const start = performance.now();

      after(() => {
        const end = performance.now();
        const duration = end - start;

        storeMetrics.actionCount++;
        storeMetrics.totalActionTime += duration;
        storeMetrics.averageActionTime = storeMetrics.totalActionTime / storeMetrics.actionCount;

        // Track slowest actions (top 10)
        storeMetrics.slowestActions.push({
          name: `${storeId}.${name}`,
          time: duration,
          timestamp: Date.now(),
        });

        storeMetrics.slowestActions.sort((a, b) => b.time - a.time);
        storeMetrics.slowestActions = storeMetrics.slowestActions.slice(0, 10);

        // Warn about slow actions in development
        if (import.meta.env.DEV && duration > 100) {
          console.warn(`[Store Performance] Slow action detected: ${storeId}.${name} took ${duration.toFixed(2)}ms`);
        }
      });
    });

    // Expose metrics getter
    store.getPerformanceMetrics = () => ({ ...storeMetrics });
  };
}

/**
 * Store error handling plugin
 * Centralizes error handling across all stores
 */
function createErrorHandlingPlugin() {
  const globalErrorHandlers: Array<(error: any, store: string, action: string) => void> = [];

  return ({ store }: any) => {
    store.$onAction(({ name, onError }: any) => {
      onError((error: any) => {
        // Call all registered global error handlers
        globalErrorHandlers.forEach(handler => {
          try {
            handler(error, store.$id, name);
          } catch (handlerError) {
            console.error('[Store Error Handler] Handler threw error:', handlerError);
          }
        });

        // Default error handling
        console.error(`[Store Error] ${store.$id}.${name}:`, error);
      });
    });

    // Allow stores to register global error handlers
    store.addGlobalErrorHandler = (handler: (error: any, store: string, action: string) => void) => {
      globalErrorHandlers.push(handler);
      
      // Return unregister function
      return () => {
        const index = globalErrorHandlers.indexOf(handler);
        if (index > -1) {
          globalErrorHandlers.splice(index, 1);
        }
      };
    };
  };
}

/**
 * Store event bus plugin
 * Allows inter-store communication via events
 */
function createEventBusPlugin() {
  const eventListeners = new Map<StoreEventType, StoreEventListener[]>();

  const emit = (type: StoreEventType, payload: any, storeName: string) => {
    const listeners = eventListeners.get(type) || [];
    const event = {
      type,
      payload,
      storeName,
      timestamp: Date.now(),
    };

    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[Store Event] Listener error:', error);
      }
    });
  };

  const on = (type: StoreEventType, listener: StoreEventListener) => {
    const listeners = eventListeners.get(type) || [];
    listeners.push(listener);
    eventListeners.set(type, listeners);

    // Return unsubscribe function
    return () => {
      const currentListeners = eventListeners.get(type) || [];
      const index = currentListeners.indexOf(listener);
      if (index > -1) {
        currentListeners.splice(index, 1);
        eventListeners.set(type, currentListeners);
      }
    };
  };

  const off = (type: StoreEventType, listener?: StoreEventListener) => {
    if (listener) {
      const listeners = eventListeners.get(type) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
        eventListeners.set(type, listeners);
      }
    } else {
      eventListeners.delete(type);
    }
  };

  return ({ store }: any) => {
    const storeName = store.$id;

    // Emit action events
    store.$onAction(({ name, args, after, onError }: any) => {
      emit('action:before', { name, args }, storeName);

      after((result: any) => {
        emit('action:after', { name, args, result }, storeName);
      });

      onError((error: any) => {
        emit('action:error', { name, args, error }, storeName);
      });
    });

    // Emit mutation events
    store.$subscribe((mutation: any) => {
      emit('mutation:after', mutation, storeName);
    });

    // Add event bus methods to store
    store.$emit = (type: StoreEventType, payload: any) => emit(type, payload, storeName);
    store.$on = on;
    store.$off = off;
  };
}

/**
 * Store hydration plugin
 * Handles SSR hydration and initial state loading
 */
function createHydrationPlugin() {
  return ({ store }: any) => {
    // Add hydration method
    store.$hydrate = (data: any) => {
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          if (store.$state.hasOwnProperty(key)) {
            store.$state[key] = data[key];
          }
        });
        
        store.$emit('state:hydrate', data);
      }
    };

    // Add serialize method for SSR
    store.$serialize = () => {
      return JSON.parse(JSON.stringify(store.$state));
    };
  };
}

/**
 * Store reset plugin
 * Provides enhanced reset functionality
 */
function createResetPlugin() {
  return ({ store }: any) => {
    const initialState = JSON.parse(JSON.stringify(store.$state));

    // Enhanced reset method
    const originalReset = store.$reset;
    store.$reset = (options: { selective?: string[]; exclude?: string[] } = {}) => {
      if (options.selective) {
        // Reset only specified properties
        options.selective.forEach(key => {
          if (initialState.hasOwnProperty(key)) {
            store.$state[key] = JSON.parse(JSON.stringify(initialState[key]));
          }
        });
      } else if (options.exclude) {
        // Reset all except specified properties
        Object.keys(initialState).forEach(key => {
          if (!options.exclude!.includes(key)) {
            store.$state[key] = JSON.parse(JSON.stringify(initialState[key]));
          }
        });
      } else {
        // Full reset
        originalReset();
      }

      store.$emit('state:reset', options);
    };
  };
}

/**
 * Create configured Pinia instance
 */
export function createAppPinia(): Pinia {
  const pinia = createPinia();

  // Configure persistence plugin
  pinia.use(createPersistedState({
    // Global persistence configuration
    key: (id: string) => `gocommerce_store_${id}`,
    storage: localStorage,
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
    // Auto-save on state changes
    auto: true,
    // Pick specific properties to persist by default
    pick: ['lastUpdated'],
    // Debug persistence in development
    debug: import.meta.env.DEV,
  }));

  // Add custom plugins
  pinia.use(createLoggingPlugin());
  pinia.use(createPerformancePlugin());
  pinia.use(createErrorHandlingPlugin());
  pinia.use(createEventBusPlugin());
  pinia.use(createHydrationPlugin());
  pinia.use(createResetPlugin());

  return pinia;
}

/**
 * Install Pinia in Vue app with configuration
 */
export function setupStores(app: App): Pinia {
  const pinia = createAppPinia();
  
  app.use(pinia);

  // Enable Vue DevTools integration in development
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    // Enable devtools
    app.config.globalProperties.__VUE_PROD_DEVTOOLS__ = true;
  }

  // Register stores with StoreManager after pinia is set up
  registerStores(pinia);

  return pinia;
}

/**
 * Register all stores with the StoreManager
 */
function registerStores(pinia: Pinia): void {
  // Import auth store and register it
  import('./auth').then(({ useAuthStore }) => {
    const authStore = useAuthStore(pinia);
    StoreManager.registerStore('auth', authStore);
  }).catch(error => {
    console.error('Failed to register auth store:', error);
  });
}

/**
 * Global store utilities for application-wide store management
 */
export class StoreManager {
  private static pinia: Pinia;
  private static stores = new Map<string, any>();

  static setPinia(pinia: Pinia) {
    StoreManager.pinia = pinia;
  }

  static registerStore(name: string, store: any) {
    StoreManager.stores.set(name, store);
  }

  static getStore<T = any>(name: string): T | null {
    return StoreManager.stores.get(name) || null;
  }

  static getAllStores(): Record<string, any> {
    return Object.fromEntries(StoreManager.stores.entries());
  }

  static resetAllStores(options?: { exclude?: string[] }) {
    StoreManager.stores.forEach((store, name) => {
      if (options?.exclude?.includes(name)) return;
      
      if (typeof store.$reset === 'function') {
        store.$reset();
      }
    });
  }

  static getStoreMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    StoreManager.stores.forEach((store, name) => {
      if (typeof store.getPerformanceMetrics === 'function') {
        metrics[name] = store.getPerformanceMetrics();
      }
    });

    return metrics;
  }

  static enableDevMode() {
    if (typeof window !== 'undefined') {
      (window as any).__STORE_MANAGER__ = StoreManager;
      console.log('[Store Manager] Dev mode enabled. Use __STORE_MANAGER__ to access store utilities.');
    }
  }
}

// Default export
export default createAppPinia;

// Re-export Pinia types and utilities for convenience
export { defineStore, storeToRefs, getActivePinia } from 'pinia';
export type { Store, StoreDefinition } from 'pinia';

// Re-export store utilities
export * from './types';
export * from './utils';

// Copilot: This file may have been generated or refactored by GitHub Copilot.
