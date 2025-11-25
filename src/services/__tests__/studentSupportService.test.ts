// Student Support Service Tests
import { StudentSupportService } from '../studentSupportService';

describe('StudentSupportService', () => {
  beforeEach(() => {
    localStorage.clear();
    const service = StudentSupportService.getInstance();
    service.initialize();
  });

  describe('createSupportRequest', () => {
    it('should create a new support request with correct properties', () => {
      const service = StudentSupportService.getInstance();
      const request = service.createSupportRequest({
        studentId: 'STU001',
        type: 'academic',
        category: 'mathematics',
        title: 'Bantuan Matematika',
        description: 'Saya kesulitan dengan kalkulus',
        priority: 'medium'
      });

      expect(request.id).toBeDefined();
      expect(request.studentId).toBe('STU001');
      expect(request.type).toBe('academic');
      expect(request.category).toBe('mathematics');
      expect(request.title).toBe('Bantuan Matematika');
      expect(request.description).toBe('Saya kesulitan dengan kalkulus');
      expect(request.priority).toBe('medium');
      expect(request.status).toBe('pending');
      expect(request.createdAt).toBeDefined();
      expect(request.updatedAt).toBeDefined();
    });

    it('should process requests automatically for common issues', async () => {
      const service = StudentSupportService.getInstance();
      const request = service.createSupportRequest({
        studentId: 'STU001',
        type: 'technical',
        category: 'login',
        title: 'Masalah login',
        description: 'Saya tidak bisa login ke portal',
        priority: 'medium'
      });

      // Mock AI processing
      jest.spyOn(service as any, 'getAIResponse').mockResolvedValue({
        response: 'Coba gunakan fitur Magic Link untuk login',
        category: 'technical',
        confidence: 0.8,
        contextUsed: true
      });

      await service.processRequestAutomatically(request);

      const requests = service.getSupportRequests();
      const processedRequest = requests.find(r => r.id === request.id);
      
      expect(processedRequest).toBeDefined();
      expect(processedRequest?.status).toBe('in_progress');
      expect(processedRequest?.resolution).toBeDefined();
    });
  });

  describe('updateStudentProgress', () => {
    it('should update student progress with new data', () => {
      const service = StudentSupportService.getInstance();
      const progressData = {
        academicMetrics: {
          gpa: 85,
          attendanceRate: 85,
          assignmentCompletion: 90,
          subjectPerformance: { math: 85, science: 78 }
        },
        engagementMetrics: {
          portalLoginFrequency: 5,
          featureUsage: { dashboard: 10, grades: 5 },
          supportRequestsCount: 2,
          lastActiveDate: new Date().toISOString()
        }
      };

      service.updateStudentProgress('STU001', progressData);

      const progress = service.getStudentProgress('STU001');
      expect(progress).toBeDefined();
      expect(progress?.academicMetrics.gpa).toBe(85);
      expect(progress?.studentId).toBe('STU001');
      expect(progress?.riskLevel).toBe('low');
    });

    it('should create new progress record if none exists', () => {
      const service = StudentSupportService.getInstance();
      service.updateStudentProgress('STU002', {
        academicMetrics: {
          gpa: 2.5,
          attendanceRate: 75,
          assignmentCompletion: 60,
          subjectPerformance: {}
        },
        engagementMetrics: {
          portalLoginFrequency: 1,
          featureUsage: {},
          supportRequestsCount: 0,
          lastActiveDate: new Date().toISOString()
        }
      });

      const progress = service.getStudentProgress('STU002');
      expect(progress).toBeDefined();
      expect(progress?.studentId).toBe('STU002');
      expect(progress?.riskLevel).toBe('high');
    });
  });

  describe('addSupportResource', () => {
    it('should add new support resource', () => {
      const service = StudentSupportService.getInstance();
      const resource = service.addSupportResource({
        title: 'Tutorial Matematika',
        description: 'Panduan lengkap belajar matematika',
        category: 'tutorial',
        type: 'video',
        tags: ['math', 'tutorial'],
        difficulty: 'beginner',
        estimatedTime: 30,
        rating: 0
      });

      expect(resource.id).toBeDefined();
      expect(resource.title).toBe('Tutorial Matematika');
      expect(resource.usageCount).toBe(0);
      expect(resource.rating).toBe(0);
    });

    it('should retrieve resources by category', () => {
      const service = StudentSupportService.getInstance();
      service.addSupportResource({
        title: 'Tutorial Login',
        description: 'Cara login ke portal',
        category: 'guide',
        type: 'text',
        tags: ['login', 'guide'],
        difficulty: 'beginner',
        estimatedTime: 5,
        rating: 0
      });

      const guides = service.getSupportResources('guide');
      expect(guides.length).toBeGreaterThan(0);
      expect(guides[0].category).toBe('guide');
    });
  });

  describe('getSupportAnalytics', () => {
    it('should return correct analytics', () => {
      const service = StudentSupportService.getInstance();
      service.createSupportRequest({
        studentId: 'STU001',
        type: 'academic',
        category: 'mathematics',
        title: 'Test 1',
        description: 'Description 1',
        priority: 'medium'
      });
      
      service.createSupportRequest({
        studentId: 'STU002',
        type: 'technical',
        category: 'login',
        title: 'Test 2',
        description: 'Description 2',
        priority: 'high'
      });
      
      const analytics = service.getSupportAnalytics();
      
      expect(analytics.totalRequests).toBe(2);
      expect(analytics.openRequests).toBeGreaterThanOrEqual(0);
      expect(analytics.resolvedRequests).toBeGreaterThanOrEqual(0);
      expect(analytics.escalatedRequests).toBeGreaterThanOrEqual(0);
      expect(analytics.categoryBreakdown).toBeDefined();
    });
  });

  describe('generateSupportReport', () => {
    it('should generate support report for different timeframes', () => {
      const service = StudentSupportService.getInstance();
      const dailyReport = service.generateSupportReport('daily');
      const weeklyReport = service.generateSupportReport('weekly');
      
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
      const service = StudentSupportService.getInstance();
      const resource = service.addSupportResource({
        title: 'Test Resource',
        description: 'Test description',
        category: 'guide',
        type: 'text',
        tags: ['test'],
        difficulty: 'beginner',
        estimatedTime: 10,
        rating: 0
      });

      service.rateResource(resource.id, 5);
      
      const resources = service.getSupportResources();
      const updatedResource = resources.find(r => r.id === resource.id);
      
      expect(updatedResource?.usageCount).toBe(1);
      expect(updatedResource?.rating).toBe(5);
    });
  });
});