
// Re-export API configuration from centralized location
// This file is kept for backward compatibility
// Use src/config/api.ts for new code

export {
  DEFAULT_API_BASE_URL,
  API_BASE_URL,
  DEFAULT_WS_BASE_URL,
  WS_BASE_URL,
  LEGACY_ENDPOINTS as WORKER_CHAT_ENDPOINT,
  LEGACY_ENDPOINTS as WORKER_LOGIN_ENDPOINT,
  FEATURE_FLAGS,
} from './config/api';

export const ENABLE_BACKEND_API = true;
export const ENABLE_AUTH_JWT = true;
