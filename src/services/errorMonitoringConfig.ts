// Konfigurasi error monitoring untuk production dan development
// Setup otomatis berdasarkan environment

import { getErrorLoggingService, ErrorReportingOptions } from './errorLoggingService';
import { initSentry } from './sentryService';

interface ErrorMonitoringConfig {
  development: ErrorReportingOptions;
  production: ErrorReportingOptions;
  staging?: ErrorReportingOptions;
}

// Konfigurasi default untuk setiap environment
const ERROR_MONITORING_CONFIG: ErrorMonitoringConfig = {
  development: {
    enableConsole: true,
    enableLocalStorage: true,
    enableExternalService: false, // Tidak aktif di development
    maxStoredErrors: 100,
    reportErrors: true
  },

  production: {
    enableConsole: false, // Minimal console logging di production
    enableLocalStorage: true, // Aktif untuk debugging jika diperlukan
    enableExternalService: true, // Aktif jika external service dikonfigurasi
    externalServiceUrl: process.env.REACT_APP_ERROR_REPORTING_URL, // URL untuk external service
    maxStoredErrors: 50, // Lebih sedikit di production untuk performa
    reportErrors: true
  },

  staging: {
    enableConsole: true,
    enableLocalStorage: true,
    enableExternalService: true,
    externalServiceUrl: process.env.REACT_APP_ERROR_REPORTING_URL,
    maxStoredErrors: 75,
    reportErrors: true
  }
};

// Function untuk mendapatkan konfigurasi berdasarkan environment
function getEnvironmentConfig(): ErrorReportingOptions {
  const env = process.env.NODE_ENV || 'development';

  // Gunakan konfigurasi spesifik untuk environment
  const config = ERROR_MONITORING_CONFIG[env as keyof ErrorMonitoringConfig];

  if (!config) {
    console.warn(`Konfigurasi error monitoring untuk environment '${env}' tidak ditemukan, menggunakan development config`);
    return ERROR_MONITORING_CONFIG.development;
  }

  return config;
}

// Function untuk setup error monitoring
export function setupErrorMonitoring(customConfig?: Partial<ErrorReportingOptions>): void {
  const envConfig = getEnvironmentConfig();

  // Gabungkan konfigurasi environment dengan konfigurasi custom
  const finalConfig: ErrorReportingOptions = {
    ...envConfig,
    ...customConfig
  };

  // Setup error logging service dengan konfigurasi
  const errorService = getErrorLoggingService(finalConfig);

  // Inisialisasi Sentry untuk error tracking
  initSentry();

  console.log(`Error monitoring diinisialisasi untuk environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Error monitoring config:', {
    enableConsole: finalConfig.enableConsole,
    enableLocalStorage: finalConfig.enableLocalStorage,
    enableExternalService: finalConfig.enableExternalService,
    maxStoredErrors: finalConfig.maxStoredErrors,
    hasExternalServiceUrl: !!finalConfig.externalServiceUrl
  });

  // Setup global error handlers jika di production
  if (process.env.NODE_ENV === 'production') {
    setupProductionErrorHandlers(errorService);
  }

  // Setup development helpers jika di development
  if (process.env.NODE_ENV === 'development') {
    setupDevelopmentHelpers(errorService);
  }
}

// Setup error handlers khusus untuk production
function setupProductionErrorHandlers(errorService: ReturnType<typeof getErrorLoggingService>): void {
  // Global error handler untuk unhandled errors
  window.addEventListener('error', (event) => {
    errorService.logError(event.error || new Error(event.message), undefined, {
      source: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Global handler untuk unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    errorService.logError(error, undefined, {
      source: 'unhandledrejection',
      type: 'promise_rejection'
    });
  });

  // Monitor memory usage jika tersedia
  if ('memory' in performance) {
    // Setup memory monitoring setiap 30 detik
    setInterval(() => {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const usedMemoryMB = Math.round(memoryInfo.usedJSHeapSize / 1048576);
        const totalMemoryMB = Math.round(memoryInfo.totalJSHeapSize / 1048576);

        // Log warning jika memory usage tinggi
        if (usedMemoryMB > 100) { // Lebih dari 100MB
          errorService.logError(
            new Error(`High memory usage: ${usedMemoryMB}MB used out of ${totalMemoryMB}MB`),
            undefined,
            {
              category: 'performance',
              usedMemoryMB,
              totalMemoryMB,
              usagePercentage: Math.round((usedMemoryMB / totalMemoryMB) * 100)
            }
          );
        }
      }
    }, 30000); // Check setiap 30 detik
  }
}

// Setup development helpers
function setupDevelopmentHelpers(errorService: ReturnType<typeof getErrorLoggingService>): void {
  // Tambahkan global function untuk debugging
  (window as any).getErrorLogs = () => errorService.getStoredErrorLogs();
  (window as any).clearErrorLogs = () => errorService.clearStoredErrorLogs();
  (window as any).getErrorStats = () => errorService.getErrorStats();
  (window as any).exportErrorLogs = () => errorService.exportErrorLogs();

  console.log('🔧 Development helpers available:');
  console.log('- getErrorLogs(): Get all stored error logs');
  console.log('- clearErrorLogs(): Clear all stored error logs');
  console.log('- getErrorStats(): Get error statistics');
  console.log('- exportErrorLogs(): Export error logs as JSON string');

  // Log error stats setiap menit di development
  setInterval(() => {
    const stats = errorService.getErrorStats();
    if (stats.total > 0) {
      console.log('📊 Error Stats:', stats);
    }
  }, 60000); // Log setiap menit
}

// Auto-initialize jika tidak di test environment
if (process.env.NODE_ENV !== 'test') {
  setupErrorMonitoring();
}

// Export untuk manual initialization jika diperlukan
export { ERROR_MONITORING_CONFIG };
export default setupErrorMonitoring;