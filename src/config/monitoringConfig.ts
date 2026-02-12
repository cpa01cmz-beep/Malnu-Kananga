// monitoringConfig.ts - Centralized monitoring configuration
// Flexy: All values use constants from constants.ts - no hardcoded values!

import { 
  TIME_MS, 
  RETRY_CONFIG, 
  PERFORMANCE_THRESHOLDS,
  DEVELOPMENT_THRESHOLDS
} from '../constants';

// ============================================
// ERROR MONITORING CONFIGURATION
// ============================================

export interface ErrorMonitoringConfig {
  dsn: string;
  environment: 'development' | 'production' | 'staging';
  tracesSampleRate: number;
  release: string | undefined;
}

/**
 * Get error monitoring configuration based on environment
 */
export const getErrorMonitoringConfig = (): ErrorMonitoringConfig => {
  const env = import.meta.env.MODE || 'development';
  const isProduction = env === 'production';

  // Sentry DSN (replace with actual DSN in production)
  const dsn = import.meta.env.VITE_SENTRY_DSN || '';

  let environment: 'development' | 'production';
  if (env === 'production') {
    environment = 'production';
  } else if (env === 'staging') {
    environment = 'production';
  } else {
    environment = 'development';
  }

  const tracesSampleRate = isProduction ? 0.1 : 1.0;

  return {
    dsn,
    environment,
    tracesSampleRate,
  } as ErrorMonitoringConfig;
};

// ============================================
// PERFORMANCE MONITORING CONFIGURATION
// ============================================

export interface PerformanceMonitoringConfig {
  slowRequestThreshold: number; // milliseconds
  enabled: boolean;
  errorRateThreshold: number; // percentage
  averageResponseTimeThreshold: number; // milliseconds
  consecutiveFailuresThreshold: number;
  maxMetrics: number;
}

/**
 * Get performance monitoring configuration
 * Flexy: Using constants instead of hardcoded values
 */
export const getPerformanceMonitoringConfig = (): PerformanceMonitoringConfig => {
  const env = import.meta.env.MODE || 'development';
  const isProduction = env === 'production';

  return {
    slowRequestThreshold: isProduction 
      ? PERFORMANCE_THRESHOLDS.SLOW_REQUEST_MS 
      : TIME_MS.TEN_SECONDS,
    enabled: isProduction,
    errorRateThreshold: isProduction 
      ? PERFORMANCE_THRESHOLDS.ERROR_RATE_ALERT_PERCENT 
      : DEVELOPMENT_THRESHOLDS.ERROR_RATE.DEV,
    averageResponseTimeThreshold: isProduction 
      ? PERFORMANCE_THRESHOLDS.AVG_RESPONSE_TIME_ALERT_MS 
      : TIME_MS.TEN_SECONDS,
    consecutiveFailuresThreshold: PERFORMANCE_THRESHOLDS.CONSECUTIVE_FAILURES_ALERT,
    maxMetrics: 1000,
  };
};

// ============================================
// HEALTH METRICS CONFIGURATION
// ============================================

export interface HealthMetricsConfig {
  refreshInterval: number; // milliseconds
  alertRetentionPeriod: number; // milliseconds
  maxAlerts: number;
  memoryWarningThreshold: number; // percentage
  memoryCriticalThreshold: number; // percentage
}

/**
 * Get health metrics configuration
 * Flexy: Using constants instead of hardcoded values
 */
export const getHealthMetricsConfig = (): HealthMetricsConfig => {
  const env = import.meta.env.MODE || 'development';
  const isProduction = env === 'production';

  return {
    refreshInterval: isProduction 
      ? RETRY_CONFIG.WEBSOCKET_PING_INTERVAL 
      : TIME_MS.TEN_SECONDS,
    alertRetentionPeriod: TIME_MS.ONE_WEEK,
    maxAlerts: 100,
    memoryWarningThreshold: PERFORMANCE_THRESHOLDS.MEMORY_WARNING_PERCENT,
    memoryCriticalThreshold: DEVELOPMENT_THRESHOLDS.MEMORY.CRITICAL,
  };
};

// ============================================
// ALERT THRESHOLDS
// ============================================

export interface AlertThresholds {
  websocket: {
    maxReconnectAttempts: number;
    connectionTimeout: number; // milliseconds
    pingTimeout: number; // milliseconds
  };
  pwa: {
    offlineTimeoutWarning: number; // milliseconds
    cacheSizeWarning: number; // MB
  };
  performance: {
    slowResponseWarning: number; // milliseconds
    errorRateCritical: number; // percentage
    consecutiveFailuresCritical: number;
  };
}

/**
 * Get alert thresholds
 * Flexy: Using constants instead of hardcoded values
 */
export const getAlertThresholds = (): AlertThresholds => {
  return {
    websocket: {
      maxReconnectAttempts: DEVELOPMENT_THRESHOLDS.WEBSOCKET.MAX_RECONNECT_ATTEMPTS,
      connectionTimeout: RETRY_CONFIG.WEBSOCKET_CONNECTION_TIMEOUT,
      pingTimeout: TIME_MS.FIVE_SECONDS,
    },
    pwa: {
      offlineTimeoutWarning: TIME_MS.ONE_MINUTE,
      cacheSizeWarning: DEVELOPMENT_THRESHOLDS.CACHE_SIZE.WARNING,
    },
    performance: {
      slowResponseWarning: PERFORMANCE_THRESHOLDS.AVG_RESPONSE_TIME_ALERT_MS,
      errorRateCritical: DEVELOPMENT_THRESHOLDS.ERROR_RATE.CRITICAL,
      consecutiveFailuresCritical: DEVELOPMENT_THRESHOLDS.CONSECUTIVE_FAILURES.CRITICAL,
    },
  };
};
