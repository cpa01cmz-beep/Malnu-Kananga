
// Menggunakan Environment Variable untuk URL Backend
// Di Cloudflare Pages, set Variable 'VITE_API_BASE_URL' ke URL Anda.
// Jika tidak diset, gunakan localhost atau fallback url.

// Use type assertion safely to avoid TypeScript errors if vite/client types are missing
const env: { VITE_API_BASE_URL?: string } = import.meta.env || {};

export const DEFAULT_API_BASE_URL = 'https://malnu-kananga-worker-prod.cpa01cmz.workers.dev';

export const API_BASE_URL = env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export const DEFAULT_WS_BASE_URL = DEFAULT_API_BASE_URL.replace('https://', 'wss://') + '/ws';

// API Endpoints (Legacy - Use apiService.ts instead)
export const WORKER_CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;
export const WORKER_LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

// New API Service - Import and use this for all backend interactions
export { api, authAPI, usersAPI, ppdbAPI, inventoryAPI, eventsAPI, chatAPI } from './services/apiService';

// Feature Flags
export const ENABLE_BACKEND_API = true; // Set to true to use real backend instead of localStorage
export const ENABLE_AUTH_JWT = true;
