import React, { useState } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import LoadingSpinner from './ui/LoadingSpinner';
import Card from './ui/Card';
import Button from './ui/Button';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export function PerformanceDashboard() {
  const {
    metrics,
    alerts,
    budgetStatus,
    isLoading,
    error,
    refresh,
    acknowledgeAlert,
    exportReport,
  } = usePerformanceMonitor();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'metrics' | 'budget' | 'alerts'>('overview');
  const [showExport, setShowExport] = useState(false);

  const getMetricRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricRatingBg = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'needs-improvement':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'poor':
        return 'bg-red-100 dark:bg-red-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatMetricValue = (name: string, value: number) => {
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      default:
        return `${Math.round(value)}ms`;
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'within-budget':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'over-budget':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const handleExport = async () => {
    const report = await exportReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  if (isLoading && Object.keys(metrics).length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <p className="font-semibold">Error loading performance data</p>
          <p className="text-sm mt-2">{error}</p>
          <Button onClick={refresh} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor Core Web Vitals and resource usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} variant="outline" size="sm">
            Refresh
          </Button>
          <Button onClick={() => setShowExport(true)} variant="outline" size="sm">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {unacknowledgedAlerts.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {unacknowledgedAlerts.length} Unacknowledged Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unacknowledgedAlerts.map((a) => a.message).join(', ')}
                </p>
              </div>
            </div>
            <Button onClick={() => setSelectedTab('alerts')} variant="outline" size="sm">
              View Alerts
            </Button>
          </div>
        </Card>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {(['overview', 'metrics', 'budget', 'alerts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab}
              {tab === 'alerts' && unacknowledgedAlerts.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {unacknowledgedAlerts.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Largest Contentful Paint"
            value={metrics.LCP}
            description="Time to load the largest content element"
            formatValue={formatMetricValue}
          />
          <MetricCard
            title="First Input Delay"
            value={metrics.FID}
            description="Time from first interaction to response"
            formatValue={formatMetricValue}
          />
          <MetricCard
            title="Cumulative Layout Shift"
            value={metrics.CLS}
            description="Measure of visual stability"
            formatValue={formatMetricValue}
          />
          <MetricCard
            title="First Contentful Paint"
            value={metrics.FCP}
            description="Time to render first content"
            formatValue={formatMetricValue}
          />
          <MetricCard
            title="Time to First Byte"
            value={metrics.TTFB}
            description="Time to receive first byte of data"
            formatValue={formatMetricValue}
          />
          <MetricCard
            title="Interaction to Next Paint"
            value={metrics.INP}
            description="Response time to user interactions"
            formatValue={formatMetricValue}
          />
        </div>
      )}

      {selectedTab === 'metrics' && (
        <div className="space-y-4">
          {Object.entries(metrics).map(([name, metric]) => (
            <Card key={name} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{metric.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Recorded at: {new Date(metric.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getMetricRatingColor(metric.rating)}`}>
                    {formatMetricValue(metric.name, metric.value)}
                  </div>
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getMetricRatingBg(
                      metric.rating
                    )} ${getMetricRatingColor(metric.rating)}`}
                  >
                    {metric.rating}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'budget' && (
        <div className="space-y-4">
          {budgetStatus.map((budget) => (
            <Card key={budget.resourceType} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {budget.resourceType}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {(budget.current / 1024).toFixed(2)} KB / {(budget.budget / 1024).toFixed(2)} KB
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBudgetStatusColor(
                    budget.status
                  )}`}
                >
                  {budget.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    budget.status === 'over-budget'
                      ? 'bg-red-600'
                      : budget.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min((budget.current / budget.budget) * 100, 100)}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <Card className="p-6 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-white font-semibold">No alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Performance is within acceptable thresholds
              </p>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-6 ${alert.acknowledged ? 'opacity-50' : ''} ${
                  alert.severity === 'critical' ? 'border-l-4 border-l-red-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {alert.type.replace('-', ' ')}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : alert.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : alert.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      onClick={() => acknowledgeAlert(alert.id)}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Report</h3>
              <Button onClick={() => setShowExport(false)} variant="ghost" size="sm">
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Export the current performance metrics and alerts as a JSON file.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleExport} className="flex-1">
                Download Report
              </Button>
              <Button onClick={() => setShowExport(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value?: { name: string; value: number; rating: string; timestamp: number };
  description: string;
  formatValue: (name: string, value: number) => string;
}

function MetricCard({ title, value, description, formatValue }: MetricCardProps) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <ChartBarIcon className="h-8 w-8 text-blue-600" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          {value ? (
            <div className="mt-4">
              <div className={`text-3xl font-bold ${getRatingColor(value.rating)}`}>
                {formatValue(value.name, value.value)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{value.rating}</div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-400">--</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Waiting for data...</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
