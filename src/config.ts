
// Configuration exports - Centralized configuration for the application
// This file now acts as a re-export layer to maintain backward compatibility
// All actual configuration values are in config/constants.ts to avoid circular dependencies

export {
  DEFAULT_API_BASE_URL,
  API_BASE_URL,
  DEFAULT_WS_BASE_URL,
  WS_BASE_URL,
  WORKER_CHAT_ENDPOINT,
  WORKER_LOGIN_ENDPOINT,
  ENABLE_BACKEND_API,
  ENABLE_AUTH_JWT,
} from './config/constants';

// API Service - Import and use this for all backend interactions
export { api, authAPI, usersAPI, ppdbAPI, inventoryAPI, eventsAPI, chatAPI } from './services/api';
