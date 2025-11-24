// Real-time Student Monitoring Service
// Monitor siswa secara real-time dan trigger intervensi otomatis

import { StudentSupportService } from './studentSupportService';

export interface StudentMetrics {
  studentId: string;
  timestamp: string;
  loginFrequency: number;
  pageViews: number;
  timeOnPortal: number;
  resourceAccess: number;
  assignmentProgress: number;
  lastLogin: string;
  currentSession: {
    startTime: string;
    pagesVisited: string[];
    timeSpent: number;
    interactions: number;
  };
}

export interface InterventionTrigger {
  id: string;
  studentId: string;
  triggerType: 'academic_risk' | 'engagement_drop' | 'technical_issue' | 'wellness_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metrics: any;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'resolved';
  actions: InterventionAction[];
}

export interface InterventionAction {
  id: string;
  type: 'notification' | 'resource_assignment' | 'counselor_referral' | 'parent_alert' | 'peer_support';
  config: any;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

class RealTimeMonitoringService {
  private static instance: RealTimeMonitoringService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private studentSessions: Map<string, StudentMetrics> = new Map();
  private interventionTriggers: Map<string, InterventionTrigger> = new Map();
  private studentSupportService: StudentSupportService = new StudentSupportService();

  static getInstance(): RealTimeMonitoringService {
    if (!this.instance) {
      this.instance = new RealTimeMonitoringService();
    }
    return this.instance;
  }

  // Start real-time monitoring
  startMonitoring(): void {
    if (this.monitoringInterval) return;

    console.log('🔍 Starting real-time student monitoring...');
    
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
      this.checkForInterventionTriggers();
      this.updateEngagementMetrics();
    }, 30000);

    // Deep analysis every 5 minutes
    setInterval(() => {
      this.performDeepAnalysis();
      this.checkSystemHealth();
    }, 300000);

