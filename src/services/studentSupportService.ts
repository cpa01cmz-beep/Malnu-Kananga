// Provides 24/7 automated support for students

export interface SupportTicket {
  id: string;
  studentId: string;
  category: 'academic' | 'technical' | 'administrative' | 'behavioral';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  timestamp: string;
  lastUpdated: string;
  assignedTo?: string;
  resolution?: string;
  tags: string[];
  attachments?: string[];
}

export interface SupportResource {
  id: string;
  title: string;
  description: string;
  category: 'guide' | 'tutorial' | 'faq' | 'template' | 'tool';
  type: 'text' | 'video' | 'interactive' | 'download';
  url?: string;
  content?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  rating: number;
  usageCount: number;
}

export interface StudentProgress {
  studentId: string;
  academicMetrics: {
    gpa: number;
    attendanceRate: number;
    assignmentCompletion: number;
    subjectPerformance: Record<string, number>;
  };
  engagementMetrics: {
    portalLoginFrequency: number;
    featureUsage: Record<string, number>;
    supportRequestsCount: number;
    lastActiveDate: string;
  };
  riskFactors: {
    lowGrades: boolean;
    poorAttendance: boolean;
    lowEngagement: boolean;
    frequentSupportRequests: boolean;
  };
  recommendations: string[];
  lastUpdated: string;
}

export interface SupportAutomation {
  id: string;
  name: string;
  description: string;
  trigger: 'schedule' | 'event' | 'threshold';
  triggerConfig: any;
  actions: Array<{
    type: 'notification' | 'ticket_creation' | 'resource_assignment' | 'escalation';
    config: any;
  }>;
  isActive: boolean;
  lastRun: string;
}

class StudentSupportService {
  private static TICKETS_KEY = 'malnu_support_tickets';
  private static RESOURCES_KEY = 'malnu_support_resources';
  private static PROGRESS_KEY = 'malnu_student_progress';
  private static AUTOMATION_KEY = 'malnu_support_automation';
  private static KNOWLEDGE_BASE_KEY = 'malnu_knowledge_base';

  // Initialize support system
  static initialize(): void {
    this.setupKnowledgeBase();
    this.setupAutomationRules();
    this.initializeProgressTracking();
    this.startAutomatedMonitoring();
  }

