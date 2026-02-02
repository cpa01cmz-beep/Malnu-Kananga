// errorMonitoringService.ts - Sentry-based error tracking and monitoring

import * as Sentry from '@sentry/react';
import { logger, LogLevel } from '../utils/logger';

// ============================================
// TYPES
// ============================================

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

// ============================================
// SERVICE CLASS
// ============================================

class ErrorMonitoringService {
  private initialized: boolean = false;
  private environment: 'development' | 'production' | 'staging' = 'development';
  private performanceSpans: Map<string, number> = new Map();

  /**
   * Initialize Sentry error monitoring
   */
  init(config: ErrorMonitoringConfig): void {
    if (this.initialized) {
      logger.warn('Error monitoring already initialized');
      return;
    }

    try {
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        tracesSampleRate: config.tracesSampleRate,
      });

      this.environment = config.environment;
      this.initialized = true;
      logger.info('Error monitoring initialized', { environment: config.environment });
    } catch (error) {
      logger.error('Failed to initialize error monitoring', error);
    }
  }

  /**
   * Check if monitoring is initialized
   */
  isEnabled(): boolean {
    return this.initialized && this.environment !== 'development';
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; email: string; role: string; extraRole?: string | null }): void {
    if (!this.isEnabled()) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
      extraRole: user.extraRole || undefined,
    });

    logger.debug('User context set for error monitoring', { userId: user.id, role: user.role });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    Sentry.setUser(null);
    logger.debug('User context cleared');
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext, severity?: ErrorSeverity['level']): void {
    if (!this.isEnabled()) {
      logger.error('Exception (not sent to monitoring):', error.message, error);
      return;
    }

    if (context) {
      if (context.user) {
        Sentry.setUser(context.user);
      }
      if (context.tags) {
        Sentry.setTags(context.tags);
      }
      if (context.extra) {
        Sentry.setExtras(context.extra);
      }
    }

    Sentry.withScope((scope) => {
      if (severity) {
        scope.setLevel(severity);
      }
      Sentry.captureException(error);
    });

    logger.error('Exception captured:', error.message, error);
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level?: 'error' | 'warning' | 'info', context?: ErrorContext): void {
    if (!this.isEnabled()) {
      logger.log(LogLevel.INFO, `Message (not sent to monitoring) [${level || 'info'}]: ${message}`);
      return;
    }

    if (context) {
      if (context.user) {
        Sentry.setUser(context.user);
      }
      if (context.tags) {
        Sentry.setTags(context.tags);
      }
      if (context.extra) {
        Sentry.setExtras(context.extra);
      }
    }

    Sentry.captureMessage(message, level);
    logger.log(LogLevel.INFO, `Message captured [${level || 'info'}]: ${message}`);
  }

  /**
   * Set tag for current scope
   */
  setTag(key: string, value: string): void {
    if (!this.isEnabled()) return;
    Sentry.setTag(key, value);
  }

  /**
   * Set tags for current scope
   */
  setTags(tags: Record<string, string>): void {
    if (!this.isEnabled()) return;
    Sentry.setTags(tags);
  }

  /**
   * Set extra context for current scope
   */
  setExtra(key: string, value: unknown): void {
    if (!this.isEnabled()) return;
    Sentry.setExtra(key, value);
  }

  /**
   * Set extras for current scope
   */
  setExtras(extras: Record<string, unknown>): void {
    if (!this.isEnabled()) return;
    Sentry.setExtras(extras);
  }

  /**
   * Add breadcrumb for tracking user actions
   */
  addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
    if (!this.isEnabled()) return;

    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });

    logger.debug('Breadcrumb added:', { category, message });
  }

  /**
   * Start performance span
   */
  startTransaction(name: string, operation: string = 'custom'): void {
    if (!this.isEnabled()) return;

    this.performanceSpans.set(name, Date.now());
    logger.debug('Transaction started:', { name, operation });
  }

  /**
   * End performance span
   */
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

  /**
   * Flush pending events
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    try {
      if (!this.isEnabled()) return true;
      return Sentry.flush(timeout);
    } catch (error) {
      logger.error('Error flushing Sentry events:', error);
      return false;
    }
  }

  /**
   * Get Sentry instance for advanced usage
   */
  getSentry(): typeof Sentry {
    return Sentry;
  }
}

// ============================================
// EXPORTS
// ============================================

export const errorMonitoringService = new ErrorMonitoringService();
