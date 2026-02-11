import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  gradesAPI,
  assignmentsAPI,
  assignmentSubmissionsAPI,
  subjectsAPI
} from '../services/apiService';
import {
  ClassGradeAnalytics,
  SubjectAnalytics,
  StudentPerformance,
  GradeDistribution,
} from '../types';
import { logger } from '../utils/logger';
import { authAPI } from '../services/apiService';
import { STORAGE_KEYS, TIME_MS } from '../constants';
import Card from './ui/Card';
import Button from './ui/Button';
import Tab from './ui/Tab';
import Select from './ui/Select';
import { EmptyState } from './ui/LoadingState';
import ErrorMessage from './ui/ErrorMessage';
import { CardSkeleton } from './ui/Skeleton';
import ProgressBar from './ui/ProgressBar';
import { CHART_COLORS } from '../config/chartColors';
import { analyzeClassPerformance } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GradeAnalyticsProps {
  onBack: () => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  classId?: string;
}

type AssignmentTypeFilter = 'all' | 'quiz' | 'assignment' | 'exam' | 'project' | 'lab_work' | 'presentation' | 'homework' | 'other';

const ASSIGNMENT_TYPE_LABELS: Record<AssignmentTypeFilter, string> = {
  all: 'Semua',
  quiz: 'Kuis',
  assignment: 'Tugas',
  exam: 'Ujian',
  project: 'Proyek',
  lab_work: 'Praktikum',
  presentation: 'Presentasi',
  homework: 'PR',
  other: 'Lainnya',
};