  // Setup knowledge base with common issues and solutions
  private static setupKnowledgeBase(): void {
    const existingKB = localStorage.getItem(this.KNOWLEDGE_BASE_KEY);
    if (existingKB) return;

    const knowledgeBase = {
      commonIssues: [
        {
          id: 'login_issues',
          category: 'technical',
          keywords: ['login', 'masuk', 'akses', 'password', 'lupa'],
          solution: 'Gunakan fitur Magic Link untuk login tanpa password. Masukkan email sekolah dan klik "Kirim Magic Link". Periksa email Anda dan klik link yang diterima.',
          automatedResponse: true,
          escalationThreshold: 3
        },
        {
          id: 'grade_not_showing',
          category: 'academic',
          keywords: ['nilai', 'grade', 'tidak muncul', 'kosong'],
          solution: 'Refresh halaman dan pastikan koneksi internet stabil. Jika masih tidak muncul, hubungi guru mata pelajaran terkait.',
          automatedResponse: true,
          escalationThreshold: 2
        },
        {
          id: 'schedule_conflict',
          category: 'academic',
          keywords: ['jadwal', 'schedule', 'bentrok', 'konflik'],
          solution: 'Laporkan konflik jadwal ke bagian administrasi. Sertakan mata pelajaran, waktu, dan guru yang terlibat.',
          automatedResponse: false,
          escalationThreshold: 1
        },
        {
          id: 'notification_not_working',
          category: 'technical',
          keywords: ['notifikasi', 'notification', 'tidak muncul', 'mati'],
          solution: 'Periksa pengaturan notifikasi browser dan pastikan notifikasi diizinkan. Restart browser jika perlu.',
          automatedResponse: true,
          escalationThreshold: 2
        }
      ],
      faq: [
        {
          question: 'Bagaimana cara melihat nilai semester lalu?',
          answer: 'Klik tab "Nilai" di dashboard, pilih semester yang diinginkan dari dropdown filter.',
          category: 'academic',
          views: 0
        },
        {
          question: 'Apakah portal bisa diakses offline?',
          answer: 'Ya, install sebagai PWA untuk akses offline pada jadwal dan pengumuman yang sudah di-load.',
          category: 'technical',
          views: 0
        },
        {
          question: 'Siapa yang dihubungi untuk masalah akademik?',
          answer: 'Hubungi Guru BK untuk bimbingan akademik atau guru mata pelajaran untuk masalah spesifik.',
          category: 'administrative',
          views: 0
        }
      ]
    };

    localStorage.setItem(this.KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase));
  }

  // Setup automation rules for proactive support
  private static setupAutomationRules(): void {
    const existingRules = localStorage.getItem(this.AUTOMATION_KEY);
    if (existingRules) return;

    const automationRules: SupportAutomation[] = [
      {
        id: 'low_grade_alert',
        name: 'Low Grade Alert',
        description: 'Monitor student grades and create support tickets for low performance',
        trigger: 'threshold',
        triggerConfig: {
          metric: 'grade',
          threshold: 70,
          consecutivePeriods: 2
        },
        actions: [
          {
            type: 'notification',
            config: {
              message: 'Kami mendeteksi penurunan nilai. Tim support siap membantu!',
              type: 'academic'
            }
          },
          {
            type: 'ticket_creation',
            config: {
              category: 'academic',
              priority: 'medium',
              template: 'low_grade'
            }
          }
        ],
        isActive: true,
        lastRun: ''
      },
      {
        id: 'attendance_monitor',
        name: 'Attendance Monitor',
        description: 'Monitor attendance and create interventions for poor attendance',
        trigger: 'threshold',
        triggerConfig: {
          metric: 'attendance',
          threshold: 80,
          timeFrame: 'weekly'
        },
        actions: [
          {
            type: 'notification',
            config: {
              message: 'Kehadiran Anda perlu perhatian. Hubungi kami jika ada kendala.',
              type: 'academic'
            }
          },
          {
            type: 'escalation',
            config: {
              escalateTo: 'guidance_counselor',
              delay: 24 // hours
            }
          }
        ],
        isActive: true,
        lastRun: ''
      },
      {
        id: 'engagement_tracker',
        name: 'Engagement Tracker',
        description: 'Track portal engagement and provide resources for inactive students',
        trigger: 'threshold',
        triggerConfig: {
          metric: 'last_login',
          threshold: 7, // days
          timeFrame: 'daily'
        },
        actions: [
          {
            type: 'notification',
            config: {
              message: 'Kami merindukan kehadiran Anda! Ada banyak informasi penting di portal.',
              type: 'system'
            }
          },
          {
            type: 'resource_assignment',
            config: {
              resourceIds: ['portal_tutorial', 'engagement_guide']
            }
          }
        ],
        isActive: true,
        lastRun: ''
      }
    ];

    localStorage.setItem(this.AUTOMATION_KEY, JSON.stringify(automationRules));
  }

  // Create support ticket
  static createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'timestamp' | 'lastUpdated' | 'status'>): SupportTicket {
    const tickets = this.getSupportTickets();
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'open'
    };

    tickets.unshift(newTicket);
    this.saveSupportTickets(tickets);

    // Process ticket automatically
    this.processTicketAutomatically(newTicket);

    return newTicket;
  }

  // Get all support tickets
  static getSupportTickets(): SupportTicket[] {
    const tickets = localStorage.getItem(this.TICKETS_KEY);
    return tickets ? JSON.parse(tickets) : [];
  }

  // Save support tickets
  private static saveSupportTickets(tickets: SupportTicket[]): void {
    localStorage.setItem(this.TICKETS_KEY, JSON.stringify(tickets));
  }

  // Process ticket automatically
  private static processTicketAutomatically(ticket: SupportTicket): void {
    const knowledgeBase = JSON.parse(localStorage.getItem(this.KNOWLEDGE_BASE_KEY) || '{}');
    
    // Try to find automated solution
    const matchingIssue = knowledgeBase.commonIssues?.find((issue: any) => 
      issue.keywords.some((keyword: string) => 
        ticket.subject.toLowerCase().includes(keyword) || 
        ticket.description.toLowerCase().includes(keyword)
      )
    );

    if (matchingIssue && matchingIssue.automatedResponse) {
      // Update ticket with automated response
      const tickets = this.getSupportTickets();
      const ticketIndex = tickets.findIndex(t => t.id === ticket.id);
      
      if (ticketIndex !== -1) {
        tickets[ticketIndex].status = 'in_progress';
        tickets[ticketIndex].lastUpdated = new Date().toISOString();
        tickets[ticketIndex].resolution = matchingIssue.solution;
        this.saveSupportTickets(tickets);

        // Send automated response notification
        this.sendAutomatedResponse(ticket, matchingIssue.solution);
      }
    }

    // Check if escalation is needed
    if (matchingIssue && this.shouldEscalate(ticket, matchingIssue)) {
      this.escalateTicket(ticket);
    }
  }

  // Check if ticket should be escalated
  private static shouldEscalate(ticket: SupportTicket, issue: any): boolean {
    const similarTickets = this.getSupportTickets().filter(t => 
      t.category === ticket.category && 
      t.studentId === ticket.studentId &&
      t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
    );

    return similarTickets.length >= issue.escalationThreshold;
  }

  // Escalate ticket to human support
  private static escalateTicket(ticket: SupportTicket): void {
    const tickets = this.getSupportTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticket.id);
    
    if (ticketIndex !== -1) {
      tickets[ticketIndex].status = 'escalated';
      tickets[ticketIndex].priority = 'high';
      tickets[ticketIndex].lastUpdated = new Date().toISOString();
      this.saveSupportTickets(tickets);

      // Notify support team
      this.notifySupportTeam(tickets[ticketIndex]);
    }
  }

  // Send automated response
  private static sendAutomatedResponse(ticket: SupportTicket, solution: string): void {
    // This would integrate with the notification system
    console.log(`Automated response for ticket ${ticket.id}: ${solution}`);
  }

  // Notify support team
  private static notifySupportTeam(ticket: SupportTicket): void {
    // This would send notification to human support staff
    console.log(`Escalated ticket ${ticket.id} requires human intervention`);
  }

  // Update student progress
  static updateStudentProgress(studentId: string, progress: Partial<StudentProgress>): void {
    const allProgress = this.getAllStudentProgress();
    const existingProgress = allProgress[studentId] || {
      studentId,
      academicMetrics: {
        gpa: 0,
        attendanceRate: 0,
        assignmentCompletion: 0,
        subjectPerformance: {}
      },
      engagementMetrics: {
        portalLoginFrequency: 0,
        featureUsage: {},
        supportRequestsCount: 0,
        lastActiveDate: new Date().toISOString()
      },
      riskFactors: {
        lowGrades: false,
        poorAttendance: false,
        lowEngagement: false,
        frequentSupportRequests: false
      },
      recommendations: [],
      lastUpdated: new Date().toISOString()
    };

    const updatedProgress = {
      ...existingProgress,
      ...progress,
      lastUpdated: new Date().toISOString()
    };

    // Update risk factors
    updatedProgress.riskFactors = this.assessRiskFactors(updatedProgress);

    // Generate recommendations
    updatedProgress.recommendations = this.generateRecommendations(updatedProgress);

    allProgress[studentId] = updatedProgress;
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress));

    // Trigger automation rules
    this.checkAutomationRules(updatedProgress);
  }

  // Get all student progress
  static getAllStudentProgress(): Record<string, StudentProgress> {
    const progress = localStorage.getItem(this.PROGRESS_KEY);
    return progress ? JSON.parse(progress) : {};
  }

  // Get student progress
  static getStudentProgress(studentId: string): StudentProgress | null {
    const allProgress = this.getAllStudentProgress();
    return allProgress[studentId] || null;
  }

  // Assess risk factors
  private static assessRiskFactors(progress: StudentProgress): StudentProgress['riskFactors'] {
    return {
      lowGrades: progress.academicMetrics.gpa < 70,
      poorAttendance: progress.academicMetrics.attendanceRate < 80,
      lowEngagement: progress.engagementMetrics.portalLoginFrequency < 3, // per week
      frequentSupportRequests: progress.engagementMetrics.supportRequestsCount > 5 // per month
    };
  }

  // Generate recommendations
  private static generateRecommendations(progress: StudentProgress): string[] {
    const recommendations: string[] = [];

    if (progress.riskFactors.lowGrades) {
      recommendations.push('Pertimbangkan untuk mengikuti bimbingan belajar tambahan');
      recommendations.push('Hubungi guru mata pelajaran untuk konsultasi');
    }

    if (progress.riskFactors.poorAttendance) {
      recommendations.push('Pastikan jadwal kehadiran konsisten');
      recommendations.push('Hubungi pihak sekolah jika ada kendala transportasi');
    }

    if (progress.riskFactors.lowEngagement) {
      recommendations.push('Manfaatkan fitur portal secara maksimal');
      recommendations.push('Ikuti kegiatan ekstrakurikuler yang tersedia');
    }

    if (progress.riskFactors.frequentSupportRequests) {
      recommendations.push('Ikuti tutorial penggunaan portal yang tersedia');
      recommendations.push('Hubungi Guru BK untuk bimbingan teknis');
    }

    return recommendations;
  }

  // Check automation rules
  private static checkAutomationRules(progress: StudentProgress): void {
    const rules = JSON.parse(localStorage.getItem(this.AUTOMATION_KEY) || '[]');
    
    rules.forEach((rule: SupportAutomation) => {
      if (!rule.isActive) return;

      if (this.shouldTriggerRule(rule, progress)) {
        this.executeAutomationRule(rule, progress);
      }
    });
  }

  // Check if rule should trigger
  private static shouldTriggerRule(rule: SupportAutomation, progress: StudentProgress): boolean {
    const { triggerConfig } = rule;

    switch (rule.trigger) {
      case 'threshold':
        if (triggerConfig.metric === 'grade') {
          return progress.academicMetrics.gpa < triggerConfig.threshold;
        }
        if (triggerConfig.metric === 'attendance') {
          return progress.academicMetrics.attendanceRate < triggerConfig.threshold;
        }
        if (triggerConfig.metric === 'last_login') {
          const daysSinceLogin = Math.floor(
            (Date.now() - new Date(progress.engagementMetrics.lastActiveDate).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          return daysSinceLogin > triggerConfig.threshold;
        }
        break;
    }

    return false;
  }

  // Execute automation rule
  private static executeAutomationRule(rule: SupportAutomation, progress: StudentProgress): void {
    rule.actions.forEach(action => {
      switch (action.type) {
        case 'notification':
          // Send notification via notification service
          console.log(`Notification: ${action.config.message}`);
          break;
        case 'ticket_creation':
          this.createSupportTicket({
            studentId: progress.studentId,
            category: action.config.category,
            priority: action.config.priority,
            subject: `Automated: ${rule.name}`,
            description: `System detected: ${rule.description}`,
            tags: ['automated', rule.id]
          });
          break;
        case 'escalation':
          // Escalate to appropriate staff
          console.log(`Escalated to: ${action.config.escalateTo}`);
          break;
      }
    });

    // Update last run time
    rule.lastRun = new Date().toISOString();
    const rules = JSON.parse(localStorage.getItem(this.AUTOMATION_KEY) || '[]');
    const ruleIndex = rules.findIndex((r: SupportAutomation) => r.id === rule.id);
    if (ruleIndex !== -1) {
      rules[ruleIndex] = rule;
      localStorage.setItem(this.AUTOMATION_KEY, JSON.stringify(rules));
    }
  }

  // Initialize progress tracking
  private static initializeProgressTracking(): void {
    // Track portal usage
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        const studentId = 'current_student'; // This would come from auth
        const currentProgress = this.getStudentProgress(studentId);
        
        if (currentProgress) {
          currentProgress.engagementMetrics.lastActiveDate = new Date().toISOString();
          currentProgress.engagementMetrics.portalLoginFrequency += 1;
          this.updateStudentProgress(studentId, currentProgress);
        }
      });
    }
  }

  // Start automated monitoring
  private static startAutomatedMonitoring(): void {
    // Check for at-risk students every hour
    setInterval(() => {
      this.monitorAtRiskStudents();
    }, 60 * 60 * 1000);

    // Update engagement metrics every 5 minutes
    setInterval(() => {
      this.updateEngagementMetrics();
    }, 5 * 60 * 1000);
  }

  // Monitor at-risk students
  private static monitorAtRiskStudents(): void {
    const allProgress = this.getAllStudentProgress();
    
    Object.values(allProgress).forEach(progress => {
      const hasRiskFactors = Object.values(progress.riskFactors).some(risk => risk);
      
      if (hasRiskFactors) {
        // Create intervention ticket
        this.createSupportTicket({
          studentId: progress.studentId,
          category: 'academic',
          priority: 'medium',
          subject: 'At-Risk Student Intervention',
          description: `Student identified as at-risk: ${progress.recommendations.join(', ')}`,
          tags: ['at-risk', 'automated', 'intervention']
        });
      }
    });
  }

  // Update engagement metrics
  private static updateEngagementMetrics(): void {
    // This would track real-time engagement
    console.log('Updating engagement metrics...');
  }

  // Get support resources
  static getSupportResources(category?: string): SupportResource[] {
    const resources = localStorage.getItem(this.RESOURCES_KEY);
    let allResources: SupportResource[] = resources ? JSON.parse(resources) : [];

    if (category) {
      allResources = allResources.filter(r => r.category === category);
    }

    return allResources.sort((a, b) => b.rating - a.rating);
  }

  // Add support resource
  static addSupportResource(resource: Omit<SupportResource, 'id' | 'usageCount' | 'rating'>): SupportResource {
    const resources = this.getSupportResources();
    const newResource: SupportResource = {
      ...resource,
      id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      usageCount: 0,
      rating: 0
    };

    resources.push(newResource);
    localStorage.setItem(this.RESOURCES_KEY, JSON.stringify(resources));

    return newResource;
  }

  // Rate support resource
  static rateResource(resourceId: string, rating: number): void {
    const resources = this.getSupportResources();
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    
    if (resourceIndex !== -1) {
      resources[resourceIndex].usageCount += 1;
      // Update average rating
      const currentRating = resources[resourceIndex].rating;
      const usageCount = resources[resourceIndex].usageCount;
      resources[resourceIndex].rating = ((currentRating * (usageCount - 1)) + rating) / usageCount;
      
      localStorage.setItem(this.RESOURCES_KEY, JSON.stringify(resources));
    }
  }

  // Get support analytics
  static getSupportAnalytics(): any {
    const tickets = this.getSupportTickets();
    const allProgress = this.getAllStudentProgress();

    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      escalatedTickets: tickets.filter(t => t.status === 'escalated').length,
      averageResolutionTime: this.calculateAverageResolutionTime(tickets),
      categoryBreakdown: this.getCategoryBreakdown(tickets),
      atRiskStudents: Object.values(allProgress).filter(p => 
        Object.values(p.riskFactors).some(risk => risk)
      ).length,
      totalStudents: Object.keys(allProgress).length
    };
  }

  // Calculate average resolution time
  private static calculateAverageResolutionTime(tickets: SupportTicket[]): number {
    const resolvedTickets = tickets.filter(t => t.status === 'resolved');
    
    if (resolvedTickets.length === 0) return 0;

    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.timestamp).getTime();
      const resolved = new Date(ticket.lastUpdated).getTime();
      return sum + (resolved - created);
    }, 0);

    return totalTime / resolvedTickets.length / (1000 * 60 * 60); // hours
  }

  // Get category breakdown
  private static getCategoryBreakdown(tickets: SupportTicket[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      breakdown[ticket.category] = (breakdown[ticket.category] || 0) + 1;
    });

    return breakdown;
  }

  // Generate support report
  static generateSupportReport(timeFrame: 'daily' | 'weekly' | 'monthly'): any {
    const analytics = this.getSupportAnalytics();
    const tickets = this.getSupportTickets();
    const resources = this.getSupportResources();

    const now = new Date();
    let startDate: Date;

    switch (timeFrame) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodTickets = tickets.filter(t => 
      new Date(t.timestamp) >= startDate
    );

    return {
      timeFrame,
      period: startDate.toISOString().split('T')[0] + ' to ' + now.toISOString().split('T')[0],
      totalTickets: periodTickets.length,
      resolvedTickets: periodTickets.filter(t => t.status === 'resolved').length,
      averageResolutionTime: this.calculateAverageResolutionTime(periodTickets),
      topIssues: this.getTopIssues(periodTickets),
      studentSatisfaction: this.calculateStudentSatisfaction(resources),
      recommendations: this.generateSystemRecommendations(analytics)
    };
  }

  // Get top issues
  private static getTopIssues(tickets: SupportTicket[]): Array<{subject: string, count: number}> {
    const issueCounts: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      issueCounts[ticket.subject] = (issueCounts[ticket.subject] || 0) + 1;
    });

    return Object.entries(issueCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Calculate student satisfaction
  private static calculateStudentSatisfaction(resources: SupportResource[]): number {
    if (resources.length === 0) return 0;

    const totalRating = resources.reduce((sum, resource) => sum + resource.rating, 0);
    return totalRating / resources.length;
  }

  // Generate system recommendations
  private static generateSystemRecommendations(analytics: any): string[] {
    const recommendations: string[] = [];

    if (analytics.escalatedTickets > analytics.totalTickets * 0.2) {
      recommendations.push('Pertimbangkan untuk menambah staf support');
    }

    if (analytics.averageResolutionTime > 24) {
      recommendations.push('Optimalkan proses resolusi ticket');
    }

    if (analytics.atRiskStudents > analytics.totalStudents * 0.3) {
      recommendations.push('Tingkatkan program intervensi siswa');
    }

    return recommendations;
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  StudentSupportService.initialize();
}

export { StudentSupportService };