/**
 * API Configuration
 * Centralized API URLs and endpoints
 * This file should NOT import from any other source files to avoid circular dependencies
 * Flexy Principle: Single source of truth for API configuration
 */

// Use type assertion safely to avoid TypeScript errors if vite/client types are missing
declare const importMetaEnv: { VITE_API_BASE_URL?: string } | undefined;
const env: { VITE_API_BASE_URL?: string } = (typeof importMetaEnv !== 'undefined' ? importMetaEnv : {}) || {};

// Default API Base URL - only defined here
export const DEFAULT_API_BASE_URL = 'https://malnu-kananga-worker-prod.cpa01cmz.workers.dev';

// Active API Base URL from environment or default
export const API_BASE_URL = env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

// WebSocket Base URL
export const DEFAULT_WS_BASE_URL = DEFAULT_API_BASE_URL.replace('https://', 'wss://') + '/ws';
export const WS_BASE_URL = env.VITE_API_BASE_URL 
  ? env.VITE_API_BASE_URL.replace('https://', 'wss://') + '/ws'
  : DEFAULT_WS_BASE_URL;

// Legacy endpoints (deprecated - use services/api instead)
export const LEGACY_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/api/chat`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_BACKEND_API: true,
  ENABLE_AUTH_JWT: true,
} as const;
