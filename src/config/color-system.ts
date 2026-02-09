/**
 * Enhanced Color System with Accessibility Focus
 * Comprehensive color utilities with WCAG compliance and semantic meaning
 */

export const COLOR_SYSTEM = `
/* Enhanced Color Palette with WCAG Compliance */

/* Primary Colors */
.color-primary-50 { color: #eff6ff; background-color: #eff6ff; }
.color-primary-100 { color: #dbeafe; background-color: #dbeafe; }
.color-primary-200 { color: #bfdbfe; background-color: #bfdbfe; }
.color-primary-300 { color: #93c5fd; background-color: #93c5fd; }
.color-primary-400 { color: #60a5fa; background-color: #60a5fa; }
.color-primary-500 { color: #3b82f6; background-color: #3b82f6; }
.color-primary-600 { color: #2563eb; background-color: #2563eb; }
.color-primary-700 { color: #1d4ed8; background-color: #1d4ed8; }
.color-primary-800 { color: #1e40af; background-color: #1e40af; }
.color-primary-900 { color: #1e3a8a; background-color: #1e3a8a; }
.color-primary-950 { color: #172554; background-color: #172554; }

/* Success Colors */
.color-success-50 { color: #f0fdf4; background-color: #f0fdf4; }
.color-success-100 { color: #dcfce7; background-color: #dcfce7; }
.color-success-200 { color: #bbf7d0; background-color: #bbf7d0; }
.color-success-300 { color: #86efac; background-color: #86efac; }
.color-success-400 { color: #4ade80; background-color: #4ade80; }
.color-success-500 { color: #22c55e; background-color: #22c55e; }
.color-success-600 { color: #16a34a; background-color: #16a34a; }
.color-success-700 { color: #15803d; background-color: #15803d; }
.color-success-800 { color: #166534; background-color: #166534; }
.color-success-900 { color: #14532d; background-color: #14532d; }
.color-success-950 { color: #052e16; background-color: #052e16; }

/* Warning Colors */
.color-warning-50 { color: #fffbeb; background-color: #fffbeb; }
.color-warning-100 { color: #fef3c7; background-color: #fef3c7; }
.color-warning-200 { color: #fde68a; background-color: #fde68a; }
.color-warning-300 { color: #fcd34d; background-color: #fcd34d; }
.color-warning-400 { color: #fbbf24; background-color: #fbbf24; }
.color-warning-500 { color: #f59e0b; background-color: #f59e0b; }
.color-warning-600 { color: #d97706; background-color: #d97706; }
.color-warning-700 { color: #b45309; background-color: #b45309; }
.color-warning-800 { color: #92400e; background-color: #92400e; }
.color-warning-900 { color: #78350f; background-color: #78350f; }
.color-warning-950 { color: #451a03; background-color: #451a03; }

/* Error Colors */
.color-error-50 { color: #fef2f2; background-color: #fef2f2; }
.color-error-100 { color: #fee2e2; background-color: #fee2e2; }
.color-error-200 { color: #fecaca; background-color: #fecaca; }
.color-error-300 { color: #fca5a5; background-color: #fca5a5; }
.color-error-400 { color: #f87171; background-color: #f87171; }
.color-error-500 { color: #ef4444; background-color: #ef4444; }
.color-error-600 { color: #dc2626; background-color: #dc2626; }
.color-error-700 { color: #b91c1c; background-color: #b91c1c; }
.color-error-800 { color: #991b1b; background-color: #991b1b; }
.color-error-900 { color: #7f1d1d; background-color: #7f1d1d; }
.color-error-950 { color: #450a0a; background-color: #450a0a; }

/* Info Colors */
.color-info-50 { color: #f0f9ff; background-color: #f0f9ff; }
.color-info-100 { color: #e0f2fe; background-color: #e0f2fe; }
.color-info-200 { color: #bae6fd; background-color: #bae6fd; }
.color-info-300 { color: #7dd3fc; background-color: #7dd3fc; }
.color-info-400 { color: #38bdf8; background-color: #38bdf8; }
.color-info-500 { color: #0ea5e9; background-color: #0ea5e9; }
.color-info-600 { color: #0284c7; background-color: #0284c7; }
.color-info-700 { color: #0369a1; background-color: #0369a1; }
.color-info-800 { color: #075985; background-color: #075985; }
.color-info-900 { color: #0c4a6e; background-color: #0c4a6e; }
.color-info-950 { color: #082f49; background-color: #082f49; }

/* Neutral Colors */
.color-neutral-50 { color: #fafafa; background-color: #fafafa; }
.color-neutral-100 { color: #f5f5f5; background-color: #f5f5f5; }
.color-neutral-200 { color: #e5e5e5; background-color: #e5e5e5; }
.color-neutral-300 { color: #d4d4d4; background-color: #d4d4d4; }
.color-neutral-400 { color: #a3a3a3; background-color: #a3a3a3; }
.color-neutral-500 { color: #737373; background-color: #737373; }
.color-neutral-600 { color: #525252; background-color: #525252; }
.color-neutral-700 { color: #404040; background-color: #404040; }
.color-neutral-800 { color: #262626; background-color: #262626; }
.color-neutral-900 { color: #171717; background-color: #171717; }
.color-neutral-950 { color: #0a0a0a; background-color: #0a0a0a; }

/* Text Colors with Proper Contrast */
.text-primary-light { color: #1e3a8a; }
.text-primary { color: #2563eb; }
.text-primary-dark { color: #dbeafe; }

.text-success-light { color: #14532d; }
.text-success { color: #16a34a; }
.text-success-dark { color: #dcfce7; }

.text-warning-light { color: #78350f; }
.text-warning { color: #d97706; }
.text-warning-dark { color: #fef3c7; }

.text-error-light { color: #7f1d1d; }
.text-error { color: #dc2626; }
.text-error-dark { color: #fee2e2; }

.text-info-light { color: #0c4a6e; }
.text-info { color: #0284c7; }
.text-info-dark { color: #e0f2fe; }

.text-neutral-light { color: #171717; }
.text-neutral { color: #404040; }
.text-neutral-dark { color: #d4d4d4; }

/* Background Colors with Proper Contrast */
.bg-primary-light { background-color: #dbeafe; }
.bg-primary { background-color: #3b82f6; }
.bg-primary-dark { background-color: #1e40af; }

.bg-success-light { background-color: #dcfce7; }
.bg-success { background-color: #22c55e; }
.bg-success-dark { background-color: #166534; }

.bg-warning-light { background-color: #fef3c7; }
.bg-warning { background-color: #f59e0b; }
.bg-warning-dark { background-color: #92400e; }

.bg-error-light { background-color: #fee2e2; }
.bg-error { background-color: #ef4444; }
.bg-error-dark { background-color: #991b1b; }

.bg-info-light { background-color: #e0f2fe; }
.bg-info { background-color: #0ea5e9; }
.bg-info-dark { background-color: #075985; }

.bg-neutral-light { background-color: #fafafa; }
.bg-neutral { background-color: #737373; }
.bg-neutral-dark { background-color: #262626; }

/* Border Colors */
.border-primary { border-color: #3b82f6; }
.border-success { border-color: #22c55e; }
.border-warning { border-color: #f59e0b; }
.border-error { border-color: #ef4444; }
.border-info { border-color: #0ea5e9; }
.border-neutral { border-color: #d4d4d4; }

/* Semantic Color Classes */
.text-brand-primary { color: #3b82f6; }
.text-brand-secondary { color: #6366f1; }
.text-brand-accent { color: #8b5cf6; }

.bg-brand-primary { background-color: #3b82f6; }
.bg-brand-secondary { background-color: #6366f1; }
.bg-brand-accent { background-color: #8b5cf6; }

.border-brand-primary { border-color: #3b82f6; }
.border-brand-secondary { border-color: #6366f1; }
.border-brand-accent { border-color: #8b5cf6; }

/* Status Colors */
.text-status-online { color: #22c55e; }
.text-status-offline { color: #6b7280; }
.text-status-busy { color: #f59e0b; }
.text-status-away { color: #ef4444; }

.bg-status-online { background-color: #22c55e; }
.bg-status-offline { background-color: #6b7280; }
.bg-status-busy { background-color: #f59e0b; }
.bg-status-away { background-color: #ef4444; }

/* Interactive Colors */
.text-interactive-default { color: #374151; }
.text-interactive-hover { color: #111827; }
.text-interactive-active { color: #1f2937; }
.text-interactive-disabled { color: #9ca3af; }

.bg-interactive-default { background-color: #ffffff; }
.bg-interactive-hover { background-color: #f9fafb; }
.bg-interactive-active { background-color: #f3f4f6; }
.bg-interactive-disabled { background-color: #f9fafb; }

.border-interactive-default { border-color: #d1d5db; }
.border-interactive-hover { border-color: #9ca3af; }
.border-interactive-active { border-color: #6b7280; }
.border-interactive-disabled { border-color: #e5e7eb; }

/* Accessibility Focus Colors */
.focus-ring-primary:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.focus-ring-success:focus {
  outline: 2px solid #22c55e;
  outline-offset: 2px;
}

.focus-ring-warning:focus {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.focus-ring-error:focus {
  outline: 2px solid #ef4444;
  outline-offset: 2px;
}

.focus-ring-info:focus {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .text-primary { color: #0000ff; }
  .text-success { color: #008000; }
  .text-warning { color: #ff8c00; }
  .text-error { color: #ff0000; }
  .text-info { color: #0000cd; }
  .text-neutral { color: #000000; }
  
  .bg-primary { background-color: #0000ff; }
  .bg-success { background-color: #008000; }
  .bg-warning { background-color: #ff8c00; }
  .bg-error { background-color: #ff0000; }
  .bg-info { background-color: #0000cd; }
  .bg-neutral { background-color: #000000; }
}

/* Dark Mode Colors */
@media (prefers-color-scheme: dark) {
  .text-primary-light { color: #dbeafe; }
  .text-primary { color: #60a5fa; }
  .text-primary-dark { color: #1e3a8a; }
  
  .text-success-light { color: #dcfce7; }
  .text-success { color: #4ade80; }
  .text-success-dark { color: #14532d; }
  
  .text-warning-light { color: #fef3c7; }
  .text-warning { color: #fbbf24; }
  .text-warning-dark { color: #78350f; }
  
  .text-error-light { color: #fee2e2; }
  .text-error { color: #f87171; }
  .text-error-dark { color: #7f1d1d; }
  
  .text-info-light { color: #e0f2fe; }
  .text-info { color: #38bdf8; }
  .text-info-dark { color: #0c4a6e; }
  
  .text-neutral-light { color: #d4d4d4; }
  .text-neutral { color: #a3a3a3; }
  .text-neutral-dark { color: #404040; }
  
  .bg-primary-light { background-color: #1e40af; }
  .bg-primary { background-color: #3b82f6; }
  .bg-primary-dark { background-color: #dbeafe; }
  
  .bg-success-light { background-color: #166534; }
  .bg-success { background-color: #22c55e; }
  .bg-success-dark { background-color: #dcfce7; }
  
  .bg-warning-light { background-color: #92400e; }
  .bg-warning { background-color: #f59e0b; }
  .bg-warning-dark { background-color: #fef3c7; }
  
  .bg-error-light { background-color: #991b1b; }
  .bg-error { background-color: #ef4444; }
  .bg-error-dark { background-color: #fee2e2; }
  
  .bg-info-light { background-color: #075985; }
  .bg-info { background-color: #0ea5e9; }
  .bg-info-dark { background-color: #e0f2fe; }
  
  .bg-neutral-light { background-color: #262626; }
  .bg-neutral { background-color: #737373; }
  .bg-neutral-dark { background-color: #fafafa; }
}

/* Reduced Motion for Accessibility */
@media (prefers-reduced-motion: reduce) {
  .color-transition {
    transition: none;
  }
}

/* Color Transition Classes */
.color-transition {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.color-transition-slow {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}

.color-transition-fast {
  transition: color 0.1s ease, background-color 0.1s ease, border-color 0.1s ease;
}

/* Hover States with Color Changes */
.hover-primary:hover { color: #1d4ed8; background-color: #dbeafe; }
.hover-success:hover { color: #15803d; background-color: #dcfce7; }
.hover-warning:hover { color: #b45309; background-color: #fef3c7; }
.hover-error:hover { color: #b91c1c; background-color: #fee2e2; }
.hover-info:hover { color: #0369a1; background-color: #e0f2fe; }

/* Active States */
.active-primary:active { color: #1e40af; background-color: #bfdbfe; }
.active-success:active { color: #166534; background-color: #bbf7d0; }
.active-warning:active { color: #92400e; background-color: #fde68a; }
.active-error:active { color: #991b1b; background-color: #fecaca; }
.active-info:active { color: #075985; background-color: #bae6fd; }

/* Gradient Backgrounds */
.gradient-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.gradient-success {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
}

.gradient-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
}

.gradient-error {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}

.gradient-info {
  background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
}

.gradient-neutral {
  background: linear-gradient(135deg, #737373 0%, #404040 100%);
}

/* Color Utilities for Testing */
.color-contrast-test {
  position: relative;
}

.color-contrast-test::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: currentColor;
  opacity: 0.1;
  pointer-events: none;
}

/* Print Colors */
@media print {
  .text-primary, .text-success, .text-warning, .text-error, .text-info, .text-neutral {
    color: #000000 !important;
  }
  
  .bg-primary, .bg-success, .bg-warning, .bg-error, .bg-info, .bg-neutral {
    background-color: #ffffff !important;
  }
  
  .border-primary, .border-success, .border-warning, .border-error, .border-info, .border-neutral {
    border-color: #000000 !important;
  }
}
`;

