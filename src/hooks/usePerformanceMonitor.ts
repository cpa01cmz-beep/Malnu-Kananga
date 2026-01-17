import { useEffect, useState, useCallback } from 'react';
import {
  type CoreWebVitals,
  type BudgetEntry,
  type PerformanceAlert,
  type PerformanceReport,
} from '../types/performance.types';
import { getPerformanceMonitor } from '../services/performanceMonitor';
import { logger } from '../utils/logger';

export interface UsePerformanceMonitorReturn {
  metrics: CoreWebVitals;
  alerts: PerformanceAlert[];
  budgetStatus: BudgetEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  generateReport: () => Promise<PerformanceReport>;
  acknowledgeAlert: (alertId: string) => void;
  exportReport: () => Promise<string>;
}

export function usePerformanceMonitor(autoStart = true): UsePerformanceMonitorReturn {
  const [metrics, setMetrics] = useState<CoreWebVitals>({});
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monitor = getPerformanceMonitor();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setMetrics(monitor.getMetrics());
      setAlerts(monitor.getAlerts());
      setBudgetStatus(monitor.getBudgetStatus());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Failed to refresh performance data', err);
    } finally {
      setIsLoading(false);
    }
  }, [monitor]);

  const generateReport = useCallback(async () => {
    return await monitor.generateReport();
  }, [monitor]);

  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      monitor.acknowledgeAlert(alertId);
      setAlerts(monitor.getAlerts());
    },
    [monitor]
  );

  const exportReport = useCallback(async () => {
    return await monitor.exportReport();
  }, [monitor]);

  useEffect(() => {
    if (autoStart) {
      monitor.start();
    }

    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => {
      clearInterval(interval);
      monitor.stop();
    };
  }, [autoStart, monitor, refresh]);

  return {
    metrics,
    alerts,
    budgetStatus,
    isLoading,
    error,
    refresh,
    generateReport,
    acknowledgeAlert,
    exportReport,
  };
}

export function usePerformanceMetric(metricName: keyof CoreWebVitals) {
  const { metrics, isLoading } = usePerformanceMonitor();

  return {
    value: metrics[metricName],
    isLoading,
  };
}

export function usePerformanceBudget(resourceType: string) {
  const { budgetStatus, isLoading } = usePerformanceMonitor();

  return {
    budget: budgetStatus.find((b) => b.resourceType === resourceType),
    isLoading,
  };
}
