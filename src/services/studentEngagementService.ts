// Student Engagement Monitoring System for MA Malnu Kananga
// Real-time tracking and analysis of student engagement patterns

export interface EngagementMetrics {
  loginFrequency: number;
  resourceAccess: number;
  timeSpent: number; // in minutes
  featureUsage: Record<string, number>;
  interactionQuality: number; // 1-10 scale
  participationScore: number; // 1-100 scale
  consistencyIndex: number; // 0-1 scale
  lastActiveDate: string;
  streakDays: number;
}

export interface EngagementEvent {
  id: string;
  studentId: string;
  eventType: 'login' | 'logout' | 'resource_access' | 'assessment_start' | 'assessment_complete' | 'material_view' | 'discussion_participate' | 'assignment_submit';
  timestamp: string;
  duration?: number; // in seconds
  metadata: {
    subject?: string;
    resourceType?: string;
    resourceId?: string;
    difficulty?: string;
    score?: number;
    interactionType?: string;
  };
  sessionId: string;
}

export interface EngagementAlert {
  id: string;
  studentId: string;
  type: 'low_engagement' | 'declining_performance' | 'absence_pattern' | 'intervention_needed' | 'positive_milestone';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  isResolved: boolean;
  recommendedActions: string[];
  metrics: {
    current: number;
    threshold: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

export interface EngagementReport {
  studentId: string;
  studentName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  overallScore: number; // 1-100
  metrics: EngagementMetrics;
  trends: {
    weekly: Array<{
      week: number;
      score: number;
      timeSpent: number;
      activities: number;
    }>;
    subjects: Record<string, {
      engagement: number;
      performance: number;
      improvement: number;
    }>;
  };
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  alerts: EngagementAlert[];
  comparison: {
    classAverage: number;
    percentile: number;
    rank: number;
    totalStudents: number;
  };
}

export interface ClassEngagementOverview {
  classId: string;
  className: string;
  totalStudents: number;
  activeStudents: number;
  averageEngagement: number;
  averageTimeSpent: number;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    score: number;
  }>;
  atRiskStudents: Array<{
    studentId: string;
    studentName: string;
    riskLevel: 'low' | 'medium' | 'high';
    lastActive: string;
  }>;
  subjectBreakdown: Record<string, {
    averageEngagement: number;
    totalActivities: number;
  }>;
  weeklyTrends: Array<{
    week: number;
    engagement: number;
    participation: number;
  }>;
}

class StudentEngagementService {
  private static instance: StudentEngagementService;
  private EVENTS_KEY = 'malnu_engagement_events';
  private ALERTS_KEY = 'malnu_engagement_alerts';
  private REPORTS_KEY = 'malnu_engagement_reports';
  private SESSIONS_KEY = 'malnu_active_sessions';

  private constructor() {}

  static getInstance(): StudentEngagementService {
    if (!StudentEngagementService.instance) {
      StudentEngagementService.instance = new StudentEngagementService();
    }
    return StudentEngagementService.instance;
  }

  // Initialize engagement monitoring
  initialize(): void {
    this.setupDefaultAlerts();
    this.startSessionTracking();
    console.log('📊 Student Engagement Service initialized successfully');
  }

  // Track student login
  trackLogin(studentId: string, studentName: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event: EngagementEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      eventType: 'login',
      timestamp: new Date().toISOString(),
      metadata: {},
      sessionId
    };

    this.saveEvent(event);
    this.updateActiveSession(studentId, sessionId, studentName);
    this.checkEngagementThresholds(studentId);
    
    return sessionId;
  }

  // Track student logout
  trackLogout(studentId: string, sessionId: string): void {
    const event: EngagementEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      eventType: 'logout',
      timestamp: new Date().toISOString(),
      metadata: {},
      sessionId
    };