export const COLOR_CONFIG = {
  // Primary color palette
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
  
  // Success color palette
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
  
  // Warning color palette
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
  
  // Error color palette
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
  
  // Info color palette
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
  
  // Neutral color palette
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
  
  // Semantic color mapping
  semantic: {
    primary: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
    neutral: '#737373',
  },
  
  // WCAG contrast ratios
  contrast: {
    AA: 4.5,
    AAA: 7,
    AALarge: 3,
    AAALarge: 4.5,
  },
  
  // Color combinations that pass WCAG AA
  combinations: {
    light: {
      text: {
        primary: '#1e3a8a',
        success: '#14532d',
        warning: '#78350f',
        error: '#7f1d1d',
        info: '#0c4a6e',
        neutral: '#171717',
      },
      background: {
        primary: '#dbeafe',
        success: '#dcfce7',
        warning: '#fef3c7',
        error: '#fee2e2',
        info: '#e0f2fe',
        neutral: '#fafafa',
      },
    },
    dark: {
      text: {
        primary: '#dbeafe',
        success: '#dcfce7',
        warning: '#fef3c7',
        error: '#fee2e2',
        info: '#e0f2fe',
        neutral: '#d4d4d4',
      },
      background: {
        primary: '#1e40af',
        success: '#166534',
        warning: '#92400e',
        error: '#991b1b',
        info: '#075985',
        neutral: '#262626',
      },
    },
  },
};

export const getColorValue = (palette: keyof typeof COLOR_CONFIG, shade: number | string) => {
  const colorPalette = COLOR_CONFIG[palette];
  if (typeof colorPalette === 'object' && colorPalette !== null) {
    return (colorPalette as Record<string, string>)[shade];
  }
  return undefined;
};

export const getSemanticColor = (type: keyof typeof COLOR_CONFIG.semantic) => {
  return COLOR_CONFIG.semantic[type];
};

export const getWCAGCompliantColors = (mode: 'light' | 'dark') => {
  return COLOR_CONFIG.combinations[mode];
};

export const checkContrastRatio = (foreground: string, background: string) => {
  // This is a simplified contrast ratio calculation
  // In production, you'd want to use a proper library like 'color-contrast'
  const getLuminance = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const a = [r, g, b].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  
  return (lightest + 0.05) / (darkest + 0.05);
};

export default COLOR_SYSTEM;