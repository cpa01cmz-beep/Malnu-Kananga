// Provides 24/7 automated support for students

import { ParentCommunicationService } from './parentCommunicationService';

export interface SupportRequest {
  id: string;
  studentId: string;
  type: 'academic' | 'technical' | 'administrative' | 'personal';
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  tags?: string[];
}

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
  content: string;
  category: string;
  type: 'guide' | 'video' | 'document' | 'tool';
  url?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  usageCount?: number;
  description?: string;
  estimatedTime?: number;
}

export interface StudentProgress {
  studentId: string;
  academicMetrics: {
    gpa: number;
    gradeTrend: 'improving' | 'stable' | 'declining';
    attendanceRate: number;
    assignmentCompletion: number;
    subjectPerformance?: Record<string, number>;
  };
  engagementMetrics: {
    loginFrequency: number;
    resourceAccess: number;
    supportRequests: number;
    participationScore: number;
    featureUsage?: Record<string, number>;
    lastActiveDate?: string;
  };
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
  riskFactors?: string[];
  recommendations?: string[];
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
  private static instance: StudentSupportService;
  private REQUESTS_KEY = 'malnu_support_requests';
  private RESOURCES_KEY = 'malnu_support_resources';
  private PROGRESS_KEY = 'malnu_student_progress';
  private AUTOMATION_KEY = 'malnu_support_automation';
  private KNOWLEDGE_BASE_KEY = 'malnu_knowledge_base';

  private constructor() {}

  static getInstance(): StudentSupportService {
    if (!StudentSupportService.instance) {
      StudentSupportService.instance = new StudentSupportService();
    }
    return StudentSupportService.instance;
  }

  // Initialize support system
  initialize(): void {
    this.setupKnowledgeBase();
    this.setupAutomationRules();
    this.initializeProgressTracking();
    this.startAutomatedMonitoring();
  }

