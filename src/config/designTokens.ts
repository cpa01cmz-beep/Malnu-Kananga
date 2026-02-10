/**
 * Design System Tokens - MA Malnu Kananga
 * Unified sizing, spacing, and component scales
 */

export const DESIGN_TOKENS = {
  /**
   * Spacing Scale - Based on 4px grid system
   */
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },

  /**
   * Component Sizes - Unified across all components
   */
  sizes: {
    sm: {
      padding: {
        x: '1rem',    // 16px
        y: '0.75rem', // 12px
      },
      minHeight: '3rem',      // 48px - above 44px minimum
      fontSize: '0.875rem',   // 14px
      iconSize: '1rem',       // 16px
      borderRadius: '0.75rem', // 12px
    },
    md: {
      padding: {
        x: '1.25rem', // 20px
        y: '0.875rem', // 14px
      },
      minHeight: '3.5rem',    // 56px - comfortable touch target
      fontSize: '0.875rem',   // 14px mobile, 16px desktop
      iconSize: '1.25rem',    // 20px
      borderRadius: '0.875rem', // 14px
    },
    lg: {
      padding: {
        x: '1.5rem',  // 24px
        y: '1rem',    // 16px
      },
      minHeight: '4rem',      // 64px - large touch target
      fontSize: '1rem',       // 16px mobile, 18px desktop
      iconSize: '1.5rem',     // 24px
      borderRadius: '1rem',    // 16px
    },
  },

    /**
   * Typography System - Mobile-first with fluid scaling
   */
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', 'monospace'],
    },
    fontSize: {
      xs: ['0.875rem', { lineHeight: '1.25rem', mobile: '0.8125rem' }], // 13px mobile, 14px desktop
      sm: ['1rem', { lineHeight: '1.5rem', mobile: '0.875rem' }], // 14px mobile, 16px desktop
      base: ['1.125rem', { lineHeight: '1.625rem', mobile: '1rem' }], // 16px mobile, 18px desktop
      lg: ['1.25rem', { lineHeight: '1.75rem', mobile: '1.125rem' }], // 18px mobile, 20px desktop
      xl: ['1.5rem', { lineHeight: '2rem', mobile: '1.25rem' }], // 20px mobile, 24px desktop
      '2xl': ['1.75rem', { lineHeight: '2.25rem', mobile: '1.5rem' }], // 24px mobile, 28px desktop
      '3xl': ['2rem', { lineHeight: '2.5rem', mobile: '1.75rem' }], // 28px mobile, 32px desktop
      '4xl': ['2.5rem', { lineHeight: '3rem', mobile: '2rem' }], // 32px mobile, 40px desktop
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
    fluid: {
      // Fluid typography for responsive scaling
      min: '0.875rem', // 14px minimum
      max: '1.125rem', // 18px maximum
      preferred: 'clamp(0.875rem, 2.5vw, 1.125rem)',
    }
  },

  /**
   * Border Radius Scale
   */
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  /**
   * Shadow Scale
   */
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
    float: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
  },

  /**
   * Animation Durations - Optimized for performance
   */
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  /**
   * Animation Easing
   */
  easing: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Component-specific size classes
 */
export const COMPONENT_SIZES = {
  button: {
    sm: `px-4 py-3 text-sm min-h-[3rem]`,  // 48px minimum
    md: `px-5 py-3.5 text-sm min-h-[3.5rem]`, // 56px comfortable
    lg: `px-6 py-4 text-base min-h-[4rem]`,  // 64px large
    icon: {
      sm: `p-3 min-w-[3rem] min-h-[3rem]`,  // 48px
      md: `p-3 min-w-[3.5rem] min-h-[3.5rem]`, // 56px
      lg: `p-4 min-w-[4rem] min-h-[4rem]`,  // 64px
    }
  },
  input: {
    sm: `px-3 py-3 text-sm min-h-[3rem]`,   // 48px
    md: `px-4 py-3.5 text-sm min-h-[3.5rem]`, // 56px
    lg: `px-5 py-4 text-base min-h-[4rem]`,  // 64px
  },
  card: {
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-6 sm:p-8'
    }
  },
  /**
   * Color System - Enhanced for accessibility
   */
  colors: {
    primary: {
      50: 'hsl(142 71% 88%)',
      100: 'hsl(142 70% 82%)',
      200: 'hsl(142 68% 73%)',
      300: 'hsl(142 70% 58%)',
      400: 'hsl(142 72% 35%)',
      500: 'hsl(142 72% 28%)',
      600: 'hsl(142 76% 27%)',
      700: 'hsl(142 71% 25%)',
      800: 'hsl(142 74% 20%)',
      900: 'hsl(142 76% 15%)',
    },
    semantic: {
      success: 'hsl(142 72% 30%)',
      warning: 'hsl(24 95% 53%)',
      error: 'hsl(0 65% 45%)',
      info: 'hsl(221 83% 53%)',
    },
    neutral: {
      50: 'hsl(220 20% 97%)',
      100: 'hsl(220 19% 93%)',
      200: 'hsl(220 14% 86%)',
      300: 'hsl(220 9% 71%)',
      400: 'hsl(220 9% 60%)',
      500: 'hsl(220 11% 42%)',
      600: 'hsl(215 16% 35%)',
      700: 'hsl(219 28% 22%)',
      800: 'hsl(220 26% 12%)',
      900: 'hsl(220 39% 8%)',
    },
    text: {
      primary: 'hsl(220 39% 8%)',
      secondary: 'hsl(219 28% 22%)',
      tertiary: 'hsl(215 16% 35%)',
      disabled: 'hsl(220 9% 60%)',
      inverse: 'hsl(220 20% 97%)',
    },
    background: {
      primary: 'hsl(220 20% 97%)',
      secondary: 'hsl(220 19% 93%)',
      elevated: 'hsl(0 0% 100%)',
      overlay: 'hsl(220 39% 8% / 0.6)',
    },
    border: {
      primary: 'hsl(220 14% 86%)',
      secondary: 'hsl(220 9% 71%)',
      focus: 'hsl(142 72% 35%)',
      error: 'hsl(0 65% 45%)',
    }
  },

  /**
   * Focus System - Consistent across components
   */
  focus: {
    ring: 'ring-2 ring-offset-2',
    offset: 'ring-offset-white dark:ring-offset-neutral-900',
    primary: 'ring-primary-500/50',
    error: 'ring-red-500/50',
    warning: 'ring-orange-500/50',
    success: 'ring-green-500/50',
  },

  /**
   * Responsive utilities
   */
  responsiveBreakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  } as const,
} as const;