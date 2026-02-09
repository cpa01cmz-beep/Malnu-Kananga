/**
 * Enhanced Design Token System for MA Malnu Kananga
 * Centralized design variables for consistency and maintainability
 */

export const DESIGN_TOKENS = {
  // Spacing System - 8px base unit
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
    '5xl': '8rem',    // 128px
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
      '5xl': ['3rem', { lineHeight: '1' }],         // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Color System - Enhanced with semantic colors
  colors: {
    // Primary palette
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },

    // Semantic colors
    semantic: {
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
      },
      info: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49',
      },
    },

    // Neutral colors
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
  },

  // Border Radius System
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  },

  // Shadow System
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    
    // Enhanced shadows for depth
    glow: '0 0 20px rgb(59 130 246 / 0.3)',
    glowLg: '0 0 40px rgb(59 130 246 / 0.4)',
    colored: {
      success: '0 10px 15px -3px rgb(34 197 94 / 0.1)',
      warning: '0 10px 15px -3px rgb(245 158 11 / 0.1)',
      error: '0 10px 15px -3px rgb(239 68 68 / 0.1)',
      info: '0 10px 15px -3px rgb(14 165 233 / 0.1)',
    },
  },

  // Animation System
  animation: {
    // Duration
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },

    // Easing functions
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      
      // Custom easing for better UX
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },

    // Keyframes
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      spin: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      bounce: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-25%)' },
      },
      wiggle: {
        '0%, 100%': { transform: 'rotate(-3deg)' },
        '50%': { transform: 'rotate(3deg)' },
      },
      shake: {
        '0%, 100%': { transform: 'translateX(0)' },
        '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
        '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
      },
      glow: {
        '0%, 100%': { boxShadow: '0 0 5px rgb(59 130 246 / 0.5)' },
        '50%': { boxShadow: '0 0 20px rgb(59 130 246 / 0.8)' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
    },
  },

  // Breakpoint System
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index System
  zIndex: {
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
    focus: 9999,
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2.5rem',    // 40px
        md: '3rem',      // 48px
        lg: '3.5rem',    // 56px
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
      borderRadius: '0.5rem', // 8px
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      },
    },

    input: {
      height: '3rem',    // 48px
      padding: '0.75rem 1rem',
      borderRadius: '0.375rem', // 6px
      fontSize: '1rem',
    },

    card: {
      padding: '1.5rem',
      borderRadius: '0.75rem', // 12px
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },

    modal: {
      borderRadius: '1rem', // 16px
      padding: '2rem',
      maxWidth: '90vw',
      maxHeight: '90vh',
    },
  },
} as const;

// Helper functions for accessing tokens
export const getToken = (category: keyof typeof DESIGN_TOKENS, token: string) => {
  const categoryTokens = DESIGN_TOKENS[category];
  if (typeof categoryTokens === 'object' && categoryTokens !== null) {
    return (categoryTokens as Record<string, unknown>)[token];
  }
  return undefined;
};

export const spacing = (size: keyof typeof DESIGN_TOKENS.spacing) => DESIGN_TOKENS.spacing[size];
export const fontSize = (size: keyof typeof DESIGN_TOKENS.typography.fontSize) => DESIGN_TOKENS.typography.fontSize[size];
export const fontWeight = (weight: keyof typeof DESIGN_TOKENS.typography.fontWeight) => DESIGN_TOKENS.typography.fontWeight[weight];
export const borderRadius = (size: keyof typeof DESIGN_TOKENS.borderRadius) => DESIGN_TOKENS.borderRadius[size];
export const shadow = (size: keyof typeof DESIGN_TOKENS.shadows) => DESIGN_TOKENS.shadows[size];

// CSS custom properties for dynamic theming
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {};
  
  // Spacing
  Object.entries(DESIGN_TOKENS.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });
  
  // Colors
  Object.entries(DESIGN_TOKENS.colors.primary).forEach(([key, value]) => {
    cssVars[`--color-primary-${key}`] = value;
  });
  
  Object.entries(DESIGN_TOKENS.colors.semantic).forEach(([semanticType, colors]) => {
    Object.entries(colors).forEach(([key, value]) => {
      cssVars[`--color-${semanticType}-${key}`] = value;
    });
  });
  
  // Typography
  Object.entries(DESIGN_TOKENS.typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = Array.isArray(value) ? value[0] : String(value);
  });
  
  // Border radius
  Object.entries(DESIGN_TOKENS.borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value;
  });
  
  // Shadows
  Object.entries(DESIGN_TOKENS.shadows).forEach(([key, value]) => {
    if (typeof value === 'string') {
      cssVars[`--shadow-${key}`] = value;
    }
  });
  
  return cssVars;
};

export default DESIGN_TOKENS;