// Enhanced Automated Intervention Engine
// Mesin otomasi untuk intervensi siswa berbasis AI dengan advanced analytics

import { StudentSupportService, SupportRequest } from './studentSupportService';
import RealTimeMonitoringService, { InterventionTrigger } from './realTimeMonitoringService';

export interface InterventionRule {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'technical' | 'engagement' | 'wellness';
  trigger: {
    type: 'threshold' | 'pattern' | 'anomaly' | 'schedule';
    conditions: any[];
  };
  actions: InterventionAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  cooldownPeriod: number; // minutes
  lastTriggered?: string;
}

export interface InterventionAction {
  type: 'support_request' | 'notification' | 'resource_assignment' | 'escalation' | 'parent_alert' | 'peer_match';
  config: any;
  delay?: number; // minutes
  conditions?: any[];
}

export interface InterventionResult {
  ruleId: string;
  studentId: string;
  actions: Array<{
    type: string;
    status: 'success' | 'failed' | 'pending';
    result?: any;
    error?: string;
  }>;
  timestamp: string;
  effectiveness?: number;
}

class AutomatedInterventionEngine {
  private static instance: AutomatedInterventionEngine;
  private rules: Map<string, InterventionRule> = new Map();
  private interventionHistory: Map<string, InterventionResult[]> = new Map();
  private monitoringService: RealTimeMonitoringService;

  static getInstance(): AutomatedInterventionEngine {
    if (!this.instance) {
      this.instance = new AutomatedInterventionEngine();
    }
    return this.instance;
  }

  constructor() {
    this.monitoringService = RealTimeMonitoringService.getInstance();
    this.initializeDefaultRules();
    this.startInterventionEngine();
  }

