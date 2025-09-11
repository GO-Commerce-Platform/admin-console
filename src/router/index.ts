/**
 * Vue Router Configuration
 * Main router setup with authentication, guards, and route definitions
 * 
 * Related GitHub Issue: #2 - Authentication System & Security
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { setupRouterGuards } from './guards';
import { logger } from '@/utils/logger';

/**
 * Route definitions with authentication and authorization metadata
 */
const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/',
    redirect: '/dashboard',
  },

  // Authentication routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/Login.vue'),
    meta: {
      public: true,
      title: 'Sign In - GO Commerce Admin',
    },
  },
  {
    path: '/logout',
    name: 'Logout',
    component: () => import('@/pages/auth/Logout.vue'),
    meta: {
      public: true,
      title: 'Sign Out - GO Commerce Admin',
    },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/pages/auth/Unauthorized.vue'),
    meta: {
      public: true,
      title: 'Access Denied - GO Commerce Admin',
    },
  },

  // Protected dashboard route (placeholder)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard - GO Commerce Admin',
    },
  },

  // Platform admin routes
  {
    path: '/platform',
    name: 'Platform',
    redirect: '/platform/dashboard',
    meta: {
      requiresAuth: true,
      roles: ['platform-admin'],
    },
    children: [
      {
        path: 'dashboard',
        name: 'PlatformDashboard',
        component: () => import('@/pages/platform/Dashboard.vue'),
        meta: {
          requiresAuth: true,
          roles: ['platform-admin'],
          title: 'Platform Dashboard - GO Commerce Admin',
        },
      },
      {
        path: 'stores',
        name: 'PlatformStores',
        component: () => import('@/pages/platform/Stores.vue'),
        meta: {
          requiresAuth: true,
          roles: ['platform-admin'],
          title: 'Store Management - GO Commerce Admin',
        },
      },
      {
        path: 'users',
        name: 'PlatformUsers',
        component: () => import('@/pages/platform/Users.vue'),
        meta: {
          requiresAuth: true,
          roles: ['platform-admin'],
          title: 'User Management - GO Commerce Admin',
        },
      },
    ],
  },

  // Store-scoped routes
  {
    path: '/store/:storeId',
    name: 'Store',
    redirect: (to) => `/store/${to.params.storeId}/dashboard`,
    meta: {
      requiresAuth: true,
      storeScoped: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'StoreDashboard',
        component: () => import('@/pages/store/Dashboard.vue'),
        meta: {
          requiresAuth: true,
          storeScoped: true,
          title: 'Store Dashboard - GO Commerce Admin',
        },
      },
      {
        path: 'products',
        name: 'StoreProducts',
        component: () => import('@/pages/store/Products.vue'),
        meta: {
          requiresAuth: true,
          storeScoped: true,
          roles: ['platform-admin', 'store-admin', 'product-manager'],
          title: 'Product Management - GO Commerce Admin',
        },
      },
      {
        path: 'customers',
        name: 'StoreCustomers',
        component: () => import('@/pages/store/Customers.vue'),
        meta: {
          requiresAuth: true,
          storeScoped: true,
          roles: ['platform-admin', 'store-admin', 'customer-service'],
          title: 'Customer Management - GO Commerce Admin',
        },
      },
      {
        path: 'orders',
        name: 'StoreOrders',
        component: () => import('@/pages/store/Orders.vue'),
        meta: {
          requiresAuth: true,
          storeScoped: true,
          roles: ['platform-admin', 'store-admin', 'order-manager', 'customer-service'],
          title: 'Order Management - GO Commerce Admin',
        },
      },
    ],
  },

  // Store selection route (for multi-store users)
  {
    path: '/store-selection',
    name: 'StoreSelection',
    component: () => import('@/pages/StoreSelection.vue'),
    meta: {
      requiresAuth: true,
      title: 'Select Store - GO Commerce Admin',
    },
  },

  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      public: true,
      title: 'Page Not Found - GO Commerce Admin',
    },
  },
];

/**
 * Create and configure router instance
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll to top on route change, unless user navigated back
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

/**
 * Set up meta guard for page titles
 */
router.beforeEach((to, from, next) => {
  // Set page title if provided
  if (to.meta.title) {
    document.title = to.meta.title as string;
  } else {
    document.title = 'GO Commerce Administration Console';
  }

  next();
});

/**
 * Set up authentication and authorization guards
 */
setupRouterGuards(router);

/**
 * Global navigation error handler
 */
router.onError((error) => {
  logger.error('Router navigation error:', error);
});

/**
 * Log navigation in development
 */
if (import.meta.env.DEV) {
  router.beforeEach((to, from, next) => {
    logger.debug('Router navigation:', {
      from: from.path,
      to: to.path,
      meta: to.meta,
    });
    next();
  });
}

export default router;

// Export route utilities
export { routes };

// Copilot: This file may have been generated or refactored by GitHub Copilot.
