/**
 * Chakra UI Color Theme Configuration
 * Modern dark theme with purple/indigo gradients inspired by template design
 *
 * Related GitHub Issue: #11 - Component Library & Design System
 */

export const colors = {
  // Primary brand colors - Deep purple/indigo palette (main brand)
  primary: {
    50: '#f0f0ff',
    100: '#e0e0ff',
    200: '#c7c7ff',
    300: '#a5a5ff',
    400: '#8080ff',
    500: '#6366f1', // Primary brand color (indigo-500)
    600: '#4f46e5', // Indigo-600
    700: '#4338ca', // Indigo-700
    800: '#3730a3', // Indigo-800
    900: '#312e81', // Indigo-900
  },

  // Secondary colors - Purple palette for accents
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Purple-500
    600: '#9333ea', // Purple-600
    700: '#7c3aed', // Purple-700
    800: '#6b21a8', // Purple-800
    900: '#581c87', // Purple-900
  },

  // Neutral colors - Dark theme gray scale
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b', // Main dark background
    900: '#0f172a', // Darkest background
  },

  // Success colors
  success: {
    50: '#e6fffa',
    100: '#b3f5e5',
    200: '#7fedd0',
    300: '#4ce4bb',
    400: '#1adba6',
    500: '#00d190', // Success color
    600: '#00a973',
    700: '#008056',
    800: '#005839',
    900: '#00301c',
  },

  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fed7a3',
    300: '#fdb87f',
    400: '#fc975b',
    500: '#f97316', // Warning color
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Error color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info colors
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Info color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Background colors for dark theme
  background: {
    default: '#0f172a', // Main dark background (gray-900)
    paper: '#1e293b', // Card/paper background (gray-800)
    elevated: '#334155', // Elevated elements (gray-700)
    sidebar: '#1e293b', // Sidebar background
    header: 'rgba(30, 41, 59, 0.8)', // Semi-transparent header
    disabled: '#475569', // Disabled state
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)', // Gradient background
    card: 'rgba(30, 41, 59, 0.6)', // Semi-transparent card with glassmorphism
    overlay: 'rgba(15, 23, 42, 0.8)', // Modal overlay
  },

  // Border colors for dark theme
  border: {
    default: 'rgba(71, 85, 105, 0.3)', // Semi-transparent border
    light: 'rgba(100, 116, 139, 0.2)', // Lighter border
    medium: 'rgba(71, 85, 105, 0.5)', // Medium border
    dark: 'rgba(51, 65, 85, 0.8)', // Darker border
    focus: '#6366f1', // Primary focus color
    glow: 'rgba(99, 102, 241, 0.3)', // Glowing border effect
  },

  // Text colors optimized for dark theme
  text: {
    primary: '#f8fafc', // High contrast white text
    secondary: '#cbd5e1', // Medium contrast gray text
    tertiary: '#94a3b8', // Low contrast gray text
    inverse: '#0f172a', // Dark text for light backgrounds
    link: '#8b5cf6', // Purple link color
    linkHover: '#a855f7', // Lighter purple on hover
    disabled: '#64748b', // Disabled text color
    muted: '#64748b', // Muted text
    accent: '#06b6d4', // Cyan accent text
  },

  // Bright accent colors for highlights and special elements
  accent: {
    blue: '#3b82f6', // Bright blue
    green: '#10b981', // Bright green (emerald)
    orange: '#f59e0b', // Bright orange (amber)
    red: '#ef4444', // Bright red
    purple: '#8b5cf6', // Bright purple (violet)
    teal: '#06b6d4', // Bright teal (cyan)
    pink: '#ec4899', // Bright pink
    indigo: '#6366f1', // Bright indigo
    yellow: '#eab308', // Bright yellow
    lime: '#84cc16', // Bright lime
  },

  // Status colors for various states
  status: {
    active: '#00d190',
    inactive: '#95a3b0',
    pending: '#f97316',
    draft: '#636e7a',
    archived: '#b4c1cc',
  },

  // Data visualization colors for charts and graphs (bright and distinct)
  chart: {
    primary: '#6366f1', // Indigo
    secondary: '#10b981', // Emerald
    tertiary: '#f59e0b', // Amber
    quaternary: '#8b5cf6', // Violet
    quinary: '#ec4899', // Pink
    senary: '#06b6d4', // Cyan
    septenary: '#ef4444', // Red
    octonary: '#84cc16', // Lime
  },

  // Glassmorphism effect colors
  glass: {
    primary: 'rgba(99, 102, 241, 0.1)', // Primary with transparency
    secondary: 'rgba(168, 85, 247, 0.1)', // Secondary with transparency
    white: 'rgba(255, 255, 255, 0.1)', // White glass effect
    dark: 'rgba(15, 23, 42, 0.6)', // Dark glass effect
    card: 'rgba(30, 41, 59, 0.6)', // Card glass effect
  },
}

// Color mode configurations (primarily dark theme)
export const colorModeConfig = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    text: '#0f172a',
    textSecondary: '#475569',
  },
  dark: {
    background: colors.background.default, // #0f172a
    surface: colors.background.paper, // #1e293b
    primary: colors.primary[500], // #6366f1
    secondary: colors.secondary[500], // #a855f7
    text: colors.text.primary, // #f8fafc
    textSecondary: colors.text.secondary, // #cbd5e1
  },
}

export default colors

// Copilot: This file may have been generated or refactored by GitHub Copilot.
