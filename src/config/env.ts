/**
 * Environment Configuration Module
 * Flexy: Centralized environment variable access with type safety
 * 
 * This module provides a single source of truth for all environment-based
 * configuration values, enabling multi-tenant deployments and eliminating
 * hardcoded school-specific values.
 */

export const ENV = {
  SCHOOL: {
    NAME: import.meta.env.VITE_SCHOOL_NAME || '',
    NPSN: import.meta.env.VITE_SCHOOL_NPSN || '',
    ADDRESS: import.meta.env.VITE_SCHOOL_ADDRESS || '',
    PHONE: import.meta.env.VITE_SCHOOL_PHONE || '',
    EMAIL: import.meta.env.VITE_SCHOOL_EMAIL || '',
    WEBSITE: import.meta.env.VITE_SCHOOL_WEBSITE || '',
  },
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  },
  EMAIL: {
    ADMIN: import.meta.env.VITE_ADMIN_EMAIL || '',
  },
  EXTERNAL: {
    GOOGLE_FONTS_INTER: import.meta.env.VITE_GOOGLE_FONTS_INTER || 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    GOOGLE_FONTS_JETBRAINS: import.meta.env.VITE_GOOGLE_FONTS_JETBRAINS || 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap',
  },
} as const;

export type SchoolConfig = typeof ENV.SCHOOL;
export type EmailConfig = typeof ENV.EMAIL;
export type ExternalConfig = typeof ENV.EXTERNAL;
