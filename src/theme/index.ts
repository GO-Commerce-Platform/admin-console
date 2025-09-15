/**
 * Main Theme Configuration for GO Commerce Administration Console
 * Legacy theme file - now using Naive UI theme in naive.ts
 *
 * Related GitHub Issue: #25 - UI Migration to Naive UI
 */

// Export a simple theme object for backward compatibility
// The actual theme is now in ./naive.ts
export const colors = {
  primary: {
    50: '#f8f6ff',
    500: '#9c4eff',
    900: '#4c1d95',
  }
}

export const colorModeConfig = {
  initialColorMode: 'dark'
}

// Simple fallback theme for backward compatibility
export const theme = {
  colors,
  colorModeConfig,
}

export default theme

// Copilot: This file may have been generated or refactored by GitHub Copilot.
