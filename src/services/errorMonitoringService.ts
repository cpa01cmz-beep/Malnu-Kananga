import {
  init,
  setUser as sentrySetUser,
  setTag as sentrySetTag,
  setTags as sentrySetTags,
  setExtra as sentrySetExtra,
  setExtras as sentrySetExtras,
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
  addBreadcrumb as sentryAddBreadcrumb,
  withScope,
  flush as sentryFlush,
} from '@sentry/react';
import type { Scope } from '@sentry/react';
import { logger, LogLevel } from '../utils/logger';
import { COMPONENT_TIMEOUTS } from '../constants';

export interface ErrorMonitoringConfig {
  dsn: string;
  environment: 'development' | 'production' | 'staging';
  tracesSampleRate: number;
  release?: string;
}

export interface ErrorContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export interface ErrorSeverity {
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

class ErrorMonitoringService {
  private initialized: boolean = false;
  private environment: 'development' | 'production' | 'staging' = 'development';
  private performanceSpans: Map<string, number> = new Map();

  init(config: ErrorMonitoringConfig): void {
    if (this.initialized) {
      logger.warn('Error monitoring already initialized');
      return;
    }

    try {
      init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        tracesSampleRate: config.tracesSampleRate,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
      });

      this.environment = config.environment;
      this.initialized = true;
      logger.info('Error monitoring initialized', { environment: config.environment });
    } catch (error) {
      logger.error('Failed to initialize error monitoring', error);
    }
  }

  isEnabled(): boolean {
    return this.initialized && this.environment !== 'development';
  }

  setUser(user: { id: string; email: string; role: string; extraRole?: string | null }): void {
    if (!this.isEnabled()) return;

    sentrySetUser({
      id: user.id,
      email: user.email,
      role: user.role,
      extraRole: user.extraRole || undefined,
    });

    logger.debug('User context set for error monitoring', { userId: user.id, role: user.role });
  }

  clearUser(): void {
    sentrySetUser(null);
    logger.debug('User context cleared');
  }

  captureException(error: Error, context?: ErrorContext, severity?: ErrorSeverity['level']): void {
    if (!this.isEnabled()) {
      logger.error('Exception (not sent to monitoring):', error.message, error);
      return;
    }

    if (context) {
      if (context.user) {
        sentrySetUser(context.user);
      }
      if (context.tags) {
        sentrySetTags(context.tags);
      }
      if (context.extra) {
        sentrySetExtras(context.extra);
      }
    }

    withScope((scope: Scope) => {
      if (severity) {
        scope.setLevel(severity);
      }
      sentryCaptureException(error);
    });

    logger.error('Exception captured:', error.message, error);
  }

  captureMessage(message: string, level?: 'error' | 'warning' | 'info', context?: ErrorContext): void {
    if (!this.isEnabled()) {
      logger.log(LogLevel.INFO, `Message (not sent to monitoring) [${level || 'info'}]: ${message}`);
      return;
    }

    if (context) {
      if (context.user) {
        sentrySetUser(context.user);
      }
      if (context.tags) {
        sentrySetTags(context.tags);
      }
      if (context.extra) {
        sentrySetExtras(context.extra);
      }
    }

    sentryCaptureMessage(message, level);
    logger.log(LogLevel.INFO, `Message captured [${level || 'info'}]: ${message}`);
  }

  setTag(key: string, value: string): void {
    if (!this.isEnabled()) return;
    sentrySetTag(key, value);
  }

  setTags(tags: Record<string, string>): void {
    if (!this.isEnabled()) return;
    sentrySetTags(tags);
  }

  setExtra(key: string, value: unknown): void {
    if (!this.isEnabled()) return;
    sentrySetExtra(key, value);
  }

  setExtras(extras: Record<string, unknown>): void {
    if (!this.isEnabled()) return;
    sentrySetExtras(extras);
  }

  addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
    if (!this.isEnabled()) return;

    sentryAddBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });

    logger.debug('Breadcrumb added:', { category, message });
  }

  startTransaction(name: string, operation: string = 'custom'): void {
    if (!this.isEnabled()) return;

    this.performanceSpans.set(name, Date.now());
    logger.debug('Transaction started:', { name, operation });
  }

  endTransaction(name: string, _status?: string): void {
    if (!this.isEnabled()) return;

    const startTime = this.performanceSpans.get(name);
    if (!startTime) {
      logger.warn('Transaction not found:', name);
      return;
    }

    const duration = Date.now() - startTime;
    this.performanceSpans.delete(name);
    logger.debug('Transaction ended:', { name, duration: `${duration}ms` });
  }

  async flush(timeout: number = COMPONENT_TIMEOUTS.ERROR_FLUSH): Promise<boolean> {
    try {
      if (!this.isEnabled()) return true;
      return sentryFlush(timeout);
    } catch (error) {
      logger.error('Error flushing Sentry events:', error);
      return false;
    }
  }
}

export const errorMonitoringService = new ErrorMonitoringService();
