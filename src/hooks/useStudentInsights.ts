import { useState, useEffect, useCallback } from 'react';
import { analyzeStudentPerformance } from '../services/geminiService';
import { gradesAPI, attendanceAPI } from '../services/apiService';
import { Grade, Attendance } from '../types';
import { authAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { classifyError, logError, ErrorType } from '../utils/errorHandler';
import { STORAGE_KEYS } from '../constants';

interface GradePerformance {
  subject: string;
  averageScore: number;
  grade: string;
  trend: 'improving' | 'declining' | 'stable';
  assignments: number[];
  exams: number[];
}

interface AttendanceInsight {
  totalDays: number;
  present: number;
  sick: number;
  permitted: number;
  absent: number;
  percentage: number;
  impactOnGrades: string;
}

interface StudyRecommendation {
  priority: 'high' | 'medium' | 'low';
  subject: string;
  recommendation: string;
  timeAllocation: string;
  resources: string[];
}

interface PerformanceTrend {
  month: string;
  averageScore: number;
  attendanceRate: number;
}

interface StudentInsights {
  overallPerformance: {
    gpa: number;
    classRank: string;
    totalSubjects: number;
    improvementRate: number;
  };
  gradePerformance: GradePerformance[];
  attendanceInsight: AttendanceInsight;
  studyRecommendations: StudyRecommendation[];
  performanceTrends: PerformanceTrend[];
  aiAnalysis: string;
  motivationalMessage: string;
  lastUpdated: string;
}

interface UseStudentInsightsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseStudentInsightsReturn {
  insights: StudentInsights | null;
  loading: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  isGenerating: boolean;
}

export const useStudentInsights = ({
  autoRefresh = true,
  refreshInterval = 24 * 60 * 60 * 1000, // 24 hours
  enabled = true
}: UseStudentInsightsOptions = {}): UseStudentInsightsReturn => {
  const [insights, setInsights] = useState<StudentInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);

  const currentUser = authAPI.getCurrentUser();
  const studentId = currentUser?.id;

  const processGradeData = useCallback((grades: Grade[]): GradePerformance[] => {
    const subjectMap = new Map<string, GradePerformance>();

    grades.forEach(grade => {
      const subjectName = grade.subjectName || `Subject ${grade.subjectId}`;
      
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          subject: subjectName,
          averageScore: 0,
          grade: '',
          trend: 'stable',
          assignments: [],
          exams: []
        });
      }

      const perf = subjectMap.get(subjectName)!;
      
      if (grade.assignment !== undefined) {
        perf.assignments.push(grade.assignment);
      }
      if (grade.midExam !== undefined) {
        perf.exams.push(grade.midExam);
      }
      if (grade.finalExam !== undefined) {
        perf.exams.push(grade.finalExam);
      }
    });

    // Calculate averages and grades
    subjectMap.forEach((perf, _subject) => {
      const allScores = [...perf.assignments, ...perf.exams];
      perf.averageScore = allScores.length > 0 
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
        : 0;

      perf.grade = getGradeFromScore(perf.averageScore);
      
      // Simple trend calculation (can be enhanced)
      if (perf.assignments.length >= 3) {
        const recent = perf.assignments.slice(-2);
        const earlier = perf.assignments.slice(-4, -2);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg;
        
        if (recentAvg > earlierAvg + 2) perf.trend = 'improving';
        else if (recentAvg < earlierAvg - 2) perf.trend = 'declining';
      }
    });

    return Array.from(subjectMap.values());
  }, []);

  const processAttendanceData = useCallback((attendance: Attendance[]): AttendanceInsight => {
    const totalDays = attendance.length;
    const present = attendance.filter(a => a.status === 'hadir').length;
    const sick = attendance.filter(a => a.status === 'sakit').length;
    const permitted = attendance.filter(a => a.status === 'izin').length;
    const absent = attendance.filter(a => a.status === 'alpa').length;
    const percentage = totalDays > 0 ? (present / totalDays) * 100 : 0;

    let impactOnGrades = '';
    if (percentage >= 95) impactOnGrades = 'Kehadiran sangat baik mendukung prestasi akademik';
    else if (percentage >= 90) impactOnGrades = 'Kehadiran baik, namun perlu ditingkatkan';
    else if (percentage >= 85) impactOnGrades = 'Kehadiran perlu perhatian, dapat mempengaruhi prestasi';
    else impactOnGrades = 'Kehadiran rendah dapat menghambat prestasi akademik';

    return {
      totalDays,
      present,
      sick,
      permitted,
      absent,
      percentage,
      impactOnGrades
    };
  }, []);

  const generateTrends = useCallback((grades: Grade[], attendance: Attendance[]): PerformanceTrend[] => {
    // Group by month and calculate averages
    const monthlyData = new Map<string, { scores: number[], attendanceCount: number, totalDays: number }>();

    grades.forEach(grade => {
      const date = new Date(grade.createdAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { scores: [], attendanceCount: 0, totalDays: 0 });
      }

      const score = grade.score || grade.assignment || grade.midExam || grade.finalExam || 0;
      if (score > 0) {
        monthlyData.get(monthKey)!.scores.push(score);
      }
    });

    attendance.forEach(att => {
      const date = new Date(att.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { scores: [], attendanceCount: 0, totalDays: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      data.totalDays++;
      if (att.status === 'hadir') data.attendanceCount++;
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: formatMonth(month),
        averageScore: data.scores.length > 0 
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length 
          : 0,
        attendanceRate: data.totalDays > 0 ? (data.attendanceCount / data.totalDays) * 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, []);

  const fetchInsights = useCallback(async () => {
    if (!studentId || !isEnabled) return;

    setLoading(true);
    setError(null);
    setIsGenerating(true);

    // Helper function to get AI analysis with offline support
    const getAIAnalysis = async (aiData: any): Promise<string> => {
      try {
        // Check if any cached AI analysis exists for this data
        const cachedAnalyses = JSON.parse(localStorage.getItem(STORAGE_KEYS.CACHED_AI_ANALYSES) || '[]');
        const dataKey = JSON.stringify(aiData);
        
        // Find matching cached analysis (within 30 minutes)
        const matchingAnalysis = cachedAnalyses.find((analysis: any) => {
          if (analysis.operation === 'studentAnalysis') {
            const analysisTime = new Date(analysis.timestamp);
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            return analysisTime > thirtyMinutesAgo;
          }
          return false;
        });

        if (matchingAnalysis) {
          logger.info('Using cached AI analysis');
          return matchingAnalysis.result;
        }
      } catch (e) {
        logger.warn('Failed to check cached AI analyses:', e);
      }

      // Generate new analysis
      return await analyzeStudentPerformance(aiData);
    };

    // Check for cached insights first
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STUDENT_INSIGHTS(studentId));
      if (cached) {
        const cachedInsights = JSON.parse(cached);
        
        // Check if cached insights are fresh (less than 30 minutes old)
        const lastUpdated = new Date(cachedInsights.lastUpdated);
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        if (lastUpdated > thirtyMinutesAgo) {
          setInsights(cachedInsights);
          setIsGenerating(false);
          setLoading(false);
          return;
        }
        
        // Otherwise, keep old insights but fetch fresh ones
        setInsights(cachedInsights);
      }
    } catch (e) {
      logger.warn('Failed to load cached insights:', e);
    }

    try {
      const [gradesRes, attendanceRes] = await Promise.all([
        gradesAPI.getByStudent(studentId),
        attendanceAPI.getByStudent(studentId)
      ]);

      if (!gradesRes.success || !gradesRes.data) {
        throw new Error('Gagal memuat data nilai');
      }

      const grades = gradesRes.data;
      const attendance = attendanceRes.data || [];

      // Process data locally
      const gradePerformance = processGradeData(grades);
      const attendanceInsight = processAttendanceData(attendance);
      const performanceTrends = generateTrends(grades, attendance);

      // Calculate overall performance
      const gpa = gradePerformance.length > 0 
        ? gradePerformance.reduce((sum, gp) => sum + gp.averageScore, 0) / gradePerformance.length 
        : 0;

      // Get AI analysis
      const aiData = {
        grades: gradePerformance.map(gp => ({
          subject: gp.subject,
          score: gp.averageScore,
          grade: gp.grade,
          trend: gp.trend
        })),
        attendance: {
          percentage: attendanceInsight.percentage,
          totalDays: attendanceInsight.totalDays,
          present: attendanceInsight.present,
          absent: attendanceInsight.absent
        },
        trends: performanceTrends
      };

      const aiAnalysis = await getAIAnalysis(aiData);

      // Generate study recommendations based on data
      const studyRecommendations = generateStudyRecommendations(gradePerformance, attendanceInsight);

      // Generate motivational message
      const motivationalMessage = generateMotivationalMessage(gpa, attendanceInsight.percentage);

      const newInsights: StudentInsights = {
        overallPerformance: {
          gpa,
          classRank: 'Tidak tersedia', // Would need class comparison data
          totalSubjects: gradePerformance.length,
          improvementRate: calculateImprovementRate(performanceTrends)
        },
        gradePerformance,
        attendanceInsight,
        studyRecommendations,
        performanceTrends,
        aiAnalysis,
        motivationalMessage,
        lastUpdated: new Date().toISOString()
      };

      setInsights(newInsights);
      
      // Cache insights locally
      try {
        localStorage.setItem(STORAGE_KEYS.STUDENT_INSIGHTS(studentId), JSON.stringify(newInsights));
      } catch (e) {
        logger.warn('Failed to cache insights:', e);
      }

    } catch (err) {
      const classifiedError = classifyError(err, {
        operation: 'fetchStudentInsights',
        timestamp: Date.now()
      });
      logError(classifiedError);
      
      const errorMessage = classifiedError.type === ErrorType.NETWORK_ERROR 
        ? 'Gagal memuat insight. Periksa koneksi internet Anda.'
        : 'Gagal memuat data insight. Silakan coba lagi.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  }, [studentId, isEnabled, processGradeData, processAttendanceData, generateTrends]);

  // Load cached insights on mount
  useEffect(() => {
    if (!studentId) return;

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STUDENT_INSIGHTS(studentId));
      if (cached) {
        const parsedInsights = JSON.parse(cached);
        const cachedTime = new Date(parsedInsights.lastUpdated).getTime();
        const now = new Date().getTime();
        
        // Use cached data if less than 24 hours old
        if (now - cachedTime < refreshInterval) {
          setInsights(parsedInsights);
          return;
        }
      }
    } catch (e) {
      logger.warn('Failed to load cached insights:', e);
    }

    fetchInsights();
  }, [studentId, fetchInsights, refreshInterval]);

  // Auto refresh if enabled
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
    
    // Store preference
    if (studentId) {
      localStorage.setItem(STORAGE_KEYS.INSIGHTS_ENABLED(studentId), newEnabled.toString());
    }
    
    if (newEnabled && !insights) {
      fetchInsights();
    }
  }, [studentId, insights, fetchInsights]);

  // Load enabled preference
  useEffect(() => {
    if (studentId) {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.INSIGHTS_ENABLED(studentId));
        if (saved !== null) {
          setIsEnabled(saved === 'true');
        }
      } catch (e) {
        logger.warn('Failed to load insights preference:', e);
      }
    }
  }, [studentId]);

  return {
    insights,
    loading,
    error,
    refreshInsights,
    enabled: isEnabled,
    setEnabled,
    isGenerating
  };
};

