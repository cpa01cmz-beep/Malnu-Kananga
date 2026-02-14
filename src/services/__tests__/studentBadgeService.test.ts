import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { studentBadgeService, type StudentBadge } from '../studentBadgeService';

describe('studentBadgeService', () => {
  const testStudentId = 'student123';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getAllBadges', () => {
    it('should return all available badges', () => {
      const badges = studentBadgeService.getAllBadges();
      expect(badges).toBeDefined();
      expect(Array.isArray(badges)).toBe(true);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should include academic badges', () => {
      const badges = studentBadgeService.getAllBadges();
      const academicBadges = badges.filter(b => b.category === 'academic');
      expect(academicBadges.length).toBeGreaterThan(0);
    });

    it('should include attendance badges', () => {
      const badges = studentBadgeService.getAllBadges();
      const attendanceBadges = badges.filter(b => b.category === 'attendance');
      expect(attendanceBadges.length).toBeGreaterThan(0);
    });

    it('should include assignment badges', () => {
      const badges = studentBadgeService.getAllBadges();
      const assignmentBadges = badges.filter(b => b.category === 'assignment');
      expect(assignmentBadges.length).toBeGreaterThan(0);
    });
  });

  describe('getBadgeById', () => {
    it('should return badge by id', () => {
      const badge = studentBadgeService.getBadgeById('first_assignment');
      expect(badge).toBeDefined();
      expect(badge?.id).toBe('first_assignment');
    });

    it('should return undefined for invalid id', () => {
      const badge = studentBadgeService.getBadgeById('invalid_badge');
      expect(badge).toBeUndefined();
    });
  });

  describe('getUnlockedBadges', () => {
    it('should return empty array when no badges unlocked', () => {
      const badges = studentBadgeService.getUnlockedBadges(testStudentId);
      expect(badges).toEqual([]);
    });

    it('should return unlocked badges from storage', () => {
      const unlockedBadges: StudentBadge[] = [
        {
          id: 'first_assignment',
          name: 'Langkah Pertama',
          description: 'First assignment',
          icon: '🎯',
          category: 'assignment',
          requirement: { type: 'assignments_completed', value: 1 },
          unlockedAt: '2026-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(`malnu_student_badges_${testStudentId}`, JSON.stringify(unlockedBadges));

      const badges = studentBadgeService.getUnlockedBadges(testStudentId);
      expect(badges).toHaveLength(1);
      expect(badges[0].id).toBe('first_assignment');
    });
  });

  describe('checkAndUnlockBadges', () => {
    it('should check grade average and unlock badges', async () => {
      const stats = {
        gradeAverage: 90,
        attendanceRate: 100,
        assignmentsCompleted: 10,
        quizzesPassed: 5,
        streakDays: 0,
        hasPerfectScore: false,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);

      expect(Array.isArray(unlocked)).toBe(true);
    });

    it('should unlock good_student badge for grade >= 85', async () => {
      const stats = {
        gradeAverage: 85,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);
      const unlockedIds = unlocked.map(b => b.id);

      expect(unlockedIds).toContain('good_student');
    });

    it('should unlock excellent_student badge for grade >= 90', async () => {
      const stats = {
        gradeAverage: 92,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);
      const unlockedIds = unlocked.map(b => b.id);

      expect(unlockedIds).toContain('excellent_student');
    });

    it('should unlock perfect_attendance badge for 100% attendance', async () => {
      const stats = {
        gradeAverage: 0,
        attendanceRate: 100,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);
      const unlockedIds = unlocked.map(b => b.id);

      expect(unlockedIds).toContain('perfect_attendance');
    });

    it('should unlock first_assignment badge for first assignment', async () => {
      const stats = {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 1,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);
      const unlockedIds = unlocked.map(b => b.id);

      expect(unlockedIds).toContain('first_assignment');
    });

    it('should unlock first_quiz badge for first quiz', async () => {
      const stats = {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 1,
        streakDays: 0,
        hasPerfectScore: false,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);
      const unlockedIds = unlocked.map(b => b.id);

      expect(unlockedIds).toContain('first_quiz');
    });

    it('should unlock perfect_quiz badge for perfect score', async () => {
      const stats = {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: true,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);
      const unlockedIds = unlocked.map(b => b.id);

      expect(unlockedIds).toContain('perfect_quiz');
    });

    it('should unlock week_streak badge for 7+ days', async () => {
      const stats = {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 7,
        hasPerfectScore: false,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);
      const unlockedIds = unlocked.map(b => b.id);

      expect(unlockedIds).toContain('week_streak');
    });

    it('should not duplicate already unlocked badges', async () => {
      const existingBadge: StudentBadge = {
        id: 'good_student',
        name: 'Murid Baik',
        description: 'Good student',
        icon: '📖',
        category: 'academic',
        requirement: { type: 'grade_average', value: 85 },
        unlockedAt: '2026-01-01T00:00:00.000Z',
      };
      localStorage.setItem(`malnu_student_badges_${testStudentId}`, JSON.stringify([existingBadge]));

      const stats = {
        gradeAverage: 85,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false,
      };

      const unlocked = await studentBadgeService.checkAndUnlockBadges(testStudentId, stats);
      
      expect(unlocked.length).toBe(0);
    });
  });

  describe('getBadgesByCategory', () => {
    it('should return badges filtered by category', () => {
      const academicBadges = studentBadgeService.getBadgesByCategory('academic');
      expect(academicBadges.length).toBeGreaterThan(0);
      academicBadges.forEach(badge => {
        expect(badge.category).toBe('academic');
      });
    });

    it('should return empty array for invalid category', () => {
      const badges = studentBadgeService.getBadgesByCategory('special');
      expect(badges).toEqual([]);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress for grade_average', () => {
      const badge = studentBadgeService.getBadgeById('good_student');
      expect(badge).toBeDefined();

      const progress = studentBadgeService.calculateProgress(badge!, {
        gradeAverage: 80,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false,
      });

      expect(progress).toBe(80);
    });

    it('should calculate progress for attendance_rate', () => {
      const badge = studentBadgeService.getBadgeById('perfect_attendance');
      expect(badge).toBeDefined();

      const progress = studentBadgeService.calculateProgress(badge!, {
        gradeAverage: 0,
        attendanceRate: 95,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false,
      });

      expect(progress).toBe(95);
    });

    it('should calculate progress for perfect_score', () => {
      const badge = studentBadgeService.getBadgeById('perfect_quiz');
      expect(badge).toBeDefined();

      const progress = studentBadgeService.calculateProgress(badge!, {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: true,
      });

      expect(progress).toBe(100);
    });
  });

  describe('saveUnlockedBadges', () => {
    it('should save badges to localStorage', () => {
      const badges: StudentBadge[] = [
        {
          id: 'first_assignment',
          name: 'Langkah Pertama',
          description: 'First assignment',
          icon: '🎯',
          category: 'assignment',
          requirement: { type: 'assignments_completed', value: 1 },
          unlockedAt: '2026-01-01T00:00:00.000Z',
        },
      ];

      studentBadgeService.saveUnlockedBadges(testStudentId, badges);

      const stored = localStorage.getItem(`malnu_student_badges_${testStudentId}`);
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('first_assignment');
    });
  });
});
