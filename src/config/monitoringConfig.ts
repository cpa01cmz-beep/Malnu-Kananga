// monitoringConfig.ts - Centralized monitoring configuration

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
 */
export const getPerformanceMonitoringConfig = (): PerformanceMonitoringConfig => {
  const env = import.meta.env.MODE || 'development';
  const isProduction = env === 'production';

  return {
    slowRequestThreshold: isProduction ? 5000 : 10000, // 5s in prod, 10s in dev
    enabled: isProduction,
    errorRateThreshold: isProduction ? 10 : 20, // 10% error rate in prod, 20% in dev
    averageResponseTimeThreshold: isProduction ? 3000 : 5000, // 3s in prod, 5s in dev
    consecutiveFailuresThreshold: 5,
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
 */
export const getHealthMetricsConfig = (): HealthMetricsConfig => {
  const env = import.meta.env.MODE || 'development';
  const isProduction = env === 'production';

  return {
    refreshInterval: isProduction ? 5000 : 10000, // 5s in prod, 10s in dev
    alertRetentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAlerts: 100,
    memoryWarningThreshold: 75,
    memoryCriticalThreshold: 90,
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
 */
export const getAlertThresholds = (): AlertThresholds => {
  return {
    websocket: {
      maxReconnectAttempts: 10,
      connectionTimeout: 10000, // 10 seconds
      pingTimeout: 5000, // 5 seconds
    },
    pwa: {
      offlineTimeoutWarning: 60000, // 1 minute
      cacheSizeWarning: 50, // 50 MB
    },
    performance: {
      slowResponseWarning: 5000, // 5 seconds
      errorRateCritical: 20, // 20%
      consecutiveFailuresCritical: 10,
    },
  };
};
