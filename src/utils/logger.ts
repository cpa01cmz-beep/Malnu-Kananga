const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
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
    if (isDevelopment && ['DEBUG', 'INFO'].includes(import.meta.env.VITE_LOG_LEVEL || 'INFO')) {
      console.log(this.formatMessage(LogLevel.INFO, message, ...args))
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (isDevelopment && ['DEBUG', 'INFO', 'WARN'].includes(import.meta.env.VITE_LOG_LEVEL || 'WARN')) {
      console.warn(this.formatMessage(LogLevel.WARN, message, ...args))
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
      console.error(this.formatMessage(LogLevel.ERROR, message, ...args))
    }
  }
}

export const logger = new Logger()
