const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
  private errorMonitoringService: {
    isEnabled(): boolean;
    captureException?(error: Error, context?: { extra?: Record<string, unknown> }, severity?: string): void;
    captureMessage?(message: string, level: string, context?: { extra?: Record<string, unknown> }): void;
  } | null = null;

  /**
   * Set error monitoring service for integration
   */
  setErrorMonitoringService(service: {
    isEnabled(): boolean;
    captureException?(error: Error, context?: { extra?: Record<string, unknown> }, severity?: string): void;
    captureMessage?(message: string, level?: string, context?: { extra?: Record<string, unknown> }): void;
  }): void {
    this.errorMonitoringService = service;
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString()
    const argsStr = args.length > 0 ? ` ${JSON.stringify(args)}` : ''
    return `[${timestamp}] [${level}] ${message}${argsStr}`
  }

  debug(message: string, ...args: unknown[]): void {
    if (isDevelopment && import.meta.env.VITE_LOG_LEVEL === 'DEBUG') {
      console.log(this.formatMessage(LogLevel.DEBUG, message, ...args))
    }
  }

  info(message: string, ...args: unknown[]): void {
    const logLevel = import.meta.env.VITE_LOG_LEVEL as string || 'INFO';
    if (isDevelopment && ['DEBUG', 'INFO'].indexOf(logLevel) !== -1) {
      console.log(this.formatMessage(LogLevel.INFO, message, ...args))
    }
  }

  warn(message: string, ...args: unknown[]): void {
    const logLevel = import.meta.env.VITE_LOG_LEVEL as string || 'WARN';
    if (isDevelopment && ['DEBUG', 'INFO', 'WARN'].indexOf(logLevel) !== -1) {
      console.warn(this.formatMessage(LogLevel.WARN, message, ...args))
    }
    
    // Send warnings to error monitoring in production
    if (!isDevelopment && this.errorMonitoringService?.isEnabled()) {
      this.errorMonitoringService.captureMessage?.(
        message,
        'warning',
        { extra: { args } }
      );
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
      console.error(this.formatMessage(LogLevel.ERROR, message, ...args))
    }

    // Send errors to error monitoring in production
    if (!isDevelopment && this.errorMonitoringService?.isEnabled()) {
      // Check if first arg is an Error object
      const errorArg = args[0] instanceof Error ? args[0] : new Error(message);
      this.errorMonitoringService.captureException?.(
        errorArg,
        { extra: { message, args } },
        'error'
      );
    }
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, ...args: unknown[]): void {
    switch (level) {
      case LogLevel.DEBUG:
        this.debug(message, ...args);
        break;
      case LogLevel.INFO:
        this.info(message, ...args);
        break;
      case LogLevel.WARN:
        this.warn(message, ...args);
        break;
      case LogLevel.ERROR:
        this.error(message, ...args);
        break;
    }
  }
}

export const logger = new Logger()
