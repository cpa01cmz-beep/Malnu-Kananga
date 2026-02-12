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
    NAME: import.meta.env.VITE_SCHOOL_NAME || 'MA Malnu Kananga',
    NPSN: import.meta.env.VITE_SCHOOL_NPSN || '69881502',
    ADDRESS: import.meta.env.VITE_SCHOOL_ADDRESS || 'Jalan Desa Kananga Km. 0,5, Kananga, Kec. Menes, Kab. Pandeglang, Banten',
    PHONE: import.meta.env.VITE_SCHOOL_PHONE || '',
    EMAIL: import.meta.env.VITE_SCHOOL_EMAIL || 'info@ma-malnukananga.sch.id',
    WEBSITE: import.meta.env.VITE_SCHOOL_WEBSITE || 'https://malnu-kananga.sch.id',
  },
  EMAIL: {
    ADMIN: import.meta.env.VITE_ADMIN_EMAIL || 'admin@malnu-kananga.sch.id',
  },
} as const;

export type SchoolConfig = typeof ENV.SCHOOL;
export type EmailConfig = typeof ENV.EMAIL;
