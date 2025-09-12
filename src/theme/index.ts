/**
 * Main Theme Configuration for GO Commerce Administration Console
 * Combines colors, components, typography, and spacing into a cohesive theme
 *
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import { extendTheme } from '@chakra-ui/vue-next'
import { colors, colorModeConfig } from './colors'
// import { components } from './components' // Temporarily disabled to avoid type issues

// Typography configuration - System fonts with clear hierarchy
const fonts = {
  heading: `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
  body: `"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
  mono: `"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", "Menlo", "Consolas", monospace`,
}

// Font sizes with typographic scale
const fontSizes = {
  xs: '12px', // Captions, labels
  sm: '14px', // Small text, table content
  md: '16px', // Body text, default
  lg: '18px', // Large text, subtitles
  xl: '20px', // Page headers, card titles
  '2xl': '24px', // Section headers
  '3xl': '30px', // Page titles
  '4xl': '36px', // Main headlines
  '5xl': '48px', // Hero headings
  '6xl': '60px', // Display headings
}

// Font weights
const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
}

// Spacing using 8px grid system as specified in WARP.md
const space = {
  px: '1px',
  0.5: '2px',
  1: '4px',
  2: '8px', // Base unit
  3: '12px',
  4: '16px', // 2x base
  5: '20px',
  6: '24px', // 3x base
  7: '28px',
  8: '32px', // 4x base
  9: '36px',
  10: '40px', // 5x base
  12: '48px', // 6x base
  14: '56px', // 7x base
  16: '64px', // 8x base
  20: '80px', // 10x base
  24: '96px', // 12x base
  28: '112px', // 14x base
  32: '128px', // 16x base
  36: '144px', // 18x base
  40: '160px', // 20x base
  44: '176px', // 22x base
  48: '192px', // 24x base
  52: '208px', // 26x base
  56: '224px', // 28x base
  60: '240px', // 30x base
  64: '256px', // 32x base
  72: '288px', // 36x base
  80: '320px', // 40x base
  96: '384px', // 48x base
}

// Responsive breakpoints as specified in WARP.md
const breakpoints = {
  base: '0px', // Mobile first
  sm: '320px', // Small mobile
  md: '768px', // Tablet
  lg: '1024px', // Desktop
  xl: '1280px', // Large desktop
  '2xl': '1536px', // Extra large desktop
}

// Sizing values
const sizes = {
  ...space,
  max: 'max-content',
  min: 'min-content',
  full: '100%',
  '3xs': '14rem',
  '2xs': '16rem',
  xs: '20rem',
  sm: '24rem',
  md: '28rem',
  lg: '32rem',
  xl: '36rem',
  '2xl': '42rem',
  '3xl': '48rem',
  '4xl': '56rem',
  '5xl': '64rem',
  '6xl': '72rem',
  '7xl': '80rem',
  '8xl': '90rem',
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },
}

// Border radius values
const radii = {
  none: '0',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
}

// Shadow values
const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
  focus: '0 0 0 3px rgba(0, 136, 255, 0.1)',
  none: 'none',
}

// Z-index values
const zIndices = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
}

// Transition configurations
const transition = {
  property: {
    common: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
    colors: 'background-color, border-color, color, fill, stroke',
    dimensions: 'width, height',
    position: 'left, right, top, bottom',
    background: 'background-color, background-image, background-position',
  },
  easing: {
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    'ultra-fast': '50ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    'ultra-slow': '500ms',
  },
}

// Line heights for better typography
const lineHeights = {
  normal: 'normal',
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.625,
  taller: '2',
  3: '.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
}

// Letter spacing
const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
}

// Global styles
const styles = {
  global: {
    // Reset and base styles
    '*': {
      boxSizing: 'border-box',
    },
    html: {
      fontSize: '16px',
      lineHeight: 1.5,
    },
    body: {
      fontFamily: 'body',
      color: 'text.primary',
      bg: 'background.default',
      transition: 'color 0.2s, background-color 0.2s',
      lineHeight: 'base',
      fontFeatureSettings: `'kern' 1`,
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    // Focus styles
    '*:focus': {
      outline: '2px solid',
      outlineColor: 'primary.500',
      outlineOffset: '2px',
    },
    // Selection styles
    '::selection': {
      bg: 'primary.100',
      color: 'primary.800',
    },
    // Placeholder styles
    '::placeholder': {
      color: 'text.tertiary',
    },
    // Link styles
    a: {
      color: 'text.link',
      textDecoration: 'none',
      transition: 'color 0.2s',
      _hover: {
        color: 'text.linkHover',
        textDecoration: 'underline',
      },
    },
    // Button reset
    'button, input, select, textarea': {
      fontFamily: 'inherit',
      fontSize: 'inherit',
    },
    // Scrollbar styles (webkit)
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'gray.100',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'gray.400',
      borderRadius: 'base',
      _hover: {
        bg: 'gray.500',
      },
    },
  },
}

// Configuration for color mode (light/dark theme)
const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
  cssVarPrefix: 'gocommerce',
}

// Create and export the theme (without components for now)
export const theme = extendTheme({
  colors,
  // components, // Temporarily disabled
  fonts,
  fontSizes,
  fontWeights,
  space,
  sizes,
  breakpoints,
  radii,
  shadows,
  zIndices,
  transition,
  lineHeights,
  letterSpacings,
  styles,
  config,
  // Color mode configuration
  colorModeConfig,
  // Semantic tokens for better color management
  semanticTokens: {
    colors: {
      // Text colors
      'text-primary': {
        default: 'gray.900',
        _dark: 'gray.100',
      },
      'text-secondary': {
        default: 'gray.600',
        _dark: 'gray.400',
      },
      'text-tertiary': {
        default: 'gray.500',
        _dark: 'gray.500',
      },
      // Background colors
      'bg-canvas': {
        default: 'white',
        _dark: 'gray.900',
      },
      'bg-surface': {
        default: 'gray.50',
        _dark: 'gray.800',
      },
      // Border colors
      'border-default': {
        default: 'gray.200',
        _dark: 'gray.700',
      },
      'border-muted': {
        default: 'gray.100',
        _dark: 'gray.800',
      },
    },
  },
})

export default theme

// Copilot: This file may have been generated or refactored by GitHub Copilot.
