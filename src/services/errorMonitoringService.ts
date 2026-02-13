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

type SentryModule = typeof import('@sentry/react');

class ErrorMonitoringService {
  private initialized: boolean = false;
  private environment: 'development' | 'production' | 'staging' = 'development';
  private performanceSpans: Map<string, number> = new Map();
  private sentryModule: SentryModule | null = null;
  private initPromise: Promise<void> | null = null;

  async init(config: ErrorMonitoringConfig): Promise<void> {
    if (this.initialized) {
      logger.warn('Error monitoring already initialized');
      return;
    }

    if (!config.dsn) {
      logger.info('Error monitoring disabled (no DSN configured)');
      return;
    }

    try {
      this.initPromise = this.loadAndInitSentry(config);
      await this.initPromise;
    } catch (error) {
      logger.error('Failed to initialize error monitoring', error);
    }
  }

  private async loadAndInitSentry(config: ErrorMonitoringConfig): Promise<void> {
    const sentry = await import('@sentry/react');
    this.sentryModule = sentry;

    sentry.init({
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
  }

  isEnabled(): boolean {
    return this.initialized && this.environment !== 'development';
  }

  async setUser(user: { id: string; email: string; role: string; extraRole?: string | null }): Promise<void> {
    if (!this.isEnabled() || !this.sentryModule) return;

    this.sentryModule.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
      extraRole: user.extraRole || undefined,
    });

    logger.debug('User context set for error monitoring', { userId: user.id, role: user.role });
  }

  async clearUser(): Promise<void> {
    if (!this.sentryModule) return;
    this.sentryModule.setUser(null);
    logger.debug('User context cleared');
  }

  async captureException(error: Error, context?: ErrorContext, severity?: ErrorSeverity['level']): Promise<void> {
    if (this.initPromise) {
      await this.initPromise.catch(() => {});
    }

    if (!this.isEnabled() || !this.sentryModule) {
      logger.error('Exception (not sent to monitoring):', error.message, error);
      return;
    }

    const { withScope, setUser, setTags, setExtras, captureException } = this.sentryModule;

    if (context) {
      if (context.user) {
        setUser(context.user);
      }
      if (context.tags) {
        setTags(context.tags);
      }
      if (context.extra) {
        setExtras(context.extra);
      }
    }

    withScope((scope) => {
      if (severity) {
        scope.setLevel(severity);
      }
      captureException(error);
    });

    logger.error('Exception captured:', error.message, error);
  }

  async captureMessage(message: string, level?: 'error' | 'warning' | 'info', context?: ErrorContext): Promise<void> {
    if (this.initPromise) {
      await this.initPromise.catch(() => {});
    }

    if (!this.isEnabled() || !this.sentryModule) {
      logger.log(LogLevel.INFO, `Message (not sent to monitoring) [${level || 'info'}]: ${message}`);
      return;
    }

    const { setUser, setTags, setExtras, captureMessage } = this.sentryModule;

    if (context) {
      if (context.user) {
        setUser(context.user);
      }
      if (context.tags) {
        setTags(context.tags);
      }
      if (context.extra) {
        setExtras(context.extra);
      }
    }

    captureMessage(message, level);
    logger.log(LogLevel.INFO, `Message captured [${level || 'info'}]: ${message}`);
  }

  async setTag(key: string, value: string): Promise<void> {
    if (!this.isEnabled() || !this.sentryModule) return;
    this.sentryModule.setTag(key, value);
  }

  async setTags(tags: Record<string, string>): Promise<void> {
    if (!this.isEnabled() || !this.sentryModule) return;
    this.sentryModule.setTags(tags);
  }

  async setExtra(key: string, value: unknown): Promise<void> {
    if (!this.isEnabled() || !this.sentryModule) return;
    this.sentryModule.setExtra(key, value);
  }

  async setExtras(extras: Record<string, unknown>): Promise<void> {
    if (!this.isEnabled() || !this.sentryModule) return;
    this.sentryModule.setExtras(extras);
  }

  async addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): Promise<void> {
    if (!this.isEnabled() || !this.sentryModule) return;

    this.sentryModule.addBreadcrumb({
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
      if (!this.isEnabled() || !this.sentryModule) return true;
      return this.sentryModule.flush(timeout);
    } catch (error) {
      logger.error('Error flushing Sentry events:', error);
      return false;
    }
  }
}

export const errorMonitoringService = new ErrorMonitoringService();