const COLORS = [
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.yellow,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

const GradeAnalytics: React.FC<GradeAnalyticsProps> = ({ onBack, onShowToast = () => {}, classId }) => {
  const currentUser = authAPI.getCurrentUser();
  const [analytics, setAnalytics] = useState<ClassGradeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'students' | 'assignments'>('overview');
  const [assignmentTypeFilter, setAssignmentTypeFilter] = useState<AssignmentTypeFilter>('all');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsightsError, setAiInsightsError] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
    onShowToast(msg, type);
  }, [onShowToast]);

  const calculateGradeDistribution = useCallback((scores: number[]): GradeDistribution => {
    const distribution: GradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    scores.forEach(score => {
      if (score >= 85) distribution.A++;
      else if (score >= 75) distribution.B++;
      else if (score >= 60) distribution.C++;
      else if (score >= 50) distribution.D++;
      else distribution.F++;
    });
    return distribution;
  }, []);

  const generateAIInsights = useCallback(async () => {
    if (!analytics || !classId || !currentUser?.id) return;

    setAiInsightsLoading(true);
    setAiInsightsError(null);

    try {
      const classGradesData = analytics.studentPerformances.map(student => ({
        studentName: student.studentName,
        subject: 'Overall',
        grade: student.averageScore.toFixed(1),
        semester: 'Current'
      }));

      const insights = await analyzeClassPerformance(classGradesData);
      setAiInsights(insights);

      const cacheKey = STORAGE_KEYS.CLASS_INSIGHTS(classId);
      const timestampKey = STORAGE_KEYS.CLASS_INSIGHTS_TIMESTAMP(classId);

      localStorage.setItem(cacheKey, insights);
      localStorage.setItem(timestampKey, Date.now().toString());

      showToast('AI Analisis kelas berhasil dihasilkan', 'success');
      logger.info('AI class insights generated for class:', classId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghasilkan analisis AI';
      setAiInsightsError(errorMessage);
      showToast(errorMessage, 'error');
      logger.error('Error generating AI class insights:', err);
    } finally {
      setAiInsightsLoading(false);
    }
  }, [analytics, classId, currentUser?.id, showToast]);

  const loadCachedAIInsights = useCallback(() => {
    if (!classId) return;

    try {
      const cacheKey = STORAGE_KEYS.CLASS_INSIGHTS(classId);
      const timestampKey = STORAGE_KEYS.CLASS_INSIGHTS_TIMESTAMP(classId);
      
      const cachedInsights = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(timestampKey);
      
      if (cachedInsights && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const cacheAge = Date.now() - timestamp;
        
        if (cacheAge < TIME_MS.ONE_DAY) {
          setAiInsights(cachedInsights);
          logger.debug('Loaded cached AI insights for class:', classId);
        } else {
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(timestampKey);
        }
      }
    } catch (err) {
      logger.warn('Error loading cached AI insights:', err);
    }
  }, [classId]);

  const analyzeClassGrades = useCallback(async () => {
    if (!currentUser?.id) {
      setError('User tidak ditemukan');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [gradesRes, assignmentsRes, submissionsRes, subjectsRes] = await Promise.all([
        gradesAPI.getAll(),
        assignmentsAPI.getByTeacher(currentUser.id),
        assignmentSubmissionsAPI.getAll(),
        subjectsAPI.getAll()
      ]);

      if (!gradesRes.success || !gradesRes.data ||
          !assignmentsRes.success || !assignmentsRes.data ||
          !submissionsRes.success || !submissionsRes.data ||
          !subjectsRes.success || !subjectsRes.data) {
        throw new Error('Gagal mengambil data');
      }

      const grades = gradesRes.data;
      const assignments = assignmentsRes.data;
      const submissions = submissionsRes.data;
      const subjects = subjectsRes.data;

      const classGrades = classId
        ? grades.filter(g => g.classId === classId)
        : grades;

      const filteredGrades = assignmentTypeFilter === 'all'
        ? classGrades
        : classGrades.filter(g => g.assignmentType === assignmentTypeFilter);

      if (filteredGrades.length === 0) {
        setAnalytics({
          classId: classId || 'all',
          className: classId ? 'Kelas ' + classId : 'Semua Kelas',
          totalStudents: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
          submissionRate: 0,
          subjectBreakdown: [],
          topPerformers: [],
          needsAttention: [],
          studentPerformances: [],
          lastUpdated: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      const allScores = filteredGrades.map(g => g.score);
      const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
      const highestScore = Math.max(...allScores);
      const lowestScore = Math.min(...allScores);
      const gradeDistribution = calculateGradeDistribution(allScores);

      const studentGrades = new Map<string, number[]>();
      filteredGrades.forEach(grade => {
        if (!studentGrades.has(grade.studentId)) {
          studentGrades.set(grade.studentId, []);
        }
        studentGrades.get(grade.studentId)!.push(grade.score);
      });

      const studentPerformances: StudentPerformance[] = [];
      studentGrades.forEach((scores, studentId) => {
        const studentAverage = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const studentSubmissions = submissions.filter(s => s.studentId === studentId);
        const studentAssignments = assignments.filter(a => a.classId === classId);

        studentPerformances.push({
          studentId,
          studentName: submissions.find(s => s.studentId === studentId)?.studentName || `Student ${studentId}`,
          averageScore: studentAverage,
          totalAssignments: studentAssignments.length,
          completedAssignments: studentSubmissions.length,
          submissionRate: studentAssignments.length > 0 ? (studentSubmissions.length / studentAssignments.length) * 100 : 0,
          gradeDistribution: calculateGradeDistribution(scores),
          trend: 'stable',
          lastSubmission: studentSubmissions.length > 0 ?
            studentSubmissions[studentSubmissions.length - 1].submittedAt : undefined
        });
      });

      const sortedStudents = [...studentPerformances].sort((a, b) => b.averageScore - a.averageScore);
      const topPerformers = sortedStudents.slice(0, 5);
      const needsAttention = sortedStudents.filter(s => s.averageScore < 60).slice(0, 5);

      const subjectBreakdown: SubjectAnalytics[] = [];
      const uniqueSubjectIds = [...new Set(filteredGrades.map(g => g.subjectId))];

      uniqueSubjectIds.forEach(subjectId => {
        const subjectGrades = filteredGrades.filter(g => g.subjectId === subjectId);
        const subjectAssignments = assignments.filter(a => a.subjectId === subjectId);
        const subjectSubmissions = submissions.filter(s => {
          const assignment = assignments.find(a => a.id === s.assignmentId);
          return assignment?.subjectId === subjectId;
        });

        const subjectScores = subjectGrades.map(g => g.score);
        const subjectAverageScore = subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length;

        subjectBreakdown.push({
          subjectId,
          subjectName: subjectGrades[0]?.subjectName || subjects.find(s => s.id === subjectId)?.name || `Subject ${subjectId}`,
          averageScore: subjectAverageScore,
          totalAssignments: subjectAssignments.length,
          totalSubmissions: subjectSubmissions.length,
          submissionRate: subjectAssignments.length > 0 ? (subjectSubmissions.length / subjectAssignments.length) * 100 : 0,
          averageCompletionTime: 0,
          gradeDistribution: calculateGradeDistribution(subjectScores),
          trend: 'stable'
        });
      });

      const submissionRate = assignments.length > 0 ? (submissions.length / assignments.length) * 100 : 0;

    setAnalytics({
      classId: classId || 'all',
      className: classId ? 'Kelas ' + classId : 'Semua Kelas',
      totalStudents: studentGrades.size,
      averageScore,
      highestScore,
      lowestScore,
      gradeDistribution,
      submissionRate,
      subjectBreakdown,
      topPerformers,
      needsAttention,
      studentPerformances,
      lastUpdated: new Date().toISOString(),
    });

    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data analitik');
      logger.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, [classId, currentUser?.id, calculateGradeDistribution, assignmentTypeFilter]);

  useEffect(() => {
    if (analytics) {
      loadCachedAIInsights();
    }
  }, [analytics, loadCachedAIInsights]);

  useEffect(() => {
    analyzeClassGrades();
  }, [analyzeClassGrades]);

  const exportAnalyticsReport = () => {
    if (!analytics) return;
    
    const reportData = {
      className: analytics.className,
      totalStudents: analytics.totalStudents,
      averageScore: analytics.averageScore,
      gradeDistribution: analytics.gradeDistribution,
      submissionRate: analytics.submissionRate,
      topPerformers: analytics.topPerformers,
      needsAttention: analytics.needsAttention,
      exportDate: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.GRADE_ANALYTICS_EXPORT(analytics.classId), JSON.stringify(reportData));
    showToast('Laporan analitik berhasil disimpan', 'success');
  };

  const gradeDistributionData = analytics ? [
    { name: 'A', value: analytics.gradeDistribution.A },
    { name: 'B', value: analytics.gradeDistribution.B },
    { name: 'C', value: analytics.gradeDistribution.C },
    { name: 'D', value: analytics.gradeDistribution.D },
    { name: 'F', value: analytics.gradeDistribution.F }
  ].filter(d => d.value > 0) : [];

  const uniqueStudents = analytics ? Array.from(
    new Map([...analytics.topPerformers, ...analytics.needsAttention].map(student => [student.studentId, student])).values()
  ) : [];

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Analitik Nilai Kelas</h2>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Analitik Nilai Kelas</h2>
          </div>
        </div>
        <ErrorMessage
          title="Error Loading Analytics"
          message={error}
          variant="card"
          userFriendlyMessage={error}
        />
        <div className="text-center mt-4">
          <Button
            onClick={analyzeClassGrades}
            variant="blue-solid"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Analitik Nilai Kelas</h2>
          </div>
        </div>
        <Card>
          <EmptyState message="Tidak ada data analitik yang tersedia" size="lg" />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            ← Kembali ke Portal
          </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Analitik Nilai Kelas</h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            {analytics.className} • {analytics.totalStudents} Siswa
          </p>
        </div>
        <Button
          onClick={exportAnalyticsReport}
          variant="blue-solid"
        >
          Export Laporan
        </Button>
      </div>

      <Tab
        variant="pill"
        color="blue"
        options={[
          { id: 'overview', label: 'Ringkasan' },
          { id: 'subjects', label: 'Mata Pelajaran' },
          { id: 'students', label: 'Siswa' },
          { id: 'assignments', label: 'Tugas' },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as 'overview' | 'subjects' | 'students' | 'assignments')}
        className="mb-4"
      />

      <div className="flex items-center gap-4 mb-6">
        <label htmlFor="assignment-type-filter" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Filter Jenis Tugas:
        </label>
        <Select
          id="assignment-type-filter"
          value={assignmentTypeFilter}
          onChange={(e) => setAssignmentTypeFilter(e.target.value as AssignmentTypeFilter)}
          className="w-48"
        >
          {Object.entries(ASSIGNMENT_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🤖</div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">AI Insights</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Analisis performa kelas yang dipandu AI</p>
                </div>
              </div>
              <Button
                onClick={generateAIInsights}
                disabled={aiInsightsLoading}
                variant="blue-solid"
                size="sm"
              >
                {aiInsightsLoading ? 'Generating...' : 'Generate AI Insights'}
              </Button>
            </div>
            
            {aiInsightsLoading && (
              <div className="text-center py-6">
                <div className="animate-spin text-4xl mb-3">🤖</div>
                <p className="text-neutral-600 dark:text-neutral-400">Menganalisis performa kelas dengan AI...</p>
              </div>
            )}
            
            {aiInsightsError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-400 mb-1">Error</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{aiInsightsError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {aiInsights && !aiInsightsLoading && (
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiInsights}</ReactMarkdown>
                </div>
              </div>
            )}
            
            {!aiInsights && !aiInsightsLoading && !aiInsightsError && (
              <div className="text-center py-6 bg-white dark:bg-neutral-800 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Belum ada analisis AI untuk kelas ini
                </p>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Rata-rata Nilai</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {analytics.averageScore.toFixed(1)}
                  </h3>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Nilai Tertinggi</p>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analytics.highestScore}
                  </h3>
                </div>
                <div className="text-3xl">🏆</div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Nilai Terendah</p>
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {analytics.lowestScore}
                  </h3>
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Tingkat Pengumpulan</p>
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.submissionRate.toFixed(0)}%
                  </h3>
                </div>
                <div className="text-3xl">📤</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Distribusi Nilai</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill={CHART_COLORS.indigo}
                  >
                    {gradeDistributionData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Performa Mata Pelajaran</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.subjectBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subjectName" angle={-45} textAnchor="end" height={100} interval={0} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill={CHART_COLORS.green} name="Rata-rata" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {analytics.topPerformers.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                Top Performers ({analytics.topPerformers.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Peringkat</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nama Siswa</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Rata-rata</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tugas Selesai</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPerformers.map((student, index) => (
                      <tr key={student.studentId} className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="py-2 px-3 text-sm text-neutral-900 dark:text-white">
                          #{index + 1}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-neutral-900 dark:text-white">
                          {student.studentName}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          <span className={`font-bold ${student.averageScore >= 85 ? 'text-green-600' : 
                            student.averageScore >= 75 ? 'text-blue-600' : 
                            student.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {student.averageScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-sm text-neutral-700 dark:text-neutral-300">
                          {student.completedAssignments}/{student.totalAssignments}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.trend === 'improving' ? 'bg-green-100 text-green-800' :
                            student.trend === 'declining' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {student.trend === 'improving' ? 'Naik' : 
                             student.trend === 'declining' ? 'Turun' : 'Stabil'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {analytics.needsAttention.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 text-red-600 dark:text-red-400">
                Membutuhkan Perhatian ({analytics.needsAttention.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nama Siswa</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Rata-rata</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tugas Selesai</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Predikat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.needsAttention.map((student) => (
                      <tr key={student.studentId} className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="py-2 px-3 text-sm font-medium text-neutral-900 dark:text-white">
                          {student.studentName}
                        </td>
                        <td className="py-2 px-3 text-sm text-red-600 font-bold">
                          {student.averageScore.toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-sm text-neutral-700 dark:text-neutral-300">
                          {student.completedAssignments}/{student.totalAssignments}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            D
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {analytics.subjectBreakdown.map((subject) => (
            <Card key={subject.subjectId}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {subject.subjectName}
                </h3>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {subject.totalAssignments} Tugas
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Rata-rata</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {subject.averageScore.toFixed(1)}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Tingkat Pengumpulan</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {subject.submissionRate.toFixed(0)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Dikumpulkan</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {subject.totalSubmissions}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Distribusi Nilai</p>
                <div className="flex gap-2">
                  {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="flex-1 text-center">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{grade}</div>
                      <div className="h-16 bg-neutral-100 dark:bg-neutral-700 rounded relative">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded"
                          style={{ height: `${(count / Math.max(...Object.values(subject.gradeDistribution))) * 100}%` }}
                        />
                        <span className="absolute top-1 left-0 right-0 text-xs font-bold text-neutral-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
          {analytics.subjectBreakdown.length === 0 && (
            <Card>
              <EmptyState message="Tidak ada data mata pelajaran" size="lg" />
            </Card>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Semua Siswa ({uniqueStudents.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Nama Siswa</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Rata-rata</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Predikat</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tugas Selesai</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tingkat Pengumpulan</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueStudents.map((student) => (
                    <tr key={student.studentId} className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="py-2 px-3 text-sm font-medium text-neutral-900 dark:text-white">
                        {student.studentName}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <span className={`font-bold ${student.averageScore >= 85 ? 'text-green-600' : 
                          student.averageScore >= 75 ? 'text-blue-600' : 
                          student.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {student.averageScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.averageScore >= 85 ? 'bg-green-100 text-green-800' :
                          student.averageScore >= 75 ? 'bg-blue-100 text-blue-800' :
                          student.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.averageScore >= 85 ? 'A' : 
                           student.averageScore >= 75 ? 'B' : 
                           student.averageScore >= 60 ? 'C' : 'D'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-neutral-700 dark:text-neutral-300">
                        {student.completedAssignments}/{student.totalAssignments}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <ProgressBar
                          value={student.submissionRate}
                          max={100}
                          size="sm"
                          color={student.submissionRate >= 80 ? 'success' : student.submissionRate >= 60 ? 'warning' : 'error'}
                          aria-label={`Submission rate: ${student.submissionRate.toFixed(0)}%`}
                        />
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.trend === 'improving' ? 'bg-green-100 text-green-800' :
                          student.trend === 'declining' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {student.trend === 'improving' ? 'Naik' : 
                           student.trend === 'declining' ? 'Turun' : 'Stabil'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {uniqueStudents.length === 0 && (
              <div className="text-center py-8">
                <EmptyState message="Tidak ada data siswa" size="lg" />
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <Card>
            <EmptyState 
              message="Fitur analitik tugas akan segera tersedia" 
              submessage="Data tugas dan analisis detail akan ditampilkan di sini"
              size="lg" 
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default GradeAnalytics;
