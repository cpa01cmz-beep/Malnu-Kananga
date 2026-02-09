/**
 * Validation Limits Configuration
 * Centralized limits and thresholds for validation throughout the application
 * Flexy Principle: No hardcoded limits - everything is configurable
 */

// Email validation limits
export const EMAIL_LIMITS = {
  MAX_LOCAL_LENGTH: 64,
  MAX_DOMAIN_LENGTH: 253,
} as const;

// Password validation limits
export const PASSWORD_LIMITS = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
} as const;

// Text field limits
export const TEXT_LIMITS = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_ADDRESS_LENGTH: 200,
  MAX_SEARCH_TERM_LENGTH: 100,
  MIN_SEARCH_TERM_LENGTH: 2,
} as const;

// Grade validation limits
export const GRADE_LIMITS = {
  MIN: 0,
  MAX: 100,
  PASSING_THRESHOLD: 60,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_MATERIAL_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_UPLOAD_SIZE: 100 * 1024 * 1024,  // 100MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,    // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Cache limits
export const CACHE_LIMITS = {
  MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
  DEFAULT_CACHE_SIZE: 50,
  MAX_CACHE_SIZE: 100,
} as const;

// Pagination limits
export const PAGINATION_LIMITS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

// Notification limits
export const NOTIFICATION_LIMITS = {
  MAX_HISTORY_SIZE: 100,
  MAX_QUEUE_SIZE: 50,
  TTL_MS: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

// Voice configuration limits
export const VOICE_LIMITS = {
  MAX_CACHE_SIZE: 50,
  MAX_QUEUE_SIZE: 50,
  MIN_RATE: 0.5,
  MAX_RATE: 2.0,
  MIN_PITCH: 0.5,
  MAX_PITCH: 2.0,
  MIN_VOLUME: 0.0,
  MAX_VOLUME: 1.0,
} as const;

// WebSocket limits
export const WEBSOCKET_LIMITS = {
  MAX_RECONNECT_ATTEMPTS: 5,
  MAX_SUBSCRIPTION_TTL_MS: 60 * 60 * 1000, // 1 hour
} as const;

// Retry limits
export const RETRY_LIMITS = {
  DEFAULT_MAX_RETRIES: 3,
  MAX_RETRY_DELAY_MS: 10000,
  MIN_RETRY_DELAY_MS: 1000,
} as const;

// AI/Prompt limits
export const AI_LIMITS = {
  MIN_PROMPT_LENGTH: 3,
  MAX_PROMPT_LENGTH: 1000,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TEMPERATURE: 1.0,
  MIN_TEMPERATURE: 0.0,
} as const;
