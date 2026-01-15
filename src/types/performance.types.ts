export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  id: string;
}

export interface CoreWebVitals {
  LCP?: PerformanceMetric;
  FID?: PerformanceMetric;
  CLS?: PerformanceMetric;
  FCP?: PerformanceMetric;
  TTFB?: PerformanceMetric;
  INP?: PerformanceMetric;
}

export interface PerformanceMetrics {
  vitals: CoreWebVitals;
  resourceTimings: PerformanceResourceTiming[];
  navigationTimings: PerformanceNavigationTiming | null;
  memoryInfo?: PerformanceMemory;
  longTasks: PerformanceEntry[];
  firstPaint?: number;
  firstContentfulPaint?: number;
}

export interface PerformanceBudget {
  type: 'javascript' | 'css' | 'image' | 'font' | 'total';
  size: number;
  unit: 'bytes' | 'kb' | 'mb';
}

export interface BudgetEntry {
  resourceType: string;
  budget: number;
  current: number;
  status: 'within-budget' | 'over-budget' | 'warning';
}

export interface PerformanceAlert {
  id: string;
  type: 'budget-exceeded' | 'metric-regression' | 'slow-load' | 'threshold-exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

export interface PerformanceReport {
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: PerformanceMetrics;
  budgetStatus: BudgetEntry[];
  alerts: PerformanceAlert[];
  score: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

export interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  duration: number;
  interactionId?: number;
}

export interface PerformanceLayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export interface PerformanceMonitoringConfig {
  enabled: boolean;
  sampleRate: number;
  budgetAlertThreshold: number;
  metricAlertThresholds: {
    LCP: number;
    FID: number;
    CLS: number;
    FCP: number;
    TTFB: number;
    INP: number;
  };
  budgets: PerformanceBudget[];
  alertHistoryMaxSize: number;
  reportInterval: number;
}
