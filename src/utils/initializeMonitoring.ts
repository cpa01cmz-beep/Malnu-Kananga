// initializeMonitoring.ts - Initialize all monitoring services

import { errorMonitoringService } from '../services/errorMonitoringService';
import { performanceMonitor } from '../services/performanceMonitor';
import { healthMetricsService } from '../utils/healthMetrics';
import { logger } from '../utils/logger';
import {
  getErrorMonitoringConfig,
  getPerformanceMonitoringConfig,
} from '../config/monitoringConfig';

/**
 * Initialize all monitoring services
 * Call this in main.tsx or App.tsx
 */
export const initializeMonitoring = (): void => {
  const env = import.meta.env.MODE || 'development';
  const isProduction = env === 'production';

  // Set error monitoring service in logger for automatic error integration
  logger.setErrorMonitoringService(errorMonitoringService);

  try {
    // Initialize error monitoring
    const errorConfig = getErrorMonitoringConfig();
    if (errorConfig.dsn) {
      errorMonitoringService.init(errorConfig);
    } else {
      logger.info('Error monitoring disabled (no DSN configured)');
    }
  } catch (error) {
    logger.error('Failed to initialize error monitoring', error);
  }

  try {
    // Initialize performance monitoring
    const perfConfig = getPerformanceMonitoringConfig();
    performanceMonitor.init({
      threshold: perfConfig.slowRequestThreshold,
      enabled: perfConfig.enabled,
      errorRate: perfConfig.errorRateThreshold,
      averageResponseTime: perfConfig.averageResponseTimeThreshold,
      consecutiveFailures: perfConfig.consecutiveFailuresThreshold,
    });
  } catch (error) {
    logger.error('Failed to initialize performance monitoring', error);
  }

  try {
    // Initialize health metrics
    healthMetricsService.init();
  } catch (error) {
    logger.error('Failed to initialize health metrics', error);
  }

  logger.info('Monitoring services initialized', {
    environment: env,
    performanceMonitoring: isProduction ? 'enabled' : 'disabled',
  });
};

/**
 * Set user context for all monitoring services
 */
export const setMonitoringUser = (user: {
  id: string;
  email: string;
  role: string;
  extraRole?: string | null;
}): void => {
  try {
    errorMonitoringService.setUser(user);
    logger.info('User context set for monitoring', { userId: user.id, role: user.role });
  } catch (error) {
    logger.error('Failed to set monitoring user context', error);
  }
};

/**
 * Clear user context from all monitoring services
 */
export const clearMonitoringUser = (): void => {
  try {
    errorMonitoringService.clearUser();
    logger.info('User context cleared from monitoring');
  } catch (error) {
    logger.error('Failed to clear monitoring user context', error);
  }
};

/**
 * Capture exception in all monitoring services
 */
export const captureMonitoringError = (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): void => {
  try {
    errorMonitoringService.captureException(error, context);
  } catch (e) {
    logger.error('Failed to capture error in monitoring', e);
  }
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addMonitoringBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>
): void => {
  try {
    errorMonitoringService.addBreadcrumb(category, message, data);
  } catch (error) {
    logger.error('Failed to add monitoring breadcrumb', error);
  }
};

/**
 * Start performance transaction
 */
export const startMonitoringTransaction = (
  name: string,
  operation: string = 'custom'
): void => {
  try {
    errorMonitoringService.startTransaction(name, operation);
  } catch (error) {
    logger.error('Failed to start monitoring transaction', error);
  }
};

/**
 * End performance transaction
 */
export const endMonitoringTransaction = (name: string, status?: string): void => {
  try {
    errorMonitoringService.endTransaction(name, status);
  } catch (error) {
    logger.error('Failed to end monitoring transaction', error);
  }
};
