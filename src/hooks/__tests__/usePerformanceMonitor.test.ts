import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor, usePerformanceMetric, usePerformanceBudget } from '../usePerformanceMonitor';
import { getPerformanceMonitor } from '../../services/performanceMonitor';

vi.mock('../../services/performanceMonitor', () => ({
  getPerformanceMonitor: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('usePerformanceMonitor', () => {
  const mockMonitor = {
    start: vi.fn(),
    stop: vi.fn(),
    getMetrics: vi.fn(() => ({})),
    getAlerts: vi.fn(() => []),
    getBudgetStatus: vi.fn(() => []),
    generateReport: vi.fn(async () => ({
      timestamp: Date.now(),
      url: 'http://test.com',
      userAgent: 'test',
      metrics: { vitals: {} },
      budgetStatus: [],
      alerts: [],
      score: { performance: 90, accessibility: 0, bestPractices: 0, seo: 0 },
    })),
    acknowledgeAlert: vi.fn(),
    exportReport: vi.fn(async () => '{}'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPerformanceMonitor as any).mockReturnValue(mockMonitor);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePerformanceMonitor(false));
    expect(result.current.metrics).toEqual({});
    expect(result.current.alerts).toEqual([]);
    expect(result.current.budgetStatus).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should start monitoring when autoStart is true', () => {
    renderHook(() => usePerformanceMonitor(true));
    expect(mockMonitor.start).toHaveBeenCalled();
  });

  it('should not start monitoring when autoStart is false', () => {
    renderHook(() => usePerformanceMonitor(false));
    expect(mockMonitor.start).not.toHaveBeenCalled();
  });

  it('should refresh metrics', async () => {
    const { result } = renderHook(() => usePerformanceMonitor(false));
    await act(async () => {
      await result.current.refresh();
    });
    expect(mockMonitor.getMetrics).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle refresh errors', async () => {
    const error = new Error('Test error');
    mockMonitor.getMetrics = vi.fn(() => {
      throw error;
    });
    const { result } = renderHook(() => usePerformanceMonitor(false));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBe('Test error');
  });

  it('should generate report', async () => {
    const { result } = renderHook(() => usePerformanceMonitor(false));
    const report = await result.current.generateReport();
    expect(report).toBeDefined();
    expect(mockMonitor.generateReport).toHaveBeenCalled();
  });

  it('should acknowledge alert', () => {
    const { result } = renderHook(() => usePerformanceMonitor(false));
    const alertId = 'alert-1';
    result.current.acknowledgeAlert(alertId);
    expect(mockMonitor.acknowledgeAlert).toHaveBeenCalledWith(alertId);
  });

  it('should export report', async () => {
    const { result } = renderHook(() => usePerformanceMonitor(false));
    const exported = await result.current.exportReport();
    expect(typeof exported).toBe('string');
    expect(mockMonitor.exportReport).toHaveBeenCalled();
  });
});

describe('usePerformanceMetric', () => {
  const mockMonitor = {
    start: vi.fn(),
    stop: vi.fn(),
    getMetrics: vi.fn(() => ({
      LCP: { name: 'LCP', value: 2500, rating: 'good' as const, timestamp: Date.now(), id: '1' },
    })),
    getAlerts: vi.fn(() => []),
    getBudgetStatus: vi.fn(() => []),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPerformanceMonitor as any).mockReturnValue(mockMonitor);
  });

  it('should return specific metric value', () => {
    const { result } = renderHook(() => usePerformanceMetric('LCP'));
    expect(result.current.value).toBeDefined();
    expect(result.current.value?.name).toBe('LCP');
  });

  it('should return undefined for non-existent metric', () => {
    const { result } = renderHook(() => usePerformanceMetric('CLS' as any));
    expect(result.current.value).toBeUndefined();
  });
});

describe('usePerformanceBudget', () => {
  const mockMonitor = {
    start: vi.fn(),
    stop: vi.fn(),
    getMetrics: vi.fn(() => ({})),
    getAlerts: vi.fn(() => []),
    getBudgetStatus: vi.fn(() => [
      { resourceType: 'javascript', budget: 204800, current: 150000, status: 'within-budget' as const },
    ]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPerformanceMonitor as any).mockReturnValue(mockMonitor);
  });

  it('should return specific budget status', () => {
    const { result } = renderHook(() => usePerformanceBudget('javascript'));
    expect(result.current.budget).toBeDefined();
    expect(result.current.budget?.resourceType).toBe('javascript');
  });

  it('should return undefined for non-existent budget', () => {
    const { result } = renderHook(() => usePerformanceBudget('nonexistent'));
    expect(result.current.budget).toBeUndefined();
  });
});
