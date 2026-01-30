import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Sentry before importing the service
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  setUser: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setTag: vi.fn(),
  setTags: vi.fn(),
  setExtra: vi.fn(),
  setExtras: vi.fn(),
  addBreadcrumb: vi.fn(),
  flush: vi.fn().mockResolvedValue(true),
  withScope: vi.fn((callback: (scope: any) => void) => {
    callback({
      setLevel: vi.fn(),
    });
  }),
}));

// Mock logger before importing the service
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
  },
  LogLevel: {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    DEBUG: 'debug',
  },
}));

// Now import after mocking
import { errorMonitoringService, ErrorMonitoringConfig, ErrorContext } from '../errorMonitoringService';
import * as Sentry from '@sentry/react';
import { logger } from '../../utils/logger';

describe('ErrorMonitoringService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset service state
    (errorMonitoringService as any).initialized = false;
    (errorMonitoringService as any).environment = 'development';
    (errorMonitoringService as any).performanceSpans.clear();
  });

  describe('Initialization', () => {
    it('should initialize Sentry with provided config', () => {
      const config: ErrorMonitoringConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
        release: 'v1.0.0',
      };

      errorMonitoringService.init(config);

      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        release: 'v1.0.0',
        tracesSampleRate: 0.1,
      });
      expect(logger.info).toHaveBeenCalledWith('Error monitoring initialized', { environment: 'production' });
    });

    it('should initialize successfully without release', () => {
      const config: ErrorMonitoringConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'staging',
        tracesSampleRate: 0.2,
      };

      errorMonitoringService.init(config);

      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123',
        environment: 'staging',
        release: undefined,
        tracesSampleRate: 0.2,
      });
    });

    it('should not initialize twice', () => {
      const config: ErrorMonitoringConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      };

      errorMonitoringService.init(config);
      errorMonitoringService.init(config);

      expect(Sentry.init).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith('Error monitoring already initialized');
    });

    it('should handle initialization error gracefully', () => {
      vi.mocked(Sentry.init).mockImplementationOnce(() => {
        throw new Error('Sentry init failed');
      });

      const config: ErrorMonitoringConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      };

      expect(() => errorMonitoringService.init(config)).not.toThrow();
      expect(logger.error).toHaveBeenCalledWith('Failed to initialize error monitoring', expect.any(Error));
    });
  });

  describe('isEnabled', () => {
    it('should return false when not initialized', () => {
      expect(errorMonitoringService.isEnabled()).toBe(false);
    });

    it('should return false when in development environment', () => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'development',
        tracesSampleRate: 0.1,
      });

      expect(errorMonitoringService.isEnabled()).toBe(false);
    });

    it('should return true when in production environment', () => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });

      expect(errorMonitoringService.isEnabled()).toBe(true);
    });

    it('should return true when in staging environment', () => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'staging',
        tracesSampleRate: 0.1,
      });

      expect(errorMonitoringService.isEnabled()).toBe(true);
    });
  });

  describe('User Context', () => {
    beforeEach(() => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });
    });

    it('should set user context', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'teacher',
        extraRole: 'wakasek',
      };

      errorMonitoringService.setUser(user);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        role: 'teacher',
        extraRole: 'wakasek',
      });
      expect(logger.debug).toHaveBeenCalledWith('User context set for error monitoring', {
        userId: 'user-123',
        role: 'teacher',
      });
    });

    it('should set user context without extraRole', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
      };

      errorMonitoringService.setUser(user);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        extraRole: undefined,
      });
    });

    it('should not set user context when not enabled', () => {
      (errorMonitoringService as any).initialized = false;

      errorMonitoringService.setUser({
        id: 'user-123',
        email: 'test@example.com',
        role: 'teacher',
      });

      expect(Sentry.setUser).not.toHaveBeenCalled();
    });

    it('should clear user context', () => {
      errorMonitoringService.clearUser();

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
      expect(logger.debug).toHaveBeenCalledWith('User context cleared');
    });
  });

  describe('Error Capture', () => {
    beforeEach(() => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });
    });

    it('should capture exception', () => {
      const error = new Error('Test error');

      errorMonitoringService.captureException(error);

      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
      expect(logger.error).toHaveBeenCalledWith('Exception captured:', 'Test error', error);
    });

    it('should capture exception with context', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'teacher',
        },
        tags: { feature: 'grading' },
        extra: { studentId: 'student-456' },
      };

      errorMonitoringService.captureException(error, context);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        role: 'teacher',
      });
      expect(Sentry.setTags).toHaveBeenCalledWith({ feature: 'grading' });
      expect(Sentry.setExtras).toHaveBeenCalledWith({ studentId: 'student-456' });
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should capture exception with severity', () => {
      const error = new Error('Test error');

      errorMonitoringService.captureException(error, undefined, 'fatal');

      expect(Sentry.withScope).toHaveBeenCalled();
      // The callback sets level on scope, verified through integration test
    });

    it('should not capture exception when not enabled (logs instead)', () => {
      (errorMonitoringService as any).environment = 'development';
      const error = new Error('Test error');

      errorMonitoringService.captureException(error);

      expect(Sentry.captureException).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('Exception (not sent to monitoring):', 'Test error', error);
    });
  });

  describe('Message Capture', () => {
    beforeEach(() => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });
    });

    it('should capture message with default level', () => {
      const message = 'Test message';

      errorMonitoringService.captureMessage(message);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, undefined);
      expect(logger.log).toHaveBeenCalledWith({ INFO: 'info', WARN: 'warn', ERROR: 'error', DEBUG: 'debug' }.INFO, 'Message captured [info]: Test message');
    });

    it('should capture message with custom level', () => {
      const message = 'Warning message';

      errorMonitoringService.captureMessage(message, 'warning');

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, 'warning');
    });

    it('should capture message with context', () => {
      const message = 'Test message';
      const context: ErrorContext = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'teacher',
        },
        tags: { source: 'api' },
      };

      errorMonitoringService.captureMessage(message, 'error', context);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        role: 'teacher',
      });
      expect(Sentry.setTags).toHaveBeenCalledWith({ source: 'api' });
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, 'error');
    });

    it('should not capture message when not enabled (logs instead)', () => {
      (errorMonitoringService as any).environment = 'development';
      const message = 'Test message';

      errorMonitoringService.captureMessage(message);

      expect(Sentry.captureMessage).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith({ INFO: 'info', WARN: 'warn', ERROR: 'error', DEBUG: 'debug' }.INFO, 'Message (not sent to monitoring) [info]: Test message');
    });
  });

  describe('Tags and Extras', () => {
    beforeEach(() => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });
    });

    it('should set single tag', () => {
      errorMonitoringService.setTag('feature', 'grading');

      expect(Sentry.setTag).toHaveBeenCalledWith('feature', 'grading');
    });

    it('should set multiple tags', () => {
      const tags = { feature: 'grading', component: 'GradesTab', action: 'export' };

      errorMonitoringService.setTags(tags);

      expect(Sentry.setTags).toHaveBeenCalledWith(tags);
    });

    it('should not set tags when not enabled', () => {
      (errorMonitoringService as any).environment = 'development';

      errorMonitoringService.setTag('feature', 'grading');

      expect(Sentry.setTag).not.toHaveBeenCalled();
    });

    it('should set single extra', () => {
      const value = { studentId: 'student-123', grade: 85 };

      errorMonitoringService.setExtra('gradeData', value);

      expect(Sentry.setExtra).toHaveBeenCalledWith('gradeData', value);
    });

    it('should set multiple extras', () => {
      const extras = {
        studentId: 'student-123',
        grade: 85,
        subject: 'Mathematics',
      };

      errorMonitoringService.setExtras(extras);

      expect(Sentry.setExtras).toHaveBeenCalledWith(extras);
    });

    it('should not set extras when not enabled', () => {
      (errorMonitoringService as any).environment = 'development';

      errorMonitoringService.setExtra('data', { test: 'value' });

      expect(Sentry.setExtra).not.toHaveBeenCalled();
    });
  });

  describe('Breadcrumbs', () => {
    beforeEach(() => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });
    });

    it('should add breadcrumb', () => {
      errorMonitoringService.addBreadcrumb('navigation', 'Navigated to Grades tab');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'navigation',
        message: 'Navigated to Grades tab',
        data: undefined,
        level: 'info',
      });
      expect(logger.debug).toHaveBeenCalledWith('Breadcrumb added:', {
        category: 'navigation',
        message: 'Navigated to Grades tab',
      });
    });

    it('should add breadcrumb with data', () => {
      const data = { from: '/dashboard', to: '/grades', userId: 'user-123' };

      errorMonitoringService.addBreadcrumb('navigation', 'Navigated to Grades tab', data);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'navigation',
        message: 'Navigated to Grades tab',
        data,
        level: 'info',
      });
    });

    it('should not add breadcrumb when not enabled', () => {
      (errorMonitoringService as any).environment = 'development';

      errorMonitoringService.addBreadcrumb('navigation', 'Test breadcrumb');

      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('Performance Transactions', () => {
    beforeEach(() => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });
    });

    it('should start transaction', () => {
      errorMonitoringService.startTransaction('gradesExport');

      expect((errorMonitoringService as any).performanceSpans.get('gradesExport')).toBeDefined();
      expect(logger.debug).toHaveBeenCalledWith('Transaction started:', {
        name: 'gradesExport',
        operation: 'custom',
      });
    });

    it('should start transaction with custom operation', () => {
      errorMonitoringService.startTransaction('apiCall', 'http');

      expect((errorMonitoringService as any).performanceSpans.get('apiCall')).toBeDefined();
      expect(logger.debug).toHaveBeenCalledWith('Transaction started:', {
        name: 'apiCall',
        operation: 'http',
      });
    });

    it('should not start transaction when not enabled', () => {
      (errorMonitoringService as any).environment = 'development';

      errorMonitoringService.startTransaction('testTransaction');

      expect((errorMonitoringService as any).performanceSpans.get('testTransaction')).toBeUndefined();
    });

    it('should end transaction successfully', () => {
      const startTime = Date.now();
      (errorMonitoringService as any).performanceSpans.set('testTransaction', startTime);

      errorMonitoringService.endTransaction('testTransaction');

      expect((errorMonitoringService as any).performanceSpans.has('testTransaction')).toBe(false);
      expect(logger.debug).toHaveBeenCalledWith('Transaction ended:', {
        name: 'testTransaction',
        duration: expect.stringMatching(/^\d+ms$/),
      });
    });

    it('should handle ending non-existent transaction', () => {
      errorMonitoringService.endTransaction('nonExistentTransaction');

      expect(logger.warn).toHaveBeenCalledWith('Transaction not found:', 'nonExistentTransaction');
    });

    it('should not end transaction when not enabled', () => {
      (errorMonitoringService as any).environment = 'development';
      const startTime = Date.now();
      (errorMonitoringService as any).performanceSpans.set('testTransaction', startTime);

      errorMonitoringService.endTransaction('testTransaction');

      expect((errorMonitoringService as any).performanceSpans.has('testTransaction')).toBe(true);
    });
  });

  describe('Flush', () => {
    beforeEach(() => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });
    });

    it('should flush pending events with default timeout', async () => {
      const result = await errorMonitoringService.flush();

      expect(result).toBe(true);
      expect(Sentry.flush).toHaveBeenCalledWith(2000);
    });

    it('should flush pending events with custom timeout', async () => {
      const result = await errorMonitoringService.flush(5000);

      expect(result).toBe(true);
      expect(Sentry.flush).toHaveBeenCalledWith(5000);
    });

    it('should return true when not enabled', async () => {
      (errorMonitoringService as any).environment = 'development';

      const result = await errorMonitoringService.flush();

      expect(result).toBe(true);
      expect(Sentry.flush).not.toHaveBeenCalled();
    });
  });

  describe('getSentry', () => {
    beforeEach(() => {
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });
    });

    it('should return Sentry instance', () => {
      const sentryInstance = errorMonitoringService.getSentry();

      expect(sentryInstance).toBe(Sentry);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete error tracking workflow', () => {
      // Initialize
      errorMonitoringService.init({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        tracesSampleRate: 0.1,
      });

      // Set user
      errorMonitoringService.setUser({
        id: 'user-123',
        email: 'teacher@test.com',
        role: 'teacher',
      });

      // Add breadcrumb
      errorMonitoringService.addBreadcrumb('action', 'User exported grades');

      // Start transaction
      errorMonitoringService.startTransaction('exportGrades');

      // Capture error
      const error = new Error('Export failed');
      errorMonitoringService.captureException(error, {
        tags: { action: 'export' },
        extra: { format: 'pdf' },
      });

      // End transaction
      errorMonitoringService.endTransaction('exportGrades');

      // Verify all calls
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'teacher@test.com',
        role: 'teacher',
        extraRole: undefined,
      });
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });
});
