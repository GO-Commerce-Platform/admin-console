/**
 * Icon Mapping Utility
 * Maps icon names to actual icon components for use in components like MetricCard
 * 
 * Related GitHub Issue: #11 - Component Library & Design System
 */

import {
  TrendingUp,
  TrendingDown,
  CircleCheck,
  X,
  Building,
  BuildingStore,
  CurrencyDollar,
  Users,
  ShoppingCart,
  Eye,
  Activity,
  Target,
  Gauge,
  Calendar,
  Clock,
  Star,
  Heart,
  MessageCircle,
  Bell,
  Settings,
  ChartBar,
  ChartPie,
  ChartLine
} from '@vicons/tabler'

/**
 * Icon map for string-to-component resolution
 */
export const iconMap = {
  // Trends and indicators
  TrendingUp,
  TrendingDown,
  
  // Status
  CircleCheck,
  X,
  
  // Business
  Building,
  BuildingStore,
  CurrencyDollar,
  Users,
  ShoppingCart,
  
  // Analytics
  Eye,
  Activity,
  Target,
  Gauge,
  ChartBar,
  ChartPie,
  ChartLine,
  
  // Time
  Calendar,
  Clock,
  
  // Engagement
  Star,
  Heart,
  MessageCircle,
  Bell,
  
  // System
  Settings,
  
  // Aliases for backwards compatibility
  CheckCircle: CircleCheck,
  XCircle: X,
}

/**
 * Get icon component by name
 * 
 * @param iconName - The name of the icon
 * @returns The icon component or null if not found
 */
export function getIcon(iconName: string) {
  return iconMap[iconName as keyof typeof iconMap] || null
}

/**
 * Type for available icon names
 */
export type IconName = keyof typeof iconMap

/**
 * Check if an icon exists
 */
export function hasIcon(iconName: string): iconName is IconName {
  return iconName in iconMap
}

// Export the icon map as default for direct access
export default iconMap

// Copilot: This file may have been generated or refactored by GitHub Copilot.