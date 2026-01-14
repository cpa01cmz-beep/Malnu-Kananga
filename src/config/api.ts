// API Configuration
// Centralized API endpoint configuration to avoid circular dependencies

// Use type assertion safely to avoid TypeScript errors if vite/client types are missing
const env: { VITE_API_BASE_URL?: string; VITE_WS_BASE_URL?: string } = import.meta.env || {};

export const DEFAULT_API_BASE_URL = 'https://malnu-kananga-worker-prod.cpa01cmz.workers.dev';

export const API_BASE_URL = env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export const WORKER_CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;
export const WORKER_LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

export const WS_BASE_URL = env.VITE_WS_BASE_URL ||
  (env.VITE_API_BASE_URL?.replace('https://', 'wss://') || DEFAULT_API_BASE_URL.replace('https://', 'wss://')) + '/ws';
