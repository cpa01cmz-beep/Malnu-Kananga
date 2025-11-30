
// Menggunakan Environment Variable untuk URL Backend
// Di Cloudflare Pages, set Variable 'VITE_API_BASE_URL' ke URL Worker Anda.
// Jika tidak diset, gunakan localhost atau fallback url.

// Use type assertion to avoid TypeScript errors if vite/client types are missing
const env = (import.meta as any).env;

export const API_BASE_URL = env?.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

export const WORKER_CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;
export const WORKER_LOGIN_ENDPOINT = `${API_BASE_URL}/request-login-link`;
