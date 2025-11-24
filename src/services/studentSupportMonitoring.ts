// Student Support Monitoring Service
// Provides real-time monitoring and automated interventions

import { StudentSupportService, SupportRequest, StudentProgress } from './studentSupportService';

export interface MonitoringAlert {
  id: string;
  type: 'academic_risk' | 'engagement_drop' | 'support_overload' | 'system_health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  studentId?: string;
  timestamp: string;
  resolved: boolean;
  actions: Array<{
    type: 'notification' | 'intervention' | 'escalation' | 'resource_assignment';
    config: any;
  }>;
}

export interface SystemMetrics {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  pendingRequests: number;
  averageResponseTime: number;
  systemLoad: number;
  resourceUtilization: number;
  uptime: number;
  timestamp: string;
}

class StudentSupportMonitoring {
  private static ALERTS_KEY = 'malnu_monitoring_alerts';
  private static METRICS_KEY = 'malnu_system_metrics';
  private static isMonitoring = false;
  private static monitoringInterval: NodeJS.Timeout | null = null;

  // Start automated monitoring
  static startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🔍 Student Support Monitoring started');

    // Monitor every 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
      this.monitorStudentProgress();
      this.monitorSupportLoad();
      this.checkSystemHealth();
    }, 5 * 60 * 1000);

    // Initial check
    this.performHealthCheck();
  }

  // Stop monitoring
  static stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('⏹️ Student Support Monitoring stopped');
  }

  // Perform comprehensive health check
  private static performHealthCheck(): void {
    const metrics = this.collectSystemMetrics();
    this.saveSystemMetrics(metrics);

    // Check for critical issues
    if (metrics.atRiskStudents > metrics.totalStudents * 0.3) {
      this.createAlert({
        type: 'academic_risk',
        severity: 'high',
        title: 'High Number of At-Risk Students',
        description: `${metrics.atRiskStudents} students (${((metrics.atRiskStudents / metrics.totalStudents) * 100).toFixed(1)}%) are at risk`,
        actions: [
          {
            type: 'escalation',
            config: { escalateTo: 'guidance_counselor', priority: 'high' }
          }
        ]
      });
    }

    if (metrics.pendingRequests > 20) {
      this.createAlert({
        type: 'support_overload',
        severity: 'medium',
        title: 'High Support Request Volume',
        description: `${metrics.pendingRequests} requests pending resolution`,
        actions: [
          {
            type: 'notification',
            config: { message: 'Support team experiencing high volume', target: 'support_team' }
          }
        ]
      });
    }
  }

  // Monitor individual student progress
  private static monitorStudentProgress(): void {
    const allProgress = StudentSupportService.getAllStudentProgress();
    
    Object.values(allProgress).forEach(progress => {
      // Check for sudden grade drops
      if (progress.academicMetrics.gpa < 2.0) {
        this.createAlert({
          type: 'academic_risk',
          severity: 'high',
          title: 'Critical Academic Performance',
          description: `Student ${progress.studentId} has GPA below 2.0`,
          studentId: progress.studentId,
          actions: [
            {
              type: 'intervention',
              config: { 
                type: 'academic_support',
                priority: 'high',
                message: 'Immediate academic intervention required'
              }
            }
          ]
        });
      }

      // Check for engagement drops
      if (progress.engagementMetrics.loginFrequency < 2) {
        this.createAlert({
          type: 'engagement_drop',
          severity: 'medium',
          title: 'Low Student Engagement',
          description: `Student ${progress.studentId} login frequency below threshold`,
          studentId: progress.studentId,
          actions: [
            {
              type: 'notification',
              config: { 
                message: 'We notice you haven\'t been active lately. Is everything okay?',
                target: 'student'
              }
            }
          ]
        });
      }
    });
  }

  // Monitor support system load
  private static monitorSupportLoad(): void {
    const analytics = StudentSupportService.getSupportAnalytics();
    
    // Check response time
    if (analytics.averageResolutionTime > 48) {
      this.createAlert({
        type: 'support_overload',
        severity: 'medium',
        title: 'Slow Response Times',
        description: `Average resolution time is ${analytics.averageResolutionTime.toFixed(1)} hours`,
        actions: [
          {
            type: 'escalation',
            config: { escalateTo: 'support_manager', reason: 'slow_response' }
          }
        ]
      });
    }

    // Check escalation rate
    const escalationRate = analytics.escalatedRequests / analytics.totalRequests;
    if (escalationRate > 0.3) {
      this.createAlert({
        type: 'support_overload',
        severity: 'high',
        title: 'High Escalation Rate',
        description: `${(escalationRate * 100).toFixed(1)}% of requests are being escalated`,
        actions: [
          {
            type: 'intervention',
            config: { 
              type: 'staff_training',
              focus: 'common_issues_resolution'
            }
          }
        ]
      });
    }
  }

  // Check system health
  private static checkSystemHealth(): void {
    const metrics = this.collectSystemMetrics();
    
    // Check system load
    if (metrics.systemLoad > 80) {
      this.createAlert({
        type: 'system_health',
        severity: 'critical',
        title: 'High System Load',
        description: `System load at ${metrics.systemLoad}%`,
        actions: [
          {
            type: 'escalation',
            config: { escalateTo: 'system_administrator', priority: 'critical' }
          }
        ]
      });
    }

    // Check resource utilization
    if (metrics.resourceUtilization > 90) {
      this.createAlert({
        type: 'system_health',
        severity: 'high',
        title: 'High Resource Utilization',
        description: `Resource utilization at ${metrics.resourceUtilization}%`,
        actions: [
          {
            type: 'intervention',
            config: { type: 'resource_optimization' }
          }
        ]
      });
    }
  }

  // Collect system metrics
  private static collectSystemMetrics(): SystemMetrics {
    const allProgress = StudentSupportService.getAllStudentProgress();
    const analytics = StudentSupportService.getSupportAnalytics();
    
    const totalStudents = Object.keys(allProgress).length;
    const activeStudents = Object.values(allProgress).filter(p => 
      p.engagementMetrics.loginFrequency >= 2
    ).length;
    const atRiskStudents = Object.values(allProgress).filter(p => 
      p.riskLevel === 'high'
    ).length;

    return {
      totalStudents,
      activeStudents,
      atRiskStudents,
      pendingRequests: analytics.pendingRequests,
      averageResponseTime: analytics.averageResolutionTime,
      systemLoad: Math.random() * 100, // Simulated - would use actual system metrics
      timestamp: new Date().toISOString(),
      resourceUtilization: Math.random() * 100, // Simulated
      uptime: Date.now() // Simulated uptime
    };
  }

  // Save system metrics
  private static saveSystemMetrics(metrics: SystemMetrics): void {
    const existingMetrics = JSON.parse(localStorage.getItem(this.METRICS_KEY) || '[]');
    existingMetrics.push({
      ...metrics,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 entries
    if (existingMetrics.length > 100) {
      existingMetrics.splice(0, existingMetrics.length - 100);
    }

    localStorage.setItem(this.METRICS_KEY, JSON.stringify(existingMetrics));
  }

  // Create monitoring alert
  private static createAlert(alertData: Omit<MonitoringAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alerts = this.getAlerts();
    
    // Check if similar alert already exists
    const existingAlert = alerts.find(a => 
      a.type === alertData.type && 
      a.studentId === alertData.studentId &&
      !a.resolved
    );

    if (existingAlert) return; // Don't duplicate alerts

    const newAlert: MonitoringAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    alerts.unshift(newAlert);
    this.saveAlerts(alerts);

    // Execute alert actions
    this.executeAlertActions(newAlert);
  }

  // Execute alert actions
  private static executeAlertActions(alert: MonitoringAlert): void {
    console.log(`🚨 ALERT: ${alert.title} - ${alert.description}`);

    alert.actions.forEach(action => {
      switch (action.type) {
        case 'notification':
          console.log(`📧 Notification: ${action.config.message}`);
          break;
        case 'intervention':
          console.log(`🔧 Intervention: ${action.config.type}`);
          break;
        case 'escalation':
          console.log(`⬆️ Escalated to: ${action.config.escalateTo}`);
          break;
        case 'resource_assignment':
          console.log(`📚 Resource assigned`);
          break;
      }
    });
  }

  // Get all alerts
  static getAlerts(): MonitoringAlert[] {
    const alerts = localStorage.getItem(this.ALERTS_KEY);
    return alerts ? JSON.parse(alerts) : [];
  }

  // Save alerts
  private static saveAlerts(alerts: MonitoringAlert[]): void {
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
  }

  // Resolve alert
  static resolveAlert(alertId: string): void {
    const alerts = this.getAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex !== -1) {
      alerts[alertIndex].resolved = true;
      this.saveAlerts(alerts);
    }
  }

  // Get system metrics history
  static getMetricsHistory(): SystemMetrics[] {
    const metrics = localStorage.getItem(this.METRICS_KEY);
    return metrics ? JSON.parse(metrics) : [];
  }

  // Get current system status
  static getCurrentStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: SystemMetrics;
    activeAlerts: number;
    recommendations: string[];
  } {
    const metrics = this.collectSystemMetrics();
    const alerts = this.getAlerts();
    const activeAlerts = alerts.filter(a => !a.resolved);
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    // Determine status
    if (metrics.atRiskStudents > metrics.totalStudents * 0.3 || 
        metrics.systemLoad > 80 ||
        activeAlerts.filter(a => a.severity === 'critical').length > 0) {
      status = 'critical';
    } else if (metrics.atRiskStudents > metrics.totalStudents * 0.2 || 
               metrics.systemLoad > 60 ||
               activeAlerts.filter(a => a.severity === 'high').length > 0) {
      status = 'warning';
    }

    // Generate recommendations
    if (metrics.atRiskStudents > 0) {
      recommendations.push('Increase academic support interventions');
    }
    if (metrics.pendingRequests > 10) {
      recommendations.push('Allocate additional support resources');
    }
    if (metrics.averageResponseTime > 24) {
      recommendations.push('Optimize response procedures');
    }

    return {
      status,
      metrics,
      activeAlerts: activeAlerts.length,
      recommendations
    };
  }

  // Generate monitoring report
  static generateMonitoringReport(timeFrame: 'hourly' | 'daily' | 'weekly'): any {
    const metricsHistory = this.getMetricsHistory();
    const alerts = this.getAlerts();
    const currentStatus = this.getCurrentStatus();

    const now = new Date();
    let startDate: Date;

    switch (timeFrame) {
      case 'hourly':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodMetrics = metricsHistory.filter(m => 
      new Date(m.timestamp) >= startDate
    );

    const periodAlerts = alerts.filter(a => 
      new Date(a.timestamp) >= startDate
    );

    return {
      timeFrame,
      period: startDate.toISOString() + ' to ' + now.toISOString(),
      currentStatus,
      metricsSummary: {
        averageSystemLoad: this.calculateAverage(periodMetrics, 'systemLoad'),
        peakSystemLoad: Math.max(...periodMetrics.map(m => m.systemLoad)),
        averageResponseTime: this.calculateAverage(periodMetrics, 'averageResponseTime'),
        totalAlerts: periodAlerts.length,
        criticalAlerts: periodAlerts.filter(a => a.severity === 'critical').length,
        resolvedAlerts: periodAlerts.filter(a => a.resolved).length
      },
      trends: this.calculateTrends(periodMetrics),
      topAlerts: this.getTopAlerts(periodAlerts),
      recommendations: currentStatus.recommendations
    };
  }

  // Calculate average
  private static calculateAverage(data: any[], field: string): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
    return sum / data.length;
  }

  // Calculate trends
  private static calculateTrends(metrics: SystemMetrics[]): any {
    if (metrics.length < 2) return { systemLoad: 'stable', responseTime: 'stable', atRiskStudents: 'stable' };

    const recent = metrics.slice(-5);
    const previous = metrics.slice(-10, -5);

    return {
      systemLoad: this.calculateTrendDirection(recent, previous, 'systemLoad'),
      responseTime: this.calculateTrendDirection(recent, previous, 'averageResponseTime'),
      atRiskStudents: this.calculateTrendDirection(recent, previous, 'atRiskStudents')
    };
  }

  // Calculate trend direction
  private static calculateTrendDirection(recent: any[], previous: any[], field: string): 'improving' | 'stable' | 'declining' {
    const recentAvg = this.calculateAverage(recent, field);
    const previousAvg = this.calculateAverage(previous, field);

    const change = (recentAvg - previousAvg) / previousAvg;

    if (Math.abs(change) < 0.05) return 'stable';
    return change > 0 ? 'declining' : 'improving';
  }

  // Get top alerts
  private static getTopAlerts(alerts: MonitoringAlert[]): Array<{type: string, count: number}> {
    const alertCounts: Record<string, number> = {};
    
    alerts.forEach(alert => {
      alertCounts[alert.type] = (alertCounts[alert.type] || 0) + 1;
    });

    return Object.entries(alertCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

// Auto-start monitoring when module loads
if (typeof window !== 'undefined') {
  StudentSupportMonitoring.startMonitoring();
}

export { StudentSupportMonitoring };