/**
 * Chakra UI Component Style Overrides
 * Custom component styles that align with the GO Commerce Administration Console design system
 *
 * Related GitHub Issue: #1 - Core Infrastructure
 */

// Remove problematic import for now
// import { ComponentStyleConfig } from '@chakra-ui/vue-next'

// Define our own type for component styles
type ComponentStyleConfig = {
  baseStyle?: Record<string, any>
  sizes?: Record<string, Record<string, any>>
  variants?: Record<string, Record<string, any>>
  defaultProps?: Record<string, any>
}

// Button component styles
export const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: '500',
    borderRadius: '6px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    _focus: {
      boxShadow: '0 0 0 3px rgba(0, 136, 255, 0.1)',
    },
  },
  sizes: {
    sm: {
      fontSize: '14px',
      px: '16px',
      py: '8px',
      h: '32px',
    },
    md: {
      fontSize: '16px',
      px: '20px',
      py: '10px',
      h: '40px',
    },
    lg: {
      fontSize: '18px',
      px: '24px',
      py: '12px',
      h: '48px',
    },
  },
  variants: {
    primary: {
      bg: 'primary.500',
      color: 'white',
      _hover: {
        bg: 'primary.600',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 136, 255, 0.3)',
      },
      _active: {
        bg: 'primary.700',
        transform: 'translateY(0)',
      },
    },
    secondary: {
      bg: 'gray.100',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'border.default',
      _hover: {
        bg: 'gray.200',
        borderColor: 'border.medium',
      },
      _active: {
        bg: 'gray.300',
      },
    },
    ghost: {
      bg: 'transparent',
      color: 'text.secondary',
      _hover: {
        bg: 'gray.100',
        color: 'text.primary',
      },
      _active: {
        bg: 'gray.200',
      },
    },
    danger: {
      bg: 'error.500',
      color: 'white',
      _hover: {
        bg: 'error.600',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      },
      _active: {
        bg: 'error.700',
        transform: 'translateY(0)',
      },
    },
  },
  defaultProps: {
    variant: 'primary',
    size: 'md',
  },
}

// Input component styles
export const Input: ComponentStyleConfig = {
  baseStyle: {
    field: {
      borderRadius: '6px',
      border: '1px solid',
      borderColor: 'border.default',
      bg: 'background.default',
      transition: 'all 0.2s',
      _hover: {
        borderColor: 'border.medium',
      },
      _focus: {
        borderColor: 'primary.500',
        boxShadow: '0 0 0 1px rgba(0, 136, 255, 0.6)',
      },
      _invalid: {
        borderColor: 'error.500',
        boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.6)',
      },
    },
  },
  sizes: {
    sm: {
      field: {
        fontSize: '14px',
        px: '12px',
        h: '32px',
      },
    },
    md: {
      field: {
        fontSize: '16px',
        px: '16px',
        h: '40px',
      },
    },
    lg: {
      field: {
        fontSize: '18px',
        px: '20px',
        h: '48px',
      },
    },
  },
  defaultProps: {
    size: 'md',
  },
}

