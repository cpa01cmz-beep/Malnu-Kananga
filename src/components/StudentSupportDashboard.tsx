import React, { useState, useEffect } from 'react';
import { StudentSupportMonitoring, MonitoringAlert, SystemMetrics } from '../services/studentSupportMonitoring';
import { StudentSupportService } from '../services/studentSupportService';

interface SupportDashboardProps {
  role?: 'admin' | 'support_staff' | 'teacher';
  studentId?: string;
}

const StudentSupportDashboard: React.FC<SupportDashboardProps> = ({ role = 'support_staff' }) => {
  const [currentStatus, setCurrentStatus] = useState<any>(null);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [report, setReport] = useState<any>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<MonitoringAlert | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30 * 1000);
    return () => clearInterval(interval);
  }, [selectedTimeFrame]);

  const loadDashboardData = async () => {
    try {
      const status = StudentSupportMonitoring.getCurrentStatus();
      const allAlerts = StudentSupportMonitoring.getAlerts();
      const currentMetrics = status.metrics;
      const monitoringReport = StudentSupportMonitoring.generateMonitoringReport(selectedTimeFrame);
      
      // Get AI-powered analytics
      const aiAnalytics = StudentSupportService.getSupportAnalytics();
      const aiReport = StudentSupportService.generateSupportReport(
        selectedTimeFrame === 'hourly' ? 'daily' : 
        selectedTimeFrame === 'daily' ? 'weekly' : 'monthly'
      );

      setCurrentStatus({
        ...status,
        aiAnalytics,
        aiReport
      });
      setAlerts(allAlerts.filter(a => !a.resolved));
      setMetrics(currentMetrics);
      setReport(monitoringReport);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    StudentSupportMonitoring.resolveAlert(alertId);
    loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  if (!currentStatus || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Support Dashboard</h1>
            <p className="text-gray-600">Real-time monitoring and intervention system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(currentStatus.status)}`}>
              Status: {currentStatus.status.toUpperCase()}
            </div>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalStudents}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">At-Risk Students</p>
              <p className="text-2xl font-bold text-red-600">{metrics.atRiskStudents}</p>
              <p className="text-xs text-gray-500">
                {((metrics.atRiskStudents / metrics.totalStudents) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{metrics.pendingRequests}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.averageResponseTime.toFixed(1)}h</p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">System Load</span>
              <span className="text-sm font-medium">{metrics.systemLoad.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  metrics.systemLoad > 80 ? 'bg-red-600' : 
                  metrics.systemLoad > 60 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${metrics.systemLoad}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Resource Utilization</span>
              <span className="text-sm font-medium">{metrics.resourceUtilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  metrics.resourceUtilization > 90 ? 'bg-red-600' : 
                  metrics.resourceUtilization > 70 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${metrics.resourceUtilization}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Active Students</span>
              <span className="text-sm font-medium">{metrics.activeStudents}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(metrics.activeStudents / metrics.totalStudents) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Alerts ({alerts.length})</h2>
          <select
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hourly">Last Hour</option>
            <option value="daily">Last 24 Hours</option>
            <option value="weekly">Last Week</option>
          </select>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">✅</div>
            <p>No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{alert.description}</p>
                    {alert.studentId && (
                      <p className="text-xs text-gray-500 mt-2">Student: {alert.studentId}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowAlertDetails(true);
                      }}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {currentStatus.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-2">
            {currentStatus.recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="text-blue-600">💡</div>
                <div className="text-gray-700">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Details Modal */}
      {showAlertDetails && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedAlert.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAlertDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-700 mb-4">{selectedAlert.description}</p>
            {selectedAlert.studentId && (
              <p className="text-sm text-gray-500 mb-4">Student ID: {selectedAlert.studentId}</p>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
              <div className="space-y-2">
                {selectedAlert.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="text-blue-600">
                      {action.type === 'notification' ? '📧' :
                       action.type === 'intervention' ? '🔧' :
                       action.type === 'escalation' ? '⬆️' : '📚'}
                    </div>
                    <div className="text-gray-700">
                      {action.type}: {JSON.stringify(action.config)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAlertDetails(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleResolveAlert(selectedAlert.id);
                  setShowAlertDetails(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSupportDashboard;