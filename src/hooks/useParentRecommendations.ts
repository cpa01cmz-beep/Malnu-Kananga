import { useState, useEffect, useCallback } from 'react';
import {
  generateParentRecommendations,
  getQuickParentRecommendations,
  clearParentRecommendationCache,
  type ParentRecommendation,
  type ParentChildData,
  type ParentRecommendationsInput
} from '../services/ai/parentAIRecommendationService';
import { gradesAPI, attendanceAPI, assignmentSubmissionsAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { classifyError, logError } from '../utils/errorHandler';
import { TIME_MS } from '../constants';

interface UseParentRecommendationsOptions {
  parentName: string;
  children: Array<{
    studentId: string;
    studentName: string;
  }>;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enabled?: boolean;
  useAI?: boolean;
}

interface UseParentRecommendationsReturn {
  recommendations: ParentRecommendation[];
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  clearCache: () => void;
  isGenerating: boolean;
}

export function useParentRecommendations({
  parentName,
  children,
  autoRefresh = true,
  refreshInterval = TIME_MS.ONE_DAY,
  enabled = true,
  useAI = true
}: UseParentRecommendationsOptions): UseParentRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<ParentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchChildrenData = useCallback(async (): Promise<ParentChildData[]> => {
    const childrenData: ParentChildData[] = await Promise.all(
      children.map(async (child) => {
        try {
          const [gradesResponse, attendanceResponse, submissionsResponse] = await Promise.all([
            gradesAPI.getByStudent(child.studentId),
            attendanceAPI.getByStudent(child.studentId),
            assignmentSubmissionsAPI.getByStudent(child.studentId)
          ]);

          const grades = gradesResponse.success && gradesResponse.data 
            ? gradesResponse.data.map((g) => ({
                subject: g.subjectName || g.subjectId,
                score: g.score,
                grade: g.assignment?.toString() || 'N/A',
                category: g.assignmentType || 'Umum',
                semester: g.semester || '1'
              }))
            : [];

          const attendance = attendanceResponse.success && attendanceResponse.data && attendanceResponse.data.length > 0
            ? {
                percentage: Math.round((attendanceResponse.data.reduce((sum, a) => sum + (a.status === 'hadir' ? 1 : 0), 0) / attendanceResponse.data.length) * 100),
                totalDays: attendanceResponse.data.length,
                present: attendanceResponse.data.filter((a) => a.status === 'hadir').length,
                absent: attendanceResponse.data.filter((a) => a.status === 'alpa').length,
                sick: attendanceResponse.data.filter((a) => a.status === 'sakit').length,
                permission: attendanceResponse.data.filter((a) => a.status === 'izin').length
              }
            : {
                percentage: 100,
                totalDays: 0,
                present: 0,
                absent: 0,
                sick: 0,
                permission: 0
              };

          const assignments = submissionsResponse.success && submissionsResponse.data
            ? submissionsResponse.data.map((s) => ({
                title: s.assignmentId,
                subject: 'Umum',
                dueDate: s.submittedAt,
                status: (s.status || 'pending') as 'pending' | 'submitted' | 'graded' | 'late',
                score: s.score
              }))
            : [];

          return {
            studentId: child.studentId,
            studentName: child.studentName,
            grades,
            attendance,
            assignments
          };
        } catch (err) {
          logger.error(`Error fetching data for child ${child.studentName}:`, err);
          return {
            studentId: child.studentId,
            studentName: child.studentName,
            grades: [],
            attendance: { percentage: 100, totalDays: 0, present: 0, absent: 0, sick: 0, permission: 0 },
            assignments: []
          };
        }
      })
    );

    return childrenData;
  }, [children]);

  const fetchRecommendations = useCallback(async () => {
    if (!enabled || children.length === 0) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);
    setIsGenerating(true);

    try {
      const childrenData = await fetchChildrenData();

      const input: ParentRecommendationsInput = {
        parentName,
        children: childrenData
      };

      let results: ParentRecommendation[];

      if (useAI) {
        results = await generateParentRecommendations(input);
      } else {
        results = getQuickParentRecommendations(childrenData);
      }

      setRecommendations(results);
      logger.info(`Fetched ${results.length} recommendations for parent ${parentName}`);
    } catch (err) {
      const classifiedError = classifyError(err, {
        operation: 'useParentRecommendations.fetch',
        timestamp: Date.now()
      });
      logError(classifiedError);
      setError('Gagal memuat rekomendasi. Silakan coba lagi.');
      
      const childrenData = await fetchChildrenData();
      const fallbackResults = getQuickParentRecommendations(childrenData);
      setRecommendations(fallbackResults);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  }, [enabled, children, parentName, useAI, fetchChildrenData]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    const intervalId = setInterval(() => {
      fetchRecommendations();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, enabled, refreshInterval, fetchRecommendations]);

  const clearCache = useCallback(() => {
    clearParentRecommendationCache();
    setRecommendations([]);
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations: fetchRecommendations,
    clearCache,
    isGenerating
  };
}
