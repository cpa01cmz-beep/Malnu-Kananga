
// Menggunakan Environment Variable untuk URL Backend
// Di Cloudflare Pages, set Variable 'VITE_API_BASE_URL' ke URL Anda.
// Jika tidak diset, gunakan localhost atau fallback url.

import { API_CONFIG, API_ENDPOINTS } from './constants';

// Use type assertion safely to avoid TypeScript errors if vite/client types are missing
const env: { VITE_API_BASE_URL?: string } = import.meta.env || {};

// Re-export from constants to maintain single source of truth
export const DEFAULT_API_BASE_URL = API_CONFIG.DEFAULT_BASE_URL;

export const API_BASE_URL = env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

// Flexy: Protocol constants to eliminate hardcoded strings
const PROTOCOL = {
    HTTPS: 'https://',
    WSS: 'wss://',
} as const;

export const DEFAULT_WS_BASE_URL = API_BASE_URL.replace(PROTOCOL.HTTPS, PROTOCOL.WSS) + API_CONFIG.WS_PATH;

// API Endpoints (Legacy - Use services/api instead)
export const WORKER_CHAT_ENDPOINT = `${API_BASE_URL}${API_ENDPOINTS.AI.CHAT}`;
export const WORKER_LOGIN_ENDPOINT = `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`;

// Feature Flags
export const ENABLE_BACKEND_API = true; // Set to true to use real backend instead of localStorage
export const ENABLE_AUTH_JWT = true;
