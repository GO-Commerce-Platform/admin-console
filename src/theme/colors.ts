/**
 * Chakra UI Color Theme Configuration
 * Professional blue/gray color palette with accent colors as specified in WARP.md
 * 
 * Related GitHub Issue: #1 - Core Infrastructure
 */

export const colors = {
  // Primary brand colors - Professional blue palette
  primary: {
    50: '#e6f3ff',
    100: '#b3deff',
    200: '#80c8ff',
    300: '#4db2ff',
    400: '#1a9dff',
    500: '#0088ff', // Primary brand color
    600: '#0066cc',
    700: '#004d99',
    800: '#003366',
    900: '#001a33',
  },

  // Secondary colors - Professional gray palette
  secondary: {
    50: '#f7f9fc',
    100: '#e8ecf1',
    200: '#d9e0e7',
    300: '#c4ced9',
    400: '#9aa5b1',
    500: '#697d8a', // Secondary brand color
    600: '#5a6c78',
    700: '#485966',
    800: '#374654',
    900: '#253342',
  },

  // Neutral colors - Enhanced gray scale
  gray: {
    50: '#fafbfc',
    100: '#f2f4f6',
    200: '#e8ecf0',
    300: '#d1d9e0',
    400: '#b4c1cc',
    500: '#95a3b0',
    600: '#7a8794',
    700: '#636e7a',
    800: '#4d5761',
    900: '#374047',
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

  // Background colors for different contexts
  background: {
    default: '#ffffff',
    paper: '#fafbfc',
    elevated: '#f7f9fc',
    sidebar: '#374047',
    header: '#ffffff',
    disabled: '#e8ecf0',
  },

  // Border colors
  border: {
    default: '#e8ecf0',
    light: '#f2f4f6',
    medium: '#d1d9e0',
    dark: '#b4c1cc',
    focus: '#0088ff',
  },

  // Text colors with proper contrast ratios
  text: {
    primary: '#374047',
    secondary: '#636e7a',
    tertiary: '#95a3b0',
    inverse: '#ffffff',
    link: '#0088ff',
    linkHover: '#0066cc',
    disabled: '#b4c1cc',
  },

  // Accent colors for highlights and special elements
  accent: {
    blue: '#0088ff',
    green: '#00d190',
    orange: '#f97316',
    red: '#ef4444',
    purple: '#8b5cf6',
    teal: '#14b8a6',
    pink: '#ec4899',
    indigo: '#6366f1',
  },

  // Status colors for various states
  status: {
    active: '#00d190',
    inactive: '#95a3b0',
    pending: '#f97316',
    draft: '#636e7a',
    archived: '#b4c1cc',
  },

  // Data visualization colors for charts and graphs
  chart: {
    primary: '#0088ff',
    secondary: '#00d190',
    tertiary: '#f97316',
    quaternary: '#8b5cf6',
    quinary: '#ec4899',
    senary: '#14b8a6',
  },
};

// Color mode configurations (light/dark theme support)
export const colorModeConfig = {
  light: {
    background: colors.background.default,
    surface: colors.background.paper,
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
  },
  dark: {
    background: colors.gray[900],
    surface: colors.gray[800],
    primary: colors.primary[400],
    secondary: colors.secondary[400],
    text: colors.text.inverse,
    textSecondary: colors.gray[300],
  },
};

export default colors;

// Copilot: This file may have been generated or refactored by GitHub Copilot.
