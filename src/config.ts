
// Menggunakan Environment Variable untuk URL Backend
// Di Cloudflare Pages, set Variable 'VITE_API_BASE_URL' ke URL Worker Anda.
// Jika tidak diset, gunakan localhost atau fallback url.

// Use type assertion safely to avoid TypeScript errors if vite/client types are missing
const env: { VITE_API_BASE_URL?: string } = import.meta.env || {};

export const API_BASE_URL = env.VITE_API_BASE_URL || 'https://malnu-kananga-worker.cpa01cmz.workers.dev';

export const WORKER_CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;
export const WORKER_LOGIN_ENDPOINT = `${API_BASE_URL}/request-login-link`;
