// Student Support Service Tests
import { studentSupportService, SupportRequest } from '../studentSupportService';

describe('StudentSupportService', () => {
  beforeEach(() => {
    // Clear any existing data before each test
    const service = studentSupportService as any;
    service.supportRequests = [];
    service.studentProgress.clear();
    service.interventions.clear();
  });

  describe('createSupportRequest', () => {
    it('should create a new support request with correct properties', () => {
      const request = studentSupportService.createSupportRequest(
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
      expect(request.category).toBe('math');
      expect(request.title).toBe('Bantuan Matematika');
      expect(request.description).toBe('Saya kesulitan dengan kalkulus');
      expect(request.priority).toBe('medium');
      expect(request.status).toBe('pending');
      expect(request.createdAt).toBeDefined();
    });

    it('should auto-escalate urgent requests based on keywords', () => {
      const request = studentSupportService.createSupportRequest(
        'STU001',
        'technical',
        'login',
        'Darurat tidak bisa login',
        'Saya darurat tidak bisa masuk ke portal',
        'medium'
      );

      expect(request.priority).toBe('urgent');
    });

    it('should provide automated resolution for common issues', () => {
      const request = studentSupportService.createSupportRequest(
        'STU001',
        'technical',
        'login',
        'Masalah login',
        'Saya tidak bisa login ke portal',
        'medium'
      );

      expect(request.status).toBe('resolved');
      expect(request.resolution).toBeDefined();
      expect(request.resolvedAt).toBeDefined();
    });
  });

  describe('updateStudentProgress', () => {
    it('should update student progress with new data', () => {
      const progressData = {
        academicMetrics: {
          gpa: 3.5,
          gradeTrend: 'improving' as const,
          subjectsAtRisk: ['Physics'],
          attendanceRate: 85,
          assignmentCompletion: 90
        },
        engagementMetrics: {
          loginFrequency: 5,
          resourceAccess: 10,
          supportRequests: 2,
          participationScore: 75
        },
        riskLevel: 'low' as const
      };

      studentSupportService.updateStudentProgress('STU001', progressData);

      const progress = studentSupportService.getStudentProgress('STU001');
      expect(progress).toBeDefined();
      expect(progress?.academicMetrics.gpa).toBe(3.5);
      expect(progress?.riskLevel).toBe('low');
      expect(progress?.studentId).toBe('STU001');
    });

    it('should create new progress record if none exists', () => {
      studentSupportService.updateStudentProgress('STU002', {
        riskLevel: 'medium' as const
      });

      const progress = studentSupportService.getStudentProgress('STU002');
      expect(progress).toBeDefined();
      expect(progress?.studentId).toBe('STU002');
      expect(progress?.riskLevel).toBe('medium');
    });
  });

  describe('createIntervention', () => {
    it('should create intervention strategy for student', () => {
      const intervention = studentSupportService.createIntervention(
        'STU001',
        'academic_support',
        'high',
        ['Tutoring session', 'Extra practice materials']
      );

      expect(intervention.id).toBeDefined();
      expect(intervention.studentId).toBe('STU001');
      expect(intervention.type).toBe('academic_support');
      expect(intervention.priority).toBe('high');
      expect(intervention.actions).toEqual(['Tutoring session', 'Extra practice materials']);
      expect(intervention.status).toBe('planned');
      expect(intervention.startDate).toBeDefined();
    });

    it('should store interventions per student', () => {
      studentSupportService.createIntervention('STU001', 'counseling', 'medium', ['Counseling session']);
      studentSupportService.createIntervention('STU001', 'academic_support', 'high', ['Tutoring']);

      const interventions = studentSupportService.getStudentInterventions('STU001');
      expect(interventions).toHaveLength(2);
      expect(interventions[0].studentId).toBe('STU001');
      expect(interventions[1].studentId).toBe('STU001');
    });
  });

  describe('getSupportStatistics', () => {
    it('should return correct statistics', () => {
      // Create some test requests
      studentSupportService.createSupportRequest('STU001', 'academic', 'math', 'Test 1', 'Description 1');
      studentSupportService.createSupportRequest('STU002', 'technical', 'login', 'Test 2', 'Description 2');
      
      const stats = studentSupportService.getSupportStatistics();
      
      expect(stats.totalRequests).toBe(2);
      expect(stats.pendingRequests).toBe(2); // Both start as pending
      expect(stats.resolvedRequests).toBe(0);
      expect(stats.escalatedRequests).toBe(0);
      expect(stats.averageResolutionTime).toBe(0);
    });
  });

  describe('generateSupportReport', () => {
    it('should generate formatted support report', () => {
      const report = studentSupportService.generateSupportReport();
      
      expect(report).toContain('LAPORAN DUKUNGAN SISWA');
      expect(report).toContain('Statistik Permintaan');
      expect(report).toContain('Monitoring Siswa');
      expect(report).toContain('Resources Tersedia');
      expect(report).toContain('Status Monitoring: ✅ Aktif');
    });
  });

  describe('getRelevantResources', () => {
    it('should filter resources by category', () => {
      const academicResources = studentSupportService.getRelevantResources('academic');
      
      expect(academicResources.length).toBeGreaterThan(0);
      academicResources.forEach(resource => {
        expect(resource.category).toBe('academic');
      });
    });

    it('should filter resources by difficulty', () => {
      const beginnerResources = studentSupportService.getRelevantResources('academic', 'beginner');
      
      beginnerResources.forEach(resource => {
        expect(resource.category).toBe('academic');
        expect(resource.difficulty).toBe('beginner');
      });
    });
  });
});