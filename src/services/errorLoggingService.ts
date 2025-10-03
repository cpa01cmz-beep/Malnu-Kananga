// Error Logging Service untuk monitoring dan debugging production
// Menyediakan comprehensive error collection dengan local storage dan reporting

export interface ErrorLog {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'runtime' | 'component' | 'network' | 'user' | 'system';
  metadata?: Record<string, any>;
  resolved?: boolean;
  environment: string;
}

export interface ErrorReportingOptions {
  enableConsole?: boolean;
  enableLocalStorage?: boolean;
  enableExternalService?: boolean;
  externalServiceUrl?: string;
  maxStoredErrors?: number;
  reportErrors?: boolean;
}

class ErrorLoggingService {
  private options: ErrorReportingOptions;
  private sessionId: string;
  private readonly STORAGE_KEY = 'error_logs';
  private readonly MAX_STORED_ERRORS = 100;

  constructor(options: ErrorReportingOptions = {}) {
    this.options = {
      enableConsole: true,
      enableLocalStorage: true,
      enableExternalService: false,
      maxStoredErrors: this.MAX_STORED_ERRORS,
      reportErrors: true,
      ...options
    };

    this.sessionId = this.generateSessionId();
    this.initializeEnvironment();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeEnvironment(): void {
    if (!process.env.NODE_ENV) {
      console.warn('NODE_ENV tidak tersedia, menggunakan development sebagai default');
    }
  }

  private getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private categorizeError(error: Error, componentStack?: string): { severity: ErrorLog['severity'], category: ErrorLog['category'] } {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Kategorisasi berdasarkan tipe error
    let category: ErrorLog['category'] = 'runtime';
    if (componentStack) {
      category = 'component';
    } else if (message.includes('network') || message.includes('fetch')) {
      category = 'network';
    } else if (message.includes('user') || stack.includes('user')) {
      category = 'user';
    }

    // Penentuan severity berdasarkan tipe error
    let severity: ErrorLog['severity'] = 'medium';
    if (message.includes('chunkloaderror') || message.includes('loading chunk')) {
      severity = 'high';
    } else if (message.includes('out of memory') || message.includes('maximum call stack')) {
      severity = 'critical';
    } else if (message.includes('warning') || message.includes('deprecated')) {
      severity = 'low';
    }

    return { severity, category };
  }

  private createErrorLog(
    error: Error,
    componentStack?: string,
    metadata?: Record<string, any>
  ): ErrorLog {
    const { severity, category } = this.categorizeError(error, componentStack);

    return {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      severity,
      category,
      metadata,
      environment: this.getEnvironment()
    };
  }

  private storeErrorLog(errorLog: ErrorLog): void {
    if (!this.options.enableLocalStorage) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let errorLogs: ErrorLog[] = stored ? JSON.parse(stored) : [];

      errorLogs.unshift(errorLog); // Tambah di awal

      // Batasi jumlah error yang disimpan
      if (errorLogs.length > (this.options.maxStoredErrors || this.MAX_STORED_ERRORS)) {
        errorLogs = errorLogs.slice(0, this.options.maxStoredErrors || this.MAX_STORED_ERRORS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(errorLogs));
    } catch (storageError) {
      console.warn('Gagal menyimpan error log ke localStorage:', storageError);
    }
  }

  private reportToConsole(errorLog: ErrorLog): void {
    if (!this.options.enableConsole) return;

    const logMethod = errorLog.severity === 'critical' || errorLog.severity === 'high' ? 'error' : 'warn';

    console.group(`🚨 Error Log [${errorLog.severity.toUpperCase()}]`);
    console[logMethod](`Message: ${errorLog.message}`);
    console.log(`Category: ${errorLog.category}`);
    console.log(`URL: ${errorLog.url}`);
    console.log(`Timestamp: ${errorLog.timestamp}`);
    console.log(`Session ID: ${errorLog.sessionId}`);

    if (errorLog.stack) {
      console.log('Stack Trace:', errorLog.stack);
    }

    if (errorLog.componentStack) {
      console.log('Component Stack:', errorLog.componentStack);
    }

    if (errorLog.metadata) {
      console.log('Metadata:', errorLog.metadata);
    }

    console.groupEnd();
  }

  private async reportToExternalService(errorLog: ErrorLog): Promise<void> {
    if (!this.options.enableExternalService || !this.options.externalServiceUrl) return;

    try {
      await fetch(this.options.externalServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog)
      });
    } catch (error) {
      console.warn('Gagal mengirim error ke external service:', error);
    }
  }

  // Method utama untuk logging error
  public async logError(
    error: Error,
    componentStack?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.options.reportErrors) return;

    const errorLog = this.createErrorLog(error, componentStack, metadata);

    // Simpan ke localStorage
    this.storeErrorLog(errorLog);

    // Report ke console
    this.reportToConsole(errorLog);

    // Report ke external service jika diaktifkan
    await this.reportToExternalService(errorLog);
  }

  // Method untuk logging error dari ErrorBoundary
  public async logErrorBoundary(error: Error, errorInfo: { componentStack: string }, metadata?: Record<string, any>): Promise<void> {
    await this.logError(error, errorInfo.componentStack, metadata);
  }

  // Method untuk mendapatkan semua error logs dari localStorage
  public getStoredErrorLogs(): ErrorLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Gagal mengambil error logs dari localStorage:', error);
      return [];
    }
  }

  // Method untuk clear error logs
  public clearStoredErrorLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Gagal menghapus error logs dari localStorage:', error);
    }
  }

  // Method untuk export error logs
  public exportErrorLogs(): string {
    const logs = this.getStoredErrorLogs();
    return JSON.stringify(logs, null, 2);
  }

  // Method untuk mengupdate konfigurasi
  public updateOptions(newOptions: Partial<ErrorReportingOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  // Method untuk mendapatkan session ID
  public getSessionId(): string {
    return this.sessionId;
  }

  // Method untuk mendapatkan statistik error
  public getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    recentErrors: number;
  } {
    const logs = this.getStoredErrorLogs();

    const stats = {
      total: logs.length,
      bySeverity: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      recentErrors: logs.filter(log => {
        const errorTime = new Date(log.timestamp);
        const now = new Date();
        const diffHours = (now.getTime() - errorTime.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24; // Error dalam 24 jam terakhir
      }).length
    };

    logs.forEach(log => {
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
let errorLoggingServiceInstance: ErrorLoggingService | null = null;

export function getErrorLoggingService(options?: ErrorReportingOptions): ErrorLoggingService {
  if (!errorLoggingServiceInstance) {
    errorLoggingServiceInstance = new ErrorLoggingService(options);
  } else if (options) {
    errorLoggingServiceInstance.updateOptions(options);
  }

  return errorLoggingServiceInstance;
}

// Export default instance untuk kemudahan penggunaan
export default getErrorLoggingService();

// Utility functions untuk kemudahan penggunaan
export const logError = (error: Error, metadata?: Record<string, any>) => {
  return getErrorLoggingService().logError(error, undefined, metadata);
};

export const logErrorBoundary = (error: Error, errorInfo: { componentStack: string }, metadata?: Record<string, any>) => {
  return getErrorLoggingService().logErrorBoundary(error, errorInfo, metadata);
};