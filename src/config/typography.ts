/**
 * Enhanced Typography Utility Classes - Palette 🎨
 * Comprehensive typography system for MA Malnu Kananga
 */

// import { DESIGN_SYSTEM } from './designSystem';

// Typography scale with semantic naming
export const typography = {
  // Display typography for hero sections
  display: {
    '1xl': 'text-4xl sm:text-5xl lg:text-6xl',
    '2xl': 'text-5xl sm:text-6xl lg:text-7xl',
    '3xl': 'text-6xl sm:text-7xl lg:text-8xl',
  },
  
  // Heading typography hierarchy
  heading: {
    h1: 'text-3xl sm:text-4xl lg:text-5xl',
    h2: 'text-2xl sm:text-3xl lg:text-4xl',
    h3: 'text-xl sm:text-2xl lg:text-3xl',
    h4: 'text-lg sm:text-xl lg:text-2xl',
    h5: 'text-base sm:text-lg lg:text-xl',
    h6: 'text-sm sm:text-base lg:text-lg',
  },
  
  // Body typography
  body: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  },
  
  // UI elements typography
  ui: {
    caption: 'text-xs',
    label: 'text-sm',
    button: 'text-sm sm:text-base',
    nav: 'text-sm font-medium',
  },
} as const;

// Font weight utilities
export const fontWeights = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
} as const;

// Line height utilities
export const lineHeights = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const;

// Letter spacing utilities
export const letterSpacings = {
  tighter: 'tracking-tighter',
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
} as const;

// Text alignment utilities
export const textAlignments = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
} as const;

// Text transformation utilities
export const textTransforms = {
  none: 'normal-case',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
} as const;

// Text decoration utilities
export const textDecorations = {
  none: 'no-underline',
  underline: 'underline',
  lineThrough: 'line-through',
} as const;

// Color utilities for typography
export const textColors = {
  // Default text colors
  default: {
    primary: 'text-neutral-900 dark:text-white',
    secondary: 'text-neutral-600 dark:text-neutral-400',
    tertiary: 'text-neutral-500 dark:text-neutral-500',
    inverse: 'text-white dark:text-neutral-900',
    muted: 'text-neutral-400 dark:text-neutral-600',
    subtle: 'text-neutral-300 dark:text-neutral-700',
  },
  
  // Brand colors
  brand: {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
  },
  
  // Semantic colors
  semantic: {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  },
  
  // Interactive states
  interactive: {
    link: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    button: 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white',
    disabled: 'text-neutral-400 dark:text-neutral-600',
  },
} as const;

// Responsive typography utilities
export const responsiveTypography = {
  // Responsive font sizes
  responsive: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl lg:text-2xl',
    xl: 'text-xl sm:text-2xl lg:text-3xl',
    '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
    '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
  },
  
  // Responsive line heights
  responsiveLineHeight: {
    tight: 'leading-tight sm:leading-snug',
    normal: 'leading-normal sm:leading-relaxed',
    relaxed: 'leading-relaxed sm:leading-loose',
  },
} as const;

// Typography component classes
export const typographyComponents = {
  // Article/blog content
  prose: 'prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-img:rounded-xl prose-img:shadow-lg',
  
  // Code blocks
  code: 'font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md text-neutral-800 dark:text-neutral-200',
  
  // Blockquotes
  blockquote: 'border-l-4 border-neutral-200 dark:border-neutral-700 pl-4 italic text-neutral-600 dark:text-neutral-400',
  
  // Lists
  list: {
    unordered: 'list-disc list-inside space-y-1',
    ordered: 'list-decimal list-inside space-y-1',
    inline: 'flex flex-wrap gap-2',
  },
  
  // Tables
  table: 'w-full border-collapse border border-neutral-200 dark:border-neutral-700',
  
  // Links
  link: 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline underline-offset-4 hover:underline-offset-2 transition-all duration-200',
} as const;

// Semantic typography classes
export const semanticTypography = {
  // Page titles and sections
  pageTitle: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6',
  sectionTitle: 'text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-4',
  subsectionTitle: 'text-xl sm:text-2xl lg:text-3xl font-medium text-neutral-900 dark:text-white mb-3',
  
  // Card and component headers
  cardTitle: 'text-lg font-semibold text-neutral-900 dark:text-white mb-2',
  cardSubtitle: 'text-sm text-neutral-600 dark:text-neutral-400 mb-4',
  
  // Form labels and inputs
  formLabel: 'text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block',
  formHelper: 'text-xs text-neutral-500 dark:text-neutral-400 mt-1',
  formError: 'text-sm text-red-600 dark:text-red-400 mt-1',
  
  // Navigation elements
  navItem: 'text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200',
  navActive: 'text-sm font-medium text-primary-600 dark:text-primary-400',
  
  // Status and metadata
  metadata: 'text-xs text-neutral-500 dark:text-neutral-400',
  timestamp: 'text-xs text-neutral-400 dark:text-neutral-500',
  badge: 'text-xs font-semibold px-2 py-1 rounded-full',
  
  // Interactive elements
  button: 'text-sm font-medium',
  linkButton: 'text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300',
  
  // Content sections
  paragraph: 'text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4',
  lead: 'text-lg sm:text-xl leading-relaxed text-neutral-600 dark:text-neutral-400 mb-6',
  
  // Emphasis and importance
  highlight: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-1 rounded',
  important: 'font-semibold text-neutral-900 dark:text-white',
  subtle: 'text-neutral-500 dark:text-neutral-400',
} as const;

