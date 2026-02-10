/**
 * Enhanced Design Token System for MA Malnu Kananga
 * Centralized design variables for consistency and maintainability
 */

export const DESIGN_TOKENS = {
  // Enhanced Spacing System - 8px base unit with better visual rhythm
  spacing: {
    // Micro spacing for tight layouts
    px: '0.0625rem',  // 1px
    '0.5': '0.125rem', // 2px
    xs: '0.25rem',     // 4px
    
    // Small spacing for components
    sm: '0.5rem',      // 8px
    '1.5': '0.75rem',  // 12px
    
    // Medium spacing for layouts
    md: '1rem',        // 16px
    '2.5': '1.625rem', // 26px
    
    // Large spacing for sections
    lg: '1.5rem',      // 24px
    '3.5': '2.25rem',  // 36px
    xl: '2rem',        // 32px
    '4.5': '2.75rem',  // 44px
    
    // Extra large spacing for containers
    '2xl': '3rem',     // 48px
    '5.5': '3.5rem',   // 56px
    '3xl': '4rem',     // 64px
    '6.5': '4.25rem',  // 68px
    
    // XXL spacing for hero sections
    '4xl': '6rem',     // 96px
    '7xl': '7rem',     // 112px
    '5xl': '8rem',     // 128px
    '8xl': '9rem',     // 144px
    '9xl': '10rem',    // 160px
    '10xl': '12rem',   // 192px
  },

  // Enhanced Typography Scale with better visual hierarchy
  typography: {
    fontFamily: {
      sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia serif', 'Georgia', 'serif'],
      mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'monospace'],
      display: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
    },
    // Enhanced font size scale with fluid typography and better hierarchy
    fontSize: {
      // Text scale
      xs: ['clamp(0.75rem, 0.8vw, 0.875rem)', { lineHeight: '1.25rem' }],      // 12-14px
      sm: ['clamp(0.875rem, 1vw, 1rem)', { lineHeight: '1.5rem' }],           // 14-16px
      base: ['clamp(1rem, 1.2vw, 1.125rem)', { lineHeight: '1.6rem' }],      // 16-18px
      lg: ['clamp(1.125rem, 1.4vw, 1.25rem)', { lineHeight: '1.75rem' }],     // 18-20px
      xl: ['clamp(1.25rem, 1.6vw, 1.375rem)', { lineHeight: '1.75rem' }],     // 20-22px
      '2xl': ['clamp(1.5rem, 2vw, 1.75rem)', { lineHeight: '1.875rem' }],     // 24-28px
      
      // Heading scale
      '3xl': ['clamp(1.875rem, 2.5vw, 2.25rem)', { lineHeight: '2.25rem' }], // 30-36px
      '4xl': ['clamp(2.25rem, 3vw, 2.75rem)', { lineHeight: '2.5rem' }],     // 36-44px
      '5xl': ['clamp(3rem, 4vw, 3.5rem)', { lineHeight: '1.1' }],             // 48-56px
      '6xl': ['clamp(3.75rem, 5vw, 4.5rem)', { lineHeight: '1.1' }],           // 60-72px
      '7xl': ['clamp(4.5rem, 6vw, 5.5rem)', { lineHeight: '1.05' }],          // 72-88px
      '8xl': ['clamp(5rem, 7vw, 6.5rem)', { lineHeight: '1' }],               // 80-104px
      '9xl': ['clamp(6rem, 8vw, 7.5rem)', { lineHeight: '1' }],               // 96-120px
      
      // Display scale for hero sections
      display: ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
    },
    // Enhanced font weight with better contrast
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    // Enhanced letter spacing for better readability
    letterSpacing: {
      tighter: ['-0.05em', { '@media (max-width: 768px)': '-0.025em' }],
      tight: ['-0.025em', { '@media (max-width: 768px)': '-0.01em' }],
      normal: '0em',
      wide: ['0.025em', { '@media (max-width: 768px)': '0.01em' }],
      wider: ['0.05em', { '@media (max-width: 768px)': '0.025em' }],
      widest: ['0.1em', { '@media (max-width: 768px)': '0.05em' }],
    },
    // Line height scale for better readability
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '1.75',
      extra: '2',
    },
  },

  // Enhanced Color System with better semantic colors and WCAG AA compliance
  colors: {
    // Primary palette - Enhanced emerald for better brand recognition
    primary: {
      50: '#f0fdf9',
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

    // Enhanced semantic colors with better contrast ratios
    semantic: {
      success: {
        50: '#f0fdf9',
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
      // New semantic colors for better UX
      brand: {
        50: '#f0fdf9',
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
      accent: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e',
      },
    },

    // Enhanced neutral colors with better contrast
    neutral: {
      0: '#ffffff',
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

    // Surface colors for better depth
    surface: {
      0: '#ffffff',
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

  // Enhanced Animation System with better micro-interactions
  animation: {
    // Duration with better UX timing
    duration: {
      instant: '50ms',
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
      slower: '600ms',
      slowerX: '800ms',
    },

    // Enhanced easing functions for better feel
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      
      // Custom easing for premium UX
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      crisp: 'cubic-bezier(0.4, 0, 0.2, 1)',
      butter: 'cubic-bezier(0.25, 1, 0.5, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },

    // Enhanced keyframes for sophisticated animations
    keyframes: {
      // Basic animations
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      
      // Enhanced slide animations with easing
      slideInEnhanced: {
        '0%': { 
          transform: 'translateX(-100%) rotateY(-15deg)',
          opacity: '0',
          filter: 'blur(4px)'
        },
        '50%': {
          transform: 'translateX(-50%) rotateY(-7deg)',
          opacity: '0.5',
          filter: 'blur(2px)'
        },
        '100%': { 
          transform: 'translateX(0) rotateY(0deg)',
          opacity: '1',
          filter: 'blur(0px)'
        },
      },
      
      slideOutEnhanced: {
        '0%': { 
          transform: 'translateX(0) rotateY(0deg)',
          opacity: '1',
          filter: 'blur(0px)'
        },
        '50%': {
          transform: 'translateX(50%) rotateY(7deg)',
          opacity: '0.5',
          filter: 'blur(2px)'
        },
        '100%': { 
          transform: 'translateX(100%) rotateY(15deg)',
          opacity: '0',
          filter: 'blur(4px)'
        },
      },

      // Enhanced scale animations
      scaleInEnhanced: {
        '0%': { 
          transform: 'scale(0.8) rotateX(10deg)',
          opacity: '0',
          filter: 'blur(2px)'
        },
        '50%': {
          transform: 'scale(1.05) rotateX(-2deg)',
          opacity: '0.8',
          filter: 'blur(0px)'
        },
        '100%': { 
          transform: 'scale(1) rotateX(0deg)',
          opacity: '1',
          filter: 'blur(0px)'
        },
      },

      // Enhanced bounce animations
      bounceEnhanced: {
        '0%, 20%, 53%, 80%, 100%': {
          transform: 'translate3d(0, 0, 0) scaleY(1)',
        },
        '40%, 43%': {
          transform: 'translate3d(0, -30px, 0) scaleY(1.1)',
        },
        '70%': {
          transform: 'translate3d(0, -15px, 0) scaleY(1.05)',
        },
        '90%': {
          transform: 'translate3d(0, -4px, 0) scaleY(1.02)',
        },
      },

      // Enhanced pulse animations
      pulseEnhanced: {
        '0%': {
          transform: 'scale(1)',
          opacity: '1',
        },
        '50%': {
          transform: 'scale(1.05)',
          opacity: '0.8',
        },
        '100%': {
          transform: 'scale(1)',
          opacity: '1',
        },
      },

      // Enhanced glow animations
      glowEnhanced: {
        '0%, 100%': {
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
        },
        '50%': {
          boxShadow: '0 0 40px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.3)',
        },
      },

      // Enhanced float animations
      floatEnhanced: {
        '0%, 100%': {
          transform: 'translateY(0px) rotateX(0deg)',
        },
        '25%': {
          transform: 'translateY(-8px) rotateX(2deg)',
        },
        '50%': {
          transform: 'translateY(-12px) rotateX(0deg)',
        },
        '75%': {
          transform: 'translateY(-8px) rotateX(-2deg)',
        },
      },

      // Enhanced loading animations
      loadingDotsEnhanced: {
        '0%, 80%, 100%': {
          transform: 'scale(0.8)',
          opacity: '0.5',
        },
        '40%': {
          transform: 'scale(1.2)',
          opacity: '1',
        },
      },

      // Enhanced shimmer animations
      shimmerEnhanced: {
        '0%': {
          backgroundPosition: '-1000px 0',
          transform: 'skewX(-15deg)',
        },
        '100%': {
          backgroundPosition: '1000px 0',
          transform: 'skewX(-15deg)',
        },
      },

      // Enhanced rotate animations
      rotateEnhanced: {
        '0%': {
          transform: 'rotate(0deg) scale(1)',
        },
        '50%': {
          transform: 'rotate(180deg) scale(1.1)',
        },
        '100%': {
          transform: 'rotate(360deg) scale(1)',
        },
      },

      // Enhanced flip animations
      flipEnhanced: {
        '0%': {
          transform: 'perspective(400px) rotateY(0)',
        },
        '40%': {
          transform: 'perspective(400px) rotateY(-180deg)',
        },
        '60%': {
          transform: 'perspective(400px) rotateY(-190deg)',
        },
        '100%': {
          transform: 'perspective(400px) rotateY(-360deg)',
        },
      },
      slideUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideLeft: {
        '0%': { transform: 'translateX(20px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      slideRight: {
        '0%': { transform: 'translateX(-20px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.9)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.9)', opacity: '0' },
      },
      
      // Interactive animations
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.6' },
      },
      ping: {
        '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        '0%': { transform: 'scale(1)', opacity: '1' },
      },
      spin: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      bounce: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-25%)' },
      },
      
      // Sophisticated micro-interactions
      wiggle: {
        '0%, 100%': { transform: 'rotate(-3deg)' },
        '50%': { transform: 'rotate(3deg)' },
      },
      shake: {
        '0%, 100%': { transform: 'translateX(0)' },
        '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
        '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
      },
      glow: {
        '0%, 100%': { boxShadow: '0 0 5px rgb(34 197 94 / 0.3)' },
        '50%': { boxShadow: '0 0 20px rgb(34 197 94 / 0.6)' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-6px)' },
      },
      
      // Button interactions
      buttonPress: {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(0.96)' },
        '100%': { transform: 'scale(1)' },
      },
      buttonHover: {
        '0%': { transform: 'scale(1) translateY(0)' },
        '100%': { transform: 'scale(1.02) translateY(-1px)' },
      },
      
      // Card interactions
      cardHover: {
        '0%': { transform: 'scale(1) translateY(0)' },
        '100%': { transform: 'scale(1.02) translateY(-4px)' },
      },
      cardLift: {
        '0%': { transform: 'translateY(0)' },
        '100%': { transform: 'translateY(-8px)' },
      },
      
      // Loading animations
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
      skeleton: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      
      // Success/error feedback
      successPulse: {
        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
        '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' },
        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
      },
      errorShake: {
        '0%, 100%': { transform: 'translateX(0)' },
        '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
        '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
      },
      
      // Page transitions
      pageSlideIn: {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      pageSlideOut: {
        '0%': { transform: 'translateX(0)', opacity: '1' },
        '100%': { transform: 'translateX(-100%)', opacity: '0' },
      },
      
      // Modal animations
      modalFadeIn: {
        '0%': { opacity: '0', transform: 'scale(0.9)' },
        '100%': { opacity: '1', transform: 'scale(1)' },
      },
      modalFadeOut: {
        '0%': { opacity: '1', transform: 'scale(1)' },
        '100%': { opacity: '0', transform: 'scale(0.9)' },
      },
    },
  },

  // Enhanced Breakpoint System with mobile-first approach
  breakpoints: {
    xs: '375px',   // iPhone SE
    sm: '640px',   // Small tablets
    md: '768px',   // Tablets
    lg: '1024px',  // Small desktops
    xl: '1280px',  // Desktops
    '2xl': '1536px', // Large desktops
    '3xl': '1920px', // Extra large screens
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
        xs: '2.25rem',   // 36px - small mobile
        sm: '2.5rem',    // 40px
        md: '3rem',      // 48px
        lg: '3.5rem',    // 56px
        xl: '4rem',      // 64px - large touch targets
      },
      padding: {
        xs: '0.5rem 0.75rem',  // Compact mobile
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
        xl: '1.25rem 2.5rem', // Extra large
      },
      borderRadius: '0.5rem', // 8px
      fontSize: {
        xs: '0.75rem',   // Small mobile
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
      // Touch target sizes
      touchTarget: {
        min: '44px',     // iOS HIG minimum
        comfortable: '48px', // Android recommended
        large: '56px',   // Enhanced accessibility
      },
    },

    input: {
      height: {
        xs: '2.5rem',   // Compact mobile
        md: '3rem',      // Standard
        lg: '3.5rem',   // Large touch
      },
      padding: {
        xs: '0.5rem 0.75rem',
        md: '0.75rem 1rem',
        lg: '1rem 1.25rem',
      },
      borderRadius: '0.375rem', // 6px
      fontSize: {
        xs: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      },
    },

    card: {
      padding: {
        xs: '1rem',     // Compact mobile
        md: '1.5rem',
        lg: '2rem',     // Large desktop
      },
      borderRadius: {
        xs: '0.5rem',  // Smaller on mobile
        md: '0.75rem',
        lg: '1rem',     // Larger on desktop
      },
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },

    modal: {
      borderRadius: {
        xs: '0.75rem', // Rounded but not too much on mobile
        md: '1rem',
        lg: '1.25rem', // More rounded on larger screens
      },
      padding: {
        xs: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
      },
      maxWidth: {
        xs: '95vw',
        md: '90vw',
        lg: '80vw',
      },
      maxHeight: {
        xs: '95vh',
        md: '90vh',
        lg: '85vh',
      },
    },

    // Mobile-specific components
    mobile: {
      safeArea: {
        top: 'env(safe-area-inset-top)',
        right: 'env(safe-area-inset-right)',
        bottom: 'env(safe-area-inset-bottom)',
        left: 'env(safe-area-inset-left)',
      },
      notch: {
        height: '44px', // Status bar height
        padding: 'env(safe-area-inset-top, 0)',
      },
      gesture: {
        minSwipeDistance: '50px',
        maxTapDuration: '200ms',
        maxTapDistance: '10px',
      },
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