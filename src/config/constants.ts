// config/constants.ts - Configuration Constants
// This file contains all configuration values that were previously in config.ts
// Extracted to avoid circular dependencies between config.ts and services/api

const env: { VITE_API_BASE_URL?: string; VITE_WS_BASE_URL?: string } = import.meta.env || {};

export const DEFAULT_API_BASE_URL = 'https://malnu-kananga-worker-prod.cpa01cmz.workers.dev';

export const API_BASE_URL = env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export const DEFAULT_WS_BASE_URL = DEFAULT_API_BASE_URL.replace('https://', 'wss://') + '/ws';

export const WS_BASE_URL = env.VITE_WS_BASE_URL ||
  (env.VITE_API_BASE_URL?.replace('https://', 'wss://') || DEFAULT_WS_BASE_URL);

// API Endpoints (Legacy - Use apiService.ts instead)
export const WORKER_CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;
export const WORKER_LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

// Feature Flags
export const ENABLE_BACKEND_API = true;
export const ENABLE_AUTH_JWT = true;
