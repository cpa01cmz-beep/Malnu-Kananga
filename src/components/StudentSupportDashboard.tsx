import React, { useState, useEffect } from 'react';
import { StudentSupportMonitoring, MonitoringAlert, SystemMetrics } from '../services/studentSupportMonitoring';
import { StudentSupportService } from '../services/studentSupportService';
import RealTimeMonitoringService, { StudentMetrics, InterventionTrigger } from '../services/realTimeMonitoringService';

interface SupportDashboardProps {
  role?: 'admin' | 'support_staff' | 'teacher';
  studentId?: string;
}

const StudentSupportDashboard: React.FC<SupportDashboardProps> = ({ role: _role = 'support_staff', studentId: _studentId }) => {
const [currentStatus, setCurrentStatus] = useState<{ status: string; lastUpdated: string; activeUsers: number; aiAnalytics?: any; aiReport?: any; recommendations?: string[]; metrics?: any; activeAlerts?: number } | null>(null);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [_report, setReport] = useState<{ summary: string; details: string[] } | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<MonitoringAlert | null>(null);
  
  // Enhanced real-time monitoring state
  const [monitoringService] = useState(() => RealTimeMonitoringService.getInstance());
  const [realTimeStats, setRealTimeStats] = useState<any>(null);
  const [interventionTriggers, setInterventionTriggers] = useState<InterventionTrigger[]>([]);
  const [studentSessions, setStudentSessions] = useState<StudentMetrics[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30 * 1000);
    return () => clearInterval(interval);
  }, [selectedTimeFrame, autoRefresh]);

  // Enhanced real-time monitoring
  useEffect(() => {
    if (autoRefresh) {
      const refreshInterval = setInterval(() => {
        loadRealTimeData();
      }, 15000); // Refresh every 15 seconds for real-time data
      return () => clearInterval(refreshInterval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      const status = StudentSupportMonitoring.getCurrentStatus();
      const allAlerts = StudentSupportMonitoring.getAlerts();
      const currentMetrics = status.metrics;
      const monitoringReport = StudentSupportMonitoring.generateMonitoringReport(selectedTimeFrame);
      
      // Get AI-powered analytics
      const supportService = StudentSupportService.getInstance();
      const aiAnalytics = supportService.getSupportAnalytics();
      const aiReport = supportService.generateSupportReport(
        selectedTimeFrame === 'hourly' ? 'daily' : 
        selectedTimeFrame === 'daily' ? 'weekly' : 'monthly'
      );

      setCurrentStatus({
        status: status.status,
        lastUpdated: new Date().toISOString(),
        activeUsers: status.metrics?.activeStudents || 0,
        aiAnalytics,
        aiReport,
        recommendations: status.recommendations,
        metrics: status.metrics,
        activeAlerts: status.activeAlerts
      });
      setAlerts(allAlerts.filter(a => !a.resolved));
      setMetrics(currentMetrics);
      setReport(monitoringReport);
      
      // Load enhanced real-time data
      loadRealTimeData();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadRealTimeData = () => {
    try {
      const stats = monitoringService.getMonitoringStats();
      const sessions = Array.from((monitoringService as any).studentSessions.values());
      const triggers = monitoringService.getInterventionTriggers();

      setRealTimeStats(stats);
      setStudentSessions(sessions);
      setInterventionTriggers(triggers);
    } catch (error) {
      console.error('Failed to load real-time data:', error);
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

  const _getTrendIcon = (trend: string) => {
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
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Student Support Dashboard</h1>
            <p className="text-indigo-100">AI-powered real-time monitoring and intervention system</p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-sm text-indigo-200">
                Last Updated: {new Date(currentStatus.lastUpdated).toLocaleTimeString('id-ID')}
              </span>
              {realTimeStats && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  🤖 AI Active
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Auto Refresh</span>
            </label>
            <div className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(currentStatus.status).replace('text-', 'text-white ').replace('bg-', 'bg-white/20 ')}`}>
              Status: {currentStatus.status.toUpperCase()}
            </div>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Active Students</p>
              <p className="text-3xl font-bold text-blue-900">{realTimeStats?.activeStudents || metrics.totalStudents}</p>
              <p className="text-xs text-blue-500">Currently online</p>
            </div>
            <div className="text-4xl text-blue-500">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Pending Interventions</p>
              <p className="text-3xl font-bold text-red-900">{realTimeStats?.pendingInterventions || metrics.atRiskStudents}</p>
              <p className="text-xs text-red-500">Require attention</p>
            </div>
            <div className="text-4xl text-red-500">🚨</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-yellow-900">{realTimeStats?.inProgressInterventions || metrics.pendingRequests}</p>
              <p className="text-xs text-yellow-500">Being handled</p>
            </div>
            <div className="text-4xl text-yellow-500">⏰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Success Rate</p>
              <p className="text-3xl font-bold text-green-900">
                {Math.round(realTimeStats?.aiInsights?.interventionEffectiveness || 0)}%
              </p>
              <p className="text-xs text-green-500">AI effectiveness</p>
            </div>
            <div className="text-4xl text-green-500">✅</div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {realTimeStats?.aiInsights && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            AI Insights & Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Avg Session Duration</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor((realTimeStats.aiInsights.averageSessionDuration || 0) / 60000)}m
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Engagement Score</div>
              <div className="text-2xl font-bold text-gray-900">
                {realTimeStats.aiInsights.engagementScore || 0}/100
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Critical Cases (24h)</div>
              <div className="text-2xl font-bold text-red-600">
                {realTimeStats.aiInsights.riskTrends?.last24h?.critical || 0}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">System Uptime</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor((realTimeStats.uptime || 0) / 3600)}h
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced System Health with Real-time Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          System Performance & Health
        </h2>
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
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-medium">
                {(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  (process.memoryUsage().heapUsed / 1024 / 1024) > 400 ? 'bg-red-600' : 
                  (process.memoryUsage().heapUsed / 1024 / 1024) > 300 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min((process.memoryUsage().heapUsed / 1024 / 1024 / 500) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Active Students</span>
              <span className="text-sm font-medium">{realTimeStats?.activeStudents || metrics.activeStudents}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${((realTimeStats?.activeStudents || metrics.activeStudents) / metrics.totalStudents) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Additional Performance Metrics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Total Interventions</div>
            <div className="text-lg font-bold text-gray-900">{realTimeStats?.totalInterventions || 0}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">System Health</div>
            <div className={`text-lg font-bold ${getStatusColor(realTimeStats?.systemHealth || 'healthy')}`}>
              {(realTimeStats?.systemHealth || 'healthy').toUpperCase()}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Resource Utilization</div>
            <div className="text-lg font-bold text-gray-900">{metrics.resourceUtilization.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600">Avg Response Time</div>
            <div className="text-lg font-bold text-gray-900">{metrics.averageResponseTime.toFixed(1)}h</div>
          </div>
        </div>
      </div>

      {/* Enhanced Active Alerts with Real-time Interventions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🚨</span>
            Active Interventions ({interventionTriggers.length + alerts.length})
          </h2>
          <select
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value as 'hourly' | 'daily' | 'weekly')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hourly">Last Hour</option>
            <option value="daily">Last 24 Hours</option>
            <option value="weekly">Last Week</option>
          </select>
        </div>

        {interventionTriggers.length === 0 && alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">✅</div>
            <p>No active interventions or alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show real-time intervention triggers first */}
            {interventionTriggers.slice(0, 3).map(trigger => (
              <div key={trigger.id} className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(trigger.severity)}`}>
                        {trigger.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        AI DETECTED
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(trigger.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {trigger.triggerType.replace('_', ' ').toUpperCase()} - Student {trigger.studentId}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Automatic intervention triggered by AI monitoring system
                    </p>
                    {trigger.actions.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-gray-700">Actions:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {trigger.actions.map(action => (
                            <span key={action.id} className="px-2 py-1 bg-white text-gray-700 rounded text-xs">
                              {action.type.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAlert({
                          id: trigger.id,
                          title: `${trigger.triggerType} - Student ${trigger.studentId}`,
                          description: `Automatic intervention: ${trigger.severity} severity`,
                          severity: trigger.severity,
                      timestamp: trigger.timestamp,
                      studentId: trigger.studentId,
                      actions: trigger.actions,
                      resolved: false
                        } as any);
                        setShowAlertDetails(true);
                      }}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show traditional alerts */}
            {alerts.slice(0, Math.max(0, 5 - interventionTriggers.length)).map(alert => (
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
      {currentStatus?.recommendations && currentStatus.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-2">
            {currentStatus.recommendations!.map((rec: string, index: number) => (
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