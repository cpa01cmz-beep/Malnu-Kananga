// Student Support Service Tests
import { StudentSupportService } from '../studentSupportService';

describe('StudentSupportService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('createSupportTicket', () => {
    it('should create a new support ticket with correct properties', () => {
      const ticket = StudentSupportService.createSupportTicket({
        studentId: 'STU001',
        category: 'academic',
        priority: 'medium',
        subject: 'Bantuan Matematika',
        description: 'Saya kesulitan dengan kalkulus',
        tags: ['math']
      });

      expect(ticket.id).toBeDefined();
      expect(ticket.studentId).toBe('STU001');
      expect(ticket.category).toBe('academic');
      expect(ticket.subject).toBe('Bantuan Matematika');
      expect(ticket.description).toBe('Saya kesulitan dengan kalkulus');
      expect(ticket.priority).toBe('medium');
      expect(ticket.status).toBe('open');
      expect(ticket.timestamp).toBeDefined();
    });

    it('should process tickets automatically for common issues', () => {
      // Initialize knowledge base first
      StudentSupportService.initialize();
      
      const ticket = StudentSupportService.createSupportTicket({
        studentId: 'STU001',
        category: 'technical',
        priority: 'medium',
        subject: 'Masalah login',
        description: 'Saya tidak bisa login ke portal',
        tags: ['login']
      });

      // Check if ticket was processed automatically
      const tickets = StudentSupportService.getSupportTickets();
      const processedTicket = tickets.find(t => t.id === ticket.id);
      
      expect(processedTicket).toBeDefined();
      // The ticket should be processed and have automated response
      expect(processedTicket?.status).toBe('in_progress');
      expect(processedTicket?.resolution).toBeDefined();
    });
  });

  describe('updateStudentProgress', () => {
    it('should update student progress with new data', () => {
      const progressData = {
        academicMetrics: {
          gpa: 3.5,
          attendanceRate: 85,
          assignmentCompletion: 90,
          subjectPerformance: {}
        },
        engagementMetrics: {
          portalLoginFrequency: 5,
          featureUsage: {},
          supportRequestsCount: 2,
          lastActiveDate: new Date().toISOString()
        }
      };

      StudentSupportService.updateStudentProgress('STU001', progressData);

      const progress = StudentSupportService.getStudentProgress('STU001');
      expect(progress).toBeDefined();
      expect(progress?.academicMetrics.gpa).toBe(3.5);
      expect(progress?.studentId).toBe('STU001');
    });

    it('should create new progress record if none exists', () => {
      StudentSupportService.updateStudentProgress('STU002', {
        academicMetrics: {
          gpa: 2.5,
          attendanceRate: 75,
          assignmentCompletion: 80,
          subjectPerformance: {}
        }
      });

      const progress = StudentSupportService.getStudentProgress('STU002');
      expect(progress).toBeDefined();
      expect(progress?.studentId).toBe('STU002');
    });
  });

  describe('addSupportResource', () => {
    it('should add new support resource', () => {
      const resource = StudentSupportService.addSupportResource({
        title: 'Math Tutorial',
        description: 'Basic mathematics tutorial',
        category: 'tutorial',
        type: 'video',
        tags: ['math', 'basic'],
        difficulty: 'beginner',
        estimatedTime: 30
      });

      expect(resource.id).toBeDefined();
      expect(resource.title).toBe('Math Tutorial');
      expect(resource.category).toBe('tutorial');
      expect(resource.usageCount).toBe(0);
      expect(resource.rating).toBe(0);
    });
  });

  describe('getSupportAnalytics', () => {
    it('should return correct analytics', () => {
      // Create some test tickets
      StudentSupportService.createSupportTicket({
        studentId: 'STU001',
        category: 'academic',
        priority: 'medium',
        subject: 'Test 1',
        description: 'Description 1',
        tags: []
      });
      StudentSupportService.createSupportTicket({
        studentId: 'STU002',
        category: 'technical',
        priority: 'low',
        subject: 'Test 2',
        description: 'Description 2',
        tags: []
      });
      
      const analytics = StudentSupportService.getSupportAnalytics();
      
      expect(analytics.totalTickets).toBe(2);
      expect(analytics.openTickets).toBe(2);
      expect(analytics.resolvedTickets).toBe(0);
      expect(analytics.escalatedTickets).toBe(0);
    });
  });

  describe('generateSupportReport', () => {
    it('should generate formatted support report', () => {
      const report = StudentSupportService.generateSupportReport('daily');
      
      expect(report.timeFrame).toBe('daily');
      expect(report.totalTickets).toBeDefined();
      expect(report.resolvedTickets).toBeDefined();
      expect(report.averageResolutionTime).toBeDefined();
      expect(report.topIssues).toBeDefined();
    });
  });

  describe('getSupportResources', () => {
    it('should return all resources when no category specified', () => {
      const resources = StudentSupportService.getSupportResources();
      expect(Array.isArray(resources)).toBe(true);
    });

    it('should filter resources by category', () => {
      // Add a test resource first
      StudentSupportService.addSupportResource({
        title: 'Test Guide',
        description: 'Test description',
        category: 'guide',
        type: 'text',
        tags: ['test'],
        difficulty: 'beginner',
        estimatedTime: 15
      });
      
      const guides = StudentSupportService.getSupportResources('guide');
      expect(guides.length).toBeGreaterThan(0);
      guides.forEach(resource => {
        expect(resource.category).toBe('guide');
      });
    });
  });
});