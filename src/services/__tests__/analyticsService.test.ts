import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService } from '../analyticsService';
import type { AnalyticsFilters } from '../../types/analytics.types';
import { STORAGE_KEYS } from '../../constants';

describe('AnalyticsService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Cache Management', () => {
    it('should cache and retrieve analytics data', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'Test Range',
        },
        role: 'admin',
      };

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        { id: 'student-1', name: 'John Doe', role: 'student', className: 'Class A' },
        { id: 'teacher-1', name: 'Jane Smith', role: 'teacher', subjects: 'Mathematics' },
      ]));
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 85,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([
        {
          id: 'attendance-1',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-15',
          status: 'hadir',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));

      const firstCall = await analyticsService.getSchoolWideAnalytics(filters);
      const secondCall = await analyticsService.getSchoolWideAnalytics(filters);

      expect(firstCall).toEqual(secondCall);
      expect(firstCall.totalStudents).toBe(1);
      expect(firstCall.totalTeachers).toBe(1);
    });

    it(
      'should invalidate cache after TTL expires',
      { timeout: 10000 },
      async () => {
        const filters: AnalyticsFilters = {
          dateRange: {
            startDate: '2026-01-01',
            endDate: '2026-01-31',
            label: 'Test Range',
          },
          role: 'admin',
        };

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
          { id: 'student-1', name: 'John Doe', role: 'student', className: 'Class A' },
        ]));
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));

        const firstCall = await analyticsService.getSchoolWideAnalytics(filters);

        await new Promise(resolve => setTimeout(resolve, 5100));

        const secondCall = await analyticsService.getSchoolWideAnalytics(filters);

        expect(firstCall.totalStudents).toBe(secondCall.totalStudents);
      }
    );
  });

  describe('School-Wide Analytics', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        { id: 'student-1', name: 'John Doe', role: 'student', className: 'Class A' },
        { id: 'student-2', name: 'Jane Smith', role: 'student', className: 'Class A' },
        { id: 'teacher-1', name: 'Math Teacher', role: 'teacher', subjects: 'Mathematics, Physics' },
      ]));
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 85,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-15T10:00:00Z',
        },
        {
          id: 'grade-2',
          studentId: 'student-2',
          subjectId: 'Mathematics',
          score: 92,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([
        {
          id: 'attendance-1',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-15',
          status: 'hadir',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-15T10:00:00Z',
        },
        {
          id: 'attendance-2',
          studentId: 'student-2',
          classId: 'Class A',
          date: '2026-01-15',
          status: 'hadir',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));
    });

    it('should calculate school-wide analytics correctly', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'admin',
      };

      const analytics = await analyticsService.getSchoolWideAnalytics(filters);

      expect(analytics.totalStudents).toBe(2);
      expect(analytics.totalTeachers).toBe(1);
      expect(analytics.overallAttendanceRate).toBe(100);
      expect(analytics.overallAverageGrade).toBe(88.5);
    });

    it('should calculate subject performance correctly', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'admin',
      };

      const analytics = await analyticsService.getSchoolWideAnalytics(filters);

      expect(analytics.subjectPerformance).toHaveLength(1);
      expect(analytics.subjectPerformance[0].subject).toBe('Mathematics');
      expect(analytics.subjectPerformance[0].averageScore).toBe(88.5);
    });

    it('should calculate grade distribution correctly', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'admin',
      };

      const analytics = await analyticsService.getSchoolWideAnalytics(filters);

      expect(analytics.gradeDistribution.total).toBe(2);
      expect(analytics.gradeDistribution.A).toBe(1);
      expect(analytics.gradeDistribution.B).toBe(1);
    });

    it('should calculate class performance correctly', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'admin',
      };

      const analytics = await analyticsService.getSchoolWideAnalytics(filters);

      expect(analytics.classPerformance).toHaveLength(1);
      expect(analytics.classPerformance[0].className).toBe('Class A');
      expect(analytics.classPerformance[0].studentCount).toBe(2);
    });
  });

  describe('Student Performance Analytics', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        {
          id: 'student-1',
          userId: 'user-1',
          nisn: '1234567890',
          nis: '12345',
          class: 'Class A',
          className: 'Class A',
          address: 'Address',
          phoneNumber: '1234567890',
          parentName: 'Parent',
          parentPhone: '0987654321',
          dateOfBirth: '2005-01-01',
          enrollmentDate: '2020-01-01',
        },
      ]));
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 85,
          maxScore: 100,
          assignmentType: 'assignment',
          createdAt: '2026-01-15T10:00:00Z',
        },
        {
          id: 'grade-2',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 90,
          maxScore: 100,
          assignmentType: 'mid',
          createdAt: '2026-01-16T10:00:00Z',
        },
      ]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([
        {
          id: 'attendance-1',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-15',
          status: 'hadir',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));
    });

    it('should calculate student performance analytics correctly', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'student',
      };

      const analytics = await analyticsService.getStudentPerformanceAnalytics('student-1', filters);

      expect(analytics.studentId).toBe('student-1');
      expect(analytics.className).toBe('Class A');
      expect(analytics.overallGPA).toBe(87.5);
      expect(analytics.attendanceRate).toBe(100);
    });

    it('should calculate grade trends correctly', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'student',
      };

      const analytics = await analyticsService.getStudentPerformanceAnalytics('student-1', filters);

      expect(analytics.gradeTrend).toHaveLength(2);
      expect(analytics.gradeTrend[0].score).toBe(85);
      expect(analytics.gradeTrend[1].score).toBe(90);
    });

    it('should identify top subjects correctly', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'student',
      };

      const analytics = await analyticsService.getStudentPerformanceAnalytics('student-1', filters);

      expect(analytics.topSubjects).toContain('Mathematics');
    });
  });

  describe('Insights Generation', () => {
    it('should generate low attendance warning', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'admin',
      };

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        { id: 'student-1', name: 'John Doe', role: 'student', className: 'Class A' },
      ]));
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 85,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([
        {
          id: 'attendance-1',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-15',
          status: 'alpa',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-15T10:00:00Z',
        },
        {
          id: 'attendance-2',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-16',
          status: 'alpa',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-16T10:00:00Z',
        },
        {
          id: 'attendance-3',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-17',
          status: 'alpa',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-17T10:00:00Z',
        },
        {
          id: 'attendance-4',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-18',
          status: 'alpa',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-18T10:00:00Z',
        },
        {
          id: 'attendance-5',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-19',
          status: 'alpa',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-19T10:00:00Z',
        },
      ]));

      const analytics = await analyticsService.getSchoolWideAnalytics(filters);
      const insights = analyticsService.generateInsights(analytics);

      expect(insights.some(i => i.category === 'attendance' && i.type === 'warning')).toBe(true);
    });

    it('should generate low grade warning', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'admin',
      };

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        { id: 'student-1', name: 'John Doe', role: 'student', className: 'Class A' },
      ]));
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 50,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-15T10:00:00Z',
        },
        {
          id: 'grade-2',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 45,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-16T10:00:00Z',
        },
        {
          id: 'grade-3',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 55,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-17T10:00:00Z',
        },
        {
          id: 'grade-4',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 48,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-18T10:00:00Z',
        },
      ]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([
        {
          id: 'attendance-1',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-15',
          status: 'hadir',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));

      const analytics = await analyticsService.getSchoolWideAnalytics(filters);
      const insights = analyticsService.generateInsights(analytics);

      expect(insights.some(i => i.category === 'performance' && i.type === 'negative')).toBe(true);
    });

    it('should generate positive insight for excellent performance', async () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          label: 'January 2026',
        },
        role: 'admin',
      };

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        { id: 'student-1', name: 'John Doe', role: 'student', className: 'Class A' },
      ]));
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'Mathematics',
          score: 95,
          maxScore: 100,
          assignmentType: 'exam',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([
        {
          id: 'attendance-1',
          studentId: 'student-1',
          classId: 'Class A',
          date: '2026-01-15',
          status: 'hadir',
          notes: '',
          recordedBy: 'teacher-1',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ]));

      const analytics = await analyticsService.getSchoolWideAnalytics(filters);
      const insights = analyticsService.generateInsights(analytics);

      expect(insights.some(i => i.category === 'performance' && i.type === 'positive')).toBe(true);
    });
  });
});
