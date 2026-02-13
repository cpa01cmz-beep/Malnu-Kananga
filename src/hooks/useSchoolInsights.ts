import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { classifyError, ErrorType } from '../utils/errorHandler';
import { TIME_MS, STORAGE_KEYS } from '../constants';

interface ClassPerformance {
  className: string;
  classId: string;
  averageScore: number;
  totalStudents: number;
  attendanceRate: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface SubjectPerformance {
  subject: string;
  subjectId: string;
  averageScore: number;
  totalStudents: number;
  topScore: number;
  lowestScore: number;
  passRate: number;
}

interface SchoolAttendance {
  totalStudents: number;
  averageAttendance: number;
  byClass: Array<{
    className: string;
    attendanceRate: number;
    totalStudents: number;
  }>;
}

interface SchoolInsights {
  overview: {
    totalStudents: number;
    averageGPA: number;
    averageAttendance: number;
    totalClasses: number;
    atRiskStudents: number;
  };
  classPerformance: ClassPerformance[];
  subjectPerformance: SubjectPerformance[];
  schoolAttendance: SchoolAttendance;
  aiAnalysis: string;
  lastUpdated: string;
}

interface UseSchoolInsightsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseSchoolInsightsReturn {
  insights: SchoolInsights | null;
  loading: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

// TODO: This hook requires backend API endpoints to function fully:
// - GET /api/grades/school - Get all grades for school-wide analytics
// - GET /api/attendance/school - Get all attendance for school-wide analytics  
// - GET /api/classes/performance - Get performance by class
// - GET /api/subjects/performance - Get performance by subject
//
// For now, this implementation provides the UI structure and demonstrates
// the intended functionality. Full implementation pending backend support.

export const useSchoolInsights = ({
  autoRefresh = true,
  refreshInterval = TIME_MS.ONE_DAY,
  enabled = true,
}: UseSchoolInsightsOptions = {}): UseSchoolInsightsReturn => {
  const [insights, setInsights] = useState<SchoolInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);

  const currentUser = authAPI.getCurrentUser();

