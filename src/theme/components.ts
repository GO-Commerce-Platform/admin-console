/**
 * LEGACY - Component Style Configurations
 * 
 * This file contains legacy component style configurations from the Chakra UI migration.
 * These styles are preserved for reference and potential integration with Naive UI theming.
 * 
 * Current UI Framework: Naive UI
 * Previous UI Framework: Chakra UI (migrated)
 *
 * Related GitHub Issue: #25 - UI Migration from Chakra UI to Naive UI
 * Related GitHub Issue: #11 - Component Library & Design System
 */

// LEGACY: This type was used for Chakra UI component styling
type LegacyComponentStyleConfig = {
  baseStyle?: Record<string, any>
  sizes?: Record<string, Record<string, any>>
  variants?: Record<string, Record<string, any>>
  defaultProps?: Record<string, any>
}

// LEGACY - Button component styles with glassmorphism (Chakra UI)
export const LegacyButton: LegacyComponentStyleConfig = {
  baseStyle: {
    fontWeight: '500',
    borderRadius: '8px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid transparent',
    _focus: {
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.6), 0 0 20px rgba(99, 102, 241, 0.3)',
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
      bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: 'white',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.2)',
        bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      },
      _active: {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
      },
    },
    secondary: {
      bg: 'rgba(71, 85, 105, 0.3)',
      color: 'text.primary',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      backdropFilter: 'blur(12px)',
      _hover: {
        bg: 'rgba(71, 85, 105, 0.4)',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      },
      _active: {
        bg: 'rgba(71, 85, 105, 0.5)',
        transform: 'translateY(0)',
      },
    },
    ghost: {
      bg: 'transparent',
      color: 'text.secondary',
      _hover: {
        bg: 'rgba(71, 85, 105, 0.2)',
        color: 'text.primary',
        transform: 'translateY(-1px)',
      },
      _active: {
        bg: 'rgba(71, 85, 105, 0.3)',
        transform: 'translateY(0)',
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

// LEGACY - Input component styles (Chakra UI)
export const LegacyInput: LegacyComponentStyleConfig = {
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

// LEGACY - Card component styles with glassmorphism (Chakra UI)
export const LegacyCard: LegacyComponentStyleConfig = {
  baseStyle: {
    container: {
      bg: 'rgba(30, 41, 59, 0.6)',
      borderRadius: '12px',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      _hover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 0.4)',
      },
    },
    header: {
      px: '24px',
      py: '20px',
      borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
      borderTopRadius: '12px',
    },
    body: {
      px: '24px',
      py: '20px',
    },
    footer: {
      px: '24px',
      py: '16px',
      borderTop: '1px solid rgba(71, 85, 105, 0.2)',
      bg: 'rgba(51, 65, 85, 0.3)',
      borderBottomRadius: '12px',
    },
  },
  variants: {
    elevated: {
      container: {
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.1)',
        _hover: {
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.3)',
          transform: 'translateY(-6px)',
        },
      },
    },
    outline: {
      container: {
        bg: 'transparent',
        border: '1px solid rgba(71, 85, 105, 0.4)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'none',
      },
    },
    glass: {
      container: {
        bg: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
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
