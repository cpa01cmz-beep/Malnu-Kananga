import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { studentTimelineService } from '../studentTimelineService';
import type {
  TimelineEvent,
  TimelineFilter,
} from '../../types/timeline';

describe('studentTimelineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    studentTimelineService.clearCache();
  });

  describe('getTimeline', () => {
    it('should return empty array when no data exists', async () => {
      const result = await studentTimelineService.getTimeline('student-1');

      expect(result).toEqual([]);
    });

    it('should return timeline events sorted by timestamp desc by default', async () => {
      localStorage.setItem('malnu_grades', JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'subject-1',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 1',
          score: 85,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-02T10:00:00Z',
        },
        {
          id: 'grade-2',
          studentId: 'student-1',
          subjectId: 'subject-2',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 2',
          score: 90,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-03T10:00:00Z',
        },
      ]));

      const result = await studentTimelineService.getTimeline('student-1', {
        sortBy: 'timestamp',
        sortOrder: 'desc',
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('grade-grade-2');
      expect(result[1].id).toBe('grade-grade-1');
    });
  });

  describe('getFilteredTimeline', () => {
    it('should filter events by type', async () => {
      localStorage.setItem('malnu_grades', JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'subject-1',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 1',
          score: 85,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ]));

      const filter: TimelineFilter = {
        eventTypes: ['grade'],
      };

      const result = await studentTimelineService.getFilteredTimeline('student-1', filter);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('grade');
    });

    it('should filter events by date range', async () => {
      localStorage.setItem('malnu_grades', JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'subject-1',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 1',
          score: 85,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-01T10:00:00Z',
        },
        {
          id: 'grade-2',
          studentId: 'student-1',
          subjectId: 'subject-2',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 2',
          score: 90,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-15T10:00:00Z',
        },
      ]));

      const filter: TimelineFilter = {
        dateRange: {
          startDate: '2024-01-10',
          endDate: '2024-01-20',
        },
      };

      const result = await studentTimelineService.getFilteredTimeline('student-1', filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('grade-grade-2');
    });

    it('should filter events by minimum score', async () => {
      localStorage.setItem('malnu_grades', JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'subject-1',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 1',
          score: 75,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-01T10:00:00Z',
        },
        {
          id: 'grade-2',
          studentId: 'student-1',
          subjectId: 'subject-2',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 2',
          score: 90,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-15T10:00:00Z',
        },
      ]));

      const filter: TimelineFilter = {
        minScore: 80,
      };

      const result = await studentTimelineService.getFilteredTimeline('student-1', filter);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('grade');
    });
  });

  describe('getTimelineStats', () => {
    it('should return stats for timeline events', async () => {
      localStorage.setItem('malnu_grades', JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'subject-1',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 1',
          score: 85,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ]));

      const stats = await studentTimelineService.getTimelineStats('student-1');

      expect(stats.totalEvents).toBe(1);
      expect(stats.averageScore).toBe(85);
    });

    it('should return undefined average score when no grades exist', async () => {
      const stats = await studentTimelineService.getTimelineStats('student-1');

      expect(stats.totalEvents).toBe(0);
      expect(stats.averageScore).toBeUndefined();
    });
  });

  describe('addEvent', () => {
    it('should update cache with new event', async () => {
      localStorage.setItem('malnu_grades', JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'subject-1',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 1',
          score: 85,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ]));

      await studentTimelineService.getTimeline('student-1');

      const mockEvent: TimelineEvent = {
        id: 'test-event-1',
        type: 'grade',
        studentId: 'student-1',
        title: 'Test Event',
        description: 'Test Description',
        icon: '📊',
        color: 'text-green-600',
        timestamp: '2024-01-01T11:00:00Z',
        data: {
          gradeId: 'grade-1',
          subjectId: 'subject-1',
          score: 85,
          maxScore: 100,
        },
      };

      await studentTimelineService.addEvent(mockEvent);

      const cachedData = localStorage.getItem('malnu_timeline_student-1');
      expect(cachedData).toBeDefined();

      if (cachedData) {
        const cachedEvents = JSON.parse(cachedData);
        expect(cachedEvents).toContainEqual(mockEvent);
      }
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific student', async () => {
      localStorage.setItem('malnu_grades', JSON.stringify([
        {
          id: 'grade-1',
          studentId: 'student-1',
          subjectId: 'subject-1',
          classId: 'class-1',
          academicYear: '2024',
          semester: '1',
          assignmentName: 'Assignment 1',
          score: 85,
          maxScore: 100,
          createdBy: 'teacher-1',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ]));

      await studentTimelineService.getTimeline('student-1');

      studentTimelineService.clearCache('student-1');

      const result = await studentTimelineService.getTimeline('student-1');

      expect(result).toHaveLength(1);
    });

    it('should clear all cache when no student ID provided', () => {
      studentTimelineService.clearCache();

      expect(localStorage.getItem('malnu_timeline_student-1')).toBeNull();
    });
  });
});
