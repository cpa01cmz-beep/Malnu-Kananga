/**
 * Tests for logger utility
 * Verifies logging behavior across different levels and environments
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, LogLevel } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    // Reset environment variables for each test
    vi.stubEnv('DEV', true);
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_LOG_LEVEL', 'INFO');
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('LogLevel enum', () => {
    it('should have correct log level values', () => {
      expect(LogLevel.DEBUG).toBe('DEBUG');
      expect(LogLevel.INFO).toBe('INFO');
      expect(LogLevel.WARN).toBe('WARN');
      expect(LogLevel.ERROR).toBe('ERROR');
    });
  });

  describe('debug', () => {
    it('should log debug messages in development when VITE_LOG_LEVEL is DEBUG', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'DEBUG');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.debug('Test debug message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toContain('[DEBUG]');
      expect(loggedMessage).toContain('Test debug message');
    });

    it('should not log debug messages in development when VITE_LOG_LEVEL is INFO', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'INFO');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.debug('Test debug message');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log debug messages in production', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.debug('Test debug message');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should format debug messages with timestamp and level', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'DEBUG');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.debug('Test debug message');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/); // ISO timestamp
      expect(loggedMessage).toContain('[DEBUG]');
    });

    it('should log additional arguments as JSON', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'DEBUG');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      const extraData = { key: 'value', number: 42 };
      logger.debug('Test with args', extraData, 'another arg');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toContain('Test with args');
      expect(loggedMessage).toContain(JSON.stringify(extraData));
    });
  });

  describe('info', () => {
    it('should log info messages in development when VITE_LOG_LEVEL is INFO or DEBUG', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'INFO');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.info('Test info message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toContain('[INFO]');
      expect(loggedMessage).toContain('Test info message');
    });

    it('should log info messages in development when VITE_LOG_LEVEL is DEBUG', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'DEBUG');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.info('Test info message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should not log info messages in development when VITE_LOG_LEVEL is WARN', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'WARN');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.info('Test info message');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log info messages in production', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.info('Test info message');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should format info messages with timestamp and level', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'INFO');
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.info('Test info message');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      expect(loggedMessage).toContain('[INFO]');
    });
  });

  describe('warn', () => {
    it('should log warning messages in development when VITE_LOG_LEVEL is WARN, INFO, or DEBUG', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'WARN');
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      
      logger.warn('Test warning message');
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      const loggedMessage = consoleWarnSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toContain('[WARN]');
      expect(loggedMessage).toContain('Test warning message');
    });

    it('should log warning messages in development when VITE_LOG_LEVEL is INFO', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'INFO');
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      
      logger.warn('Test warning message');
      
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log warning messages in development when VITE_LOG_LEVEL is DEBUG', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'DEBUG');
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      
      logger.warn('Test warning message');
      
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should not log warning messages in development when VITE_LOG_LEVEL is ERROR', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'ERROR');
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      
      logger.warn('Test warning message');
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should send warnings to error monitoring in production', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      
      const mockErrorMonitoring = {
        isEnabled: () => true,
        captureMessage: vi.fn()
      };
      
      logger.setErrorMonitoringService(mockErrorMonitoring);
      
      logger.warn('Test warning message', { extra: 'data' });
      
      expect(mockErrorMonitoring.captureMessage).toHaveBeenCalledWith(
        'Test warning message',
        'warning',
        { extra: { args: [{ extra: 'data' }] } }
      );
    });

    it('should not send warnings to error monitoring if not enabled', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      
      const mockErrorMonitoring = {
        isEnabled: () => false,
        captureMessage: vi.fn()
      };
      
      logger.setErrorMonitoringService(mockErrorMonitoring);
      
      logger.warn('Test warning message');
      
      expect(mockErrorMonitoring.captureMessage).not.toHaveBeenCalled();
    });

    it('should format warning messages with timestamp and level', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'WARN');
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      
      logger.warn('Test warning message');
      
      const loggedMessage = consoleWarnSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      expect(loggedMessage).toContain('[WARN]');
    });
  });

  describe('error', () => {
    it('should log error messages in development', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      logger.error('Test error message');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toContain('[ERROR]');
      expect(loggedMessage).toContain('Test error message');
    });

    it('should log error messages regardless of VITE_LOG_LEVEL in development', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'ERROR');
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      logger.error('Test error message');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should send errors to error monitoring in production', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      
      const testError = new Error('Test error');
      const mockErrorMonitoring = {
        isEnabled: () => true,
        captureException: vi.fn()
      };
      
      logger.setErrorMonitoringService(mockErrorMonitoring);
      
      logger.error('Error occurred', testError);
      
      expect(mockErrorMonitoring.captureException).toHaveBeenCalledWith(
        testError,
        { extra: { message: 'Error occurred', args: [testError] } },
        'error'
      );
    });

    it('should create error from message if first arg is not Error', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      
      const mockErrorMonitoring = {
        isEnabled: () => true,
        captureException: vi.fn()
      };
      
      logger.setErrorMonitoringService(mockErrorMonitoring);
      
      logger.error('Error message without Error object');
      
      expect(mockErrorMonitoring.captureException).toHaveBeenCalled();
      const capturedError = mockErrorMonitoring.captureException.mock.calls[0][0];
      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError.message).toBe('Error message without Error object');
    });

    it('should not send errors to error monitoring if not enabled', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      
      const mockErrorMonitoring = {
        isEnabled: () => false,
        captureException: vi.fn()
      };
      
      logger.setErrorMonitoringService(mockErrorMonitoring);
      
      logger.error('Test error message');
      
      expect(mockErrorMonitoring.captureException).not.toHaveBeenCalled();
    });

    it('should format error messages with timestamp and level', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      logger.error('Test error message');
      
      const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      expect(loggedMessage).toContain('[ERROR]');
    });
  });

  describe('log (custom level)', () => {
    it('should call debug method for DEBUG level', () => {
      const debugSpy = vi.spyOn(logger, 'debug');
      
      logger.log(LogLevel.DEBUG, 'Test message');
      
      expect(debugSpy).toHaveBeenCalledWith('Test message');
    });

    it('should call info method for INFO level', () => {
      const infoSpy = vi.spyOn(logger, 'info');
      
      logger.log(LogLevel.INFO, 'Test message');
      
      expect(infoSpy).toHaveBeenCalledWith('Test message');
    });

    it('should call warn method for WARN level', () => {
      const warnSpy = vi.spyOn(logger, 'warn');
      
      logger.log(LogLevel.WARN, 'Test message');
      
      expect(warnSpy).toHaveBeenCalledWith('Test message');
    });

    it('should call error method for ERROR level', () => {
      const errorSpy = vi.spyOn(logger, 'error');
      
      logger.log(LogLevel.ERROR, 'Test message');
      
      expect(errorSpy).toHaveBeenCalledWith('Test message');
    });

    it('should pass additional arguments to the appropriate method', () => {
      const debugSpy = vi.spyOn(logger, 'debug');
      const extraData = { key: 'value' };
      
      logger.log(LogLevel.DEBUG, 'Test message', extraData);
      
      expect(debugSpy).toHaveBeenCalledWith('Test message', extraData);
    });
  });

  describe('setErrorMonitoringService', () => {
    it('should set error monitoring service', () => {
      const mockService = {
        isEnabled: () => true,
        captureException: vi.fn(),
        captureMessage: vi.fn()
      };
      
      logger.setErrorMonitoringService(mockService);
      
      // Verify service is set by calling warn in production
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      
      logger.warn('Test warning');
      
      expect(mockService.captureMessage).toHaveBeenCalled();
    });

    it('should allow setting service with only isEnabled method', () => {
      const mockService = {
        isEnabled: () => false
      };
      
      expect(() => {
        logger.setErrorMonitoringService(mockService);
      }).not.toThrow();
    });

    it('should allow updating error monitoring service', () => {
      const mockService1 = {
        isEnabled: () => false,
        captureMessage: vi.fn()
      };
      
      const mockService2 = {
        isEnabled: () => true,
        captureMessage: vi.fn()
      };
      
      logger.setErrorMonitoringService(mockService1);
      logger.setErrorMonitoringService(mockService2);
      
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      
      logger.warn('Test warning');
      
      expect(mockService1.captureMessage).not.toHaveBeenCalled();
      expect(mockService2.captureMessage).toHaveBeenCalled();
    });
  });

  describe('environment handling', () => {
    it('should detect development mode correctly', () => {
      vi.stubEnv('DEV', true);
      vi.stubEnv('MODE', 'development');
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      vi.stubEnv('VITE_LOG_LEVEL', 'INFO');
      
      logger.info('Development test');
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle missing VITE_LOG_LEVEL gracefully', () => {
      vi.stubEnv('VITE_LOG_LEVEL', undefined);
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.info('Test without log level');
      
      // Should default to INFO level
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should not log in production environment for info/debug', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('MODE', 'production');
      
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      logger.info('Production info');
      logger.debug('Production debug');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should still log errors in development environment', () => {
      vi.stubEnv('DEV', true);
      vi.stubEnv('MODE', 'development');
      
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      logger.error('Development error');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
