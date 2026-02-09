/**
 * Timing Configuration
 * Centralized timeout and delay values throughout the application
 * Flexy Principle: No hardcoded timing - everything is configurable
 */

// Toast notification timing
export const TOAST_TIMING = {
  DEFAULT_DURATION: 3000,
  SHORT_DURATION: 1500,
  LONG_DURATION: 5000,
  ERROR_DURATION: 4000,
} as const;

// Animation timing
export const ANIMATION_TIMING = {
  DEFAULT_DELAY: 2000,
  SHORT_DELAY: 500,
  TRANSITION_DURATION: 300,
  FADE_DURATION: 200,
} as const;

// Network timing
export const NETWORK_TIMING = {
  SLOW_CONNECTION_THRESHOLD: 3000,
  REQUEST_TIMEOUT: 30000,
  CONNECTION_TIMEOUT: 10000,
} as const;

// Voice feature timing
export const VOICE_TIMING = {
  SPEECH_RECOGNITION_TIMEOUT: 5000,
  CONTINUOUS_MODE_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 500,
  SPEECH_TIMEOUT: 30000,
  RETRY_DELAY: 2000,
} as const;

// WebSocket timing
export const WEBSOCKET_TIMING = {
  CONNECTION_TIMEOUT: 10000,
  RECONNECT_DELAY: 5000,
  PING_INTERVAL: 30000,
  FALLBACK_POLLING_INTERVAL: 30000,
  VISIBILITY_CHECK_THRESHOLD: 60000, // 1 minute
} as const;

// Email service timing
export const EMAIL_TIMING = {
  CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Retry timing
export const RETRY_TIMING = {
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;

// Notification timing
export const NOTIFICATION_TIMING = {
  RETRY_DELAY: 1000,
  VIBRATION_PATTERN: [200, 100, 200] as const,
} as const;

// UI interaction timing
export const UI_TIMING = {
  DOUBLE_CLICK_DELAY: 300,
  SCROLL_DEBOUNCE: 100,
  RESIZE_DEBOUNCE: 250,
  HOVER_DELAY: 150,
} as const;

// Cache timing
export const CACHE_TIMING = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  EXTENDED_TTL: 60 * 60 * 1000, // 1 hour
} as const;

// Accessibility timing
export const ACCESSIBILITY_TIMING = {
  ANNOUNCEMENT_DURATION: 1000,
  FOCUS_VISIBLE_DELAY: 100,
} as const;