  // Setup knowledge base with common issues and solutions
  private setupKnowledgeBase(): void {
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
  private setupAutomationRules(): void {
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

  // Create support request
  static createSupportRequest(
    studentId: string,
    type: SupportRequest['type'],
    category: string,
    title: string,
    description: string,
    priority: SupportRequest['priority']
  ): SupportRequest {
    const requests = this.getSupportRequests();
    const newRequest: SupportRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      type,
      category,
      title,
      description,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };

    requests.unshift(newRequest);
    this.saveSupportRequests(requests);

    // Process request automatically
    this.processRequestAutomatically(newRequest);

    return newRequest;
  }

  // Get all support requests
  static getSupportRequests(): SupportRequest[] {
    const requests = localStorage.getItem(this.REQUESTS_KEY);
    return requests ? JSON.parse(requests) : [];
  }

  // Save support requests
  private static saveSupportRequests(requests: SupportRequest[]): void {
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
  }

  // Process request automatically with AI integration
  static async processRequestAutomatically(request: SupportRequest): Promise<void> {
    try {
      // Get AI-powered response
      const aiResponse = await this.getAIResponse(request);
      
      // Update request with AI response
      const requests = this.getSupportRequests();
      const requestIndex = requests.findIndex(r => r.id === request.id);
      
      if (requestIndex !== -1) {
        requests[requestIndex].status = aiResponse.confidence > 0.7 ? 'in_progress' : 'pending';
        requests[requestIndex].updatedAt = new Date().toISOString();
        requests[requestIndex].resolution = aiResponse.response;
        requests[requestIndex].tags = [...(requests[requestIndex].tags || []), aiResponse.category];
        this.saveSupportRequests(requests);

        // Send automated response notification
        this.sendAutomatedResponse(request, aiResponse.response);
        
        // If confidence is low, escalate to human
        if (aiResponse.confidence < 0.7) {
          this.escalateRequest(request);
        }
      }
    } catch (error) {
      console.error('AI processing failed:', error);
      // Fallback to knowledge base
      this.processWithKnowledgeBase(request);
    }
  }

  // Get AI response from worker with enhanced context and fallback
  private static async getAIResponse(request: SupportRequest): Promise<{
    response: string;
    category: string;
    confidence: number;
    contextUsed: boolean;
  }> {
    const studentProgress = this.getStudentProgress(request.studentId);
    
    try {
      const response = await fetch('/api/student-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: request.studentId,
          message: `${request.title}\n\n${request.description}`,
          category: request.type,
          context: {
            requestType: request.type,
            priority: request.priority,
            studentProgress: studentProgress,
            requestHistory: this.getSupportRequests()
              .filter(r => r.studentId === request.studentId)
              .slice(0, 3),
            systemContext: {
              timestamp: new Date().toISOString(),
              language: 'id-ID',
              schoolName: 'MA Malnu Kananga',
              supportLevel: 'automated'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Validate AI response
      if (!result.response || !result.category || typeof result.confidence !== 'number') {
        throw new Error('Invalid AI response format');
      }

      return result;
    } catch (error) {
      console.warn('AI service unavailable, using enhanced fallback:', error);
      return this.getEnhancedFallbackResponse(request, studentProgress);
    }
  }

  // Enhanced fallback response system
  private static getEnhancedFallbackResponse(request: SupportRequest, studentProgress: StudentProgress | null): {
    response: string;
    category: string;
    confidence: number;
    contextUsed: boolean;
  } {
    const fallbackResponses = {
      academic: {
        login: {
          response: "Untuk masuk ke portal, gunakan fitur Magic Link. Masukkan email sekolah Anda dan periksa email untuk link masuk. Jika tidak menerima email, periksa folder spam dan pastikan email yang dimasukkan benar.",
          category: "login",
          confidence: 0.8
        },
        nilai: {
          response: "Nilai dapat dilihat di tab 'Nilai' pada dashboard. Pilih semester yang diinginkan dari dropdown. Jika nilai tidak muncul, refresh halaman atau hubungi guru mata pelajaran terkait.",
          category: "nilai",
          confidence: 0.75
        },
        default: {
          response: "Terima kasih atas pertanyaan akademis Anda. Tim support akan membantu Anda. Sementara itu, coba periksa panduan pembelajaran atau hubungi guru mata pelajaran terkait.",
          category: "academic",
          confidence: 0.6
        }
      },
      technical: {
        portal: {
          response: "Jika portal tidak berfungsi, coba: 1) Clear browser cache, 2) Gunakan browser Chrome/Firefox terbaru, 3) Periksa koneksi internet, 4) Restart browser. Jika masih bermasalah, hubungi IT support.",
          category: "portal",
          confidence: 0.85
        },
        default: {
          response: "Kami menerima laporan masalah teknis Anda. Tim IT akan segera memeriksanya. Coba refresh halaman atau restart browser sementara menunggu respons.",
          category: "technical",
          confidence: 0.7
        }
      },
      administrative: {
        default: {
          response: "Untuk pertanyaan administratif, silakan hubungi bagian tata usaha sekolah pada jam kerja (Senin-Jumat, 07:00-15:00) atau buat tiket support untuk ditindaklanjuti.",
          category: "administrative",
          confidence: 0.65
        }
      },
      personal: {
        default: {
          response: "Untuk dukungan personal, Anda dapat menghubungi Guru Bimbingan Konseling (BK). Privasi Anda akan terjaga dan kami siap membantu dengan sepenuh hati.",
          category: "personal",
          confidence: 0.7
        }
      }
    };

    // Determine best response based on request content
    const requestText = `${request.title} ${request.description}`.toLowerCase();
    const typeResponses = fallbackResponses[request.type] || fallbackResponses.academic;
    
    let selectedResponse = typeResponses.default;
    
    // Check for specific keywords
    if (requestText.includes('login') || requestText.includes('masuk')) {
      selectedResponse = typeResponses.login || typeResponses.default;
    } else if (requestText.includes('nilai') || requestText.includes('grade')) {
      selectedResponse = typeResponses.nilai || typeResponses.default;
    } else if (requestText.includes('portal')) {
      selectedResponse = typeResponses.portal || typeResponses.default;
    }

    // Add student-specific context if available
    let enhancedResponse = selectedResponse.response;
    if (studentProgress) {
      if (studentProgress.riskLevel === 'high') {
        enhancedResponse += "\n\n💡 Perhatian: Kami melihat Anda mungkin perlu dukungan tambahan. Jangan ragu menghubungi Guru BK untuk bantuan lebih lanjut.";
      }
    }

    return {
      response: enhancedResponse,
      category: selectedResponse.category,
      confidence: selectedResponse.confidence,
      contextUsed: !!studentProgress
    };
  }

  // Fallback to knowledge base processing
  private static processWithKnowledgeBase(request: SupportRequest): void {
    const knowledgeBase = JSON.parse(localStorage.getItem(this.KNOWLEDGE_BASE_KEY) || '{}');
    
    // Try to find automated solution
    const matchingIssue = knowledgeBase.commonIssues?.find((issue: any) => 
      issue.keywords.some((keyword: string) => 
        request.title.toLowerCase().includes(keyword) || 
        request.description.toLowerCase().includes(keyword)
      )
    );

    if (matchingIssue && matchingIssue.automatedResponse) {
      // Update request with automated response
      const requests = this.getSupportRequests();
      const requestIndex = requests.findIndex(r => r.id === request.id);
      
      if (requestIndex !== -1) {
        requests[requestIndex].status = 'in_progress';
        requests[requestIndex].updatedAt = new Date().toISOString();
        requests[requestIndex].resolution = matchingIssue.solution;
        this.saveSupportRequests(requests);

        // Send automated response notification
        this.sendAutomatedResponse(request, matchingIssue.solution);
      }
    }

    // Check if escalation is needed
    if (matchingIssue && this.shouldEscalate(request, matchingIssue)) {
      this.escalateRequest(request);
    }
  }

  // Check if request should be escalated
  private static shouldEscalate(request: SupportRequest, issue: any): boolean {
    const similarRequests = this.getSupportRequests().filter(r => 
      r.type === request.type && 
      r.studentId === request.studentId &&
      r.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
    );

    return similarRequests.length >= issue.escalationThreshold;
  }

  // Escalate request to human support
  private static escalateRequest(request: SupportRequest): void {
    const requests = this.getSupportRequests();
    const requestIndex = requests.findIndex(r => r.id === request.id);
    
    if (requestIndex !== -1) {
      requests[requestIndex].status = 'escalated';
      requests[requestIndex].priority = 'high';
      requests[requestIndex].updatedAt = new Date().toISOString();
      this.saveSupportRequests(requests);

      // Notify support team
      this.notifySupportTeam(requests[requestIndex]);
    }
  }

  // Send automated response
  private static sendAutomatedResponse(request: SupportRequest, solution: string): void {
    // This would integrate with the notification system
    console.log(`Automated response for request ${request.id}: ${solution}`);
  }

  // Notify support team
  private static notifySupportTeam(request: SupportRequest): void {
    // This would send notification to human support staff
    console.log(`Escalated request ${request.id} requires human intervention`);
  }

  // Update student progress
  static updateStudentProgress(studentId: string, progress: Partial<StudentProgress>): void {
    const allProgress = this.getAllStudentProgress();
    const existingProgress = allProgress[studentId] || {
      studentId,
      academicMetrics: {
        gpa: 0,
        gradeTrend: 'stable' as const,
        attendanceRate: 0,
        assignmentCompletion: 0
      },
      engagementMetrics: {
        loginFrequency: 0,
        resourceAccess: 0,
        supportRequests: 0,
        participationScore: 0
      },
      riskLevel: 'low' as const,
      lastUpdated: new Date().toISOString()
    };

    const updatedProgress = {
      ...existingProgress,
      ...progress,
      lastUpdated: new Date().toISOString()
    };

    // Update risk level
    updatedProgress.riskLevel = this.assessRiskLevel(updatedProgress);

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

  // Assess risk level
  private static assessRiskLevel(progress: StudentProgress): StudentProgress['riskLevel'] {
    let riskScore = 0;

    if (progress.academicMetrics.gpa < 70) riskScore += 2;
    if (progress.academicMetrics.attendanceRate < 80) riskScore += 2;
    if (progress.engagementMetrics.loginFrequency < 3) riskScore += 1;
    if (progress.engagementMetrics.supportRequests > 5) riskScore += 1;

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
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

    // Check parent communication triggers
    this.checkParentCommunicationTriggers(progress);
  }

  // Check parent communication triggers
  private static checkParentCommunicationTriggers(progress: StudentProgress): void {
    try {
      // Send weekly progress reports
      const lastWeeklyReport = localStorage.getItem(`last_weekly_report_${progress.studentId}`);
      const now = new Date();
      const shouldSendWeekly = !lastWeeklyReport || 
        (now.getTime() - new Date(lastWeeklyReport).getTime()) > 7 * 24 * 60 * 60 * 1000;

      if (shouldSendWeekly) {
        ParentCommunicationService.sendTemplateCommunication(
          progress.studentId,
          'progress_report_weekly',
          {
            studentName: `Siswa ${progress.studentId}`,
            weekPeriod: `Minggu ke-${Math.ceil(now.getDate() / 7)}`,
            gpa: progress.academicMetrics.gpa.toFixed(2),
            attendanceRate: progress.academicMetrics.attendanceRate,
            assignmentCompletion: progress.academicMetrics.assignmentCompletion,
            gradeTrend: progress.academicMetrics.gradeTrend,
            loginFrequency: progress.engagementMetrics.loginFrequency,
            resourceAccess: progress.engagementMetrics.resourceAccess,
            supportRequests: progress.engagementMetrics.supportRequests,
            riskLevel: progress.riskLevel.toUpperCase(),
            hasConcerns: progress.riskLevel !== 'low',
            concerns: this.generateConcerns(progress)
          }
        );
        localStorage.setItem(`last_weekly_report_${progress.studentId}`, now.toISOString());
      }

      // Send high-risk alerts
      if (progress.riskLevel === 'high') {
        const lastAlert = localStorage.getItem(`last_risk_alert_${progress.studentId}`);
        const shouldSendAlert = !lastAlert || 
          (now.getTime() - new Date(lastAlert).getTime()) > 24 * 60 * 60 * 1000;

        if (shouldSendAlert) {
          ParentCommunicationService.sendTemplateCommunication(
            progress.studentId,
            'alert_high_risk',
            {
              studentName: `Siswa ${progress.studentId}`,
              riskLevel: progress.riskLevel.toUpperCase(),
              riskFactors: this.generateRiskFactors(progress),
              recommendations: this.generateParentRecommendations(progress),
              urgency: 'IMMEDIATE',
              emergencyContact: 'support@ma-malnukananga.sch.id'
            },
            'urgent'
          );
          localStorage.setItem(`last_risk_alert_${progress.studentId}`, now.toISOString());
        }
      }
    } catch (error) {
      console.error('Failed to check parent communication triggers:', error);
    }
  }

  // Generate concerns description for parents
  private static generateConcerns(progress: StudentProgress): string {
    const concerns = [];
    
    if (progress.academicMetrics.gpa < 70) {
      concerns.push('- IPK dibawah standar');
    }
    if (progress.academicMetrics.attendanceRate < 80) {
      concerns.push('- Kehadiran rendah');
    }
    if (progress.academicMetrics.assignmentCompletion < 75) {
      concerns.push('- Penyelesaian tugas rendah');
    }
    if (progress.engagementMetrics.loginFrequency < 3) {
      concerns.push('- Jarang mengakses portal');
    }
    
    return concerns.length > 0 ? concerns.join('\n') : 'Tidak ada concerns khusus.';
  }

  // Generate risk factors for parents
  private static generateRiskFactors(progress: StudentProgress): string {
    const factors = [];
    
    if (progress.academicMetrics.gpa < 70) factors.push('IPK rendah');
    if (progress.academicMetrics.attendanceRate < 80) factors.push('Kehadiran rendah');
    if (progress.academicMetrics.assignmentCompletion < 75) factors.push('Tugas tidak selesai');
    if (progress.engagementMetrics.loginFrequency < 3) factors.push('Engagement rendah');
    if (progress.engagementMetrics.supportRequests > 5) factors.push('Banyak permintaan bantuan');
    
    return factors.join(', ') || 'Tidak ada faktor risiko spesifik';
  }

  // Generate recommendations for parents
  private static generateParentRecommendations(progress: StudentProgress): string {
    const recommendations = [];
    
    if (progress.academicMetrics.gpa < 70) {
      recommendations.push('1. Sediakan waktu belajar terstruktur di rumah');
      recommendations.push('2. Diskusikan kesulitan akademis dengan guru mata pelajaran');
    }
    if (progress.academicMetrics.attendanceRate < 80) {
      recommendations.push('3. Pastikan siswa hadir tepat waktu setiap hari');
      recommendations.push('4. Hubungi pihak sekolah jika ada kendala kehadiran');
    }
    if (progress.engagementMetrics.loginFrequency < 3) {
      recommendations.push('5. Bantu siswa mengakses portal secara teratur');
      recommendations.push('6. Monitor penggunaan portal untuk informasi penting');
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : 'Lanjutkan dukungan positif yang sudah diberikan.';
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
        if (triggerConfig.metric === 'engagement') {
          return progress.engagementMetrics.loginFrequency < triggerConfig.threshold;
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
          this.createSupportRequest(
            progress.studentId,
            action.config.category || 'academic',
            'automated',
            `Automated: ${rule.name}`,
            `System detected: ${rule.description}`,
            action.config.priority || 'medium'
          );
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
  private initializeProgressTracking(): void {
    // Initialize sample data for testing
    const sampleProgress: StudentProgress = {
      studentId: 'STU001',
      academicMetrics: {
        gpa: 3.2,
        gradeTrend: 'stable',
        attendanceRate: 85,
        assignmentCompletion: 90
      },
      engagementMetrics: {
        loginFrequency: 4,
        resourceAccess: 12,
        supportRequests: 2,
        participationScore: 75
      },
      riskLevel: 'low',
      lastUpdated: new Date().toISOString()
    };

    this.updateStudentProgress('STU001', sampleProgress);
  }

  // Start automated monitoring
  private startAutomatedMonitoring(): void {
    // Check for at-risk students every hour
    setInterval(() => {
      this.monitorAtRiskStudents();
    }, 60 * 60 * 1000);

    // Update engagement metrics every 5 minutes
    setInterval(() => {
      this.updateEngagementMetrics();
    }, 5 * 60 * 1000);
  }

  // Monitor at-risk students with AI-powered analysis
  private static async monitorAtRiskStudents(): Promise<void> {
    const allProgress = this.getAllStudentProgress();
    
    for (const progress of Object.values(allProgress)) {
      try {
        // Get AI-powered risk assessment
        const riskAssessment = await this.getAIRiskAssessment(progress);
        
        if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'medium') {
          // Create intervention request with AI recommendations
          const recommendations = riskAssessment.recommendations || [];
          const recommendationText = recommendations.map((rec: any) => 
            `- ${rec.description} (${rec.priority})`
          ).join('\n');
          
          this.createSupportRequest(
            progress.studentId,
            'academic',
            'intervention',
            `AI-Detected ${riskAssessment.riskLevel.toUpperCase()} Risk Student`,
            `Risk factors: ${riskAssessment.riskFactors.join(', ')}\n\nRecommendations:\n${recommendationText}`,
            riskAssessment.riskLevel === 'high' ? 'high' : 'medium'
          );
          
          // Send proactive notifications
          await this.sendProactiveNotification(progress, riskAssessment);
        }
      } catch (error) {
        console.error(`Failed to monitor student ${progress.studentId}:`, error);
        // Fallback to basic monitoring
        if (progress.riskLevel === 'high') {
          this.createSupportRequest(
            progress.studentId,
            'academic',
            'intervention',
            'At-Risk Student Intervention',
            `Student identified as at-risk with ${progress.riskLevel} risk level`,
            'medium'
          );
        }
      }
    }
  }

  // Get AI-powered risk assessment with enhanced fallback
  private static async getAIRiskAssessment(progress: StudentProgress): Promise<{
    riskLevel: string;
    riskScore: number;
    riskFactors: string[];
    urgency: string;
    recommendations: any[];
  }> {
    try {
      const response = await fetch('/api/support-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentMetrics: {
            ...progress.academicMetrics,
            ...progress.engagementMetrics,
            lastLoginDays: this.calculateDaysSinceLastLogin(progress.studentId)
          },
          context: {
            studentId: progress.studentId,
            timestamp: new Date().toISOString(),
            assessmentType: 'comprehensive'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Risk assessment error: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Validate AI risk assessment
      if (!result.riskAssessment || !result.riskAssessment.riskLevel) {
        throw new Error('Invalid risk assessment format');
      }

      return result.riskAssessment;
    } catch (error) {
      console.warn('AI risk assessment unavailable, using enhanced fallback:', error);
      return this.getEnhancedRiskAssessment(progress);
    }
  }

  // Enhanced risk assessment fallback
  private static getEnhancedRiskAssessment(progress: StudentProgress): {
    riskLevel: string;
    riskScore: number;
    riskFactors: string[];
    urgency: string;
    recommendations: any[];
  } {
    let riskScore = 0;
    const riskFactors: string[] = [];
    const recommendations: any[] = [];

    // Academic risk factors
    if (progress.academicMetrics.gpa < 70) {
      riskScore += 3;
      riskFactors.push('IPK rendah');
      recommendations.push({
        description: 'Program remedial akademik',
        priority: 'high',
        type: 'academic'
      });
    }

    if (progress.academicMetrics.attendanceRate < 80) {
      riskScore += 2;
      riskFactors.push('Kehadiran rendah');
      recommendations.push({
        description: 'Monitoring kehadiran intensif',
        priority: 'medium',
        type: 'attendance'
      });
    }

    if (progress.academicMetrics.assignmentCompletion < 75) {
      riskScore += 2;
      riskFactors.push('Penyelesaian tugas rendah');
      recommendations.push({
        description: 'Bimbingan manajemen waktu',
        priority: 'medium',
        type: 'time_management'
      });
    }

    // Engagement risk factors
    if (progress.engagementMetrics.loginFrequency < 3) {
      riskScore += 1;
      riskFactors.push('Login jarang');
      recommendations.push({
        description: 'Kampanye engagement portal',
        priority: 'low',
        type: 'engagement'
      });
    }

    if (progress.engagementMetrics.supportRequests > 5) {
      riskScore += 1;
      riskFactors.push('Banyak permintaan bantuan');
      recommendations.push({
        description: 'Evaluasi sistem support',
        priority: 'medium',
        type: 'system'
      });
    }

    // Determine risk level
    let riskLevel = 'low';
    let urgency = 'low';
    
    if (riskScore >= 6) {
      riskLevel = 'high';
      urgency = 'immediate';
      recommendations.push({
        description: 'Intervensi Guru BK segera',
        priority: 'urgent',
        type: 'counseling'
      });
    } else if (riskScore >= 3) {
      riskLevel = 'medium';
      urgency = 'soon';
    }

    // Add general recommendations
    if (riskScore > 0) {
      recommendations.push({
        description: 'Komunikasi dengan orang tua',
        priority: 'medium',
        type: 'parent_communication'
      });
    }

    return {
      riskLevel,
      riskScore,
      riskFactors,
      urgency,
      recommendations
    };
  }

  // Calculate days since last login
  private static calculateDaysSinceLastLogin(studentId: string): number {
    // This would integrate with actual login tracking system
    // For now, return mock data
    return Math.floor(Math.random() * 14);
  }

  // Send proactive notification
  private static async sendProactiveNotification(progress: StudentProgress, riskAssessment: any): Promise<void> {
    // This would integrate with notification system
    console.log(`Proactive notification for student ${progress.studentId}:`, {
      riskLevel: riskAssessment.riskLevel,
      urgency: riskAssessment.urgency,
      recommendations: riskAssessment.recommendations
    });
  }

  // Update engagement metrics
  private static updateEngagementMetrics(): void {
    // This would track real-time engagement
    console.log('Updating engagement metrics...');
  }

  // Get relevant resources with enhanced search and fallback
  static async getRelevantResources(searchTerm?: string): Promise<SupportResource[]> {
    const resources = this.getSupportResources();
    
    if (!searchTerm) return resources;

    try {
      // Try AI-enhanced knowledge base first
      const knowledgeBase = AIEnhancedKnowledgeBase.getInstance();
      const searchResults = await knowledgeBase.searchKnowledgeBase({
        query: searchTerm,
        limit: 10
      });

      // Convert knowledge base articles to support resources
      const kbResources: SupportResource[] = searchResults.map(result => ({
        id: result.article.id,
        title: result.article.title,
        content: result.article.content,
        category: result.article.category,
        type: result.article.type as any,
        tags: result.article.tags,
        difficulty: result.article.difficulty,
        rating: result.article.rating,
        usageCount: result.article.usageCount
      }));

      // Combine with traditional resources
      const traditionalResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Merge and deduplicate by ID
      const allResources = [...kbResources, ...traditionalResources];
      const uniqueResources = allResources.filter((resource, index, self) =>
        index === self.findIndex(r => r.id === resource.id)
      );

      // Sort by rating and usage
      return uniqueResources.sort((a, b) => 
        (b.rating || 0) * 10 + (b.usageCount || 0) - 
        ((a.rating || 0) * 10 + (a.usageCount || 0))
      );
    } catch (error) {
      console.warn('AI knowledge base unavailable, using enhanced search:', error);
      return this.getEnhancedResourceSearch(resources, searchTerm);
    }
  }

  // Enhanced resource search with intelligent matching
  private static getEnhancedResourceSearch(resources: SupportResource[], searchTerm: string): SupportResource[] {
    const searchLower = searchTerm.toLowerCase();
    const searchTerms = searchLower.split(' ').filter(term => term.length > 2);
    
    const scoredResources = resources.map(resource => {
      let score = 0;
      
      // Exact title match gets highest score
      if (resource.title.toLowerCase() === searchLower) {
        score += 100;
      }
      
      // Title contains search term
      if (resource.title.toLowerCase().includes(searchLower)) {
        score += 50;
      }
      
      // Individual term matching in title
      searchTerms.forEach(term => {
        if (resource.title.toLowerCase().includes(term)) {
          score += 20;
        }
      });
      
      // Content matching
      if (resource.content.toLowerCase().includes(searchLower)) {
        score += 30;
      }
      
      searchTerms.forEach(term => {
        if (resource.content.toLowerCase().includes(term)) {
          score += 10;
        }
      });
      
      // Tag matching
      resource.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchLower)) {
          score += 25;
        }
        searchTerms.forEach(term => {
          if (tag.toLowerCase().includes(term)) {
            score += 15;
          }
        });
      });
      
      // Category matching
      if (resource.category.toLowerCase().includes(searchLower)) {
        score += 15;
      }
      
      // Boost based on rating and usage
      score += (resource.rating || 0) * 5;
      score += (resource.usageCount || 0) * 0.5;
      
      return { resource, score };
    });
    
    // Filter out resources with no matches and sort by score
    return scoredResources
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.resource);
  }

  // Get support resources
  static getSupportResources(category?: string): SupportResource[] {
    const resources = localStorage.getItem(this.RESOURCES_KEY);
    let allResources: SupportResource[] = resources ? JSON.parse(resources) : this.initializeSampleResources();

    if (category) {
      allResources = allResources.filter(r => r.category === category);
    }

    return allResources.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Initialize sample resources
  private initializeSampleResources(): SupportResource[] {
    const sampleResources: SupportResource[] = [
      {
        id: 'res_001',
        title: 'Panduan Login Magic Link',
        content: 'Cara menggunakan fitur Magic Link untuk login tanpa password ke portal siswa',
        category: 'technical',
        type: 'guide',
        tags: ['login', 'magic-link', 'akses'],
        difficulty: 'beginner',
        rating: 4.5,
        usageCount: 25
      },
      {
        id: 'res_002',
        title: 'Tutorial Melihat Nilai',
        content: 'Langkah demi langkah cara melihat nilai semester dan mata pelajaran',
        category: 'academic',
        type: 'video',
        url: 'https://example.com/nilai-tutorial',
        tags: ['nilai', 'grade', 'tutorial'],
        difficulty: 'beginner',
        rating: 4.2,
        usageCount: 18
      },
      {
        id: 'res_003',
        title: 'Tips Belajar Efektif',
        content: 'Strategi dan teknik belajar yang efektif untuk meningkatkan pemahaman',
        category: 'academic',
        type: 'document',
        tags: ['belajar', 'studi', 'efektif'],
        difficulty: 'intermediate',
        rating: 4.8,
        usageCount: 32
      },
      {
        id: 'res_004',
        title: 'Panduan Penggunaan Portal',
        content: 'Panduan lengkap penggunaan fitur-fitur portal siswa',
        category: 'technical',
        type: 'guide',
        tags: ['portal', 'panduan', 'fitur'],
        difficulty: 'beginner',
        rating: 4.0,
        usageCount: 45
      },
      {
        id: 'res_005',
        title: 'Cara Menghubungi Guru BK',
        content: 'Prosedur dan kontak untuk menghubungi Guru Bimbingan Konseling',
        category: 'administrative',
        type: 'document',
        tags: ['guru-bk', 'konseling', 'kontak'],
        difficulty: 'beginner',
        rating: 3.9,
        usageCount: 12
      }
    ];

    localStorage.setItem(this.RESOURCES_KEY, JSON.stringify(sampleResources));
    return sampleResources;
  }

  // Add support resource
  addSupportResource(resource: Omit<SupportResource, 'id' | 'usageCount' | 'rating'>): SupportResource {
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
      resources[resourceIndex].usageCount = (resources[resourceIndex].usageCount || 0) + 1;
      // Update average rating
      const currentRating = resources[resourceIndex].rating || 0;
      const usageCount = resources[resourceIndex].usageCount || 1;
      resources[resourceIndex].rating = ((currentRating * (usageCount - 1)) + rating) / usageCount;
      
      localStorage.setItem(this.RESOURCES_KEY, JSON.stringify(resources));
    }
  }

  // Get support analytics
  static getSupportAnalytics(): any {
    const requests = this.getSupportRequests();
    const allProgress = this.getAllStudentProgress();

    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      resolvedRequests: requests.filter(r => r.status === 'resolved').length,
      escalatedRequests: requests.filter(r => r.status === 'escalated').length,
      averageResolutionTime: this.calculateAverageResolutionTime(requests),
      categoryBreakdown: this.getCategoryBreakdown(requests),
      atRiskStudents: Object.values(allProgress).filter(p => p.riskLevel === 'high').length,
      totalStudents: Object.keys(allProgress).length
    };
  }

  // Calculate average resolution time
  private static calculateAverageResolutionTime(requests: SupportRequest[]): number {
    const resolvedRequests = requests.filter(r => r.status === 'resolved');
    
    if (resolvedRequests.length === 0) return 0;

    const totalTime = resolvedRequests.reduce((sum, request) => {
      const created = new Date(request.createdAt).getTime();
      const resolved = new Date(request.updatedAt).getTime();
      return sum + (resolved - created);
    }, 0);

    return totalTime / resolvedRequests.length / (1000 * 60 * 60); // hours
  }

  // Get category breakdown
  private static getCategoryBreakdown(requests: SupportRequest[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    requests.forEach(request => {
      breakdown[request.type] = (breakdown[request.type] || 0) + 1;
    });

    return breakdown;
  }

  // Generate support report
  static generateSupportReport(timeFrame: 'daily' | 'weekly' | 'monthly'): any {
    const analytics = this.getSupportAnalytics();
    const requests = this.getSupportRequests();
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

    const periodRequests = requests.filter(r => 
      new Date(r.createdAt) >= startDate
    );

    return {
      timeFrame,
      period: startDate.toISOString().split('T')[0] + ' to ' + now.toISOString().split('T')[0],
      totalRequests: periodRequests.length,
      resolvedRequests: periodRequests.filter(r => r.status === 'resolved').length,
      averageResolutionTime: this.calculateAverageResolutionTime(periodRequests),
      topIssues: this.getTopIssues(periodRequests),
      studentSatisfaction: this.calculateStudentSatisfaction(resources),
      recommendations: this.generateSystemRecommendations(analytics)
    };
  }

  // Get top issues
  private static getTopIssues(requests: SupportRequest[]): Array<{title: string, count: number}> {
    const issueCounts: Record<string, number> = {};
    
    requests.forEach(request => {
      issueCounts[request.title] = (issueCounts[request.title] || 0) + 1;
    });

    return Object.entries(issueCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Calculate student satisfaction
  private static calculateStudentSatisfaction(resources: SupportResource[]): number {
    if (resources.length === 0) return 0;

    const totalRating = resources.reduce((sum, resource) => sum + (resource.rating || 0), 0);
    return totalRating / resources.length;
  }

  // Generate system recommendations
  private static generateSystemRecommendations(analytics: any): string[] {
    const recommendations: string[] = [];

    if (analytics.escalatedRequests > analytics.totalRequests * 0.2) {
      recommendations.push('Pertimbangkan untuk menambah staf support');
    }

    if (analytics.averageResolutionTime > 24) {
      recommendations.push('Optimalkan proses resolusi permintaan');
    }

    if (analytics.atRiskStudents > analytics.totalStudents * 0.3) {
      recommendations.push('Tingkatkan program intervensi siswa');
    }

    return recommendations;
  }
}

// Initialize enhanced support system with real-time monitoring
import RealTimeMonitoringService from './realTimeMonitoringService';
import AutomatedInterventionEngine from './automatedInterventionEngine';

// Auto-initialize when module loads with error handling
if (typeof window !== 'undefined') {
  try {
    StudentSupportService.initialize();
    
    // Start real-time monitoring
    const monitoringService = RealTimeMonitoringService.getInstance();
    monitoringService.startMonitoring();
    
    // Initialize intervention engine
    const interventionEngine = AutomatedInterventionEngine.getInstance();
    interventionEngine.initialize();
    
    console.log('🚀 Enhanced Student Support System initialized with real-time monitoring and automated interventions');
  } catch (error) {
    console.error('Failed to initialize Student Support System:', error);
    // Fallback initialization
    try {
      StudentSupportService.initialize();
      console.log('⚠️ Student Support System initialized in fallback mode');
    } catch (fallbackError) {
      console.error('Critical: Student Support System failed to initialize:', fallbackError);
    }
  }
}

export { StudentSupportService };