// Card component styles
export const Card: ComponentStyleConfig = {
  baseStyle: {
    container: {
      bg: 'background.paper',
      borderRadius: '8px',
      border: '1px solid',
      borderColor: 'border.light',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s',
      _hover: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-1px)',
      },
    },
    header: {
      px: '24px',
      py: '20px',
      borderBottom: '1px solid',
      borderBottomColor: 'border.light',
    },
    body: {
      px: '24px',
      py: '20px',
    },
    footer: {
      px: '24px',
      py: '16px',
      borderTop: '1px solid',
      borderTopColor: 'border.light',
      bg: 'background.elevated',
    },
  },
  variants: {
    elevated: {
      container: {
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        _hover: {
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    outline: {
      container: {
        bg: 'transparent',
        border: '1px solid',
        borderColor: 'border.default',
        boxShadow: 'none',
      },
    },
  },
  defaultProps: {
    variant: 'elevated',
  },
}

// Table component styles
export const Table: ComponentStyleConfig = {
  baseStyle: {
    table: {
      borderCollapse: 'collapse',
      width: 'full',
    },
    thead: {
      bg: 'background.elevated',
    },
    th: {
      fontWeight: '600',
      textTransform: 'none',
      letterSpacing: '0',
      fontSize: '14px',
      color: 'text.secondary',
      borderBottom: '2px solid',
      borderBottomColor: 'border.light',
      px: '16px',
      py: '12px',
      textAlign: 'left',
    },
    td: {
      fontSize: '14px',
      px: '16px',
      py: '12px',
      borderBottom: '1px solid',
      borderBottomColor: 'border.light',
      color: 'text.primary',
    },
    tbody: {
      tr: {
        _hover: {
          bg: 'background.elevated',
        },
        _selected: {
          bg: 'primary.50',
        },
      },
    },
  },
  variants: {
    striped: {
      tbody: {
        tr: {
          '&:nth-of-type(odd)': {
            bg: 'background.elevated',
          },
        },
      },
    },
  },
}

// Modal component styles
export const Modal: ComponentStyleConfig = {
  baseStyle: {
    dialog: {
      bg: 'background.default',
      borderRadius: '12px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 10px 20px rgba(0, 0, 0, 0.1)',
    },
    header: {
      px: '24px',
      py: '20px',
      fontSize: '20px',
      fontWeight: '600',
      borderBottom: '1px solid',
      borderBottomColor: 'border.light',
    },
    body: {
      px: '24px',
      py: '20px',
    },
    footer: {
      px: '24px',
      py: '16px',
      borderTop: '1px solid',
      borderTopColor: 'border.light',
      bg: 'background.elevated',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    overlay: {
      bg: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
    },
  },
  sizes: {
    sm: {
      dialog: { maxW: '400px' },
    },
    md: {
      dialog: { maxW: '500px' },
    },
    lg: {
      dialog: { maxW: '700px' },
    },
    xl: {
      dialog: { maxW: '900px' },
    },
    full: {
      dialog: { maxW: '100vw', h: '100vh', borderRadius: '0' },
    },
  },
  defaultProps: {
    size: 'md',
  },
}

// Badge component styles
export const Badge: ComponentStyleConfig = {
  baseStyle: {
    px: '8px',
    py: '4px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  variants: {
    solid: {
      bg: 'gray.500',
      color: 'white',
    },
    subtle: {
      bg: 'gray.100',
      color: 'gray.800',
    },
    success: {
      bg: 'success.500',
      color: 'white',
    },
    warning: {
      bg: 'warning.500',
      color: 'white',
    },
    error: {
      bg: 'error.500',
      color: 'white',
    },
    info: {
      bg: 'info.500',
      color: 'white',
    },
  },
  defaultProps: {
    variant: 'subtle',
  },
}

// Alert component styles
export const Alert: ComponentStyleConfig = {
  baseStyle: {
    container: {
      borderRadius: '6px',
      border: '1px solid',
      px: '16px',
      py: '12px',
    },
    title: {
      fontWeight: '600',
      fontSize: '16px',
      mb: '4px',
    },
    description: {
      fontSize: '14px',
    },
  },
  variants: {
    info: {
      container: {
        bg: 'info.50',
        borderColor: 'info.200',
        color: 'info.800',
      },
    },
    warning: {
      container: {
        bg: 'warning.50',
        borderColor: 'warning.200',
        color: 'warning.800',
      },
    },
    success: {
      container: {
        bg: 'success.50',
        borderColor: 'success.200',
        color: 'success.800',
      },
    },
    error: {
      container: {
        bg: 'error.50',
        borderColor: 'error.200',
        color: 'error.800',
      },
    },
  },
  defaultProps: {
    variant: 'info',
  },
}

// Export all component overrides
export const components = {
  Button,
  Input,
  Card,
  Table,
  Modal,
  Badge,
  Alert,
}

export default components

// Copilot: This file may have been generated or refactored by GitHub Copilot.
