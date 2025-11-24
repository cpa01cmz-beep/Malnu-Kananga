// Automated Intervention Engine
// Mesin otomasi untuk intervensi siswa berbasis AI

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

  // Initialize default intervention rules
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
              autoAssign: 'guidance_counselor'
            }
          },
          {
            type: 'parent_alert',
            config: {
              urgency: 'immediate',
              template: 'critical_academic_alert',
              includeRecommendations: true
            },
            delay: 5
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['academic_recovery_plan', 'emergency_study_guide'],
              priority: 'high'
            }
          }
        ],
        priority: 'critical',
        isActive: true,
        cooldownPeriod: 1440 // 24 hours
      },
      {
        id: 'declining_performance',
        name: 'Declining Performance Alert',
        description: 'Deteksi dan intervensi untuk penurunan performa',
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
              template: 'performance_decline'
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['study_improvement_guide', 'time_management_tips'],
              priority: 'medium'
            }
          },
          {
            type: 'notification',
            config: {
              message: 'Kami mendeteksi penurunan performa. Tim support siap membantu!',
              type: 'support'
            }
          }
        ],
        priority: 'high',
        isActive: true,
        cooldownPeriod: 720 // 12 hours
      },
      {
        id: 'low_engagement',
        name: 'Low Engagement Intervention',
        description: 'Intervensi untuk siswa dengan engagement rendah',
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
              message: 'Kami merindukan kehadiran Anda! Ada banyak informasi penting di portal.',
              type: 'engagement'
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['portal_tutorial', 'engagement_guide'],
              priority: 'low'
            }
          },
          {
            type: 'peer_match',
            config: {
              type: 'study_buddy',
              criteria: 'similar_courses'
            },
            delay: 60
          }
        ],
        priority: 'medium',
        isActive: true,
        cooldownPeriod: 480 // 8 hours
      },
      {
        id: 'technical_difficulties',
        name: 'Technical Difficulties Detection',
        description: 'Deteksi masalah teknis dan bantuan otomatis',
        category: 'technical',
        trigger: {
          type: 'anomaly',
          conditions: [
            { metric: 'failedLogins', operator: '>', value: 3 },
            { metric: 'pageErrors', operator: '>', value: 5 },
            { metric: 'sessionDuration', operator: '<', value: 60 }
          ]
        },
        actions: [
          {
            type: 'support_request',
            config: {
              priority: 'medium',
              category: 'technical',
              template: 'technical_difficulties'
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['troubleshooting_guide', 'contact_support'],
              priority: 'medium'
            }
          }
        ],
        priority: 'medium',
        isActive: true,
        cooldownPeriod: 240 // 4 hours
      },
      {
        id: 'wellness_check',
        name: 'Wellness Check Protocol',
        description: 'Protocol kesehatan mental dan kesejahteraan',
        category: 'wellness',
        trigger: {
          type: 'pattern',
          conditions: [
            { metric: 'supportRequests', operator: '>', value: 5 },
            { metric: 'stressIndicators', operator: '>', value: 3 },
            { metric: 'isolationScore', operator: '>', value: 7 }
          ]
        },
        actions: [
          {
            type: 'support_request',
            config: {
              priority: 'high',
              category: 'personal',
              template: 'wellness_check',
              confidential: true
            }
          },
          {
            type: 'escalation',
            config: {
              escalateTo: 'counselor',
              urgency: 'soon',
              reason: 'wellness_concern'
            }
          }
        ],
        priority: 'high',
        isActive: true,
        cooldownPeriod: 1440 // 24 hours
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
    const allProgress = StudentSupportService.getAllStudentProgress();
    
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
    const requests = StudentSupportService.getSupportRequests()
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
    
    StudentSupportService.createSupportRequest(
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
    
    // This would integrate with notification system
    console.log(`📱 Notification sent to student ${studentId}: ${config.message}`);
  }

  // Execute resource assignment action
  private async executeResourceAssignmentAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    
    // This would assign resources to student
    console.log(`📚 Resources assigned to student ${studentId}: ${config.resourceIds.join(', ')}`);
  }

  // Execute escalation action
  private async executeEscalationAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    
    // This would escalate to appropriate staff
    console.log(`🚨 Escalated for student ${studentId}: ${config.escalateTo} (${config.urgency})`);
  }

  // Execute parent alert action
  private async executeParentAlertAction(action: InterventionAction, studentId: string): Promise<void> {
    const config = action.config;
    
    // This would send alert to parents
    console.log(`👨‍👩‍👧‍👦 Parent alert sent for student ${studentId}: ${config.urgency}`);
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
  private getInterventionHistory(studentId: string): InterventionResult[] {
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
    const progress = StudentSupportService.getStudentProgress(studentId);
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