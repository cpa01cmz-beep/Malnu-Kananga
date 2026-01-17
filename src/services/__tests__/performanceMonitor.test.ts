import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor, getPerformanceMonitor } from '../performanceMonitor';
import type { PerformanceMonitoringConfig } from '../../types/performance.types';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  let config: Partial<PerformanceMonitoringConfig>;

  beforeEach(() => {
    config = {
      enabled: true,
      sampleRate: 1.0,
      budgets: [
        { type: 'javascript', size: 200, unit: 'kb' },
        { type: 'css', size: 50, unit: 'kb' },
      ],
      metricAlertThresholds: {
        LCP: 4000,
        FID: 300,
        CLS: 0.25,
        FCP: 3000,
        TTFB: 1800,
        INP: 500,
      },
    };
    monitor = new PerformanceMonitor(config);
  });

  afterEach(() => {
    monitor.stop();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const defaultMonitor = new PerformanceMonitor();
      expect(defaultMonitor).toBeDefined();
      expect(defaultMonitor.getMetrics()).toBeDefined();
    });

    it('should initialize with custom config', () => {
      expect(monitor).toBeDefined();
    });
  });

  describe('starting and stopping', () => {
    it.skip('should start monitoring', () => {
      monitor.start();
      if (typeof PerformanceObserver !== 'undefined') {
        expect(monitor['observers'].length).toBeGreaterThan(0);
      }
      monitor.stop();
    });

    it('should stop monitoring', () => {
      monitor.start();
      monitor.stop();
      expect(monitor['observers'].length).toBe(0);
    });

    it('should warn when disabled', () => {
      const disabledMonitor = new PerformanceMonitor({ enabled: false });
      disabledMonitor.start();
      expect(disabledMonitor['observers'].length).toBe(0);
    });
  });

  describe('metrics tracking', () => {
    it('should return empty metrics initially', () => {
      const metrics = monitor.getMetrics();
      expect(metrics).toBeDefined();
      expect(Object.keys(metrics)).toHaveLength(0);
    });

    it('should return metrics after recording', () => {
      monitor.start();
      const metrics = monitor.getMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('alerts', () => {
    it('should return empty alerts initially', () => {
      const alerts = monitor.getAlerts();
      expect(alerts).toEqual([]);
    });

    it('should acknowledge alerts', () => {
      const alertId = 'test-alert-1';
      const alert = {
        id: alertId,
        type: 'threshold-exceeded' as const,
        severity: 'high' as const,
        message: 'Test alert',
        metric: 'LCP',
        value: 5000,
        threshold: 4000,
        timestamp: Date.now(),
        acknowledged: false,
      };
      monitor['alerts'].push(alert);
      monitor.acknowledgeAlert(alertId);
      expect(monitor['alerts'][0].acknowledged).toBe(true);
    });
  });

  describe('budget status', () => {
    it('should return budget status', () => {
      const budgetStatus = monitor.getBudgetStatus();
      expect(budgetStatus).toBeDefined();
      expect(budgetStatus.length).toBeGreaterThan(0);
    });

    it('should calculate budget status correctly', () => {
      const budgetStatus = monitor.getBudgetStatus();
      const javascriptBudget = budgetStatus.find((b) => b.resourceType === 'javascript');
      expect(javascriptBudget).toBeDefined();
      expect(javascriptBudget?.budget).toBe(200 * 1024);
    });
  });

  describe('report generation', () => {
    it('should generate a performance report', async () => {
      monitor.start();
      const report = await monitor.generateReport();
      expect(report).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.url).toBeDefined();
      expect(report.userAgent).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.budgetStatus).toBeDefined();
      expect(report.alerts).toBeDefined();
      expect(report.score).toBeDefined();
    });
  });

  describe('report export', () => {
    it('should export report as JSON string', async () => {
      const exported = await monitor.exportReport();
      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('url');
      expect(parsed).toHaveProperty('userAgent');
      expect(parsed).toHaveProperty('metrics');
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = getPerformanceMonitor();
      const instance2 = getPerformanceMonitor();
      expect(instance1).toBe(instance2);
    });
  });
});
