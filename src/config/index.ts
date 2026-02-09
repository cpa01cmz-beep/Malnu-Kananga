/**
 * Config Module Index
 * Centralized exports for all configuration files
 * Flexy Principle: Clean, organized module exports
 */

// API Configuration
export {
  DEFAULT_API_BASE_URL,
  API_BASE_URL,
  DEFAULT_WS_BASE_URL,
  WS_BASE_URL,
  LEGACY_ENDPOINTS,
  FEATURE_FLAGS,
} from './api';

// Limits Configuration
export {
  EMAIL_LIMITS,
  PASSWORD_LIMITS,
  TEXT_LIMITS,
  GRADE_LIMITS,
  FILE_LIMITS,
  CACHE_LIMITS,
  PAGINATION_LIMITS,
  NOTIFICATION_LIMITS,
  VOICE_LIMITS,
  WEBSOCKET_LIMITS,
  RETRY_LIMITS,
  AI_LIMITS,
} from './limits';

// Timing Configuration
export {
  TOAST_TIMING,
  ANIMATION_TIMING,
  NETWORK_TIMING,
  VOICE_TIMING,
  WEBSOCKET_TIMING,
  EMAIL_TIMING,
  RETRY_TIMING,
  NOTIFICATION_TIMING,
  UI_TIMING,
  CACHE_TIMING,
  ACCESSIBILITY_TIMING,
} from './timing';

// Retry Configuration
export {
  RETRYABLE_STATUS_CODES,
  RETRYABLE_NETWORK_ERRORS,
  SERVER_ERROR_STATUS_CODES,
  DEFAULT_RETRY_OPTIONS,
  type RetryOptions,
  type RetryResult,
} from './retry';