// Accessibility-focused typography
export const accessibleTypography = {
  // High contrast for better readability
  highContrast: 'text-neutral-900 dark:text-white',
  
  // Large text for accessibility
  largeText: 'text-lg sm:text-xl',
  
  // Focus visible states for text links
  focusVisible: 'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 rounded',
  
  // Screen reader only text
  srOnly: 'sr-only',
  
  // Skip links
  skipLink: 'absolute top-0 left-0 z-50 p-3 bg-primary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 -translate-y-full focus:translate-y-0 transition-transform duration-200',
} as const;

// Print typography
export const printTypography = {
  // Print-friendly styles
  print: 'print:text-black print:bg-white',
  
  // Hide elements in print
  printHidden: 'print:hidden',
  
  // Show elements only in print
  printOnly: 'hidden print:block',
} as const;

// Animation utilities for typography
export const typographyAnimations = {
  // Fade in animations
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  
  // Text reveal animations
  reveal: 'opacity-0 animate-[reveal_0.5s_ease-out_forwards]',
  typewriter: 'overflow-hidden whitespace-nowrap animate-[typewriter_2s_steps(40)_forwards]',
  
  // Hover effects
  hoverLift: 'hover:-translate-y-0.5 transition-transform duration-200',
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverGlow: 'hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200',
} as const;

// Utility function to combine typography classes
export const typo = {
  // Quick typography presets
  display1: `${typography.display['1xl']} ${fontWeights.bold} ${lineHeights.tight} ${textColors.default.primary}`,
  display2: `${typography.display['2xl']} ${fontWeights.bold} ${lineHeights.tight} ${textColors.default.primary}`,
  h1: `${typography.heading.h1} ${fontWeights.bold} ${lineHeights.tight} ${textColors.default.primary}`,
  h2: `${typography.heading.h2} ${fontWeights.semibold} ${lineHeights.tight} ${textColors.default.primary}`,
  h3: `${typography.heading.h3} ${fontWeights.semibold} ${lineHeights.snug} ${textColors.default.primary}`,
  h4: `${typography.heading.h4} ${fontWeights.medium} ${lineHeights.snug} ${textColors.default.primary}`,
  h5: `${typography.heading.h5} ${fontWeights.medium} ${lineHeights.normal} ${textColors.default.primary}`,
  h6: `${typography.heading.h6} ${fontWeights.medium} ${lineHeights.normal} ${textColors.default.primary}`,
  
  body: `${typography.body.base} ${lineHeights.relaxed} ${textColors.default.secondary}`,
  bodyLarge: `${typography.body.lg} ${lineHeights.relaxed} ${textColors.default.secondary}`,
  bodySmall: `${typography.body.sm} ${lineHeights.normal} ${textColors.default.secondary}`,
  
  caption: `${typography.ui.caption} ${fontWeights.medium} ${textColors.default.tertiary}`,
  label: `${typography.ui.label} ${fontWeights.medium} ${textColors.default.secondary}`,
  
  // Responsive presets
  responsiveH1: `${typography.heading.h1} ${fontWeights.bold} ${lineHeights.tight} ${textColors.default.primary}`,
  responsiveBody: `${responsiveTypography.responsive.base} ${lineHeights.relaxed} ${textColors.default.secondary}`,
  
  // Interactive presets
  link: `${typographyComponents.link}`,
  button: `${typography.ui.button}`,
  
  // Semantic presets
  pageTitle: semanticTypography.pageTitle,
  sectionTitle: semanticTypography.sectionTitle,
  cardTitle: semanticTypography.cardTitle,
  formLabel: semanticTypography.formLabel,
  
  // Accessibility presets
  accessibleText: `${accessibleTypography.highContrast}`,
  largeText: `${accessibleTypography.largeText}`,
  focusText: `${accessibleTypography.focusVisible}`,
} as const;

// Type definitions for TypeScript support
export type TypographyScale = keyof typeof typography;
export type FontWeightKey = keyof typeof fontWeights;
export type LineHeightKey = keyof typeof lineHeights;
export type TextColorKey = keyof typeof textColors;
export type SemanticKey = keyof typeof semanticTypography;

export default {
  typography,
  fontWeights,
  lineHeights,
  letterSpacings,
  textAlignments,
  textTransforms,
  textDecorations,
  textColors,
  responsiveTypography,
  typographyComponents,
  semanticTypography,
  accessibleTypography,
  printTypography,
  typographyAnimations,
  typo,
};