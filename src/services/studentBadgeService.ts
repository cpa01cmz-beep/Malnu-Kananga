import { logger } from '../utils/logger';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'academic' | 'attendance' | 'assignment' | 'quiz' | 'streak' | 'special';
  requirement: {
    type: 'grade_average' | 'attendance_rate' | 'assignments_completed' | 'quizzes_passed' | 'streak_days' | 'perfect_score';
    value: number;
  };
  unlockedAt?: string;
}

export interface StudentBadge extends Badge {
  unlockedAt: string;
}

const BADGES: Badge[] = [
  {
    id: 'first_assignment',
    name: 'Langkah Pertama',
    description: 'Menyelesaikan tugas pertama Anda',
    icon: '🎯',
    category: 'assignment',
    requirement: { type: 'assignments_completed', value: 1 }
  },
  {
    id: 'five_assignments',
    name: 'Sangat Aktif',
    description: 'Menyelesaikan 5 tugas',
    icon: '📚',
    category: 'assignment',
    requirement: { type: 'assignments_completed', value: 5 }
  },
  {
    id: 'ten_assignments',
    name: 'Sangat Berkomitmen',
    description: 'Menyelesaikan 10 tugas',
    icon: '🏆',
    category: 'assignment',
    requirement: { type: 'assignments_completed', value: 10 }
  },
  {
    id: 'perfect_attendance',
    name: 'Kehadiran Sempurna',
    description: 'Memiliki tingkat kehadiran 100%',
    icon: '⭐',
    category: 'attendance',
    requirement: { type: 'attendance_rate', value: 100 }
  },
  {
    id: 'great_attendance',
    name: 'Sangat Rajin',
    description: 'Memiliki tingkat kehadiran di atas 95%',
    icon: '🌟',
    category: 'attendance',
    requirement: { type: 'attendance_rate', value: 95 }
  },
  {
    id: 'good_student',
    name: 'Murid Baik',
    description: 'Memiliki rata-rata nilai di atas 85',
    icon: '📖',
    category: 'academic',
    requirement: { type: 'grade_average', value: 85 }
  },
  {
    id: 'excellent_student',
    name: 'Sangat Cemerlang',
    description: 'Memiliki rata-rata nilai di atas 90',
    icon: '🎓',
    category: 'academic',
    requirement: { type: 'grade_average', value: 90 }
  },
  {
    id: 'top_student',
    name: 'Siswa Terbaik',
    description: 'Memiliki rata-rata nilai di atas 95',
    icon: '👑',
    category: 'academic',
    requirement: { type: 'grade_average', value: 95 }
  },
  {
    id: 'first_quiz',
    name: 'Ujian Perdana',
    description: 'Mengikuti kuis pertama',
    icon: '✏️',
    category: 'quiz',
    requirement: { type: 'quizzes_passed', value: 1 }
  },
  {
    id: 'quiz_master',
    name: 'Ahli Kuis',
    description: 'Lulus 5 kuis',
    icon: '🧠',
    category: 'quiz',
    requirement: { type: 'quizzes_passed', value: 5 }
  },
  {
    id: 'perfect_quiz',
    name: 'Sempurna',
    description: 'Mendapatkan nilai sempurna dalam kuis',
    icon: '💯',
    category: 'quiz',
    requirement: { type: 'perfect_score', value: 100 }
  },
  {
    id: 'week_streak',
    name: 'Seminggu Beruntun',
    description: 'Belajar selama 7 hari berturut-turut',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak_days', value: 7 }
  },
  {
    id: 'month_streak',
    name: 'Sebulan Beruntun',
    description: 'Belajar selama 30 hari berturut-turut',
    icon: '💪',
    category: 'streak',
    requirement: { type: 'streak_days', value: 30 }
  }
];

const BADGES_STORAGE_KEY = 'malnu_student_badges';

export const studentBadgeService = {
  getAllBadges(): Badge[] {
    return BADGES;
  },

  getBadgeById(id: string): Badge | undefined {
    return BADGES.find(b => b.id === id);
  },

  getBadgesByCategory(category: Badge['category']): Badge[] {
    return BADGES.filter(b => b.category === category);
  },

  getUnlockedBadges(studentId: string): StudentBadge[] {
    try {
      const stored = localStorage.getItem(`${BADGES_STORAGE_KEY}_${studentId}`);
      if (stored) {
        return JSON.parse(stored) as StudentBadge[];
      }
    } catch (err) {
      logger.error('Failed to get unlocked badges:', err);
    }
    return [];
  },

  saveUnlockedBadges(studentId: string, badges: StudentBadge[]): void {
    try {
      localStorage.setItem(`${BADGES_STORAGE_KEY}_${studentId}`, JSON.stringify(badges));
    } catch (err) {
      logger.error('Failed to save unlocked badges:', err);
    }
  },

  checkAndUnlockBadges(
    studentId: string,
    stats: {
      gradeAverage: number;
      attendanceRate: number;
      assignmentsCompleted: number;
      quizzesPassed: number;
      streakDays: number;
      hasPerfectScore: boolean;
    }
  ): StudentBadge[] {
    const unlockedBadges = this.getUnlockedBadges(studentId);
    const unlockedIds = new Set(unlockedBadges.map(b => b.id));
    const newlyUnlocked: StudentBadge[] = [];

    for (const badge of BADGES) {
      if (unlockedIds.has(badge.id)) continue;

      let earned = false;
      switch (badge.requirement.type) {
        case 'grade_average':
          earned = stats.gradeAverage >= badge.requirement.value;
          break;
        case 'attendance_rate':
          earned = stats.attendanceRate >= badge.requirement.value;
          break;
        case 'assignments_completed':
          earned = stats.assignmentsCompleted >= badge.requirement.value;
          break;
        case 'quizzes_passed':
          earned = stats.quizzesPassed >= badge.requirement.value;
          break;
        case 'streak_days':
          earned = stats.streakDays >= badge.requirement.value;
          break;
        case 'perfect_score':
          earned = stats.hasPerfectScore && badge.requirement.value === 100;
          break;
      }

      if (earned) {
        const newBadge: StudentBadge = {
          ...badge,
          unlockedAt: new Date().toISOString()
        };
        newlyUnlocked.push(newBadge);
        unlockedBadges.push(newBadge);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.saveUnlockedBadges(studentId, unlockedBadges);
      logger.info(`Unlocked ${newlyUnlocked.length} new badges for student ${studentId}`);
    }

    return newlyUnlocked;
  },

  calculateProgress(
    badge: Badge,
    stats: {
      gradeAverage: number;
      attendanceRate: number;
      assignmentsCompleted: number;
      quizzesPassed: number;
      streakDays: number;
      hasPerfectScore: boolean;
    }
  ): number {
    let current = 0;
    switch (badge.requirement.type) {
      case 'grade_average':
        current = stats.gradeAverage;
        break;
      case 'attendance_rate':
        current = stats.attendanceRate;
        break;
      case 'assignments_completed':
        current = stats.assignmentsCompleted;
        break;
      case 'quizzes_passed':
        current = stats.quizzesPassed;
        break;
      case 'streak_days':
        current = stats.streakDays;
        break;
      case 'perfect_score':
        current = stats.hasPerfectScore ? 100 : 0;
        break;
    }
    return Math.min(100, Math.round((current / badge.requirement.value) * 100));
  }
};
