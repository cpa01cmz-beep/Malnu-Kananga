import { errorMonitoringService } from '../services/errorMonitoringService';
import { performanceMonitor } from '../services/performanceMonitor';
import { healthMetricsService } from '../utils/healthMetrics';
import { logger } from '../utils/logger';
import {
  getErrorMonitoringConfig,
  getPerformanceMonitoringConfig,
} from '../config/monitoringConfig';

export const initializeMonitoring = async (): Promise<void> => {
  const env = import.meta.env.MODE || 'development';
  const isProduction = env === 'production';

  logger.setErrorMonitoringService(errorMonitoringService);

  try {
    const errorConfig = getErrorMonitoringConfig();
    if (errorConfig.dsn) {
      await errorMonitoringService.init(errorConfig);
    } else {
      logger.info('Error monitoring disabled (no DSN configured)');
    }
  } catch (error) {
    logger.error('Failed to initialize error monitoring', error);
  }

  try {
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
    healthMetricsService.init();
  } catch (error) {
    logger.error('Failed to initialize health metrics', error);
  }

  logger.info('Monitoring services initialized', {
    environment: env,
    performanceMonitoring: isProduction ? 'enabled' : 'disabled',
  });
};

export const setMonitoringUser = async (user: {
  id: string;
  email: string;
  role: string;
  extraRole?: string | null;
}): Promise<void> => {
  try {
    await errorMonitoringService.setUser(user);
    logger.info('User context set for monitoring', { userId: user.id, role: user.role });
  } catch (error) {
    logger.error('Failed to set monitoring user context', error);
  }
};

export const clearMonitoringUser = async (): Promise<void> => {
  try {
    await errorMonitoringService.clearUser();
    logger.info('User context cleared from monitoring');
  } catch (error) {
    logger.error('Failed to clear monitoring user context', error);
  }
};

export const captureMonitoringError = async (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): Promise<void> => {
  try {
    await errorMonitoringService.captureException(error, context);
  } catch (e) {
    logger.error('Failed to capture error in monitoring', e);
  }
};

export const addMonitoringBreadcrumb = async (
  category: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> => {
  try {
    await errorMonitoringService.addBreadcrumb(category, message, data);
  } catch (error) {
    logger.error('Failed to add monitoring breadcrumb', error);
  }
};

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

export const endMonitoringTransaction = (name: string, status?: string): void => {
  try {
    errorMonitoringService.endTransaction(name, status);
  } catch (error) {
    logger.error('Failed to end monitoring transaction', error);
  }
};
