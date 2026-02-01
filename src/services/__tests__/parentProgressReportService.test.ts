import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parentProgressReportService } from '../parentProgressReportService';
import type { Grade, Attendance } from '../../types';

describe('parentProgressReportService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('generateProgressReport', () => {
    it('should generate a progress report with AI analysis', async () => {
      const grades: Grade[] = [
        {
          id: '1',
          studentId: 'student1',
          subjectId: 'subject1',
          classId: 'class1',
          academicYear: '2024-2025',
          semester: '1',
          assignmentType: 'tugas',
          assignmentName: 'Tugas 1',
          score: 85,
          maxScore: 100,
          createdBy: 'teacher1',
          createdAt: '2024-01-15T10:00:00Z',
          subjectName: 'Matematika'
        },
        {
          id: '2',
          studentId: 'student1',
          subjectId: 'subject2',
          classId: 'class1',
          academicYear: '2024-2025',
          semester: '1',
          assignmentType: 'tugas',
          assignmentName: 'Tugas 1',
          score: 75,
          maxScore: 100,
          createdBy: 'teacher1',
          createdAt: '2024-01-20T10:00:00Z',
          subjectName: 'Fisika'
        }
      ];

      const attendance: Attendance[] = [
        {
          id: '1',
          studentId: 'student1',
          classId: 'class1',
          date: '2024-01-15',
          status: 'hadir',
          notes: '',
          recordedBy: 'teacher1',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          studentId: 'student1',
          classId: 'class1',
          date: '2024-01-16',
          status: 'hadir',
          notes: '',
          recordedBy: 'teacher1',
          createdAt: '2024-01-16T10:00:00Z'
        }
      ];

      // Mock geminiService
      vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance').mockResolvedValue(
        'Test AI analysis for progress report'
      );

      const report = await parentProgressReportService.generateProgressReport(
        'student1',
        'John Doe',
        'parent1',
        grades,
        attendance
      );

      expect(report).toBeDefined();
      expect(report.studentId).toBe('student1');
      expect(report.studentName).toBe('John Doe');
      expect(report.parentId).toBe('parent1');
      expect(report.analysis).toBe('Test AI analysis for progress report');
      expect(report.gradesData.subjects).toHaveLength(2);
      expect(report.attendanceData.percentage).toBe(100);
      expect(report.generatedAt).toBeDefined();
    });

    it('should return cached report if within TTL', async () => {
      const grades: Grade[] = [{
        id: '1',
        studentId: 'student1',
        subjectId: 'subject1',
        classId: 'class1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher1',
        createdAt: '2024-01-15T10:00:00Z',
        subjectName: 'Matematika'
      }];

      const attendance: Attendance[] = [{
        id: '1',
        studentId: 'student1',
        classId: 'class1',
        date: '2024-01-15',
        status: 'hadir',
        notes: '',
        recordedBy: 'teacher1',
        createdAt: '2024-01-15T10:00:00Z'
      }];

      const mockAnalyze = vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance').mockResolvedValue(
        'First analysis'
      );

      // Generate first report
      const report1 = await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, attendance
      );

      // Generate second report (should use cache)
      const report2 = await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, attendance
      );

      expect(report2.id).toBe(report1.id);
      expect(report2.analysis).toBe('First analysis');
      expect(mockAnalyze).toHaveBeenCalledTimes(1);
    });

    it('should force refresh when forceRefresh is true', async () => {
      const grades: Grade[] = [{
        id: '1',
        studentId: 'student1',
        subjectId: 'subject1',
        classId: 'class1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher1',
        createdAt: '2024-01-15T10:00:00Z',
        subjectName: 'Matematika'
      }];

      const attendance: Attendance[] = [{
        id: '1',
        studentId: 'student1',
        classId: 'class1',
        date: '2024-01-15',
        status: 'hadir',
        notes: '',
        recordedBy: 'teacher1',
        createdAt: '2024-01-15T10:00:00Z'
       }];

      const mockAnalyze = vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance')
        .mockResolvedValueOnce('First analysis')
        .mockResolvedValueOnce('Second analysis');

      // Generate first report
      await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, attendance
      );

      // Generate with force refresh
      const report2 = await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, attendance, true
      );

      expect(mockAnalyze).toHaveBeenCalledTimes(2);
      expect(report2.analysis).toBe('Second analysis');
    });

    it('should handle empty grades and attendance', async () => {
      vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance')
        .mockResolvedValue('Empty analysis');

      const report = await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', [], []
      );

      expect(report.gradesData.subjects).toHaveLength(0);
      expect(report.gradesData.averageScore).toBe(0);
      expect(report.attendanceData.percentage).toBe(100);
      expect(report.trendsData).toHaveLength(0);
    });

    it('should calculate correct subject trends', async () => {
      const grades: Grade[] = [
        {
          id: '1',
          studentId: 'student1',
          subjectId: 'subject1',
          classId: 'class1',
          academicYear: '2024-2025',
          semester: '1',
          assignmentType: 'tugas',
          assignmentName: 'Tugas 1',
          score: 70,
          maxScore: 100,
          createdBy: 'teacher1',
          createdAt: '2024-01-01T10:00:00Z',
          subjectName: 'Matematika'
        },
        {
          id: '2',
          studentId: 'student1',
          subjectId: 'subject1',
          classId: 'class1',
          academicYear: '2024-2025',
          semester: '1',
          assignmentType: 'tugas',
          assignmentName: 'Tugas 2',
          score: 85,
          maxScore: 100,
          createdBy: 'teacher1',
          createdAt: '2024-01-15T10:00:00Z',
          subjectName: 'Matematika'
        }
      ];

      vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance').mockResolvedValue('Test');

      const report = await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, []
      );

      expect(report.gradesData.subjects[0].trend).toBe('up');
    });
  });

  describe('getCachedReport', () => {
    it('should return null when no cache exists', () => {
      const cached = parentProgressReportService.getCachedReport('student1', 'parent1');
      expect(cached).toBeNull();
    });

    it('should return cached report when exists', async () => {
      const grades: Grade[] = [{
        id: '1',
        studentId: 'student1',
        subjectId: 'subject1',
        classId: 'class1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher1',
        createdAt: '2024-01-15T10:00:00Z',
        subjectName: 'Matematika'
      }];

      vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance').mockResolvedValue('Test');

      await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, []
      );

      const cached = parentProgressReportService.getCachedReport('student1', 'parent1');
      expect(cached).toBeDefined();
      expect(cached?.studentId).toBe('student1');
    });
  });

  describe('getParentReports', () => {
    it('should return empty array when no reports exist', () => {
      const reports = parentProgressReportService.getParentReports('parent1');
      expect(reports).toEqual([]);
    });

    it('should return all reports for a parent sorted by date', async () => {
      const grades: Grade[] = [{
        id: '1',
        studentId: 'student1',
        subjectId: 'subject1',
        classId: 'class1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher1',
        createdAt: '2024-01-15T10:00:00Z',
        subjectName: 'Matematika'
      }];

      vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance').mockResolvedValue('Test');

      // Generate report for student 1
      await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, []
      );

      // Generate report for student 2
      await parentProgressReportService.generateProgressReport(
        'student2', 'Jane', 'parent1', [], []
      );

      const reports = parentProgressReportService.getParentReports('parent1');
      expect(reports).toHaveLength(2);
      expect(reports[0].generatedAt >= reports[1].generatedAt).toBe(true);
    });
  });

  describe('Settings Management', () => {
    it('should return null when no settings exist', () => {
      const settings = parentProgressReportService.getSettings('parent1');
      expect(settings).toBeNull();
    });

    it('should save and retrieve settings', () => {
      const settings = {
        parentId: 'parent1',
        frequency: 'bi-weekly' as const,
        enableNotifications: true,
        quietHoursStart: '23:00',
        quietHoursEnd: '08:00'
      };

      parentProgressReportService.saveSettings(settings);
      const retrieved = parentProgressReportService.getSettings('parent1');

      expect(retrieved).toEqual(settings);
    });

    it('should return default settings', () => {
      const defaults = parentProgressReportService.getDefaultSettings('parent1');

      expect(defaults.parentId).toBe('parent1');
      expect(defaults.frequency).toBe('weekly');
      expect(defaults.enableNotifications).toBe(true);
      expect(defaults.quietHoursStart).toBe('22:00');
      expect(defaults.quietHoursEnd).toBe('07:00');
    });
  });

  describe('shouldGenerateReport', () => {
    it('should return false when no settings exist', () => {
      const shouldGenerate = parentProgressReportService.shouldGenerateReport('parent1');
      expect(shouldGenerate).toBe(false);
    });

    it('should return false when notifications disabled', () => {
      const settings = {
        parentId: 'parent1',
        frequency: 'weekly' as const,
        enableNotifications: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
      };

      parentProgressReportService.saveSettings(settings);
      const shouldGenerate = parentProgressReportService.shouldGenerateReport('parent1');
      expect(shouldGenerate).toBe(false);
    });

    it('should return true when no previous report', () => {
      const settings = {
        parentId: 'parent1',
        frequency: 'weekly' as const,
        enableNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
      };

      parentProgressReportService.saveSettings(settings);
      const shouldGenerate = parentProgressReportService.shouldGenerateReport('parent1');
      expect(shouldGenerate).toBe(true);
    });

    it('should return true when weekly frequency and 7 days passed', () => {
      const settings = {
        parentId: 'parent1',
        frequency: 'weekly' as const,
        enableNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        lastReportDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      };

      parentProgressReportService.saveSettings(settings);
      const shouldGenerate = parentProgressReportService.shouldGenerateReport('parent1');
      expect(shouldGenerate).toBe(true);
    });

    it('should return false when weekly frequency and less than 7 days passed', () => {
      const settings = {
        parentId: 'parent1',
        frequency: 'weekly' as const,
        enableNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        lastReportDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      parentProgressReportService.saveSettings(settings);
      const shouldGenerate = parentProgressReportService.shouldGenerateReport('parent1');
      expect(shouldGenerate).toBe(false);
    });
  });

  describe('deleteReport', () => {
    it('should delete report successfully', async () => {
      const grades: Grade[] = [{
        id: '1',
        studentId: 'student1',
        subjectId: 'subject1',
        classId: 'class1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher1',
        createdAt: '2024-01-15T10:00:00Z',
        subjectName: 'Matematika'
      }];

      vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance').mockResolvedValue('Test');

      const report = await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, []
      );

      const result = parentProgressReportService.deleteReport(report.id, 'student1');
      expect(result).toBe(true);

      const cached = parentProgressReportService.getCachedReport('student1', 'parent1');
      expect(cached).toBeNull();
    });

    it('should return false when report not found', () => {
      const result = parentProgressReportService.deleteReport('nonexistent', 'student1');
      expect(result).toBe(false);
    });
  });

  describe('clearStudentReports', () => {
    it('should clear all reports for a student', async () => {
      const grades: Grade[] = [{
        id: '1',
        studentId: 'student1',
        subjectId: 'subject1',
        classId: 'class1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher1',
        createdAt: '2024-01-15T10:00:00Z',
        subjectName: 'Matematika'
      }];

      vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance').mockResolvedValue('Test');

      await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, []
      );

      parentProgressReportService.clearStudentReports('student1');

      const cached = parentProgressReportService.getCachedReport('student1', 'parent1');
      expect(cached).toBeNull();
    });
  });

  describe('scoreToLetterGrade', () => {
    it('should convert scores to letter grades correctly', async () => {
      const grades: Grade[] = [
        { id: '1', studentId: 's', subjectId: '1', classId: '1', academicYear: '2024', semester: '1', assignmentType: 't', assignmentName: 'T', score: 95, maxScore: 100, createdBy: 't', createdAt: '2024-01-01', subjectName: 'Matematika' },
        { id: '2', studentId: 's', subjectId: '1', classId: '1', academicYear: '2024', semester: '1', assignmentType: 't', assignmentName: 'T', score: 85, maxScore: 100, createdBy: 't', createdAt: '2024-01-01', subjectName: 'Fisika' },
        { id: '3', studentId: 's', subjectId: '1', classId: '1', academicYear: '2024', semester: '1', assignmentType: 't', assignmentName: 'T', score: 75, maxScore: 100, createdBy: 't', createdAt: '2024-01-01', subjectName: 'Kimia' },
        { id: '4', studentId: 's', subjectId: '1', classId: '1', academicYear: '2024', semester: '1', assignmentType: 't', assignmentName: 'T', score: 65, maxScore: 100, createdBy: 't', createdAt: '2024-01-01', subjectName: 'Biologi' },
        { id: '5', studentId: 's', subjectId: '1', classId: '1', academicYear: '2024', semester: '1', assignmentType: 't', assignmentName: 'T', score: 55, maxScore: 100, createdBy: 't', createdAt: '2024-01-01', subjectName: 'Sejarah' }
      ];

      vi.spyOn(await import('../geminiService'), 'analyzeStudentPerformance').mockResolvedValue('Test');

      const report = await parentProgressReportService.generateProgressReport(
        'student1', 'John', 'parent1', grades, []
      );

      const letterGrades = report.gradesData.subjects.map(s => s.grade);
      expect(letterGrades).toContain('A');
      expect(letterGrades).toContain('B');
      expect(letterGrades).toContain('C');
      expect(letterGrades).toContain('D');
      expect(letterGrades).toContain('E');
    });
  });
});
