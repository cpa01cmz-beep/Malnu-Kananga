/**
 * Enhanced Typography System
 * Advanced typography hierarchy and readability improvements
 */

import { EXTERNAL_URLS } from '../constants';

export const TYPOGRAPHY_SYSTEM = `
/* Enhanced Font Loading with Performance Optimization */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('${EXTERNAL_URLS.GOOGLE_FONTS_INTER}');
  size-adjust: 95%; /* Slightly adjust for better readability */
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 100 800;
  font-display: swap;
  src: url('${EXTERNAL_URLS.GOOGLE_FONTS_JETBRAINS}');
}

/* System font stack as fallback */
@font-face {
  font-family: 'System Fallback';
  src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial'), local('sans-serif');
  font-display: swap;
}

/* Typography Scale with Enhanced Readability */
.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
  letter-spacing: 0.05em;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
  letter-spacing: 0.025em;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
  letter-spacing: 0em;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
  letter-spacing: -0.025em;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
  letter-spacing: -0.025em;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
  letter-spacing: -0.025em;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
  letter-spacing: -0.025em;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
  letter-spacing: -0.025em;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
  letter-spacing: -0.025em;
}

.text-6xl {
  font-size: 3.75rem;
  line-height: 1;
  letter-spacing: -0.025em;
}

/* Enhanced Font Weights */
.font-thin { font-weight: 100; }
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }

/* Typography Hierarchy */
.heading-1 {
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #111827;
  margin-bottom: 1rem;
}

.heading-2 {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #111827;
  margin-bottom: 0.75rem;
}

.heading-3 {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #111827;
  margin-bottom: 0.5rem;
}

.heading-4 {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #111827;
  margin-bottom: 0.5rem;
}

.heading-5 {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #111827;
  margin-bottom: 0.25rem;
}

.heading-6 {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #111827;
  margin-bottom: 0.25rem;
}

/* Body Text Variants */
.body-large {
  font-size: 1.125rem;
  line-height: 1.82rem;
  font-weight: 400;
  color: #374151;
}

.body-base {
  font-size: 1rem;
  line-height: 1.62rem;
  font-weight: 400;
  color: #374151;
}

.body-small {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  color: #6b7280;
}

.body-xs {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  color: #6b7280;
}

/* Enhanced Readability Classes */
.readable {
  max-width: 65ch;
  line-height: 1.7;
  color: #374151;
}

.readable-large {
  max-width: 70ch;
  line-height: 1.8;
  font-size: 1.125rem;
}

.readable-small {
  max-width: 60ch;
  line-height: 1.6;
  font-size: 0.875rem;
}

/* Text Alignment with Enhanced Control */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

/* Text Transform with Better Control */
.uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }

/* Enhanced Text Colors */
.text-primary { color: #111827; }
.text-secondary { color: #6b7280; }
.text-tertiary { color: #9ca3af; }
.text-muted { color: #d1d5db; }

/* Semantic Text Colors */
.text-success { color: #059669; }
.text-warning { color: #d97706; }
.text-error { color: #dc2626; }
.text-info { color: #2563eb; }

/* Text Decorations */
.underline { text-decoration: underline; }
.line-through { text-decoration: line-through; }
.no-underline { text-decoration: none; }

/* Enhanced Link Styles */
.link {
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s ease, text-decoration 0.2s ease;
}

.link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.link:active {
  color: #1e40af;
}

.link-external {
  position: relative;
  padding-right: 1.25rem;
}

.link-external::after {
  content: '↗';
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.875em;
  opacity: 0.7;
}

/* Enhanced List Styles */
.list-none { list-style: none; }
.list-disc { list-style: disc; }
.list-decimal { list-style: decimal; }
.list-square { list-style: square; }

.list-inside {
  list-style-position: inside;
  padding-left: 0;
}

.list-outside {
  list-style-position: outside;
  padding-left: 1.5rem;
}

/* Enhanced List Spacing */
.list-spacing-sm > li {
  margin-bottom: 0.5rem;
}

.list-spacing-md > li {
  margin-bottom: 0.75rem;
}

.list-spacing-lg > li {
  margin-bottom: 1rem;
}

/* Code Typography */
.code-inline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  color: #374151;
}

.code-block {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  line-height: 1.5;
}

/* Preformatted Text */
.pre {
  font-family: 'JetBrains Mono', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

/* Blockquote Styles */
.blockquote {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

.blockquote-large {
  border-left: 6px solid #3b82f6;
  padding-left: 1.5rem;
  margin: 2rem 0;
  font-size: 1.25rem;
  font-style: italic;
  color: #4b5563;
}

/* Enhanced Text Selection */
::selection {
  background-color: hsl(var(--color-primary-500) / 0.3);
  color: hsl(var(--color-neutral-900));
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

::-moz-selection {
  background-color: hsl(var(--color-primary-500) / 0.3);
  color: hsl(var(--color-neutral-900));
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* Enhanced selection for dark mode */
@media (prefers-color-scheme: dark) {
  ::selection, ::-moz-selection {
    background-color: hsl(var(--color-primary-400) / 0.4);
    color: hsl(var(--color-neutral-100));
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }
}

/* Focus Styles for Text */
.focus-text:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

/* Enhanced Responsive Typography with Fluid Scaling */
@media (max-width: 375px) {
  :root {
    --fluid-min-width: 375;
    --fluid-max-width: 375;
    --fluid-screen: 100vw;
    --fluid-bp: calc(
      (var(--fluid-screen) - var(--fluid-min-width) / 1) /
      (var(--fluid-max-width) - var(--fluid-min-width))
    );
  }
}

@media (min-width: 376px) and (max-width: 640px) {
  :root {
    --fluid-min-width: 376;
    --fluid-max-width: 640;
    --fluid-screen: 100vw;
    --fluid-bp: calc(
      (var(--fluid-screen) - var(--fluid-min-width) / 1) /
      (var(--fluid-max-width) - var(--fluid-min-width))
    );
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  :root {
    --fluid-min-width: 641;
    --fluid-max-width: 768;
    --fluid-screen: 100vw;
    --fluid-bp: calc(
      (var(--fluid-screen) - var(--fluid-min-width) / 1) /
      (var(--fluid-max-width) - var(--fluid-min-width))
    );
  }
}

/* Mobile-first responsive typography */
@media (max-width: 480px) {
  .heading-1 { 
    font-size: clamp(1.5rem, 5vw, 2rem); 
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .heading-2 { 
    font-size: clamp(1.25rem, 4vw, 1.5rem); 
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .heading-3 { 
    font-size: clamp(1.125rem, 3.5vw, 1.25rem); 
    line-height: 1.4;
  }
  .heading-4 { 
    font-size: clamp(1rem, 3vw, 1.125rem); 
    line-height: 1.5;
  }
  .heading-5 { 
    font-size: clamp(0.875rem, 2.5vw, 1rem); 
    line-height: 1.6;
  }
  .heading-6 { 
    font-size: clamp(0.75rem, 2vw, 0.875rem); 
    line-height: 1.6;
  }
  
  .body-large { 
    font-size: clamp(1rem, 2.5vw, 1.125rem); 
    line-height: 1.82;
  }
  .body-base { 
    font-size: clamp(0.875rem, 2vw, 1rem); 
    line-height: 1.62;
  }
  .body-small { 
    font-size: clamp(0.75rem, 1.5vw, 0.875rem); 
    line-height: 1.5;
  }
  .body-xs { 
    font-size: clamp(0.625rem, 1.2vw, 0.75rem); 
    line-height: 1.4;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .heading-1 { font-size: clamp(2rem, 4vw, 2.5rem); line-height: 1.1; }
  .heading-2 { font-size: clamp(1.5rem, 3.5vw, 2rem); line-height: 1.2; }
  .heading-3 { font-size: clamp(1.25rem, 3vw, 1.5rem); line-height: 1.3; }
  .heading-4 { font-size: clamp(1.125rem, 2.5vw, 1.25rem); line-height: 1.4; }
  
  .body-large { font-size: clamp(1.125rem, 2vw, 1.25rem); line-height: 1.7; }
  .body-base { font-size: clamp(1rem, 1.8vw, 1.125rem); line-height: 1.7; }
  .body-small { font-size: clamp(0.875rem, 1.5vw, 1rem); line-height: 1.6; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .heading-1 { font-size: clamp(2.5rem, 3vw, 3rem); line-height: 1.05; }
  .heading-2 { font-size: clamp(2rem, 2.5vw, 2.5rem); line-height: 1.1; }
  .heading-3 { font-size: clamp(1.5rem, 2vw, 2rem); line-height: 1.2; }
  
  .readable { max-width: 70ch; }
  .readable-large { max-width: 75ch; }
  .readable-small { max-width: 65ch; }
}

@media (min-width: 1025px) {
  .heading-1 { font-size: clamp(3rem, 4vw, 4rem); line-height: 1; }
  .heading-2 { font-size: clamp(2.5rem, 3vw, 3rem); line-height: 1.05; }
  .heading-3 { font-size: clamp(2rem, 2.5vw, 2.5rem); line-height: 1.1; }
  
  .readable { max-width: 75ch; }
  .readable-large { max-width: 80ch; }
  .readable-small { max-width: 70ch; }
}

/* Enhanced readability for different screen sizes */
@media (max-width: 640px) {
  .readable-mobile {
    max-width: 100%;
    padding: 0 1rem;
    line-height: 1.7;
    font-size: 1rem;
  }
  
  .readable-mobile-condensed {
    max-width: 100%;
    padding: 0 0.5rem;
    line-height: 1.6;
    font-size: 0.875rem;
  }
}

/* Print optimization */
@media print {
  .heading-1, .heading-2, .heading-3, .heading-4, .heading-5, .heading-6 {
    color: #000;
    page-break-after: avoid;
    orphans: 3;
    widows: 3;
  }
  
  .body-large, .body-base, .body-small, .body-xs {
    color: #000;
    orphans: 3;
    widows: 3;
  }
}

/* Print Typography */
@media print {
  .heading-1, .heading-2, .heading-3, .heading-4, .heading-5, .heading-6 {
    color: #000;
    page-break-after: avoid;
  }
  
  .body-large, .body-base, .body-small, .body-xs {
    color: #000;
  }
  
  .link {
    color: #000;
    text-decoration: underline;
  }
  
  .link::after {
    content: ' (' attr(href) ')';
    font-size: 0.875em;
    color: #666;
  }
}

/* Dark Mode Typography */
@media (prefers-color-scheme: dark) {
  .heading-1, .heading-2, .heading-3, .heading-4, .heading-5, .heading-6 {
    color: #f9fafb;
  }
  
  .body-large, .body-base {
    color: #e5e7eb;
  }
  
  .body-small, .body-xs {
    color: #9ca3af;
  }
  
  .text-primary { color: #f9fafb; }
  .text-secondary { color: #d1d5db; }
  .text-tertiary { color: #9ca3af; }
  .text-muted { color: #6b7280; }
  
  .code-inline {
    background-color: #374151;
    color: #d1d5db;
  }
  
  .blockquote {
    color: #9ca3af;
    border-left-color: #60a5fa;
  }
  
  .blockquote-large {
    color: #d1d5db;
    border-left-color: #60a5fa;
  }
}

/* Accessibility Enhancements */
@media (prefers-contrast: high) {
  .heading-1, .heading-2, .heading-3, .heading-4, .heading-5, .heading-6 {
    color: #000;
  }
  
  .body-large, .body-base {
    color: #000;
  }
  
  .link {
    color: #0000ff;
    text-decoration: underline;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .link {
    transition: none;
  }
}

/* Enhanced Text Truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Text Shadow for Better Contrast */
.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.text-shadow {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.text-shadow-lg {
  text-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Text Glow Effects */
.text-glow {
  text-shadow: 0 0 10px currentColor;
}

.text-glow-lg {
  text-shadow: 0 0 20px currentColor;
}
`;

export const TYPOGRAPHY_CONFIG = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  // Font sizes with responsive scaling
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
    base: ['1rem', { lineHeight: '1.62rem', letterSpacing: '0em' }],
    lg: ['1.125rem', { lineHeight: '1.82rem', letterSpacing: '-0.025em' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
    '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
    '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
  },
  
  // Font weights
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
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Line height
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

export const getTypographyClasses = (type: string) => {
  const classes = {
    heading: {
      1: 'heading-1',
      2: 'heading-2',
      3: 'heading-3',
      4: 'heading-4',
      5: 'heading-5',
      6: 'heading-6',
    },
    body: {
      large: 'body-large',
      base: 'body-base',
      small: 'body-small',
      xs: 'body-xs',
    },
    readable: {
      base: 'readable',
      large: 'readable-large',
      small: 'readable-small',
    },
    code: {
      inline: 'code-inline',
      block: 'code-block',
    },
  };
  
  return classes[type as keyof typeof classes] || {};
};

export default TYPOGRAPHY_SYSTEM;