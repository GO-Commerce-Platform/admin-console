/**
 * Naive UI Theme Configuration
 * 
 * Custom dark theme with glassmorphism effects for GO Commerce Admin Console
 * 
 * Related GitHub Issue: #25 - UI Migration from Chakra UI to Naive UI
 */

import type { GlobalThemeOverrides } from 'naive-ui'

/**
 * Custom color palette matching the existing design
 */
const colors = {
  // Primary brand colors - purple theme
  primary: {
    50: '#f8f6ff',
    100: '#f1ebff', 
    200: '#e4d4ff',
    300: '#d1b3ff',
    400: '#b884ff',
    500: '#9c4eff', // Main brand color
    600: '#7c3aed',
    700: '#6b21d4',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  
  // Background colors for glassmorphism
  background: {
    primary: 'rgba(15, 23, 42, 0.95)',      // slate-900 with opacity
    secondary: 'rgba(30, 41, 59, 0.8)',     // slate-800 with opacity  
    tertiary: 'rgba(51, 65, 85, 0.6)',      // slate-700 with opacity
    card: 'rgba(30, 41, 59, 0.6)',          // Card backgrounds
    overlay: 'rgba(0, 0, 0, 0.4)',          // Modal overlays
  },
  
  // Text colors
  text: {
    primary: '#f1f5f9',    // slate-100
    secondary: '#cbd5e1',  // slate-300  
    tertiary: '#94a3b8',   // slate-400
    muted: '#64748b',      // slate-500
  },
  
  // Border colors
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    accent: 'rgba(156, 78, 255, 0.4)',
  },
  
  // Status colors
  success: '#10b981',  // emerald-500
  warning: '#f59e0b',  // amber-500  
  error: '#ef4444',    // red-500
  info: '#3b82f6',     // blue-500
}

/**
 * Custom Naive UI theme overrides
 */
export const themeOverrides: GlobalThemeOverrides = {
  common: {
    // Primary brand color
    primaryColor: colors.primary[500],
    primaryColorHover: colors.primary[400],
    primaryColorPressed: colors.primary[600],
    primaryColorSuppl: colors.primary[300],
    
    // Background colors
    bodyColor: colors.background.primary,
    cardColor: colors.background.card,
    modalColor: colors.background.secondary,
    popoverColor: colors.background.secondary,
    tableColor: colors.background.card,
    
    // Text colors
    textColorBase: colors.text.primary,
    textColor1: colors.text.primary,
    textColor2: colors.text.secondary, 
    textColor3: colors.text.tertiary,
    textColorDisabled: colors.text.muted,
    
    // Border colors
    borderColor: colors.border.light,
    dividerColor: colors.border.light,
    
    // Status colors
    successColor: colors.success,
    warningColor: colors.warning,
    errorColor: colors.error,
    infoColor: colors.info,
    
    // Border radius for consistent rounded corners
    borderRadius: '12px',
    borderRadiusSmall: '8px',
    
    // Font settings
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    fontSizeLarge: '16px',
    fontSizeSmall: '12px',
    
    // Box shadow for glassmorphism effect
    boxShadow1: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    boxShadow2: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(156, 78, 255, 0.2)',
    boxShadow3: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(156, 78, 255, 0.3)',
  },
  
  // Button component overrides
  Button: {
    colorPrimary: colors.primary[500],
    colorHoverPrimary: colors.primary[400],
    colorPressedPrimary: colors.primary[600],
    colorFocusPrimary: colors.primary[400],
    
    // Glassmorphism button styles
    colorSecondary: colors.background.tertiary,
    colorHoverSecondary: colors.background.secondary,
    
    borderRadiusMedium: '8px',
    borderRadiusLarge: '12px',
    
    // Enhanced button shadows
    boxShadowHover: '0 8px 25px rgba(156, 78, 255, 0.25)',
    boxShadowPressed: '0 4px 12px rgba(156, 78, 255, 0.35)',
  },
  
  // Card component overrides for glassmorphism
  Card: {
    color: colors.background.card,
    colorModal: colors.background.secondary,
    borderColor: colors.border.light,
    borderRadius: '12px',
    
    // Enhanced card shadows
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  
  // Table component overrides
  DataTable: {
    borderColor: colors.border.light,
    thColor: colors.background.secondary,
    tdColor: 'transparent',
    tdColorHover: colors.background.tertiary,
    tdColorStriped: colors.background.tertiary,
    borderRadius: '12px',
    
    // Table header styling
    thTextColor: colors.text.secondary,
    thFontWeight: '600',
  },
  
  // Input component overrides
  Input: {
    color: colors.background.tertiary,
    colorFocus: colors.background.secondary,
    border: `1px solid ${colors.border.light}`,
    borderFocus: `1px solid ${colors.border.accent}`,
    borderRadius: '8px',
    textColor: colors.text.primary,
    placeholderColor: colors.text.muted,
    
    // Enhanced input shadows  
    boxShadowFocus: `0 0 0 2px ${colors.primary[500]}25`,
  },
  
  // Select component overrides
  Select: {
    color: colors.background.tertiary,
    colorFocus: colors.background.secondary,
    optionColor: colors.background.secondary,
    optionColorHover: colors.background.tertiary,
    optionTextColor: colors.text.primary,
    borderRadius: '8px',
  },
  
  // Menu/Dropdown component overrides
  Dropdown: {
    color: colors.background.secondary,
    borderColor: colors.border.light,
    borderRadius: '8px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  },
  
  // Modal component overrides
  Modal: {
    color: colors.background.secondary,
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  },
  
  // Dialog component overrides
  Dialog: {
    color: colors.background.secondary,
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  },
}

// Theme configuration is exported via themeOverrides above
// The base theme (darkTheme) is imported directly from naive-ui in main.ts

/**
 * Export colors for use in components
 */
export { colors }

// Copilot: This file may have been generated or refactored by GitHub Copilot.