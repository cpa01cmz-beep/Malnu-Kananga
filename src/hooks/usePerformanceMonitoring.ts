import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  cls?: number;
  inp?: number;
  lcp?: number;
  fcp?: number;
  ttfb?: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    Sentry?: { captureMessage: (msg: string, opts?: Record<string, unknown>) => void };
  }
}

export function usePerformanceMonitoring(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const metrics: PerformanceMetrics = {};

    const reportMetric = (metric: Metric): void => {
      const { name, value, rating, delta, id, navigationType } = metric;
      
      (metrics as Record<string, number | undefined>)[name.toLowerCase()] = value;

      if (import.meta.env.DEV) {
        logger.info(`[Web Vitals] ${name}:`, {
          value: Math.round(value * 100) / 100,
          rating,
          delta,
          id,
          navigationType,
        });
      }

      if (import.meta.env.PROD && window.gtag) {
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          value: Math.round(value),
          event_label: id,
          custom_parameter_1: navigationType,
        });
      }

      if (rating === 'poor' && window.Sentry) {
        window.Sentry.captureMessage(
          `Poor ${name}: ${value}`,
          {
            level: 'warning',
            extra: { metric: name, value, rating, id },
          }
        );
      }
    };

    onCLS(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        logger.info('[Performance] All metrics collected:', metrics);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

export default usePerformanceMonitoring;
