/**
 * Notifications Composable
 * Manages user notifications, alerts, and messaging
 * 
 * Related GitHub Issue: #11 - Component Library & Design System
 */

import { ref, computed, reactive } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
}

interface NotificationState {
  notifications: Notification[]
  loading: boolean
  error: string | null
}

// Global notification state
const state = reactive<NotificationState>({
  notifications: [],
  loading: false,
  error: null,
})

/**
 * Use Notifications Composable
 * 
 * Provides reactive notification management functionality
 */
export function useNotifications() {
  // Computed values
  const unreadCount = computed(() => 
    state.notifications.filter(n => !n.read).length
  )
  
  const unreadNotifications = computed(() =>
    state.notifications.filter(n => !n.read)
  )
  
  const recentNotifications = computed(() =>
    state.notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
  )

  // Actions
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }
    
    state.notifications.unshift(newNotification)
    
    // Auto-remove success notifications after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, 5000)
    }
    
    return newNotification.id
  }

  const removeNotification = (id: string) => {
    const index = state.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      state.notifications.splice(index, 1)
    }
  }

  const markAsRead = (id: string) => {
    const notification = state.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    state.notifications.forEach(notification => {
      notification.read = true
    })
  }

  const clearAll = () => {
    state.notifications = []
  }

  const clearRead = () => {
    state.notifications = state.notifications.filter(n => !n.read)
  }

  // Convenience methods for different notification types
  const showSuccess = (title: string, message: string, actionUrl?: string, actionText?: string) => {
    return addNotification({ 
      title, 
      message, 
      type: 'success',
      actionUrl,
      actionText,
    })
  }

  const showError = (title: string, message: string, actionUrl?: string, actionText?: string) => {
    return addNotification({ 
      title, 
      message, 
      type: 'error',
      actionUrl,
      actionText,
    })
  }

  const showWarning = (title: string, message: string, actionUrl?: string, actionText?: string) => {
    return addNotification({ 
      title, 
      message, 
      type: 'warning',
      actionUrl,
      actionText,
    })
  }

  const showInfo = (title: string, message: string, actionUrl?: string, actionText?: string) => {
    return addNotification({ 
      title, 
      message, 
      type: 'info',
      actionUrl,
      actionText,
    })
  }

  // Load notifications from API (placeholder)
  const loadNotifications = async () => {
    state.loading = true
    state.error = null
    
    try {
      // TODO: Replace with actual API call
      // For now, we'll just simulate some notifications
      if (state.notifications.length === 0) {
        // Add some mock notifications for development
        addNotification({
          title: 'Welcome to GO Commerce',
          message: 'Your admin console is ready to use',
          type: 'success',
        })
        
        addNotification({
          title: 'New Order Received',
          message: 'Order #12345 needs processing',
          type: 'info',
          actionUrl: '/orders/12345',
          actionText: 'View Order',
        })
        
        addNotification({
          title: 'Low Inventory Alert',
          message: 'Product "Premium Widget" is running low on stock',
          type: 'warning',
          actionUrl: '/products/premium-widget',
          actionText: 'Manage Inventory',
        })
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to load notifications'
    } finally {
      state.loading = false
    }
  }

  return {
    // State
    notifications: computed(() => state.notifications),
    unreadCount,
    unreadNotifications,
    recentNotifications,
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    
    // Actions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearRead,
    loadNotifications,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.