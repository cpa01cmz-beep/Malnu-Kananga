// Enhanced Student Support Dashboard Component
// Dashboard monitoring real-time untuk admin support

import React, { useState, useEffect } from 'react';
import { StudentSupportService } from '../services/studentSupportService';
const studentSupportService = StudentSupportService.getInstance();
import RealTimeMonitoringService from '../services/realTimeMonitoringService';
import AutomatedInterventionEngine from '../services/automatedInterventionEngine';

interface SupportDashboardProps {
  adminId?: string;
}

const SupportDashboard: React.FC<SupportDashboardProps> = ({ adminId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'interventions' | 'analytics'>('overview');
  const [realTimeStats, setRealTimeStats] = useState<any>(null);
  const [interventionStats, setInterventionStats] = useState<any>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [activeInterventions, setActiveInterventions] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    try {
      // Get real-time monitoring stats
      const monitoringService = RealTimeMonitoringService.getInstance();
      setRealTimeStats(monitoringService.getMonitoringStats());

      // Get intervention engine stats
      const interventionEngine = AutomatedInterventionEngine.getInstance();
      setInterventionStats(interventionEngine.getInterventionStats());

      // Get at-risk students
      const allProgress = StudentSupportService.getAllStudentProgress();
      const atRisk = Object.values(allProgress).filter(student => 
        student.riskLevel === 'high' || student.riskLevel === 'medium'
      );
      setAtRiskStudents(atRisk);

      // Get active interventions
      const triggers = monitoringService.getInterventionTriggers();
      const active = triggers.filter(trigger => 
        trigger.status === 'pending' || trigger.status === 'in_progress'
      );
      setActiveInterventions(active);

      // Get system health
      setSystemHealth({
        status: monitoringService.getMonitoringStats().systemHealth,
        uptime: monitoringService.getMonitoringStats().uptime,
        memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Support Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring and intervention system</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'monitoring', label: 'Real-time Monitoring', icon: '🔍' },
              { id: 'interventions', label: 'Interventions', icon: '🤖' },
              { id: 'analytics', label: 'Analytics', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* System Health */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 text-2xl font-bold">
                    {realTimeStats?.activeStudents || 0}
                  </div>
                  <div className="text-blue-800 text-sm">Active Students</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 text-2xl font-bold">
                    {atRiskStudents.length}
                  </div>
                  <div className="text-green-800 text-sm">At-Risk Students</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-orange-600 text-2xl font-bold">
                    {activeInterventions.length}
                  </div>
                  <div className="text-orange-800 text-sm">Active Interventions</div>
                </div>
                <div className={`p-4 rounded-lg ${systemHealth?.status === 'healthy' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-2xl font-bold ${getHealthColor(systemHealth?.status || 'unknown')}`}>
                    {systemHealth?.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                  <div className="text-sm text-gray-800">System Health</div>
                </div>
              </div>

              {/* Recent Interventions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Interventions</h3>
                <div className="space-y-2">
                  {activeInterventions.slice(0, 5).map(intervention => (
                    <div key={intervention.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">Student {intervention.studentId}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getSeverityColor(intervention.severity)}`}>
                          {intervention.triggerType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        {new Date(intervention.timestamp).toLocaleTimeString('id-ID')}
                      </div>
                    </div>
                  ))}
                  {activeInterventions.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No active interventions
                    </div>
                  )}
                </div>
              </div>

              {/* At-Risk Students */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-3">At-Risk Students Requiring Attention</h3>
                <div className="space-y-2">
                  {atRiskStudents.slice(0, 5).map(student => (
                    <div key={student.studentId} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">Student {student.studentId}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getRiskColor(student.riskLevel)}`}>
                          {student.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        GPA: {student.academicMetrics.gpa.toFixed(1)}
                      </div>
                    </div>
                  ))}
                  {atRiskStudents.length === 0 && (
                    <div className="text-center text-green-600 py-4">
                      All students are performing well!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Real-time Monitoring</h2>
              
              {/* Monitoring Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Session Statistics</h3>
                  <div className="space-y-1 text-sm">
                    <div>Active Sessions: {realTimeStats?.activeStudents || 0}</div>
                    <div>Pending Interventions: {realTimeStats?.pendingInterventions || 0}</div>
                    <div>In Progress: {realTimeStats?.inProgressInterventions || 0}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">System Performance</h3>
                  <div className="space-y-1 text-sm">
                    <div>Memory Usage: {systemHealth?.memory || 0} MB</div>
                    <div>Uptime: {Math.floor((systemHealth?.uptime || 0) / 3600)}h</div>
                    <div>Total Interventions: {interventionStats?.totalInterventions || 0}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Effectiveness</h3>
                  <div className="space-y-1 text-sm">
                    <div>Avg Effectiveness: {interventionStats?.averageEffectiveness?.toFixed(1) || 0}%</div>
                    <div>Active Rules: {interventionStats?.activeRules || 0}</div>
                    <div>Last 24h: {interventionStats?.recentActivity?.last24Hours || 0}</div>
                  </div>
                </div>
              </div>

              {/* Live Activity Feed */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Live Activity Feed</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeInterventions.map(intervention => (
                    <div key={intervention.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">Student {intervention.studentId}</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${getSeverityColor(intervention.severity)}`}>
                            {intervention.triggerType.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(intervention.timestamp).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {intervention.actions.length} actions queued
                      </div>
                    </div>
                  ))}
                  {activeInterventions.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interventions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Intervention Management</h2>
              
              {/* Intervention Rules */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Active Intervention Rules</h3>
                <div className="space-y-3">
                  {AutomatedInterventionEngine.getInstance().getRules().map(rule => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs ${getRiskColor(rule.category)}`}>
                              {rule.category}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(rule.priority)}`}>
                              {rule.priority}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => AutomatedInterventionEngine.getInstance().toggleRule(rule.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            rule.isActive 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intervention History */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Intervention Results</h3>
                <div className="space-y-2">
                  {atRiskStudents.slice(0, 3).map(student => {
                    const history = RealTimeMonitoringService.getInstance().getInterventionTriggers(student.studentId);
                    const recentHistory = history.slice(-3);
                    
                    return (
                      <div key={student.studentId} className="border border-gray-200 rounded-lg p-3">
                        <div className="font-medium text-gray-900">Student {student.studentId}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Recent interventions: {recentHistory.length}
                        </div>
                        {recentHistory.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {recentHistory.map(intervention => (
                              <div key={intervention.id} className="text-xs text-gray-500">
                                {new Date(intervention.timestamp).toLocaleString('id-ID')} - {intervention.triggerType}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Analytics & Insights</h2>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Intervention Effectiveness</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Effectiveness</span>
                      <span className="text-sm font-medium">
                        {interventionStats?.averageEffectiveness?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Interventions</span>
                      <span className="text-sm font-medium">
                        {interventionStats?.totalInterventions || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium text-green-600">
                        {Math.min(95, (interventionStats?.averageEffectiveness || 0) + 10).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Risk Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">High Risk</span>
                      <span className="text-sm font-medium text-red-600">
                        {atRiskStudents.filter(s => s.riskLevel === 'high').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Medium Risk</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {atRiskStudents.filter(s => s.riskLevel === 'medium').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Low Risk</span>
                      <span className="text-sm font-medium text-green-600">
                        {Object.values(StudentSupportService.getAllStudentProgress()).filter(s => s.riskLevel === 'low').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">System Recommendations</h3>
                <div className="space-y-2">
                  {interventionStats?.averageEffectiveness < 50 && (
                    <div className="text-sm text-blue-800">
                      • Consider reviewing and optimizing intervention rules for better effectiveness
                    </div>
                  )}
                  {atRiskStudents.filter(s => s.riskLevel === 'high').length > 5 && (
                    <div className="text-sm text-blue-800">
                      • High number of at-risk students detected. Consider proactive outreach programs.
                    </div>
                  )}
                  {realTimeStats?.pendingInterventions > 10 && (
                    <div className="text-sm text-blue-800">
                      • High number of pending interventions. Additional support staff may be needed.
                    </div>
                  )}
                  {systemHealth?.status !== 'healthy' && (
                    <div className="text-sm text-red-800">
                      • System health requires attention. Check resource utilization.
                    </div>
                  )}
                  {interventionStats?.averageEffectiveness > 80 && atRiskStudents.length < 3 && (
                    <div className="text-sm text-green-800">
                      • System is performing optimally! Current interventions are highly effective.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;