// Helper functions
function getGradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'E';
}

function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

function calculateImprovementRate(trends: PerformanceTrend[]): number {
  if (trends.length < 2) return 0;
  
  const latest = trends[trends.length - 1].averageScore;
  const earliest = trends[0].averageScore;
  
  return earliest > 0 ? ((latest - earliest) / earliest) * 100 : 0;
}

function generateStudyRecommendations(
  gradePerformance: GradePerformance[], 
  attendanceInsight: AttendanceInsight
): StudyRecommendation[] {
  const recommendations: StudyRecommendation[] = [];
  
  // Priority: failing subjects first
  const failingSubjects = gradePerformance.filter(gp => gp.averageScore < 70);
  failingSubjects.forEach(subject => {
    recommendations.push({
      priority: 'high',
      subject: subject.subject,
      recommendation: `Fokus pada pemahaman konsep dasar dan tambah waktu belajar 2-3 jam per minggu`,
      timeAllocation: '30-45 menit/hari',
      resources: ['Modul pembelajaran', 'Video tutorial', 'Diskusi dengan guru']
    });
  });
  
  // Priority: declining subjects
  const decliningSubjects = gradePerformance.filter(gp => gp.trend === 'declining' && gp.averageScore < 80);
  decliningSubjects.forEach(subject => {
    recommendations.push({
      priority: 'medium',
      subject: subject.subject,
      recommendation: `Tinjau kembali metode belajar dan minta feedback dari guru`,
      timeAllocation: '20-30 menit/hari',
      resources: ['Latihan soal', 'Study group', 'Tutoring']
    });
  });
  
  // Attendance recommendation
  if (attendanceInsight.percentage < 90) {
    recommendations.push({
      priority: 'high',
      subject: 'Kehadiran',
      recommendation: 'Tingkatkan kehadiran untuk mendapatkan penjelasan langsung dari guru',
      timeAllocation: 'Fokus harian',
      resources: ['Jadwal belajar teratur', 'Alarm pagi', 'Koordinasi dengan orang tua']
    });
  }
  
  return recommendations.slice(0, 5); // Max 5 recommendations
}

function generateMotivationalMessage(gpa: number, attendancePercentage: number): string {
  if (gpa >= 85 && attendancePercentage >= 95) {
    return 'Luar biasa! Pertahankan prestasi dan disiplin Anda!';
  } else if (gpa >= 75 && attendancePercentage >= 90) {
    return 'Prestasi baik! Terus tingkatkan dengan fokus pada mata pelajaran yang perlu perhatian.';
  } else if (gpa >= 60) {
    return 'Anda menunjukkan perbaikan! Tetap konsisten dan jangan ragu minta bantuan.';
  } else {
    return 'Setiap langkah kecil menuju perbaikan itu berharga. Terus berusaha dan jangan menyerah!';
  }
}