    this.saveEvent(event);
    this.removeActiveSession(studentId);
    this.updateEngagementMetrics(studentId);
  }

  // Track resource access
  trackResourceAccess(studentId: string, resourceType: string, resourceId: string, subject?: string): void {
    const event: EngagementEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      eventType: 'resource_access',
      timestamp: new Date().toISOString(),
      metadata: {
        resourceType,
        resourceId,
        subject
      },
      sessionId: this.getCurrentSession(studentId) || ''
    };

    this.saveEvent(event);
    this.updateEngagementMetrics(studentId);
  }

  // Track assessment activity
  trackAssessmentActivity(studentId: string, assessmentType: 'start' | 'complete', assessmentId: string, score?: number, subject?: string): void {
    const event: EngagementEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      eventType: assessmentType === 'start' ? 'assessment_start' : 'assessment_complete',
      timestamp: new Date().toISOString(),
      metadata: {
        resourceId: assessmentId,
        resourceType: 'assessment',
        subject,
        score
      },
      sessionId: this.getCurrentSession(studentId) || ''
    };

    this.saveEvent(event);
    
    if (assessmentType === 'complete' && score) {
      this.analyzePerformanceTrend(studentId, score, subject);
    }
    
    this.updateEngagementMetrics(studentId);
  }

  // Track material viewing
  trackMaterialView(studentId: string, materialId: string, duration: number, subject?: string): void {
    const event: EngagementEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      eventType: 'material_view',
      timestamp: new Date().toISOString(),
      duration,
      metadata: {
        resourceId: materialId,
        resourceType: 'material',
        subject
      },
      sessionId: this.getCurrentSession(studentId) || ''
    };

    this.saveEvent(event);
    this.updateEngagementMetrics(studentId);
  }

  // Track discussion participation
  trackDiscussionParticipation(studentId: string, interactionType: string, discussionId: string): void {
    const event: EngagementEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      eventType: 'discussion_participate',
      timestamp: new Date().toISOString(),
      metadata: {
        resourceId: discussionId,
        resourceType: 'discussion',
        interactionType
      },
      sessionId: this.getCurrentSession(studentId) || ''
    };

    this.saveEvent(event);
    this.updateEngagementMetrics(studentId);
  }

  // Get engagement metrics for student
  getEngagementMetrics(studentId: string, period: 'week' | 'month' | 'semester' = 'month'): EngagementMetrics {
    const events = this.getStudentEvents(studentId, period);
    const now = new Date();
    
    // Calculate login frequency
    const loginEvents = events.filter(e => e.eventType === 'login');
    const loginFrequency = loginEvents.length;

    // Calculate resource access
    const resourceEvents = events.filter(e => e.eventType === 'resource_access' || e.eventType === 'material_view');
    const resourceAccess = resourceEvents.length;

    // Calculate time spent
    const timeSpent = events.reduce((total, event) => total + (event.duration || 0), 0) / 60; // convert to minutes

    // Calculate feature usage
    const featureUsage: Record<string, number> = {};
    events.forEach(event => {
      const feature = event.metadata.resourceType || event.eventType;
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    // Calculate interaction quality (based on assessment scores and participation)
    const assessmentEvents = events.filter(e => e.eventType === 'assessment_complete' && e.metadata.score);
    const avgScore = assessmentEvents.length > 0 
      ? assessmentEvents.reduce((sum, e) => sum + (e.metadata.score || 0), 0) / assessmentEvents.length 
      : 0;
    const interactionQuality = Math.min(10, (avgScore / 10) + (events.filter(e => e.eventType === 'discussion_participate').length * 0.5));

    // Calculate participation score
    const totalActivities = events.length;
    const participationScore = Math.min(100, (totalActivities / 30) * 100); // Assuming 30 activities is 100%

    // Calculate consistency index
    const activeDays = new Set(events.map(e => e.timestamp.split('T')[0])).size;
    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 120;
    const consistencyIndex = activeDays / periodDays;

    // Calculate streak days
    const streakDays = this.calculateStreakDays(studentId);

    return {
      loginFrequency,
      resourceAccess,
      timeSpent,
      featureUsage,
      interactionQuality,
      participationScore,
      consistencyIndex,
      lastActiveDate: events.length > 0 ? events[events.length - 1].timestamp : '',
      streakDays
    };
  }

  // Generate engagement report
  generateEngagementReport(studentId: string, studentName: string, period: 'week' | 'month' | 'semester' = 'month'): EngagementReport {
    const metrics = this.getEngagementMetrics(studentId, period);
    const events = this.getStudentEvents(studentId, period);
    const alerts = this.getStudentAlerts(studentId);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(metrics);

    // Generate trends
    const trends = this.generateTrends(studentId, period);

    // Identify strengths and concerns
    const strengths = this.identifyStrengths(metrics);
    const concerns = this.identifyConcerns(metrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, concerns);

    // Get class comparison
    const comparison = this.getClassComparison(studentId, overallScore);

    return {
      studentId,
      studentName,
      period: {
        startDate: this.getPeriodStartDate(period),
        endDate: new Date().toISOString()
      },
      overallScore,
      metrics,
      trends,
      strengths,
      concerns,
      recommendations,
      alerts,
      comparison
    };
  }

  // Get class engagement overview
  getClassEngagementOverview(classId: string, className: string): ClassEngagementOverview {
    // This would typically query a database of all students in the class
    // For demo purposes, we'll use mock data
    const mockStudents = [
      { id: 'STU001', name: 'Ahmad Fauzi Rahman' },
      { id: 'STU002', name: 'Siti Aminah' },
      { id: 'STU003', name: 'Budi Santoso' },
      { id: 'STU004', name: 'Dewi Lestari' },
      { id: 'STU005', name: 'Eko Prasetyo' }
    ];

    const studentReports = mockStudents.map(student => ({
      ...student,
      metrics: this.getEngagementMetrics(student.id, 'month'),
      overallScore: this.calculateOverallScore(this.getEngagementMetrics(student.id, 'month'))
    }));

    const totalStudents = studentReports.length;
    const activeStudents = studentReports.filter(s => s.metrics.lastActiveDate !== '').length;
    const averageEngagement = studentReports.reduce((sum, s) => sum + s.overallScore, 0) / totalStudents;
    const averageTimeSpent = studentReports.reduce((sum, s) => sum + s.metrics.timeSpent, 0) / totalStudents;

    const topPerformers = studentReports
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 3)
      .map(s => ({
        studentId: s.id,
        studentName: s.name,
        score: s.overallScore
      }));

    const atRiskStudents = studentReports
      .filter(s => s.overallScore < 60)
      .sort((a, b) => a.overallScore - b.overallScore)
      .map(s => ({
        studentId: s.id,
        studentName: s.name,
        riskLevel: s.overallScore < 40 ? 'high' : s.overallScore < 50 ? 'medium' : 'low' as 'low' | 'medium' | 'high',
        lastActive: s.metrics.lastActiveDate
      }));

    const subjectBreakdown = {
      'Matematika': { averageEngagement: 75, totalActivities: 120 },
      'Fisika': { averageEngagement: 68, totalActivities: 95 },
      'Kimia': { averageEngagement: 72, totalActivities: 110 },
      'Biologi': { averageEngagement: 80, totalActivities: 130 }
    };

    const weeklyTrends = [
      { week: 1, engagement: 65, participation: 70 },
      { week: 2, engagement: 68, participation: 72 },
      { week: 3, engagement: 72, participation: 75 },
      { week: 4, engagement: 70, participation: 73 }
    ];

    return {
      classId,
      className,
      totalStudents,
      activeStudents,
      averageEngagement,
      averageTimeSpent,
      topPerformers,
      atRiskStudents,
      subjectBreakdown,
      weeklyTrends
    };
  }

  // Check engagement thresholds and create alerts
  private checkEngagementThresholds(studentId: string): void {
    const metrics = this.getEngagementMetrics(studentId, 'week');
    const alerts = this.getStudentAlerts(studentId);

    // Check for low engagement
    if (metrics.participationScore < 30 && metrics.consistencyIndex < 0.3) {
      this.createAlert(studentId, 'low_engagement', 'high', 
        'Student engagement is significantly below expected levels');
    }

    // Check for absence pattern
    if (metrics.streakDays === 0 && metrics.loginFrequency < 2) {
      this.createAlert(studentId, 'absence_pattern', 'medium',
        'Student has not been active for several days');
    }

    // Check for positive milestones
    if (metrics.participationScore > 80 && metrics.consistencyIndex > 0.8) {
      this.createAlert(studentId, 'positive_milestone', 'low',
        'Student shows excellent engagement and consistency');
    }
  }

  // Create engagement alert
  private createAlert(studentId: string, type: EngagementAlert['type'], severity: EngagementAlert['severity'], message: string): void {
    const alert: EngagementAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
      isResolved: false,
      recommendedActions: this.getRecommendedActions(type),
      metrics: {
        current: 0,
        threshold: 0,
        trend: 'stable'
      }
    };

    const alerts = this.getAllAlerts();
    alerts.push(alert);
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
  }

  // Get recommended actions for alert type
  private getRecommendedActions(type: EngagementAlert['type']): string[] {
    const actionMap: Record<EngagementAlert['type'], string[]> = {
      'low_engagement': [
        'Schedule one-on-one counseling session',
        'Identify potential barriers to engagement',
        'Provide additional learning resources',
        'Contact parents/guardians if needed'
      ],
      'declining_performance': [
        'Review recent assessment results',
        'Provide targeted remedial support',
        'Adjust learning approach if needed',
        'Monitor progress closely'
      ],
      'absence_pattern': [
        'Contact student immediately',
        'Check for personal or technical issues',
        'Inform parents/guardians',
        'Document intervention steps'
      ],
      'intervention_needed': [
        'Develop personalized intervention plan',
        'Coordinate with support services',
        'Schedule regular check-ins',
        'Consider alternative learning methods'
      ],
      'positive_milestone': [
        'Acknowledge and celebrate achievement',
        'Consider peer mentoring opportunities',
        'Provide enrichment activities',
        'Share success with parents/guardians'
      ]
    };

    return actionMap[type] || [];
  }

  // Calculate overall engagement score
  private calculateOverallScore(metrics: EngagementMetrics): number {
    const weights = {
      participationScore: 0.3,
      consistencyIndex: 0.25,
      interactionQuality: 0.2,
      timeSpent: 0.15,
      resourceAccess: 0.1
    };

    const normalizedMetrics = {
      participationScore: metrics.participationScore,
      consistencyIndex: metrics.consistencyIndex * 100,
      interactionQuality: metrics.interactionQuality * 10,
      timeSpent: Math.min(100, (metrics.timeSpent / 300) * 100), // 5 hours = 100%
      resourceAccess: Math.min(100, (metrics.resourceAccess / 50) * 100) // 50 resources = 100%
    };

    return Math.round(
      weights.participationScore * normalizedMetrics.participationScore +
      weights.consistencyIndex * normalizedMetrics.consistencyIndex +
      weights.interactionQuality * normalizedMetrics.interactionQuality +
      weights.timeSpent * normalizedMetrics.timeSpent +
      weights.resourceAccess * normalizedMetrics.resourceAccess
    );
  }

  // Generate trends for report
  private generateTrends(studentId: string, period: 'week' | 'month' | 'semester'): EngagementReport['trends'] {
    // Mock trend data - in real implementation, this would analyze historical data
    const weeks = period === 'week' ? 1 : period === 'month' ? 4 : 16;
    
    const weekly = Array.from({ length: Math.min(weeks, 4) }, (_, i) => ({
      week: i + 1,
      score: 65 + Math.random() * 20,
      timeSpent: 120 + Math.random() * 180,
      activities: 15 + Math.floor(Math.random() * 25)
    }));

    const subjects = {
      'Matematika': { engagement: 70 + Math.random() * 20, performance: 75 + Math.random() * 15, improvement: Math.random() * 10 - 5 },
      'Fisika': { engagement: 65 + Math.random() * 25, performance: 70 + Math.random() * 20, improvement: Math.random() * 10 - 5 },
      'Kimia': { engagement: 72 + Math.random() * 18, performance: 78 + Math.random() * 12, improvement: Math.random() * 10 - 5 },
      'Biologi': { engagement: 75 + Math.random() * 15, performance: 80 + Math.random() * 10, improvement: Math.random() * 10 - 5 }
    };

    return { weekly, subjects };
  }

  // Identify strengths
  private identifyStrengths(metrics: EngagementMetrics): string[] {
    const strengths: string[] = [];

    if (metrics.consistencyIndex > 0.8) {
      strengths.push('Excellent consistency in learning activities');
    }

    if (metrics.interactionQuality > 8) {
      strengths.push('High quality interactions and participation');
    }

    if (metrics.timeSpent > 300) {
      strengths.push('Dedicated time investment in learning');
    }

    if (metrics.streakDays > 7) {
      strengths.push('Maintains positive learning streak');
    }

    if (Object.keys(metrics.featureUsage).length > 5) {
      strengths.push('Utilizes diverse learning resources');
    }

    return strengths;
  }

  // Identify concerns
  private identifyConcerns(metrics: EngagementMetrics): string[] {
    const concerns: string[] = [];

    if (metrics.consistencyIndex < 0.3) {
      concerns.push('Inconsistent engagement pattern');
    }

    if (metrics.participationScore < 40) {
      concerns.push('Low participation in learning activities');
    }

    if (metrics.timeSpent < 60) {
      concerns.push('Limited time spent on learning platform');
    }

    if (metrics.streakDays === 0) {
      concerns.push('No recent active learning days');
    }

    if (metrics.loginFrequency < 3) {
      concerns.push('Infrequent platform access');
    }

    return concerns;
  }

  // Generate recommendations
  private generateRecommendations(metrics: EngagementMetrics, concerns: string[]): string[] {
    const recommendations: string[] = [];

    if (concerns.includes('Inconsistent engagement pattern')) {
      recommendations.push('Establish a regular learning schedule');
      recommendations.push('Set daily learning goals and reminders');
    }

    if (concerns.includes('Low participation in learning activities')) {
      recommendations.push('Explore different types of learning materials');
      recommendations.push('Join discussion forums and group activities');
    }

    if (concerns.includes('Limited time spent on learning platform')) {
      recommendations.push('Aim for at least 30 minutes of daily engagement');
      recommendations.push('Break learning into smaller, manageable sessions');
    }

    if (metrics.interactionQuality < 6) {
      recommendations.push('Focus on understanding concepts before attempting assessments');
      recommendations.push('Seek help from teachers or peers when needed');
    }

    return recommendations;
  }

  // Get class comparison (mock implementation)
  private getClassComparison(studentId: string, studentScore: number): EngagementReport['comparison'] {
    // Mock class data
    const classAverage = 72;
    const totalStudents = 32;
    const percentile = Math.floor((studentScore / 100) * totalStudents);
    const rank = totalStudents - Math.floor((studentScore / 100) * totalStudents) + 1;

    return {
      classAverage,
      percentile,
      rank,
      totalStudents
    };
  }

  // Helper methods
  private saveEvent(event: EngagementEvent): void {
    const events = this.getAllEvents();
    events.push(event);
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
  }

  private getAllEvents(): EngagementEvent[] {
    const events = localStorage.getItem(this.EVENTS_KEY);
    return events ? JSON.parse(events) : [];
  }

  private getStudentEvents(studentId: string, period: 'week' | 'month' | 'semester'): EngagementEvent[] {
    const events = this.getAllEvents();
    const cutoffDate = this.getPeriodStartDate(period);
    
    return events
      .filter(event => event.studentId === studentId)
      .filter(event => new Date(event.timestamp) >= new Date(cutoffDate))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private getPeriodStartDate(period: 'week' | 'month' | 'semester'): string {
    const now = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 120;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return startDate.toISOString();
  }

  private updateActiveSession(studentId: string, sessionId: string, studentName: string): void {
    const sessions = this.getActiveSessions();
    sessions[studentId] = { sessionId, studentName, loginTime: new Date().toISOString() };
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  private removeActiveSession(studentId: string): void {
    const sessions = this.getActiveSessions();
    delete sessions[studentId];
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  private getCurrentSession(studentId: string): string | null {
    const sessions = this.getActiveSessions();
    return sessions[studentId]?.sessionId || null;
  }

  private getActiveSessions(): Record<string, { sessionId: string; studentName: string; loginTime: string }> {
    const sessions = localStorage.getItem(this.SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : {};
  }

  private calculateStreakDays(studentId: string): number {
    const events = this.getStudentEvents(studentId, 'month');
    const loginDates = new Set(
      events
        .filter(e => e.eventType === 'login')
        .map(e => e.timestamp.split('T')[0])
    );

    if (loginDates.size === 0) return 0;

    const sortedDates = Array.from(loginDates).sort();
    let streak = 1;
    const today = new Date().toISOString().split('T')[0];

    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const currentDate = new Date(sortedDates[i]);
      const nextDate = new Date(sortedDates[i + 1]);
      const diffDays = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return sortedDates.includes(today) ? streak : 0;
  }

  private updateEngagementMetrics(studentId: string): void {
    // This would trigger real-time updates to dashboards
    console.log(`Updated engagement metrics for student ${studentId}`);
  }

  private analyzePerformanceTrend(studentId: string, score: number, subject?: string): void {
    // Analyze if performance is declining and create alerts if needed
    const recentAssessments = this.getStudentEvents(studentId, 'month')
      .filter(e => e.eventType === 'assessment_complete' && e.metadata.score)
      .slice(-5);

    if (recentAssessments.length >= 3) {
      const recentScores = recentAssessments.map(e => e.metadata.score || 0);
      const trend = this.calculateTrend(recentScores);

      if (trend < -10) { // Declining by more than 10 points
        this.createAlert(studentId, 'declining_performance', 'medium',
          'Student shows declining performance trend');
      }
    }
  }

  private calculateTrend(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  private getAllAlerts(): EngagementAlert[] {
    const alerts = localStorage.getItem(this.ALERTS_KEY);
    return alerts ? JSON.parse(alerts) : [];
  }

  private getStudentAlerts(studentId: string): EngagementAlert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.studentId === studentId && !alert.isResolved);
  }

  private setupDefaultAlerts(): void {
    // Initialize default alert configurations
    console.log('Engagement alert system configured');
  }

  private startSessionTracking(): void {
    // Start monitoring active sessions
    console.log('Session tracking initiated');
  }

  // Public methods for dashboard integration
  getActiveStudentsCount(): number {
    return Object.keys(this.getActiveSessions()).length;
  }

  getStudentsNeedingIntervention(): Array<{ studentId: string; studentName: string; alertType: string }> {
    const alerts = this.getAllAlerts();
    const criticalAlerts = alerts.filter(a => !a.isResolved && (a.severity === 'high' || a.severity === 'critical'));
    
    return criticalAlerts.map(alert => ({
      studentId: alert.studentId,
      studentName: `Student ${alert.studentId}`, // Would get from student data
      alertType: alert.type
    }));
  }

  resolveAlert(alertId: string): boolean {
    const alerts = this.getAllAlerts();
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) return false;
    
    alerts[alertIndex].isResolved = true;
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
    
    return true;
  }

  exportEngagementData(studentId?: string): string {
    const events = studentId ? this.getStudentEvents(studentId, 'semester') : this.getAllEvents();
    const alerts = studentId ? this.getStudentAlerts(studentId) : this.getAllAlerts();
    
    return JSON.stringify({
      studentId,
      exportDate: new Date().toISOString(),
      events,
      alerts,
      metrics: studentId ? this.getEngagementMetrics(studentId, 'semester') : null
    }, null, 2);
  }
}

// Export service instance
export const StudentEngagementServiceInstance = StudentEngagementService.getInstance();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  try {
    StudentEngagementServiceInstance.initialize();
  } catch (error) {
    console.error('Failed to initialize Student Engagement Service:', error);
  }
}