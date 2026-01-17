import {
  type PerformanceMetric,
  type CoreWebVitals,
  type PerformanceMetrics,
  type PerformanceBudget,
  type BudgetEntry,
  type PerformanceAlert,
  type PerformanceReport,
  type PerformanceMonitoringConfig,
  type PerformanceMemory,
  type PerformanceEventTiming,
  type PerformanceLayoutShift,
} from '../types/performance.types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

export class PerformanceMonitor {
  private config: PerformanceMonitoringConfig;
  private metrics: CoreWebVitals = {};
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private reportTimer: number | null = null;

  private readonly PERFORMANCE_THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  private readonly DEFAULT_CONFIG: PerformanceMonitoringConfig = {
    enabled: true,
    sampleRate: 1.0,
    budgetAlertThreshold: 1.1,
    metricAlertThresholds: {
      LCP: 4000,
      FID: 300,
      CLS: 0.25,
      FCP: 3000,
      TTFB: 1800,
      INP: 500,
    },
    budgets: [
      { type: 'javascript', size: 200, unit: 'kb' },
      { type: 'css', size: 50, unit: 'kb' },
      { type: 'image', size: 500, unit: 'kb' },
      { type: 'total', size: 1000, unit: 'kb' },
    ],
    alertHistoryMaxSize: 50,
    reportInterval: 60000,
  };

