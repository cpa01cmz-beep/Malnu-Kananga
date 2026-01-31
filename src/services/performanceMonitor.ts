// performanceMonitor.ts - API performance monitoring and metrics

import { logger } from '../utils/logger';

// Type declarations for Web API
declare global {
  interface Performance {
    now: () => number;
  }
}

// ============================================
// TYPES
// ============================================

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  timestamp: string;
  userAgent: string;
}

export interface PerformanceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  slowestRequest: PerformanceMetric | null;
  fastestRequest: PerformanceMetric | null;
  requestsByEndpoint: Map<string, { count: number; totalTime: number; errors: number }>;
}

export interface SlowRequestConfig {
  threshold: number; // milliseconds
  enabled: boolean;
}

export interface AlertThreshold {
  errorRate: number; // percentage
  averageResponseTime: number; // milliseconds
  consecutiveFailures: number;
}

// ============================================
// SERVICE CLASS
// ============================================

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private config: SlowRequestConfig = {
    threshold: 3000, // 3 seconds
    enabled: true,
  };
  private alertThresholds: AlertThreshold = {
    errorRate: 10, // 10% error rate
    averageResponseTime: 5000, // 5 seconds
    consecutiveFailures: 5,
  };
  private consecutiveFailures: number = 0;
  private readonly maxMetrics: number = 1000;
  private monitoringEnabled: boolean = false;

  /**
   * Initialize performance monitoring
   */
  init(config?: Partial<SlowRequestConfig & AlertThreshold>): void {
    if (this.monitoringEnabled) {
      logger.warn('Performance monitoring already initialized');
      return;
    }

    if (config) {
      if (config.threshold !== undefined) this.config.threshold = config.threshold;
      if (config.enabled !== undefined) this.config.enabled = config.enabled;
      if (config.errorRate !== undefined) this.alertThresholds.errorRate = config.errorRate;
      if (config.averageResponseTime !== undefined) {
        this.alertThresholds.averageResponseTime = config.averageResponseTime;
      }
      if (config.consecutiveFailures !== undefined) {
        this.alertThresholds.consecutiveFailures = config.consecutiveFailures;
      }
    }

    this.monitoringEnabled = import.meta.env.MODE === 'production';
    logger.info('Performance monitoring initialized', {
      enabled: this.monitoringEnabled,
      config: this.config,
      thresholds: this.alertThresholds,
    });
  }

  /**
   * Start tracking a request
   */
  startRequest(endpoint: string, method: string): () => void {
    if (!this.monitoringEnabled) {
      return () => {};
    }

    const startTime = typeof window !== 'undefined' && window.performance ? window.performance.now() : Date.now();

    return () => {
      this.endRequest(endpoint, method, startTime);
    };
  }

  /**
   * End tracking a request
   */
  private endRequest(endpoint: string, method: string, startTime: number, status?: number, success?: boolean): void {
    if (!this.monitoringEnabled) return;

    const duration = typeof window !== 'undefined' && window.performance ? window.performance.now() - startTime : Date.now() - startTime;
    const metric: PerformanceMetric = {
      endpoint,
      method,
      duration: Math.round(duration),
      status: status || 0,
      success: success !== undefined ? success : status ? status < 400 : false,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    this.metrics.push(metric);

    // Trim metrics if exceeding max size (FIFO)
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Track consecutive failures
    if (!metric.success) {
      this.consecutiveFailures++;
      this.checkFailureThreshold();
    } else {
      this.consecutiveFailures = 0;
    }

    // Check for slow requests
    if (this.config.enabled && duration > this.config.threshold) {
      logger.warn('Slow request detected', metric);
      this.alertSlowRequest(metric);
    }

    logger.debug('Request tracked', {
      endpoint,
      method,
      duration: `${Math.round(duration)}ms`,
      status: metric.status,
    });
  }

  /**
   * Record API response
   */
  recordResponse(endpoint: string, method: string, startTime: number, status: number): void {
    const success = status >= 200 && status < 300;
    this.endRequest(endpoint, method, startTime, status, success);
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    const totalRequests = this.metrics.length;
    const successfulRequests = this.metrics.filter(m => m.success).length;
    const failedRequests = totalRequests - successfulRequests;

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = totalRequests > 0 ? totalDuration / totalRequests : 0;

    const slowRequests = this.config.enabled
      ? this.metrics.filter(m => m.duration > this.config.threshold).length
      : 0;

    const slowestRequest = this.metrics.length > 0
      ? this.metrics.reduce((slowest, m) => m.duration > slowest.duration ? m : slowest)
      : null;

    const fastestRequest = this.metrics.length > 0
      ? this.metrics.reduce((fastest, m) => m.duration < fastest.duration ? m : fastest)
      : null;

    // Group by endpoint
    const requestsByEndpoint = new Map<string, { count: number; totalTime: number; errors: number }>();
    for (const metric of this.metrics) {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = requestsByEndpoint.get(key);
      if (existing) {
        existing.count++;
        existing.totalTime += metric.duration;
        if (!metric.success) existing.errors++;
      } else {
        requestsByEndpoint.set(key, {
          count: 1,
          totalTime: metric.duration,
          errors: metric.success ? 0 : 1,
        });
      }
    }

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests,
      slowestRequest,
      fastestRequest,
      requestsByEndpoint,
    };
  }

  /**
   * Get error rate percentage
   */
  getErrorRate(): number {
    const stats = this.getStats();
    return stats.totalRequests > 0
      ? (stats.failedRequests / stats.totalRequests) * 100
      : 0;
  }

  /**
   * Check error rate threshold
   */
  checkErrorRateThreshold(): boolean {
    const errorRate = this.getErrorRate();
    if (errorRate > this.alertThresholds.errorRate) {
      logger.error('Error rate threshold exceeded', {
        current: `${errorRate.toFixed(2)}%`,
        threshold: `${this.alertThresholds.errorRate}%`,
      });
      return true;
    }
    return false;
  }

  /**
   * Check average response time threshold
   */
  checkResponseTimeThreshold(): boolean {
    const stats = this.getStats();
    if (stats.averageResponseTime > this.alertThresholds.averageResponseTime) {
      logger.warn('Average response time threshold exceeded', {
        current: `${stats.averageResponseTime}ms`,
        threshold: `${this.alertThresholds.averageResponseTime}ms`,
      });
      return true;
    }
    return false;
  }

  /**
   * Check consecutive failures threshold
   */
  private checkFailureThreshold(): void {
    if (this.consecutiveFailures >= this.alertThresholds.consecutiveFailures) {
      logger.error('Consecutive failures threshold exceeded', {
        count: this.consecutiveFailures,
        threshold: this.alertThresholds.consecutiveFailures,
      });
    }
  }

  /**
   * Alert on slow request
   */
  private alertSlowRequest(metric: PerformanceMetric): void {
    logger.warn('Slow request alert', {
      endpoint: metric.endpoint,
      method: metric.method,
      duration: `${metric.duration}ms`,
      threshold: `${this.config.threshold}ms`,
      status: metric.status,
    });
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
     this.metrics = [];
     this.consecutiveFailures = 0;
     logger.info('Performance metrics cleared');
   }

  /**
   * Cleanup performance monitor - reset all state
   * Call this on logout or when monitoring needs to be reset
   */
  cleanup(): void {
     this.metrics = [];
     this.consecutiveFailures = 0;
     this.monitoringEnabled = false;
     logger.info('Performance monitor cleaned up');
   }

  /**
   * Get recent metrics (last N requests)
   */
  getRecentMetrics(count: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get metrics by time range
   */
  getMetricsByTimeRange(startDate: Date, endDate: Date): PerformanceMetric[] {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return this.metrics.filter(m => {
      const time = new Date(m.timestamp).getTime();
      return time >= start && time <= end;
    });
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(this.getStats(), (key, value) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      return value;
    }, 2);
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    logger.info('Performance monitoring', { enabled });
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.monitoringEnabled;
  }
}

// ============================================
// EXPORTS
// ============================================

export const performanceMonitor = new PerformanceMonitor();
