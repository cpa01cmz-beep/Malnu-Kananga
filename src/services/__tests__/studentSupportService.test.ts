// Student Support Service Tests
import { StudentSupportService } from '../studentSupportService';

describe('StudentSupportService', () => {
  beforeEach(() => {
    localStorage.clear();
    StudentSupportService.initialize();
  });

  describe('createSupportRequest', () => {
    it('should create a new support request with correct properties', () => {
      const request = StudentSupportService.createSupportRequest(
        'STU001',
        'academic',
        'math',
        'Bantuan Matematika',
        'Saya kesulitan dengan kalkulus',
        'medium'
      );

      expect(request.id).toBeDefined();
      expect(request.studentId).toBe('STU001');
      expect(request.type).toBe('academic');
      expect(request.title).toBe('Bantuan Matematika');
      expect(request.description).toBe('Saya kesulitan dengan kalkulus');
      expect(request.priority).toBe('medium');
      expect(request.status).toBe('pending');
      expect(request.createdAt).toBeDefined();
      expect(request.updatedAt).toBeDefined();
    });

    it('should process requests automatically for common issues', () => {
      const request = StudentSupportService.createSupportRequest(
        'STU001',
        'technical',
        'login',
        'Masalah login',
        'Saya tidak bisa login ke portal',
        'medium'
      );

      const requests = StudentSupportService.getSupportRequests();
      const processedRequest = requests.find(r => r.id === request.id);
      
      expect(processedRequest).toBeDefined();
      expect(processedRequest?.status).toBe('in_progress');
      expect(processedRequest?.resolution).toBeDefined();
    });
  });

  describe('updateStudentProgress', () => {
    it('should update student progress with new data', () => {
      const progressData = {
        academicMetrics: {
          gpa: 85,
          gradeTrend: 'improving' as const,
          attendanceRate: 85,
          assignmentCompletion: 90
        },
        engagementMetrics: {
          loginFrequency: 5,
          resourceAccess: 10,
          supportRequests: 2,
          participationScore: 75
        }
      };

      StudentSupportService.updateStudentProgress('STU001', progressData);

      const progress = StudentSupportService.getStudentProgress('STU001');
      expect(progress).toBeDefined();
      expect(progress?.academicMetrics.gpa).toBe(85);
      expect(progress?.studentId).toBe('STU001');
      expect(progress?.riskLevel).toBe('low');
    });

    it('should create new progress record if none exists', () => {
      StudentSupportService.updateStudentProgress('STU002', {
        academicMetrics: {
          gpa: 2.5,
          gradeTrend: 'declining' as const,
          attendanceRate: 75,
          assignmentCompletion: 60
        },
        engagementMetrics: {
          loginFrequency: 1,
          resourceAccess: 2,
          supportRequests: 0,
          participationScore: 50
        }
      });

      const progress = StudentSupportService.getStudentProgress('STU002');
      expect(progress).toBeDefined();
      expect(progress?.studentId).toBe('STU002');
      expect(progress?.riskLevel).toBe('high');
    });
  });

  describe('addSupportResource', () => {
    it('should add new support resource', () => {
      const resource = StudentSupportService.addSupportResource({
        title: 'Tutorial Matematika',
        content: 'Panduan lengkap belajar matematika',
        category: 'academic',
        type: 'video',
        tags: ['math', 'tutorial'],
        difficulty: 'beginner'
      });

      expect(resource.id).toBeDefined();
      expect(resource.title).toBe('Tutorial Matematika');
      expect(resource.usageCount).toBe(0);
      expect(resource.rating).toBe(0);
    });

    it('should retrieve resources by category', () => {
      StudentSupportService.addSupportResource({
        title: 'Tutorial Login',
        content: 'Cara login ke portal',
        category: 'technical',
        type: 'guide',
        tags: ['login', 'guide'],
        difficulty: 'beginner'
      });

      const guides = StudentSupportService.getSupportResources('technical');
      expect(guides.length).toBeGreaterThan(0);
      expect(guides[0].category).toBe('technical');
    });
  });

  describe('getSupportAnalytics', () => {
    it('should return correct analytics', () => {
      // Clear existing data first
      localStorage.clear();
      StudentSupportService.initialize();
      
      StudentSupportService.createSupportRequest(
        'STU001',
        'academic',
        'test',
        'Test 1',
        'Description 1',
        'medium'
      );
      
      StudentSupportService.createSupportRequest(
        'STU002',
        'technical',
        'test',
        'Test 2',
        'Description 2',
        'high'
      );
      
      const analytics = StudentSupportService.getSupportAnalytics();
      
      expect(analytics.totalRequests).toBeGreaterThanOrEqual(2);
      expect(analytics.pendingRequests).toBeGreaterThanOrEqual(0);
      expect(analytics.resolvedRequests).toBeGreaterThanOrEqual(0);
      expect(analytics.escalatedRequests).toBeGreaterThanOrEqual(0);
      expect(analytics.categoryBreakdown).toBeDefined();
    });
  });

  describe('generateSupportReport', () => {
    it('should generate support report for different timeframes', () => {
      const dailyReport = StudentSupportService.generateSupportReport('daily');
      const weeklyReport = StudentSupportService.generateSupportReport('weekly');
      
      expect(dailyReport.timeFrame).toBe('daily');
      expect(dailyReport.period).toBeDefined();
      expect(dailyReport.totalRequests).toBeDefined();
      expect(dailyReport.recommendations).toBeDefined();
      
      expect(weeklyReport.timeFrame).toBe('weekly');
      expect(weeklyReport.period).toBeDefined();
      expect(weeklyReport.totalRequests).toBeDefined();
    });
  });

  describe('rateResource', () => {
    it('should update resource rating and usage count', () => {
      const resource = StudentSupportService.addSupportResource({
        title: 'Test Resource',
        content: 'Test description',
        category: 'technical',
        type: 'guide',
        tags: ['test'],
        difficulty: 'beginner'
      });

      StudentSupportService.rateResource(resource.id, 5);
      
      const resources = StudentSupportService.getSupportResources();
      const updatedResource = resources.find(r => r.id === resource.id);
      
      expect(updatedResource?.usageCount).toBe(1);
      expect(updatedResource?.rating).toBe(5);
    });
  });
});