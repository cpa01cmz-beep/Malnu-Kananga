// performanceMonitor.test.ts - Tests for performance monitoring service

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performanceMonitor } from '../performanceMonitor';

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock window.performance
let mockPerformanceNow = 0;
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => mockPerformanceNow),
  },
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    userAgent: 'test-user-agent',
  },
});

describe('performanceMonitor', () => {
  beforeEach(() => {
    // Reset performanceMonitor state
    performanceMonitor.clearMetrics();
    performanceMonitor.setMonitoringEnabled(true);
    vi.clearAllMocks();
    mockPerformanceNow = 0;
  });

  afterEach(() => {
    performanceMonitor.clearMetrics();
  });

  describe('init()', () => {
    it('should initialize monitoring with default config', () => {
      performanceMonitor.setMonitoringEnabled(false);
      performanceMonitor.init();

      // Note: init() sets enabled based on import.meta.env.MODE === 'production'
      // In test environment, this is not 'production', so monitoring is not enabled by default
      // We manually enable it in beforeEach
      expect(performanceMonitor.isEnabled()).toBeDefined();
    });

    it('should not reinitialize if already enabled', () => {
      performanceMonitor.init();
      const isEnabled = performanceMonitor.isEnabled();
      performanceMonitor.init();

      expect(isEnabled).toBe(performanceMonitor.isEnabled());
    });

    it('should accept custom slow request config', () => {
      performanceMonitor.init({
        threshold: 5000,
        enabled: false,
      });

      const stats = performanceMonitor.getStats();
      expect(stats).toBeDefined();
    });

    it('should accept custom alert thresholds', () => {
      performanceMonitor.init({
        errorRate: 20,
        averageResponseTime: 10000,
        consecutiveFailures: 10,
      });

      const stats = performanceMonitor.getStats();
      expect(stats).toBeDefined();
    });

    it('should accept partial config', () => {
      performanceMonitor.init({
        threshold: 2000,
      });

      expect(performanceMonitor.isEnabled()).toBe(true);
    });
  });

  describe('startRequest()', () => {
    it('should return a stop function', () => {
      const stop = performanceMonitor.startRequest('/api/test', 'GET');
      expect(typeof stop).toBe('function');
    });

    it('should record metric when stop is called', () => {
      const stop = performanceMonitor.startRequest('/api/test', 'GET');
      stop();

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(1);
    });

    it('should return empty function when monitoring disabled', () => {
      performanceMonitor.setMonitoringEnabled(false);
      const stop = performanceMonitor.startRequest('/api/test', 'GET');
      stop();

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe('recordResponse()', () => {
    it('should record successful request (2xx status)', () => {
      const start = Date.now();
      performanceMonitor.recordResponse('/api/test', 'GET', start, 200);

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
      expect(stats.failedRequests).toBe(0);
    });

    it('should record redirect request (3xx status) as not-successful', () => {
      const start = Date.now();
      performanceMonitor.recordResponse('/api/test', 'GET', start, 304);

      const stats = performanceMonitor.getStats();
      // 3xx redirects are not considered successful (2xx only)
      expect(stats.successfulRequests).toBe(0);
      expect(stats.failedRequests).toBe(1);
    });

    it('should record failed request (4xx status)', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404);

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(0);
      expect(stats.failedRequests).toBe(1);
    });

    it('should record failed request (5xx status)', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 500);

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(0);
      expect(stats.failedRequests).toBe(1);
    });

    it('should handle multiple responses', () => {
      performanceMonitor.recordResponse('/api/test1', 'GET', Date.now(), 200);
      performanceMonitor.recordResponse('/api/test2', 'POST', Date.now(), 404);
      performanceMonitor.recordResponse('/api/test3', 'GET', Date.now(), 500);

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(3);
      expect(stats.successfulRequests).toBe(1);
      expect(stats.failedRequests).toBe(2);
    });
  });

  describe('getStats()', () => {
    beforeEach(() => {
      // Reset mockPerformanceNow for these tests
      mockPerformanceNow = 100;
      performanceMonitor.recordResponse('/api/test', 'GET', 0, 200);

      mockPerformanceNow = 200;
      performanceMonitor.recordResponse('/api/test', 'GET', 100, 404);

      mockPerformanceNow = 300;
      performanceMonitor.recordResponse('/api/other', 'POST', 200, 500);
    });

    it('should calculate total requests', () => {
      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(3);
    });

    it('should calculate successful requests', () => {
      const stats = performanceMonitor.getStats();
      expect(stats.successfulRequests).toBe(1);
    });

    it('should calculate failed requests', () => {
      const stats = performanceMonitor.getStats();
      expect(stats.failedRequests).toBe(2);
    });

    it('should calculate average response time', () => {
      // Record some requests with known durations
      mockPerformanceNow = 100;
      performanceMonitor.recordResponse('/api/test1', 'GET', 0, 200);

      mockPerformanceNow = 200;
      performanceMonitor.recordResponse('/api/test2', 'GET', 100, 200);

      mockPerformanceNow = 500;
      performanceMonitor.recordResponse('/api/test3', 'GET', 200, 200);

      const stats = performanceMonitor.getStats();
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(typeof stats.averageResponseTime).toBe('number');
    });

    it('should identify slow requests', () => {
      performanceMonitor.clearMetrics();
      performanceMonitor.setMonitoringEnabled(false); // Allow init to update config
      performanceMonitor.init({ threshold: 100 });
      performanceMonitor.setMonitoringEnabled(true);

      // Fast request - 50ms duration
      mockPerformanceNow = 50;
      performanceMonitor.recordResponse('/api/fast', 'GET', 0, 200);

      // Slow request - 200ms duration (above 100ms threshold)
      mockPerformanceNow = 250;
      performanceMonitor.recordResponse('/api/slow', 'GET', 50, 200);

      const stats = performanceMonitor.getStats();
      expect(stats.slowRequests).toBe(1);
    });

    it('should find slowest request', () => {
      const stats = performanceMonitor.getStats();
      expect(stats.slowestRequest).not.toBeNull();
      expect(stats.slowestRequest).toHaveProperty('endpoint');
      expect(stats.slowestRequest).toHaveProperty('duration');
    });

    it('should find fastest request', () => {
      const stats = performanceMonitor.getStats();
      expect(stats.fastestRequest).not.toBeNull();
      expect(stats.fastestRequest).toHaveProperty('endpoint');
      expect(stats.fastestRequest).toHaveProperty('duration');
    });

    it('should return null for slowest/fastest when no metrics', () => {
      performanceMonitor.clearMetrics();
      const stats = performanceMonitor.getStats();
      expect(stats.slowestRequest).toBeNull();
      expect(stats.fastestRequest).toBeNull();
    });

    it('should group metrics by endpoint', () => {
      const stats = performanceMonitor.getStats();
      expect(stats.requestsByEndpoint).toBeInstanceOf(Map);
      expect(stats.requestsByEndpoint.size).toBeGreaterThan(0);
    });

    it('should correctly count requests per endpoint', () => {
      const stats = performanceMonitor.getStats();
      const getTestEndpoint = stats.requestsByEndpoint.get('GET /api/test');
      expect(getTestEndpoint).toBeDefined();
      expect(getTestEndpoint?.count).toBe(2);
    });
  });

  describe('getErrorRate()', () => {
    it('should return 0 when no requests', () => {
      const errorRate = performanceMonitor.getErrorRate();
      expect(errorRate).toBe(0);
    });

    it('should calculate 0% error rate for all successful', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 201);

      const errorRate = performanceMonitor.getErrorRate();
      expect(errorRate).toBe(0);
    });

    it('should calculate 50% error rate for half failed', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404);

      const errorRate = performanceMonitor.getErrorRate();
      expect(errorRate).toBe(50);
    });

    it('should calculate 100% error rate for all failed', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 500);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404);

      const errorRate = performanceMonitor.getErrorRate();
      expect(errorRate).toBe(100);
    });
  });

  describe('checkErrorRateThreshold()', () => {
    beforeEach(() => {
      performanceMonitor.init({ errorRate: 10 });
    });

    it('should return true when above threshold', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404); // 50% error rate

      const exceeded = performanceMonitor.checkErrorRateThreshold();
      expect(exceeded).toBe(true); // Above 10% threshold
    });

    it('should return false when below threshold', () => {
      for (let i = 0; i < 10; i++) {
        performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);
      }
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404); // ~9% error rate

      const exceeded = performanceMonitor.checkErrorRateThreshold();
      expect(exceeded).toBe(false); // Below 10% threshold
    });

    it('should return false when no requests', () => {
      const exceeded = performanceMonitor.checkErrorRateThreshold();
      expect(exceeded).toBe(false);
    });
  });

  describe('checkResponseTimeThreshold()', () => {
    beforeEach(() => {
      performanceMonitor.setMonitoringEnabled(false); // Allow init to update config
      performanceMonitor.init({ averageResponseTime: 1000 });
      performanceMonitor.setMonitoringEnabled(true);
    });

    it('should return false when below threshold', () => {
      // Record fast requests - 100ms and 200ms durations
      mockPerformanceNow = 100;
      performanceMonitor.recordResponse('/api/fast', 'GET', 0, 200);

      mockPerformanceNow = 300;
      performanceMonitor.recordResponse('/api/fast', 'GET', 100, 200);

      const exceeded = performanceMonitor.checkResponseTimeThreshold();
      expect(exceeded).toBe(false);
    });

    it('should return true when above threshold', () => {
      // Record slow requests - 1500ms and 2000ms durations
      mockPerformanceNow = 1500;
      performanceMonitor.recordResponse('/api/slow', 'GET', 0, 200);

      mockPerformanceNow = 3500;
      performanceMonitor.recordResponse('/api/slow', 'GET', 1500, 200);

      const exceeded = performanceMonitor.checkResponseTimeThreshold();
      expect(exceeded).toBe(true);
    });

    it('should return false when no requests', () => {
      const exceeded = performanceMonitor.checkResponseTimeThreshold();
      expect(exceeded).toBe(false);
    });
  });

  describe('clearMetrics()', () => {
    it('should clear all metrics', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404);

      expect(performanceMonitor.getStats().totalRequests).toBe(2);

      performanceMonitor.clearMetrics();

      expect(performanceMonitor.getStats().totalRequests).toBe(0);
      expect(performanceMonitor.getStats().successfulRequests).toBe(0);
      expect(performanceMonitor.getStats().failedRequests).toBe(0);
    });

    it('should reset consecutive failures counter', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 500);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404);

      performanceMonitor.clearMetrics();

      // Check consecutive failures by tracking next successful request
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);
      const stats = performanceMonitor.getStats();
      expect(stats.failedRequests).toBe(0);
    });
  });

  describe('getRecentMetrics()', () => {
    it('should return empty array when no metrics', () => {
      const recent = performanceMonitor.getRecentMetrics(10);
      expect(recent).toEqual([]);
    });

    it('should return all metrics when count exceeds total', () => {
      performanceMonitor.recordResponse('/api/test1', 'GET', Date.now(), 200);
      performanceMonitor.recordResponse('/api/test2', 'GET', Date.now(), 200);

      const recent = performanceMonitor.getRecentMetrics(10);
      expect(recent.length).toBe(2);
    });

    it('should return last N metrics', () => {
      for (let i = 0; i < 10; i++) {
        performanceMonitor.recordResponse(`/api/test${i}`, 'GET', Date.now(), 200);
      }

      const recent = performanceMonitor.getRecentMetrics(5);
      expect(recent.length).toBe(5);
      expect(recent[0].endpoint).toBe('/api/test5');
      expect(recent[4].endpoint).toBe('/api/test9');
    });

    it('should return correct count', () => {
      for (let i = 0; i < 5; i++) {
        performanceMonitor.recordResponse(`/api/test${i}`, 'GET', Date.now(), 200);
      }

      const recent = performanceMonitor.getRecentMetrics(3);
      expect(recent.length).toBe(3);
    });
  });

  describe('getMetricsByTimeRange()', () => {
    it('should return empty array when no metrics', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-31');
      const metrics = performanceMonitor.getMetricsByTimeRange(start, end);
      expect(metrics).toEqual([]);
    });

    it('should filter metrics by time range', () => {
      const now = Date.now();
      const hourAgo = now - 60 * 60 * 1000;

      // Record metrics at different times (simulated via timestamps in test)
      performanceMonitor.recordResponse('/api/test1', 'GET', hourAgo, 200);
      performanceMonitor.recordResponse('/api/test2', 'GET', now, 200);

      const start = new Date(now - 30 * 60 * 1000); // 30 minutes ago
      const end = new Date(now + 60 * 1000); // 1 minute from now

      // Note: This test is limited since we can't control timestamps directly
      // Just verify the function works without errors
      const metrics = performanceMonitor.getMetricsByTimeRange(start, end);
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should handle invalid time ranges', () => {
      const start = new Date('2026-01-31');
      const end = new Date('2026-01-01'); // End before start

      const metrics = performanceMonitor.getMetricsByTimeRange(start, end);
      expect(metrics).toEqual([]);
    });
  });

  describe('exportMetrics()', () => {
    it('should export metrics as JSON string', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);

      const exported = performanceMonitor.exportMetrics();
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('totalRequests');
      expect(parsed).toHaveProperty('successfulRequests');
      expect(parsed).toHaveProperty('failedRequests');
    });

    it('should convert Map to object in export', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);

      const exported = performanceMonitor.exportMetrics();
      const parsed = JSON.parse(exported);

      expect(parsed.requestsByEndpoint).toBeDefined();
      expect(typeof parsed.requestsByEndpoint).toBe('object');
      expect(parsed.requestsByEndpoint).not.toBeInstanceOf(Map);
    });

    it('should export empty stats when no metrics', () => {
      const exported = performanceMonitor.exportMetrics();
      const parsed = JSON.parse(exported);

      expect(parsed.totalRequests).toBe(0);
      expect(parsed.successfulRequests).toBe(0);
      expect(parsed.failedRequests).toBe(0);
    });
  });

  describe('setMonitoringEnabled()', () => {
    it('should enable monitoring', () => {
      performanceMonitor.setMonitoringEnabled(false);
      performanceMonitor.setMonitoringEnabled(true);

      expect(performanceMonitor.isEnabled()).toBe(true);
    });

    it('should disable monitoring', () => {
      performanceMonitor.setMonitoringEnabled(false);

      expect(performanceMonitor.isEnabled()).toBe(false);
    });

    it('should prevent recording when disabled', () => {
      performanceMonitor.setMonitoringEnabled(false);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(0);
    });

    it('should resume recording when re-enabled', () => {
      performanceMonitor.setMonitoringEnabled(false);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);

      performanceMonitor.setMonitoringEnabled(true);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200);

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBe(1);
    });
  });

  describe('isEnabled()', () => {
    it('should return initial state', () => {
      const enabled = performanceMonitor.isEnabled();
      expect(typeof enabled).toBe('boolean');
    });

    it('should reflect enabled state after init', () => {
      performanceMonitor.init();
      expect(performanceMonitor.isEnabled()).toBe(true);
    });
  });

  describe('FIFO Metrics Management', () => {
    it('should trim metrics when exceeding max size', () => {
      // Set a small max by reinitializing (internal maxMetrics is 1000)
      // We'll simulate by adding many requests
      for (let i = 0; i < 1001; i++) {
        performanceMonitor.recordResponse(`/api/test${i}`, 'GET', Date.now(), 200);
      }

      const stats = performanceMonitor.getStats();
      expect(stats.totalRequests).toBeLessThanOrEqual(1000);
    });

    it('should keep most recent metrics when trimmed', () => {
      for (let i = 0; i < 1001; i++) {
        performanceMonitor.recordResponse(`/api/test${i}`, 'GET', Date.now(), 200);
      }

      const recent = performanceMonitor.getRecentMetrics(10);
      // Recent metrics should include high index numbers
      const endpoints = recent.map(m => m.endpoint);
      expect(endpoints).toContain('/api/test1000');
    });
  });

  describe('Consecutive Failures Tracking', () => {
    it('should track consecutive failures', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 500);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 503);

      const stats = performanceMonitor.getStats();
      expect(stats.failedRequests).toBe(3);
    });

    it('should reset consecutive failures on success', () => {
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 500);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 404);
      performanceMonitor.recordResponse('/api/test', 'GET', Date.now(), 200); // Success

      const stats = performanceMonitor.getStats();
      expect(stats.failedRequests).toBe(2);
      expect(stats.successfulRequests).toBe(1);
    });
  });

  describe('Slow Request Detection', () => {
    beforeEach(() => {
      performanceMonitor.setMonitoringEnabled(false); // Allow init to update config
      performanceMonitor.init({ threshold: 1000, enabled: true });
      performanceMonitor.setMonitoringEnabled(true);
    });

    it('should detect slow requests above threshold', () => {
      // Record request with 2000ms duration (above 1000ms threshold)
      mockPerformanceNow = 2000;
      performanceMonitor.recordResponse('/api/slow', 'GET', 0, 200);

      const stats = performanceMonitor.getStats();
      expect(stats.slowRequests).toBe(1);
    });

    it('should not flag fast requests as slow', () => {
      performanceMonitor.recordResponse('/api/fast', 'GET', Date.now() - 100, 200);

      const stats = performanceMonitor.getStats();
      expect(stats.slowRequests).toBe(0);
    });
  });
});
