// healthMetrics.ts - System health metrics collection and monitoring

import { logger } from './logger';
import { performanceMonitor } from '../services/performanceMonitor';
import { CONVERSION, PERFORMANCE_THRESHOLDS, STORAGE_LIMITS } from '../constants';

// Type declarations for Web API
declare global {
  interface Window {
    performance: Performance;
  }
  interface Performance {
    now: () => number;
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
  interface Navigator {
    connection?: {
      effectiveType: string;
      rtt: number;
      downlink: number;
    };
  }
}

// ============================================
// TYPES
// ============================================

export interface WebSocketHealthMetrics {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  reconnectAttempts: number;
  lastConnected?: string;
  lastDisconnected?: string;
  connectionErrors: number;
  messagesReceived: number;
  messagesSent: number;
  averagePingLatency?: number;
}

export interface PWAHealthMetrics {
  online: boolean;
  lastOnlineStatusChange: string;
  totalOfflineTime: number;
  offlineSince?: string;
  serviceWorkerActive: boolean;
  cacheStatus: {
    cached: number;
    size: string;
    lastUpdate: string;
  };
}

export interface SystemHealthMetrics {
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  webSocket: WebSocketHealthMetrics;
  pwa: PWAHealthMetrics;
  performance: {
    errorRate: number;
    averageResponseTime: number;
    totalRequests: number;
  };
  browser: {
    name: string;
    version: string;
    os: string;
  };
  network: {
    online: boolean;
    effectiveType?: string;
    rtt?: number;
    downlink?: number;
  };
}

export interface HealthAlert {
  type: 'websocket' | 'pwa' | 'performance' | 'memory';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  metrics?: Partial<SystemHealthMetrics>;
}

// ============================================
// SERVICE CLASS
// ============================================

class HealthMetricsService {
  private startTime: number = Date.now();
  private webSocketMetrics: WebSocketHealthMetrics = {
    connected: false,
    connecting: false,
    reconnecting: false,
    reconnectAttempts: 0,
    connectionErrors: 0,
    messagesReceived: 0,
    messagesSent: 0,
  };
  private pwaMetrics: PWAHealthMetrics = {
    online: navigator.onLine,
    lastOnlineStatusChange: new Date().toISOString(),
    totalOfflineTime: 0,
    serviceWorkerActive: false,
    cacheStatus: {
      cached: 0,
      size: '0 KB',
      lastUpdate: new Date().toISOString(),
    },
  };
  private alerts: HealthAlert[] = [];
  private offlineSince: number | null = null;
  private monitoringEnabled: boolean = false;

  /**
   * Initialize health metrics monitoring
   */
  init(): void {
    if (this.monitoringEnabled) {
      logger.warn('Health metrics already initialized');
      return;
    }

    this.monitoringEnabled = import.meta.env.MODE === 'production';
    this.setupNetworkMonitoring();
    this.setupServiceWorkerMonitoring();

    logger.info('Health metrics monitoring initialized', { enabled: this.monitoringEnabled });
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleOnlineStatusChange(false);
    });
  }

  /**
   * Setup service worker monitoring
   */
  private setupServiceWorkerMonitoring(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.pwaMetrics.serviceWorkerActive = true;
        logger.info('Service worker controller changed');
      });

      // Check initial service worker status
      navigator.serviceWorker.getRegistration().then(registration => {
        this.pwaMetrics.serviceWorkerActive = !!registration;
      }).catch(() => {
        logger.debug('No service worker registration found');
      });
    }
  }

  /**
   * Handle online/offline status change
   */
  private handleOnlineStatusChange(online: boolean): void {
    this.pwaMetrics.online = online;
    this.pwaMetrics.lastOnlineStatusChange = new Date().toISOString();

    if (online && this.offlineSince) {
      const offlineDuration = Date.now() - this.offlineSince;
      this.pwaMetrics.totalOfflineTime += offlineDuration;
      this.pwaMetrics.offlineSince = undefined;
      this.offlineSince = null;

      logger.info('Connection restored', { offlineDuration: `${offlineDuration}ms` });
      this.createAlert('pwa', 'info', 'Connection restored');
    } else if (!online) {
      this.pwaMetrics.offlineSince = new Date().toISOString();
      this.offlineSince = Date.now();

      logger.warn('Connection lost');
      this.createAlert('pwa', 'warning', 'Connection lost');
    }
  }

  /**
   * Update WebSocket health metrics
   */
  updateWebSocketMetrics(metrics: Partial<WebSocketHealthMetrics>): void {
    this.webSocketMetrics = { ...this.webSocketMetrics, ...metrics };

    if (metrics.connected === false) {
      this.webSocketMetrics.connectionErrors++;
      this.webSocketMetrics.lastDisconnected = new Date().toISOString();
      this.createAlert('websocket', 'warning', 'WebSocket disconnected');
    } else if (metrics.connected === true) {
      this.webSocketMetrics.lastConnected = new Date().toISOString();
    }

    logger.debug('WebSocket metrics updated', this.webSocketMetrics);
  }

  /**
   * Record WebSocket message
   */
  recordWebSocketMessage(direction: 'sent' | 'received'): void {
    if (direction === 'sent') {
      this.webSocketMetrics.messagesSent++;
    } else {
      this.webSocketMetrics.messagesReceived++;
    }
  }

  /**
   * Record WebSocket ping latency
   */
  recordPingLatency(latency: number): void {
    const currentAvg = this.webSocketMetrics.averagePingLatency || 0;
    const count = this.webSocketMetrics.messagesReceived;
    this.webSocketMetrics.averagePingLatency = ((currentAvg * count) + latency) / (count + 1);
  }

  /**
   * Update PWA cache metrics
   */
  updateCacheMetrics(cached: number, size: string, lastUpdate: string): void {
    this.pwaMetrics.cacheStatus = { cached, size, lastUpdate };
    logger.debug('Cache metrics updated', this.pwaMetrics.cacheStatus);
  }

  /**
   * Get current health metrics
   */
  getHealthMetrics(): SystemHealthMetrics {
    const perfStats = performanceMonitor.getStats();
    const browserInfo = this.getBrowserInfo();
    const networkInfo = this.getNetworkInfo();

    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      memory: this.getMemoryMetrics(),
      webSocket: { ...this.webSocketMetrics },
      pwa: { ...this.pwaMetrics },
      performance: {
        errorRate: performanceMonitor.getErrorRate(),
        averageResponseTime: perfStats.averageResponseTime,
        totalRequests: perfStats.totalRequests,
      },
      browser: browserInfo,
      network: networkInfo,
    };
  }

  /**
   * Get memory metrics
   */
  private getMemoryMetrics() {
    if (typeof window !== 'undefined' && 'memory' in window.performance) {
      const mem = (window.performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (mem) {
        return {
          used: Math.round(mem.usedJSHeapSize / CONVERSION.BYTES_PER_MB), // MB
          total: Math.round(mem.totalJSHeapSize / CONVERSION.BYTES_PER_MB), // MB
          percentage: Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100),
        };
      }
    }
    return { used: 0, total: 0, percentage: 0 };
  }

  /**
   * Get browser info
   */
  private getBrowserInfo() {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (ua.includes('Firefox')) {
      name = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Chrome')) {
      name = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari')) {
      name = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edge')) {
      name = 'Edge';
      version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }

    // Detect OS
    if (ua.includes('Windows')) {
      os = 'Windows';
    } else if (ua.includes('Mac')) {
      os = 'macOS';
    } else if (ua.includes('Linux')) {
      os = 'Linux';
    } else if (ua.includes('Android')) {
      os = 'Android';
    } else if (ua.includes('iOS')) {
      os = 'iOS';
    }

    return { name, version, os };
  }

  /**
   * Get network info
   */
  private getNetworkInfo() {
    const connection = navigator.connection;
    if (connection) {
      return {
        online: navigator.onLine,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        downlink: connection.downlink,
      };
    }
    return { online: navigator.onLine };
  }

  /**
   * Create health alert
   */
  private createAlert(
    type: HealthAlert['type'],
    severity: HealthAlert['severity'],
    message: string,
    metrics?: Partial<SystemHealthMetrics>
  ): void {
    const alert: HealthAlert = {
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
      metrics,
    };

    this.alerts.push(alert);

    // Keep only last N alerts
    if (this.alerts.length > STORAGE_LIMITS.LOG_ENTRIES_MAX) {
      this.alerts.shift();
    }

    logger.warn(`Health alert [${severity}]`, { type, message });
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(count: number = 20): HealthAlert[] {
    return this.alerts.slice(-count);
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: HealthAlert['type']): HealthAlert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: HealthAlert['severity']): HealthAlert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    logger.info('Health alerts cleared');
  }

  /**
   * Check system health status
   */
  checkHealthStatus(): { healthy: boolean; issues: string[] } {
    const metrics = this.getHealthMetrics();
    const issues: string[] = [];

    // Check WebSocket
    if (!metrics.webSocket.connected && metrics.webSocket.reconnectAttempts > 5) {
      issues.push('WebSocket connection failed after multiple reconnection attempts');
    }

    // Check network
    if (!metrics.network.online) {
      issues.push('Network is offline');
    }

    // Check memory
    if (metrics.memory.percentage > PERFORMANCE_THRESHOLDS.MEMORY_WARNING_PERCENT) {
      issues.push(`Memory usage critical: ${metrics.memory.percentage}%`);
    }

    // Check performance
    if (metrics.performance.errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE_ALERT_PERCENT) {
      issues.push(`High error rate: ${metrics.performance.errorRate.toFixed(2)}%`);
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    logger.info('Health metrics monitoring', { enabled });
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.startTime = Date.now();
    this.webSocketMetrics = {
      connected: false,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      connectionErrors: 0,
      messagesReceived: 0,
      messagesSent: 0,
    };
    this.pwaMetrics = {
      online: navigator.onLine,
      lastOnlineStatusChange: new Date().toISOString(),
      totalOfflineTime: 0,
      serviceWorkerActive: this.pwaMetrics.serviceWorkerActive,
      cacheStatus: {
        cached: 0,
        size: '0 KB',
        lastUpdate: new Date().toISOString(),
      },
    };
    this.offlineSince = null;
    this.alerts = [];

    logger.info('Health metrics reset');
  }
}

// ============================================
// EXPORTS
// ============================================

export const healthMetricsService = new HealthMetricsService();