    // Hourly comprehensive report
    setInterval(() => {
      this.generateHourlyReport();
      this.performSystemMaintenance();
    }, 3600000);
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ Real-time monitoring stopped');
    }
  }

  // Track student session
  trackStudentSession(studentId: string, sessionData: Partial<StudentMetrics>): void {
    const existingSession = this.studentSessions.get(studentId) || {
      studentId,
      timestamp: new Date().toISOString(),
      loginFrequency: 0,
      pageViews: 0,
      timeOnPortal: 0,
      resourceAccess: 0,
      assignmentProgress: 0,
      lastLogin: new Date().toISOString(),
      currentSession: {
        startTime: new Date().toISOString(),
        pagesVisited: [],
        timeSpent: 0,
        interactions: 0
      }
    };

    // Update session data
    const updatedSession: StudentMetrics = {
      ...existingSession,
      ...sessionData,
      timestamp: new Date().toISOString(),
      currentSession: {
        ...existingSession.currentSession,
        ...sessionData.currentSession,
        startTime: existingSession.currentSession.startTime || new Date().toISOString()
      }
    };

    this.studentSessions.set(studentId, updatedSession);

    // Check for immediate intervention needs
    this.checkImmediateInterventionNeeds(updatedSession);
  }

  // Track page view
  trackPageView(studentId: string, page: string): void {
    const session = this.studentSessions.get(studentId);
    if (session) {
      session.pageViews++;
      session.currentSession.pagesVisited.push(page);
      session.currentSession.timeSpent = Date.now() - new Date(session.currentSession.startTime).getTime();
      this.studentSessions.set(studentId, session);
    }
  }

  // Track resource access
  trackResourceAccess(studentId: string, resourceId: string): void {
    const session = this.studentSessions.get(studentId);
    if (session) {
      session.resourceAccess++;
      session.currentSession.interactions++;
      this.studentSessions.set(studentId, session);
    }
  }

  // Check for immediate intervention needs
  private checkImmediateInterventionNeeds(session: StudentMetrics): void {
    const triggers: InterventionTrigger[] = [];

    // Check for critical issues
    if (this.isCriticalRisk(session)) {
      triggers.push(this.createInterventionTrigger(session, 'critical', 'academic_risk'));
    }

    // Check for technical issues
    if (this.hasTechnicalIssues(session)) {
      triggers.push(this.createInterventionTrigger(session, 'high', 'technical_issue'));
    }

    // Check for engagement drop
    if (this.hasEngagementDrop(session)) {
      triggers.push(this.createInterventionTrigger(session, 'medium', 'engagement_drop'));
    }

    // Execute interventions
    triggers.forEach(trigger => {
      this.executeIntervention(trigger);
    });
  }

  // Check if student has critical risk
  private isCriticalRisk(session: StudentMetrics): boolean {
    const progress = this.studentSupportService.getStudentProgress(session.studentId);
    if (!progress) return false;

    return (
      progress.academicMetrics.gpa < 60 ||
      progress.academicMetrics.attendanceRate < 70 ||
      progress.riskLevel === 'high'
    );
  }

  // Check for technical issues
  private hasTechnicalIssues(session: StudentMetrics): boolean {
    const sessionDuration = Date.now() - new Date(session.currentSession.startTime).getTime();
    const hasLowInteraction = session.currentSession.interactions < 2 && sessionDuration > 600000; // 10 minutes
    const hasHighPageViews = session.pageViews > 50 && session.currentSession.timeSpent < 60000; // 1 minute

    return hasLowInteraction || hasHighPageViews;
  }

  // Check for engagement drop
  private hasEngagementDrop(session: StudentMetrics): boolean {
    const progress = this.studentSupportService.getStudentProgress(session.studentId);
    if (!progress) return false;

    return (
      progress.engagementMetrics.loginFrequency < 2 ||
      session.currentSession.timeSpent < 120000 // Less than 2 minutes
    );
  }

  // Create intervention trigger
  private createInterventionTrigger(
    session: StudentMetrics, 
    severity: InterventionTrigger['severity'], 
    triggerType: InterventionTrigger['triggerType']
  ): InterventionTrigger {
    const trigger: InterventionTrigger = {
      id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: session.studentId,
      triggerType,
      severity,
      metrics: session,
      timestamp: new Date().toISOString(),
      status: 'pending',
      actions: []
    };

    this.interventionTriggers.set(trigger.id, trigger);
    return trigger;
  }

  // Execute intervention
  private async executeIntervention(trigger: InterventionTrigger): Promise<void> {
    console.log(`🚨 Executing intervention for student ${trigger.studentId}: ${trigger.triggerType}`);

    trigger.status = 'in_progress';

    switch (trigger.triggerType) {
      case 'academic_risk':
        await this.executeAcademicIntervention(trigger);
        break;
      case 'engagement_drop':
        await this.executeEngagementIntervention(trigger);
        break;
      case 'technical_issue':
        await this.executeTechnicalIntervention(trigger);
        break;
      case 'wellness_concern':
        await this.executeWellnessIntervention(trigger);
        break;
    }

    // Update trigger status
    trigger.status = 'pending'; // Waiting for action completion
    this.interventionTriggers.set(trigger.id, trigger);
  }

  // Execute academic intervention
  private async executeAcademicIntervention(trigger: InterventionTrigger): Promise<void> {
    const actions: InterventionAction[] = [];

    // Create support request
    const supportRequest = StudentSupportService.createSupportRequest(
      trigger.studentId,
      'academic',
      'intervention',
      `Intervensi Otomatis - Risiko ${trigger.severity.toUpperCase()}`,
      `Sistem mendeteksi risiko akademis. Metrik: ${JSON.stringify(trigger.metrics, null, 2)}`,
      trigger.severity as any
    );

    actions.push({
      id: `action_${Date.now()}_1`,
      type: 'notification',
      config: {
        message: 'Tim support akademis telah diberitahu mengenai situasi Anda',
        type: 'academic_support'
      },
      status: 'pending',
      timestamp: new Date().toISOString()
    });

    // Assign resources
    if (trigger.severity === 'critical' || trigger.severity === 'high') {
      actions.push({
        id: `action_${Date.now()}_2`,
        type: 'resource_assignment',
        config: {
          resourceIds: ['academic_recovery_plan', 'study_tips', 'time_management'],
          priority: 'high'
        },
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      // Counselor referral for critical cases
      if (trigger.severity === 'critical') {
        actions.push({
          id: `action_${Date.now()}_3`,
          type: 'counselor_referral',
          config: {
            urgency: 'immediate',
            reason: 'Critical academic risk detected',
            studentId: trigger.studentId
          },
          status: 'pending',
          timestamp: new Date().toISOString()
        });
      }
    }

    trigger.actions = actions;
  }

  // Execute engagement intervention
  private async executeEngagementIntervention(trigger: InterventionTrigger): Promise<void> {
    const actions: InterventionAction[] = [];

    // Send engagement notification
    actions.push({
      id: `action_${Date.now()}_1`,
      type: 'notification',
      config: {
        message: 'Kami siap membantu Anda lebih aktif di portal. Ada yang bisa kami bantu?',
        type: 'engagement_support'
      },
      status: 'pending',
      timestamp: new Date().toISOString()
    });

    // Assign engagement resources
    actions.push({
      id: `action_${Date.now()}_2`,
      type: 'resource_assignment',
      config: {
        resourceIds: ['portal_tutorial', 'engagement_guide', 'feature_overview'],
        priority: 'medium'
      },
      status: 'pending',
      timestamp: new Date().toISOString()
    });

    trigger.actions = actions;
  }

  // Execute technical intervention
  private async executeTechnicalIntervention(trigger: InterventionTrigger): Promise<void> {
    const actions: InterventionAction[] = [];

    // Create technical support request
    StudentSupportService.createSupportRequest(
      trigger.studentId,
      'technical',
      'automated_detection',
      'Masalah Teknis Terdeteksi',
      `Sistem mendeteksi potensi masalah teknis. Metrik: ${JSON.stringify(trigger.metrics, null, 2)}`,
      'medium'
    );

    // Send technical help notification
    actions.push({
      id: `action_${Date.now()}_1`,
      type: 'notification',
      config: {
        message: 'Tim support teknis siap membantu mengatasi masalah Anda',
        type: 'technical_support'
      },
      status: 'pending',
      timestamp: new Date().toISOString()
    });

    trigger.actions = actions;
  }

  // Execute wellness intervention
  private async executeWellnessIntervention(trigger: InterventionTrigger): Promise<void> {
    const actions: InterventionAction[] = [];

    // Create wellness support request
    StudentSupportService.createSupportRequest(
      trigger.studentId,
      'personal',
      'wellness_check',
      'Perhatian Kesejahteraan',
      'Sistem mendeteksi perlunya perhatian khusus pada kesejahteraan Anda',
      'medium'
    );

    // Counselor referral
    actions.push({
      id: `action_${Date.now()}_1`,
      type: 'counselor_referral',
      config: {
        urgency: 'soon',
        reason: 'Wellness concern detected',
        studentId: trigger.studentId
      },
      status: 'pending',
      timestamp: new Date().toISOString()
    });

    trigger.actions = actions;
  }

  // Perform health check
  private performHealthCheck(): void {
    const activeStudents = this.studentSessions.size;
    const pendingInterventions = Array.from(this.interventionTriggers.values())
      .filter(trigger => trigger.status === 'pending').length;

    console.log(`💓 Health Check - Active Students: ${activeStudents}, Pending Interventions: ${pendingInterventions}`);
  }

  // Check for intervention triggers
  private checkForInterventionTriggers(): void {
    this.studentSessions.forEach(session => {
      this.checkImmediateInterventionNeeds(session);
    });
  }

  // Update engagement metrics
  private updateEngagementMetrics(): void {
    this.studentSessions.forEach((session, studentId) => {
      const progress = StudentSupportService.getStudentProgress(studentId);
      if (progress) {
        StudentSupportService.updateStudentProgress(studentId, {
          engagementMetrics: {
            ...progress.engagementMetrics,
            loginFrequency: Math.max(progress.engagementMetrics.loginFrequency, session.loginFrequency),
            resourceAccess: progress.engagementMetrics.resourceAccess + session.resourceAccess
          }
        });
      }
    });
  }

  // Perform deep analysis
  private performDeepAnalysis(): void {
    console.log('🔬 Performing deep analysis...');
    
    this.studentSessions.forEach((session, studentId) => {
      const progress = StudentSupportService.getStudentProgress(studentId);
      if (progress) {
        // Analyze patterns and predict risks
        this.analyzeStudentPatterns(session, progress);
      }
    });
  }

  // Analyze student patterns
  private analyzeStudentPatterns(session: StudentMetrics, progress: any): void {
    // Pattern analysis logic here
    const sessionDuration = Date.now() - new Date(session.currentSession.startTime).getTime();
    const avgTimePerPage = sessionDuration / Math.max(session.pageViews, 1);

    // Detect unusual patterns
    if (avgTimePerPage < 5000) { // Less than 5 seconds per page
      console.log(`⚠️ Unusual pattern detected for student ${session.studentId}: Very fast page navigation`);
    }
  }

  // Check system health
  private checkSystemHealth(): void {
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const activeSessions = this.studentSessions.size;
    const activeInterventions = this.interventionTriggers.size;

    console.log(`🏥 System Health - Memory: ${memoryUsage}MB, Sessions: ${activeSessions}, Interventions: ${activeInterventions}`);
  }

  // Generate hourly report
  private generateHourlyReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      totalStudents: this.studentSessions.size,
      totalInterventions: this.interventionTriggers.size,
      interventionTypes: this.getInterventionTypeBreakdown(),
      activeStudents: this.getActiveStudentsCount(),
      systemHealth: this.getSystemHealthStatus()
    };

    console.log('📊 Hourly Report:', report);
  }

  // Get intervention type breakdown
  private getInterventionTypeBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    this.interventionTriggers.forEach(trigger => {
      breakdown[trigger.triggerType] = (breakdown[trigger.triggerType] || 0) + 1;
    });

    return breakdown;
  }

  // Get active students count
  private getActiveStudentsCount(): number {
    const now = Date.now();
    let activeCount = 0;

    this.studentSessions.forEach(session => {
      const lastActivity = new Date(session.timestamp).getTime();
      if (now - lastActivity < 300000) { // Active in last 5 minutes
        activeCount++;
      }
    });

    return activeCount;
  }

  // Get system health status
  private getSystemHealthStatus(): string {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    
    if (memoryUsage > 500) return 'critical';
    if (memoryUsage > 300) return 'warning';
    return 'healthy';
  }

  // Perform system maintenance
  private performSystemMaintenance(): void {
    // Clean up old sessions
    const now = Date.now();
    const cutoffTime = now - (24 * 60 * 60 * 1000); // 24 hours ago

    this.studentSessions.forEach((session, studentId) => {
      const lastActivity = new Date(session.timestamp).getTime();
      if (lastActivity < cutoffTime) {
        this.studentSessions.delete(studentId);
      }
    });

    // Clean up resolved interventions
    this.interventionTriggers.forEach((trigger, triggerId) => {
      if (trigger.status === 'resolved') {
        const resolvedTime = new Date(trigger.timestamp).getTime();
        if (now - resolvedTime > 7 * 24 * 60 * 60 * 1000) { // 7 days ago
          this.interventionTriggers.delete(triggerId);
        }
      }
    });

    console.log('🧹 System maintenance completed');
  }

  // Get monitoring statistics
  getMonitoringStats(): any {
    return {
      activeStudents: this.studentSessions.size,
      pendingInterventions: Array.from(this.interventionTriggers.values())
        .filter(trigger => trigger.status === 'pending').length,
      inProgressInterventions: Array.from(this.interventionTriggers.values())
        .filter(trigger => trigger.status === 'in_progress').length,
      totalInterventions: this.interventionTriggers.size,
      systemHealth: this.getSystemHealthStatus(),
      uptime: process.uptime()
    };
  }

  // Get student session
  getStudentSession(studentId: string): StudentMetrics | undefined {
    return this.studentSessions.get(studentId);
  }

  // Get intervention triggers
  getInterventionTriggers(studentId?: string): InterventionTrigger[] {
    const triggers = Array.from(this.interventionTriggers.values());
    return studentId ? triggers.filter(trigger => trigger.studentId === studentId) : triggers;
  }
}

export default RealTimeMonitoringService;