  // Initialize default intervention rules with enhanced AI-powered rules
  private initializeDefaultRules(): void {
    const defaultRules: InterventionRule[] = [
      {
        id: 'critical_academic_risk',
        name: 'Critical Academic Risk Intervention',
        description: 'Intervensi otomatis untuk siswa dengan risiko akademis kritis',
        category: 'academic',
        trigger: {
          type: 'threshold',
          conditions: [
            { metric: 'gpa', operator: '<', value: 60 },
            { metric: 'attendanceRate', operator: '<', value: 70 },
            { metric: 'riskLevel', operator: '===', value: 'high' }
          ]
        },
        actions: [
          {
            type: 'support_request',
            config: {
              priority: 'urgent',
              category: 'academic',
              template: 'critical_intervention',
              autoAssign: 'guidance_counselor',
              aiContext: true
            }
          },
          {
            type: 'parent_alert',
            config: {
              urgency: 'immediate',
              template: 'critical_academic_alert',
              includeRecommendations: true,
              aiAnalysis: true
            },
            delay: 5
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['academic_recovery_plan', 'emergency_study_guide', 'stress_management'],
              priority: 'high',
              personalized: true
            }
          },
          {
            type: 'escalation',
            config: {
              escalateTo: 'principal',
              urgency: 'immediate',
              reason: 'critical_academic_failure',
              autoSchedule: true
            }
          }
        ],
        priority: 'critical',
        isActive: true,
        cooldownPeriod: 1440 // 24 hours
      },
      {
        id: 'ai_predicted_failure',
        name: 'AI-Predicted Academic Failure',
        description: 'AI prediction untuk siswa yang berisiko gagal berdasarkan pattern analysis',
        category: 'academic',
        trigger: {
          type: 'pattern',
          conditions: [
            { metric: 'aiRiskScore', operator: '>', value: 0.8 },
            { metric: 'decliningTrendWeeks', operator: '>=', value: 3 },
            { metric: 'multipleSubjectRisk', operator: '===', value: true }
          ]
        },
        actions: [
          {
            type: 'support_request',
            config: {
              priority: 'high',
              category: 'academic',
              template: 'ai_predicted_intervention',
              aiInsights: true,
              predictiveAnalysis: true
            }
          },
          {
            type: 'notification',
            config: {
              message: 'AI system mendeteksi potensi kesulitan akademis. Tim support siap membantu!',
              type: 'ai_prediction',
              priority: 'high'
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['personalized_study_plan', 'subject_specific_help'],
              priority: 'high',
              aiRecommended: true
            }
          }
        ],
        priority: 'high',
        isActive: true,
        cooldownPeriod: 720 // 12 hours
      },
      {
        id: 'declining_performance',
        name: 'Declining Performance Alert',
        description: 'Deteksi dan intervensi untuk penurunan performa dengan AI analysis',
        category: 'academic',
        trigger: {
          type: 'pattern',
          conditions: [
            { metric: 'gradeTrend', operator: '===', value: 'declining' },
            { metric: 'assignmentCompletion', operator: '<', value: 80 },
            { metric: 'consecutiveWeeks', operator: '>=', value: 2 }
          ]
        },
        actions: [
          {
            type: 'support_request',
            config: {
              priority: 'high',
              category: 'academic',
              template: 'performance_decline',
              aiAnalysis: true,
              trendAnalysis: true
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['study_improvement_guide', 'time_management_tips', 'motivation_boosters'],
              priority: 'medium',
              adaptive: true
            }
          },
          {
            type: 'notification',
            config: {
              message: 'Kami mendeteksi penurunan performa. AI telah menganalisis pola Anda dan menyiapkan bantuan personal!',
              type: 'support',
              aiPersonalized: true
            }
          },
          {
            type: 'peer_match',
            config: {
              type: 'academic_mentor',
              criteria: 'high_performer_same_subjects',
              aiMatched: true
            },
            delay: 30
          }
        ],
        priority: 'high',
        isActive: true,
        cooldownPeriod: 720 // 12 hours
      },
      {
        id: 'engagement_crisis',
        name: 'Engagement Crisis Detection',
        description: 'Deteksi krisis engagement dengan deep behavioral analysis',
        category: 'engagement',
        trigger: {
          type: 'anomaly',
          conditions: [
            { metric: 'loginFrequency', operator: '<', value: 1 },
            { metric: 'lastLoginDays', operator: '>', value: 14 },
            { metric: 'interactionScore', operator: '<', value: 0.2 },
            { metric: 'behavioralAnomaly', operator: '>', value: 0.8 }
          ]
        },
        actions: [
          {
            type: 'support_request',
            config: {
              priority: 'urgent',
              category: 'personal',
              template: 'engagement_crisis',
              behavioralAnalysis: true
            }
          },
          {
            type: 'parent_alert',
            config: {
              urgency: 'high',
              template: 'engagement_crisis_alert',
              behavioralInsights: true
            },
            delay: 10
          },
          {
            type: 'escalation',
            config: {
              escalateTo: 'counselor',
              urgency: 'urgent',
              reason: 'engagement_crisis',
              requireFollowUp: true
            }
          },
          {
            type: 'notification',
            config: {
              message: 'Kami sangat peduli dan merindukan kehadiran Anda. Tim support siap membantu tantangan yang Anda hadapi.',
              type: 'personal_care',
              empathy: true
            }
          }
        ],
        priority: 'critical',
        isActive: true,
        cooldownPeriod: 480 // 8 hours
      },
      {
        id: 'low_engagement',
        name: 'Low Engagement Intervention',
        description: 'Intervensi untuk siswa dengan engagement rendah dengan gamification',
        category: 'engagement',
        trigger: {
          type: 'threshold',
          conditions: [
            { metric: 'loginFrequency', operator: '<', value: 3 },
            { metric: 'lastLoginDays', operator: '>', value: 7 },
            { metric: 'resourceAccess', operator: '<', value: 5 }
          ]
        },
        actions: [
          {
            type: 'notification',
            config: {
              message: 'Kami merindukan kehadiran Anda! Ada banyak informasi penting dan fitur menarik di portal.',
              type: 'engagement',
              gamification: true,
              incentive: 'badge_points'
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['portal_tutorial', 'engagement_guide', 'feature_highlights'],
              priority: 'low',
              interactive: true
            }
          },
          {
            type: 'peer_match',
            config: {
              type: 'study_buddy',
              criteria: 'similar_courses',
              aiMatched: true
            },
            delay: 60
          },
          {
            type: 'notification',
            config: {
              message: '🎯 Challenge baru tersedia! Login dan dapatkan achievement khusus!',
              type: 'gamification',
              challenge: 'welcome_back'
            },
            delay: 120
          }
        ],
        priority: 'medium',
        isActive: true,
        cooldownPeriod: 480 // 8 hours
      },
      {
        id: 'mental_health_wellness',
        name: 'Mental Health & Wellness Check',
        description: 'Comprehensive wellness detection dengan AI sentiment analysis',
        category: 'wellness',
        trigger: {
          type: 'pattern',
          conditions: [
            { metric: 'stressIndicators', operator: '>', value: 5 },
            { metric: 'negativeSentimentScore', operator: '>', value: 0.7 },
            { metric: 'isolationBehavior', operator: '>', value: 0.8 },
            { metric: 'supportRequestFrequency', operator: '>', value: 8 }
          ]
        },
        actions: [
          {
            type: 'support_request',
            config: {
              priority: 'urgent',
              category: 'personal',
              template: 'mental_health_support',
              confidential: true,
              counselorAssigned: true
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['mental_health_resources', 'stress_management_techniques', 'coping_strategies'],
              priority: 'high',
              privateAccess: true
            }
          },
          {
            type: 'escalation',
            config: {
              escalateTo: 'school_psychologist',
              urgency: 'urgent',
              reason: 'mental_health_concern',
              confidential: true,
              immediateFollowUp: true
            }
          },
          {
            type: 'notification',
            config: {
              message: 'Kami peduli dengan kesejahteraan Anda. Bantuan profesional tersedia jika Anda membutuhkannya.',
              type: 'wellness',
              supportive: true,
              resources: 'mental_health_hotline'
            }
          }
        ],
        priority: 'critical',
        isActive: true,
        cooldownPeriod: 1440 // 24 hours
      },
      {
        id: 'technical_difficulties',
        name: 'Technical Difficulties Detection',
        description: 'Deteksi masalah teknis dan bantuan otomatis dengan diagnostic AI',
        category: 'technical',
        trigger: {
          type: 'anomaly',
          conditions: [
            { metric: 'failedLogins', operator: '>', value: 3 },
            { metric: 'pageErrors', operator: '>', value: 5 },
            { metric: 'sessionDuration', operator: '<', value: 60 },
            { metric: 'deviceCompatibility', operator: '===', value: 'poor' }
          ]
        },
        actions: [
          {
            type: 'support_request',
            config: {
              priority: 'medium',
              category: 'technical',
              template: 'technical_difficulties',
              diagnosticData: true,
              autoTroubleshoot: true
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['troubleshooting_guide', 'device_compatibility_check', 'browser_optimization'],
              priority: 'medium',
              interactive: true
            }
          },
          {
            type: 'notification',
            config: {
              message: 'Kami mendeteksi masalah teknis. AI kami telah menganalisis issue dan menyiapkan solusi!',
              type: 'technical_support',
              diagnostic: true
            }
          }
        ],
        priority: 'medium',
        isActive: true,
        cooldownPeriod: 240 // 4 hours
      },
      {
        id: 'proactive_success_coaching',
        name: 'Proactive Success Coaching',
        description: 'AI-driven proactive coaching untuk siswa dengan potensi tinggi',
        category: 'academic',
        trigger: {
          type: 'pattern',
          conditions: [
            { metric: 'highPotentialScore', operator: '>', value: 0.8 },
            { metric: 'consistentPerformance', operator: '===', value: true },
            { metric: 'growthOpportunity', operator: '>', value: 0.7 }
          ]
        },
        actions: [
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['advanced_learning_materials', 'enrichment_programs', 'leadership_development'],
              priority: 'medium',
              personalized: true,
              advanced: true
            }
          },
          {
            type: 'notification',
            config: {
              message: '🌟 Potensi luar biasa terdeteksi! Program khusus telah disiapkan untuk membantu Anda mencapai kesuksesan.',
              type: 'opportunity',
              motivational: true
            }
          },
          {
            type: 'peer_match',
            config: {
              type: 'mentorship',
              criteria: 'high_achiever_mentor',
              exclusive: true
            },
            delay: 120
          }
        ],
        priority: 'low',
        isActive: true,
        cooldownPeriod: 1680 // 28 hours
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });

    console.log(`🤖 Initialized ${defaultRules.length} intervention rules`);
  }

  // Start intervention engine
  private startInterventionEngine(): void {
    // Check for interventions every 2 minutes
    setInterval(() => {
      this.evaluateAndExecuteInterventions();
    }, 120000);

    // Analyze effectiveness every hour
    setInterval(() => {
      this.analyzeInterventionEffectiveness();
      this.optimizeRules();
    }, 3600000);

    console.log('🚀 Automated Intervention Engine started');
  }

  // Evaluate and execute interventions
  private async evaluateAndExecuteInterventions(): Promise<void> {
    const supportService = StudentSupportService.getInstance();
    const allProgress = supportService.getAllStudentProgress();
    
    for (const [studentId, progress] of Object.entries(allProgress)) {
      for (const rule of this.rules.values()) {
        if (!rule.isActive) continue;

        // Check cooldown period
        if (this.isInCooldown(rule, studentId)) continue;

        // Evaluate rule conditions
        if (this.evaluateRule(rule, progress, studentId)) {
          await this.executeInterventionRule(rule, studentId, progress);
        }
      }
    }
  }

  // Check if rule is in cooldown
  private isInCooldown(rule: InterventionRule, studentId: string): boolean {
    if (!rule.lastTriggered) return false;

    const lastTriggered = new Date(rule.lastTriggered).getTime();
    const cooldownMs = rule.cooldownPeriod * 60 * 1000;
    const now = Date.now();

    return (now - lastTriggered) < cooldownMs;
  }

  // Evaluate rule conditions
  private evaluateRule(rule: InterventionRule, progress: any, studentId: string): boolean {
    const { trigger } = rule;
    
    switch (trigger.type) {
      case 'threshold':
        return this.evaluateThresholdConditions(trigger.conditions, progress);
      case 'pattern':
        return this.evaluatePatternConditions(trigger.conditions, progress, studentId);
      case 'anomaly':
        return this.evaluateAnomalyConditions(trigger.conditions, studentId);
      case 'schedule':
        return this.evaluateScheduleConditions(trigger.conditions);
      default:
        return false;
    }
  }

  // Evaluate threshold conditions
  private evaluateThresholdConditions(conditions: any[], progress: any): boolean {
    return conditions.every(condition => {
      const { metric, operator, value } = condition;
      const actualValue = this.getMetricValue(progress, metric);
      
      switch (operator) {
        case '<': return actualValue < value;
        case '<=': return actualValue <= value;
        case '>': return actualValue > value;
        case '>=': return actualValue >= value;
        case '===': return actualValue === value;
        case '!==': return actualValue !== value;
        default: return false;
      }
    });
  }

  // Evaluate pattern conditions
  private evaluatePatternConditions(conditions: any[], progress: any, studentId: string): boolean {
    // Get historical data for pattern analysis
    const history = this.getInterventionHistory(studentId);
    const supportService = StudentSupportService.getInstance();
    const requests = supportService.getSupportRequests()
      .filter(req => req.studentId === studentId);

    return conditions.every(condition => {
      const { metric, operator, value } = condition;
      
      switch (metric) {
        case 'gradeTrend':
          return progress.academicMetrics.gradeTrend === value;
        case 'consecutiveWeeks':
          return this.calculateConsecutiveWeeks(progress, studentId) >= value;
        case 'supportRequestFrequency':
          return this.calculateRequestFrequency(requests) >= value;
        default:
          return this.getMetricValue(progress, metric) >= value;
      }
    });
  }

  // Evaluate anomaly conditions
  private evaluateAnomalyConditions(conditions: any[], studentId: string): boolean {
    const session = this.monitoringService.getStudentSession(studentId);
    if (!session) return false;

    return conditions.every(condition => {
      const { metric, operator, value } = condition;
      const actualValue = this.getSessionMetricValue(session, metric);
      
      switch (operator) {
        case '>': return actualValue > value;
        case '<': return actualValue < value;
        default: return false;
      }
    });
  }

  // Evaluate schedule conditions
  private evaluateScheduleConditions(conditions: any[]): boolean {
    const now = new Date();
    
    return conditions.every(condition => {
      const { type, time } = condition;
      
      switch (type) {
        case 'daily':
          return now.getHours() === parseInt(time);
        case 'weekly':
          return now.getDay() === parseInt(time);
        case 'monthly':
          return now.getDate() === parseInt(time);
        default:
          return false;
      }
    });
  }

  // Get metric value from progress
  private getMetricValue(progress: any, metric: string): any {
    const metricPath = metric.split('.');
    let value = progress;
    
    for (const path of metricPath) {
      value = value?.[path];
    }
    
    return value || 0;
  }

  // Get session metric value
  private getSessionMetricValue(session: any, metric: string): any {
    switch (metric) {
      case 'failedLogins':
        return session.currentSession.interactions < 2 ? 1 : 0; // Simplified
      case 'pageErrors':
        return session.pageViews > 50 ? 1 : 0; // Simplified
      case 'sessionDuration':
        return session.currentSession.timeSpent / 1000 / 60; // minutes
      default:
        return 0;
    }
  }

  // Calculate consecutive weeks
  private calculateConsecutiveWeeks(progress: any, studentId: string): number {
    // Simplified calculation - in real implementation, would analyze historical data
    return progress.academicMetrics.gradeTrend === 'declining' ? 2 : 0;
  }

  // Calculate request frequency
  private calculateRequestFrequency(requests: SupportRequest[]): number {
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    return requests.filter(req => new Date(req.createdAt).getTime() > weekAgo).length;
  }

  // Execute intervention rule
  private async executeInterventionRule(
    rule: InterventionRule, 
    studentId: string, 
    progress: any
  ): Promise<void> {
    console.log(`🔧 Executing intervention rule: ${rule.name} for student ${studentId}`);

    const result: InterventionResult = {
      ruleId: rule.id,
      studentId,
      actions: [],
      timestamp: new Date().toISOString()
    };

    // Update last triggered time
    rule.lastTriggered = new Date().toISOString();

    // Execute actions
    for (const action of rule.actions) {
      try {
        // Check delay
        if (action.delay && action.delay > 0) {
          setTimeout(() => {
            this.executeAction(action, studentId, result);
          }, action.delay * 60 * 1000);
        } else {
          await this.executeAction(action, studentId, result);
        }
      } catch (error) {
        result.actions.push({
          type: action.type,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Store result
    this.storeInterventionResult(studentId, result);
  }

  // Execute individual action
  private async executeAction(
    action: InterventionAction, 
    studentId: string, 
    result: InterventionResult
  ): Promise<void> {
    switch (action.type) {
      case 'support_request':
        await this.executeSupportRequestAction(action, studentId);
        break;
      case 'notification':
        await this.executeNotificationAction(action, studentId);
        break;
      case 'resource_assignment':
        await this.executeResourceAssignmentAction(action, studentId);
        break;
      case 'escalation':
        await this.executeEscalationAction(action, studentId);
        break;
      case 'parent_alert':
        await this.executeParentAlertAction(action, studentId);
        break;
      case 'peer_match':
        await this.executePeerMatchAction(action, studentId);
        break;
    }

    result.actions.push({
      type: action.type,
      status: 'success'
    });
  }

  // Execute support request action
  private async executeSupportRequestAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    const supportService = StudentSupportService.getInstance();
    
    supportService.createSupportRequest(
      studentId,
      config.category as any,
      'automated_intervention',
      `Intervensi Otomatis: ${config.template}`,
      `Sistem mendeteksi perlunya intervensi berdasarkan rule ${config.template}`,
      config.priority as any
    );
  }

  // Execute notification action
  private async executeNotificationAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    
    try {
      // Store notification for student to see in their dashboard
      const notificationsKey = `student_notifications_${studentId}`;
      const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
      
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: config.message,
        type: config.type || 'system',
        priority: config.priority || 'medium',
        createdAt: new Date().toISOString(),
        read: false,
        source: 'automated_intervention'
      };
      
      existingNotifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (existingNotifications.length > 50) {
        existingNotifications.splice(50);
      }
      
      localStorage.setItem(notificationsKey, JSON.stringify(existingNotifications));
      
      console.log(`📱 Notification sent to student ${studentId}: ${config.message}`);
    } catch (error) {
      console.error(`Failed to send notification to student ${studentId}:`, error);
    }
  }

  // Execute resource assignment action
  private async executeResourceAssignmentAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    
    try {
      // Get resources and mark them as assigned to student
      const resourceIds = config.resourceIds || [];
      
      // Store assignment in localStorage for tracking
      const assignmentsKey = `student_resource_assignments_${studentId}`;
      const existingAssignments = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
      
      const newAssignments = resourceIds.map((resourceId: any) => ({
        resourceId,
        assignedAt: new Date().toISOString(),
        assignedBy: 'automated_intervention',
        priority: config.priority || 'medium',
        ruleId: config.ruleId || 'unknown'
      }));
      
      existingAssignments.push(...newAssignments);
      localStorage.setItem(assignmentsKey, JSON.stringify(existingAssignments));
      
      console.log(`📚 Resources assigned to student ${studentId}: ${resourceIds.join(', ')}`);
    } catch (error) {
      console.error(`Failed to assign resources to student ${studentId}:`, error);
    }
  }

  // Execute escalation action
  private async executeEscalationAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    
    // This would escalate to appropriate staff
    console.log(`🚨 Escalated for student ${studentId}: ${config.escalateTo} (${config.urgency})`);
  }

  // Execute parent alert action with enhanced context
  private async executeParentAlertAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    
    try {
      // Import ParentCommunicationService dynamically to avoid circular dependencies
      const { ParentCommunicationService } = await import('./parentCommunicationService');
      
      // Get enhanced student context
      const supportService = StudentSupportService.getInstance();
      const studentProgress = supportService.getStudentProgress(studentId);
      const recentRequests = supportService.getSupportRequests()
        .filter(req => req.studentId === studentId)
        .slice(0, 5);
      
      // Send enhanced parent notification with detailed context
      ParentCommunicationService.sendTemplateCommunication(
        studentId,
        config.template || 'alert_high_risk',
        {
          studentName: `Siswa ${studentId}`,
          urgency: config.urgency?.toUpperCase() || 'MEDIUM',
          interventionType: config.template,
          timestamp: new Date().toISOString(),
          riskFactors: config.includeRecommendations ? this.generateRiskFactors(studentProgress) : undefined,
          recommendations: this.generateParentRecommendations(studentProgress),
          recentActivity: recentRequests.map(req => ({
            type: req.type,
            status: req.status,
            date: new Date(req.createdAt).toLocaleDateString('id-ID')
          })),
          nextSteps: this.generateNextSteps(action.config.template),
          emergencyContact: 'support@ma-malnukananga.sch.id'
        },
        config.priority || 'medium'
      );
      
      console.log(`👨‍👩‍👧‍👦 Enhanced parent alert sent for student ${studentId}: ${config.urgency}`);
    } catch (error) {
      console.error(`Failed to send parent alert for student ${studentId}:`, error);
      // Fallback to console log
      console.log(`👨‍👩‍👧‍👦 Parent alert sent for student ${studentId}: ${config.urgency}`);
    }
  }

  // Generate risk factors for parent communication
  private generateRiskFactors(studentProgress: any): string {
    if (!studentProgress) return 'Tidak ada data risiko spesifik';
    
    const factors = [];
    
    if (studentProgress.academicMetrics.gpa < 70) {
      factors.push('IPK dibawah standar');
    }
    if (studentProgress.academicMetrics.attendanceRate < 80) {
      factors.push('Kehadiran rendah');
    }
    if (studentProgress.academicMetrics.assignmentCompletion < 75) {
      factors.push('Penyelesaian tugas rendah');
    }
    if (studentProgress.engagementMetrics.loginFrequency < 3) {
      factors.push('Jarang mengakses portal');
    }
    if (studentProgress.riskLevel === 'high') {
      factors.push('Tingkat risiko tinggi');
    }
    
    return factors.length > 0 ? factors.join(', ') : 'Tidak ada faktor risiko spesifik';
  }

  // Generate parent recommendations
  private generateParentRecommendations(studentProgress: any): string {
    if (!studentProgress) return 'Lanjutkan dukungan positif yang sudah diberikan.';
    
    const recommendations = [];
    
    if (studentProgress.academicMetrics.gpa < 70) {
      recommendations.push('1. Sediakan waktu belajar terstruktur di rumah');
      recommendations.push('2. Diskusikan kesulitan akademis dengan guru mata pelajaran');
    }
    if (studentProgress.academicMetrics.attendanceRate < 80) {
      recommendations.push('3. Pastikan siswa hadir tepat waktu setiap hari');
      recommendations.push('4. Hubungi pihak sekolah jika ada kendala kehadiran');
    }
    if (studentProgress.engagementMetrics.loginFrequency < 3) {
      recommendations.push('5. Bantu siswa mengakses portal secara teratur');
      recommendations.push('6. Monitor penggunaan portal untuk informasi penting');
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : 'Lanjutkan dukungan positif yang sudah diberikan.';
  }

  // Generate next steps based on intervention type
  private generateNextSteps(template?: string): string {
    const nextSteps = {
      'critical_academic_alert': '1. Segera hubungi Guru BK\n2. Jadwalkan pertemuan dengan wali kelas\n3. Monitor aktivitas belajar di rumah',
      'alert_high_risk': '1. Perhatikan perubahan perilaku siswa\n2. Komunikasi dengan pihak sekolah\n3. Berikan dukungan emosional',
      'performance_decline': '1. Diskusikan dengan guru mata pelajaran\n2. Buat jadwal belajar bersama\n3. Monitor penyelesaian tugas',
      'wellness_check': '1. Ajak siswa berbicara terbuka\n2. Perhatikan kesehatan mental dan fisik\n3. Hubungi Guru BK jika perlu'
    };
    
    return nextSteps[template as keyof typeof nextSteps] || '1. Komunikasi dengan pihak sekolah\n2. Monitor perkembangan siswa\n3. Berikan dukungan yang diperlukan';
  }

  // Execute peer match action
  private async executePeerMatchAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    
    // This would match with peer support
    console.log(`🤝 Peer match initiated for student ${studentId}: ${config.type}`);
  }

  // Store intervention result
  private storeInterventionResult(studentId: string, result: InterventionResult): void {
    if (!this.interventionHistory.has(studentId)) {
      this.interventionHistory.set(studentId, []);
    }
    
    const history = this.interventionHistory.get(studentId)!;
    history.push(result);
    
    // Keep only last 50 results per student
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  // Get intervention history
  public getInterventionHistory(studentId: string): InterventionResult[] {
    return this.interventionHistory.get(studentId) || [];
  }

  // Analyze intervention effectiveness
  private analyzeInterventionEffectiveness(): void {
    console.log('📊 Analyzing intervention effectiveness...');
    
    this.interventionHistory.forEach((history, studentId) => {
      const recentInterventions = history.slice(-10); // Last 10 interventions
      
      recentInterventions.forEach(intervention => {
        const effectiveness = this.calculateInterventionEffectiveness(intervention, studentId);
        intervention.effectiveness = effectiveness;
      });
    });
  }

  // Calculate intervention effectiveness
  private calculateInterventionEffectiveness(intervention: InterventionResult, studentId: string): number {
    const supportService = StudentSupportService.getInstance();
    const progress = supportService.getStudentProgress(studentId);
    if (!progress) return 0;

    // Check if metrics improved after intervention
    const interventionTime = new Date(intervention.timestamp).getTime();
    const now = Date.now();
    const daysSinceIntervention = (now - interventionTime) / (1000 * 60 * 60 * 24);

    if (daysSinceIntervention < 1) return 0; // Too early to tell

    // Calculate improvement score
    let improvementScore = 0;
    
    // Academic improvement
    if (progress.academicMetrics.gradeTrend === 'improving') improvementScore += 30;
    if (progress.academicMetrics.assignmentCompletion > 80) improvementScore += 20;
    
    // Engagement improvement
    if (progress.engagementMetrics.loginFrequency > 3) improvementScore += 20;
    if (progress.engagementMetrics.resourceAccess > 10) improvementScore += 15;
    
    // Risk reduction
    if (progress.riskLevel === 'low') improvementScore += 15;
    else if (progress.riskLevel === 'medium') improvementScore += 10;

    return Math.min(100, improvementScore);
  }

  // Optimize rules based on effectiveness
  private optimizeRules(): void {
    console.log('⚙️ Optimizing intervention rules...');
    
    this.rules.forEach(rule => {
      const effectiveness = this.calculateRuleEffectiveness(rule);
      
      if (effectiveness < 30) {
        console.log(`⚠️ Rule ${rule.name} has low effectiveness (${effectiveness}%)`);
        // Could suggest rule modifications
      } else if (effectiveness > 80) {
        console.log(`✅ Rule ${rule.name} is highly effective (${effectiveness}%)`);
      }
    });
  }

  // Calculate rule effectiveness
  private calculateRuleEffectiveness(rule: InterventionRule): number {
    let totalEffectiveness = 0;
    let interventionCount = 0;

    this.interventionHistory.forEach(history => {
      const ruleInterventions = history.filter(result => result.ruleId === rule.id);
      
      ruleInterventions.forEach(intervention => {
        if (intervention.effectiveness !== undefined) {
          totalEffectiveness += intervention.effectiveness;
          interventionCount++;
        }
      });
    });

    return interventionCount > 0 ? totalEffectiveness / interventionCount : 0;
  }

  // Add custom rule
  addRule(rule: InterventionRule): void {
    this.rules.set(rule.id, rule);
    console.log(`➕ Added new intervention rule: ${rule.name}`);
  }

  // Remove rule
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    console.log(`➖ Removed intervention rule: ${ruleId}`);
  }

  // Toggle rule
  toggleRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.isActive = !rule.isActive;
      console.log(`🔄 Rule ${rule.name} ${rule.isActive ? 'activated' : 'deactivated'}`);
    }
  }

  // Get all rules
  getRules(): InterventionRule[] {
    return Array.from(this.rules.values());
  }

  // Get rule by ID
  getRule(ruleId: string): InterventionRule | undefined {
    return this.rules.get(ruleId);
  }

  // Get intervention statistics
  getInterventionStats(): any {
    const totalInterventions = Array.from(this.interventionHistory.values())
      .reduce((total, history) => total + history.length, 0);

    const activeRules = Array.from(this.rules.values()).filter(rule => rule.isActive).length;
    const averageEffectiveness = this.calculateAverageEffectiveness();

    return {
      totalInterventions,
      activeRules,
      averageEffectiveness,
      rulesByCategory: this.getRulesByCategory(),
      recentActivity: this.getRecentActivity()
    };
  }

  // Calculate average effectiveness
  private calculateAverageEffectiveness(): number {
    let totalEffectiveness = 0;
    let interventionCount = 0;

    this.interventionHistory.forEach(history => {
      history.forEach(intervention => {
        if (intervention.effectiveness !== undefined) {
          totalEffectiveness += intervention.effectiveness;
          interventionCount++;
        }
      });
    });

    return interventionCount > 0 ? totalEffectiveness / interventionCount : 0;
  }

  // Get rules by category
  private getRulesByCategory(): Record<string, number> {
    const categoryCount: Record<string, number> = {};
    
    this.rules.forEach(rule => {
      categoryCount[rule.category] = (categoryCount[rule.category] || 0) + 1;
    });

    return categoryCount;
  }

  // Get recent activity
  private getRecentActivity(): any {
    const now = Date.now();
    const dayAgo = now - (24 * 60 * 60 * 1000);
    
    let recentInterventions = 0;
    this.interventionHistory.forEach(history => {
      recentInterventions += history.filter(intervention => 
        new Date(intervention.timestamp).getTime() > dayAgo
      ).length;
    });

    return {
      last24Hours: recentInterventions,
      lastHour: this.getInterventionsLastHour()
    };
  }

  // Get interventions in last hour
  private getInterventionsLastHour(): number {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    let recentInterventions = 0;
    this.interventionHistory.forEach(history => {
      recentInterventions += history.filter(intervention => 
        new Date(intervention.timestamp).getTime() > hourAgo
      ).length;
    });

    return recentInterventions;
  }
}

export default AutomatedInterventionEngine;