  constructor(config?: Partial<PerformanceMonitoringConfig>) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
    this.loadAlerts();
  }

  start(): void {
    if (!this.config.enabled || typeof PerformanceObserver === 'undefined') {
      logger.warn('Performance monitoring is disabled or not supported');
      return;
    }

    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
    this.observeINP();
    this.observeLongTasks();

    logger.info('Performance monitoring started');
  }

  stop(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
    logger.info('Performance monitoring stopped');
  }

  getMetrics(): CoreWebVitals {
    return { ...this.metrics };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getBudgetStatus(): BudgetEntry[] {
    const resources = this.getResourcesByType();
    const budgets = this.config.budgets;

    return budgets.map((budget) => {
      const currentSize = resources[budget.type] || 0;
      const budgetSize = this.convertToBytes(budget.size, budget.unit);
      const percentage = currentSize / budgetSize;

      let status: BudgetEntry['status'] = 'within-budget';
      if (percentage > this.config.budgetAlertThreshold) {
        status = 'over-budget';
      } else if (percentage > 0.9) {
        status = 'warning';
      }

      return {
        resourceType: budget.type,
        budget: budgetSize,
        current: currentSize,
        status,
      };
    });
  }

  async generateReport(): Promise<PerformanceReport> {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resourceTimings = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const longTasks = performance.getEntriesByType('longtask');

    const metrics: PerformanceMetrics = {
      vitals: this.metrics,
      resourceTimings,
      navigationTimings: navTiming,
      longTasks,
      firstPaint: this.getMetricValue('first-paint'),
      firstContentfulPaint: this.getMetricValue('first-contentful-paint'),
    };

    const memoryInfo = (performance as { memory?: PerformanceMemory }).memory;
    if (memoryInfo) {
      metrics.memoryInfo = memoryInfo;
    }

    const budgetStatus = this.getBudgetStatus();

    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics,
      budgetStatus,
      alerts: this.alerts.filter((a) => !a.acknowledged),
      score: {
        performance: this.calculatePerformanceScore(metrics),
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
      },
    };
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.saveAlerts();
    }
  }

  private observeLCP(): void {
    if (!PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      this.recordMetric('LCP', lastEntry.startTime);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    this.observers.push(observer);
  }

  private observeFID(): void {
    if (!PerformanceObserver.supportedEntryTypes.includes('first-input')) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstInput = entries[0] as PerformanceEventTiming;
      this.recordMetric('FID', firstInput.processingStart - firstInput.startTime);
    });

    observer.observe({ type: 'first-input', buffered: true });
    this.observers.push(observer);
  }

  private observeCLS(): void {
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      return;
    }

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shiftEntry = entry as PerformanceLayoutShift;
        if (!shiftEntry.hadRecentInput) {
          clsValue += shiftEntry.value;
        }
      }
      this.recordMetric('CLS', clsValue);
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    this.observers.push(observer);
  }

  private observeFCP(): void {
    const fcpEntry = this.getMetricValue('first-contentful-paint');
    if (fcpEntry) {
      this.recordMetric('FCP', fcpEntry);
    }
  }

  private observeTTFB(): void {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navTiming) {
      const ttfb = navTiming.responseStart - navTiming.requestStart;
      this.recordMetric('TTFB', ttfb);
    }
  }

  private observeINP(): void {
    if (!PerformanceObserver.supportedEntryTypes.includes('event')) {
      return;
    }

    let inpValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEventTiming;
        if (eventEntry.interactionId) {
          inpValue = Math.max(inpValue, eventEntry.duration);
        }
      }
      this.recordMetric('INP', inpValue);
    });

    observer.observe({ type: 'event', buffered: true });
    this.observers.push(observer);
  }

  private observeLongTasks(): void {
    if (!PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        logger.warn(`Long task detected: ${entry.duration}ms`);
      }
    });

    observer.observe({ type: 'longtask', buffered: true });
    this.observers.push(observer);
  }

  private recordMetric(name: keyof CoreWebVitals, value: number): void {
    const thresholds = this.PERFORMANCE_THRESHOLDS[name];
    if (!thresholds) return;

    let rating: PerformanceMetric['rating'] = 'good';
    if (value >= thresholds.poor) {
      rating = 'poor';
    } else if (value >= thresholds.good) {
      rating = 'needs-improvement';
    }

    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
      id: `${name}-${Date.now()}`,
    };

    this.metrics[name] = metric;
    this.checkMetricThresholds(name, value);

    logger.debug(`Metric recorded: ${name} = ${value}ms (${rating})`);
  }

  private checkMetricThresholds(name: keyof CoreWebVitals, value: number): void {
    const threshold = this.config.metricAlertThresholds[name];
    if (threshold && value > threshold) {
      const alert: PerformanceAlert = {
        id: `metric-${name}-${Date.now()}`,
        type: 'threshold-exceeded',
        severity: value > threshold * 1.5 ? 'critical' : 'high',
        message: `${name} exceeded threshold: ${value.toFixed(2)}ms > ${threshold}ms`,
        metric: name,
        value,
        threshold,
        timestamp: Date.now(),
        acknowledged: false,
      };
      this.addAlert(alert);
    }
  }

  private getResourcesByType(): Record<string, number> {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const result: Record<string, number> = {
      javascript: 0,
      css: 0,
      image: 0,
      font: 0,
      other: 0,
      total: 0,
    };

    for (const resource of resources) {
      const size = resource.transferSize || 0;
      result.total += size;

      if (resource.initiatorType === 'script') {
        result.javascript += size;
      } else if (resource.initiatorType === 'link' && resource.name.endsWith('.css')) {
        result.css += size;
      } else if (resource.initiatorType === 'img') {
        result.image += size;
      } else if (resource.initiatorType === 'link' && resource.name.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
        result.font += size;
      } else {
        result.other += size;
      }
    }

    return result;
  }

  private convertToBytes(size: number, unit: PerformanceBudget['unit']): number {
    const multipliers = {
      bytes: 1,
      kb: 1024,
      mb: 1024 * 1024,
    };
    return size * multipliers[unit];
  }

  private getMetricValue(name: string): number | undefined {
    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      return entries[entries.length - 1].startTime;
    }
    return undefined;
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;
    const weights = { LCP: 0.25, FID: 0.25, CLS: 0.25, FCP: 0.25 };

    for (const [metric, weight] of Object.entries(weights)) {
      const vital = metrics.vitals[metric as keyof CoreWebVitals];
      if (!vital) continue;

      const threshold = this.PERFORMANCE_THRESHOLDS[metric as keyof typeof this.PERFORMANCE_THRESHOLDS];
      if (!threshold) continue;

      if (vital.rating === 'poor') {
        score -= 25 * weight;
      } else if (vital.rating === 'needs-improvement') {
        score -= 12.5 * weight;
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    if (this.alerts.length > this.config.alertHistoryMaxSize) {
      this.alerts = this.alerts.slice(-this.config.alertHistoryMaxSize);
    }
    this.saveAlerts();
    logger.warn(`Performance alert: ${alert.message}`);
  }

  private loadAlerts(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AI_EDITOR_AUDIT_LOG);
      if (stored) {
        this.alerts = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load performance alerts', error);
    }
  }

  private saveAlerts(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_EDITOR_AUDIT_LOG, JSON.stringify(this.alerts));
    } catch (error) {
      logger.error('Failed to save performance alerts', error);
    }
  }

  async exportReport(): Promise<string> {
    const report = await this.generateReport();
    return JSON.stringify(report, null, 2);
  }
}

let performanceMonitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(config?: Partial<PerformanceMonitoringConfig>): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor(config);
  }
  return performanceMonitorInstance;
}