  const fetchInsights = useCallback(async () => {
    if (!isEnabled) return;

    setLoading(true);
    setError(null);

    try {
      // Try to get cached insights first
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.SCHOOL_INSIGHTS);
        if (cached) {
          const cachedInsights = JSON.parse(cached);
          const lastUpdated = new Date(cachedInsights.lastUpdated);
          const oneDayAgo = new Date(Date.now() - TIME_MS.ONE_DAY);
          
          if (lastUpdated > oneDayAgo) {
            setInsights(cachedInsights);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        logger.warn('Failed to load cached school insights:', e);
      }

      // TODO: Replace with actual API calls when backend endpoints are available:
      // const [gradesRes, attendanceRes, classesRes] = await Promise.all([
      //   gradesAPI.getSchoolGrades(),
      //   attendanceAPI.getSchoolAttendance(),
      //   classesAPI.getAll()
      // ]);
      
      // For now, create a placeholder response indicating the feature is pending backend
      const placeholderInsights: SchoolInsights = {
        overview: {
          totalStudents: 0,
          averageGPA: 0,
          averageAttendance: 0,
          totalClasses: 0,
          atRiskStudents: 0
        },
        classPerformance: [],
        subjectPerformance: [],
        schoolAttendance: {
          totalStudents: 0,
          averageAttendance: 0,
          byClass: []
        },
        aiAnalysis: 'School-wide insights require backend API endpoints. This feature is pending implementation.',
        lastUpdated: new Date().toISOString()
      };

      setInsights(placeholderInsights);

      // Cache the insights
      try {
        localStorage.setItem(STORAGE_KEYS.SCHOOL_INSIGHTS, JSON.stringify(placeholderInsights));
      } catch (e) {
        logger.warn('Failed to cache school insights:', e);
      }

    } catch (err) {
      const classifiedError = classifyError(err, {
        operation: 'fetchSchoolInsights',
        timestamp: Date.now()
      });
      
      const errorMessage = classifiedError.type === ErrorType.NETWORK_ERROR
        ? 'Tidak dapat memuat insight sekolah. Periksa koneksi internet Anda.'
        : 'Gagal memuat data insight sekolah.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isEnabled]);

  // Load on mount
  useEffect(() => {
    if (!currentUser) return;
    fetchInsights();
  }, [currentUser, fetchInsights]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !isEnabled) return;
    
    const interval = setInterval(fetchInsights, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchInsights, isEnabled]);

  const refreshInsights = useCallback(async () => {
    await fetchInsights();
  }, [fetchInsights]);

  const setEnabled = useCallback((newEnabled: boolean) => {
    setIsEnabled(newEnabled);
    if (newEnabled && !insights) {
      fetchInsights();
    }
  }, [insights, fetchInsights]);

  return {
    insights,
    loading,
    error,
    refreshInsights,
    enabled: isEnabled,
    setEnabled
  };
};

// Helper to generate sample insights for demonstration
export const generateSampleSchoolInsights = (): SchoolInsights => ({
  overview: {
    totalStudents: 150,
    averageGPA: 78.5,
    averageAttendance: 92.3,
    totalClasses: 6,
    atRiskStudents: 12
  },
  classPerformance: [
    { className: 'Kelas 10 IPA', classId: '10-ipa', averageScore: 82.1, totalStudents: 25, attendanceRate: 94.5, trend: 'improving' },
    { className: 'Kelas 10 IPS', classId: '10-ips', averageScore: 76.8, totalStudents: 22, attendanceRate: 91.2, trend: 'stable' },
    { className: 'Kelas 11 IPA', classId: '11-ipa', averageScore: 79.3, totalStudents: 28, attendanceRate: 93.1, trend: 'declining' },
    { className: 'Kelas 11 IPS', classId: '11-ips', averageScore: 75.2, totalStudents: 20, attendanceRate: 89.8, trend: 'stable' },
    { className: 'Kelas 12 IPA', classId: '12-ipa', averageScore: 81.5, totalStudents: 30, attendanceRate: 95.2, trend: 'improving' },
    { className: 'Kelas 12 IPS', classId: '12-ips', averageScore: 77.9, totalStudents: 25, attendanceRate: 90.1, trend: 'improving' }
  ],
  subjectPerformance: [
    { subject: 'Matematika', subjectId: 'math', averageScore: 72.3, totalStudents: 150, topScore: 98, lowestScore: 45, passRate: 68.5 },
    { subject: 'Bahasa Indonesia', subjectId: 'indo', averageScore: 81.2, totalStudents: 150, topScore: 100, lowestScore: 55, passRate: 82.1 },
    { subject: 'Bahasa Inggris', subjectId: 'eng', averageScore: 78.6, totalStudents: 150, topScore: 95, lowestScore: 48, passRate: 75.3 },
    { subject: 'Fisika', subjectId: 'physics', averageScore: 74.8, totalStudents: 85, topScore: 97, lowestScore: 42, passRate: 71.2 },
    { subject: 'Kimia', subjectId: 'chemistry', averageScore: 76.1, totalStudents: 85, topScore: 96, lowestScore: 50, passRate: 73.5 },
    { subject: 'Biologi', subjectId: 'biology', averageScore: 79.4, totalStudents: 85, topScore: 98, lowestScore: 52, passRate: 78.8 },
    { subject: 'Sejarah', subjectId: 'history', averageScore: 83.2, totalStudents: 150, topScore: 100, lowestScore: 60, passRate: 86.5 },
    { subject: 'Ekonomi', subjectId: 'economy', averageScore: 77.8, totalStudents: 67, topScore: 94, lowestScore: 51, passRate: 74.6 }
  ],
  schoolAttendance: {
    totalStudents: 150,
    averageAttendance: 92.3,
    byClass: [
      { className: 'Kelas 10 IPA', attendanceRate: 94.5, totalStudents: 25 },
      { className: 'Kelas 10 IPS', attendanceRate: 91.2, totalStudents: 22 },
      { className: 'Kelas 11 IPA', attendanceRate: 93.1, totalStudents: 28 },
      { className: 'Kelas 11 IPS', attendanceRate: 89.8, totalStudents: 20 },
      { className: 'Kelas 12 IPA', attendanceRate: 95.2, totalStudents: 30 },
      { className: 'Kelas 12 IPS', attendanceRate: 90.1, totalStudents: 25 }
    ]
  },
  aiAnalysis: 'Analisis AI: Tingkat kehadiran sekolah keseluruhan baik (92.3%). Kelas 12 IPA menunjukkan performa terbaik dengan trend meningkat. Perhatikan Kelas 11 IPS dan Kelas 12 IPS yang menunjukkan trend stabil namun memiliki tingkat kehadiran lebih rendah. Fokus intervensi pada mata pelajaran Matematika dan Fisika yang memiliki pass rate terendah.',
  lastUpdated: new Date().toISOString()
});
