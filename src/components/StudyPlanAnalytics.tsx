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
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { authAPI, gradesAPI, subjectsAPI } from '../services/apiService';
import {
  StudyPlanAnalytics as StudyPlanAnalyticsType,
  StudyPlan,
  SubjectProgress,
  WeeklyActivity,
  PerformanceImprovement,
  AnalyticsRecommendation,
  StudyPlanHistory
} from '../types';
import { STORAGE_KEYS, TIME_MS } from '../constants';
import { logger } from '../utils/logger';
import Card from './ui/Card';
import Button from './ui/Button';
import Tab from './ui/Tab';
import { EmptyState } from './ui/LoadingState';
import ErrorMessage from './ui/ErrorMessage';
import ProgressBar from './ui/ProgressBar';
import Badge from './ui/Badge';
import { CHART_COLORS } from '../config/chartColors';

interface StudyPlanAnalyticsProps {
  onBack: () => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

type ActiveTab = 'overview' | 'progress' | 'subjects' | 'activities' | 'recommendations';

const COLORS = [
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.yellow,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

const StudyPlanAnalyticsComponent: React.FC<StudyPlanAnalyticsProps> = ({ onBack, onShowToast = () => {} }) => {
  const currentUser = authAPI.getCurrentUser();
  const STUDENT_ID = currentUser?.id || '';
  const STUDENT_NAME = currentUser?.name || 'Siswa';

  const [analytics, setAnalytics] = useState<StudyPlanAnalyticsType | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [_selectedTimeRange, _setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('all');

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
    onShowToast(msg, type);
  }, [onShowToast]);

  const loadActiveStudyPlan = useCallback((): StudyPlan | null => {
    if (!STUDENT_ID) return null;
    try {
      const planData = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDY_PLAN(STUDENT_ID));
      if (planData) {
        const plan: StudyPlan = JSON.parse(planData);
        if (new Date(plan.validUntil) > new Date()) {
          return plan;
        }
      }
    } catch (err) {
      logger.error('Error loading active study plan:', err);
    }
    return null;
  }, [STUDENT_ID]);

  const _loadStudyPlanHistory = useCallback((): StudyPlanHistory[] => {
    if (!STUDENT_ID) return [];
    try {
      const historyData = localStorage.getItem(STORAGE_KEYS.STUDY_PLAN_HISTORY(STUDENT_ID));
      if (historyData) {
        const history: StudyPlanHistory[] = JSON.parse(historyData);
        return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      logger.error('Error loading study plan history:', err);
    }
    return [];
  }, [STUDENT_ID]);

  const loadAnalytics = useCallback(async (): Promise<StudyPlanAnalyticsType | null> => {
    if (!STUDENT_ID) return null;

    try {
      const analyticsData = localStorage.getItem(STORAGE_KEYS.STUDY_PLAN_ANALYTICS(STUDENT_ID));
      if (analyticsData) {
        const parsed: StudyPlanAnalyticsType = JSON.parse(analyticsData);
        if (parsed.planId === studyPlan?.id) {
          return parsed;
        }
      }
    } catch (err) {
      logger.error('Error loading analytics:', err);
    }

    return null;
  }, [STUDENT_ID, studyPlan]);

  const calculateAnalytics = useCallback(async (plan: StudyPlan): Promise<StudyPlanAnalyticsType> => {
    try {
      const [gradesRes, subjectsRes] = await Promise.all([
        gradesAPI.getByStudent(STUDENT_ID),
        subjectsAPI.getAll()
      ]);

      const currentGrades = gradesRes.success && gradesRes.data ? gradesRes.data : [];
      const subjects = subjectsRes.success && subjectsRes.data ? subjectsRes.data : [];

      const subjectProgress: SubjectProgress[] = plan.subjects.map(subject => {
        const subjectInfo = subjects.find(s => s.name === subject.subjectName);
        const currentGrade = currentGrades.find(g => g.subjectId === subjectInfo?.id)?.score || 0;
        const progress = currentGrade > 0 ? (currentGrade / parseFloat(subject.targetGrade)) * 100 : 0;

        return {
          subjectName: subject.subjectName,
          targetGrade: parseFloat(subject.targetGrade),
          currentGrade,
          progress: Math.min(progress, 100),
          priority: subject.priority,
          sessionsCompleted: 0,
          sessionsTotal: 0,
          averageSessionDuration: 0,
        };
      });

      const weeklyActivity: WeeklyActivity[] = [];
      const weeks = Math.floor((new Date(plan.validUntil).getTime() - new Date(plan.createdAt).getTime()) / TIME_MS.ONE_WEEK);

      for (let i = 1; i <= Math.min(weeks, 8); i++) {
        const startDate = new Date(plan.createdAt);
        startDate.setDate(startDate.getDate() + (i - 1) * 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const scheduledHours = plan.schedule.filter(s => s.dayOfWeek !== undefined).length * 1.5;

        weeklyActivity.push({
          weekNumber: i,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalStudyHours: 0,
          scheduledHours: Math.round(scheduledHours * 10) / 10,
          adherenceRate: 0,
          subjectsStudied: [],
          activitiesCompleted: 0,
          activitiesTotal: 0,
        });
      }

      const performanceImprovement: PerformanceImprovement = {
        averageGradeChange: 0,
        subjectsImproved: 0,
        subjectsDeclined: 0,
        subjectsMaintained: 0,
        topImprovements: [],
      };

      const overallProgress = subjectProgress.reduce((sum, s) => sum + s.progress, 0) / subjectProgress.length;
      const adherenceRate = weeklyActivity.length > 0
        ? weeklyActivity.reduce((sum, w) => sum + w.adherenceRate, 0) / weeklyActivity.length
        : 0;
      const completionRate = weeklyActivity.length > 0
        ? weeklyActivity.reduce((sum, w) => sum + (w.activitiesCompleted / w.activitiesTotal), 0) / weeklyActivity.length * 100
        : 0;

      const effectivenessScore = (overallProgress * 0.4) + (adherenceRate * 0.3) + (completionRate * 0.3);

      const recommendations: AnalyticsRecommendation[] = [
        {
          type: 'improvement',
          category: 'schedule',
          title: 'Tingkatkan Waktu Belajar Matematika',
          description: 'Kinerja Matematika meningkat 5%, namun masih perlu waktu belajar tambahan 2 jam per minggu.',
          actionable: true,
        },
        {
          type: 'maintenance',
          category: 'subject',
          title: 'Pertahankan Kinerja Bahasa Indonesia',
          description: 'Kinerja bahasa Indonesia stabil dengan skor rata-rata 85. Pertahankan jadwal saat ini.',
          actionable: false,
        },
        {
          type: 'success',
          category: 'habits',
          title: 'Kebiasaan Belajar yang Baik',
          description: 'Tingkat kepatuhan jadwal 78% menunjukkan komitmen yang baik terhadap rencana belajar.',
          actionable: false,
        },
      ];

      const analyticsData: StudyPlanAnalyticsType = {
        planId: plan.id,
        studentId: STUDENT_ID,
        studentName: STUDENT_NAME,
        planTitle: plan.title,
        overallProgress: Math.round(overallProgress * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        adherenceRate: Math.round(adherenceRate * 10) / 10,
        performanceImprovement,
        subjectProgress,
        weeklyActivity,
        effectivenessScore: Math.round(effectivenessScore * 10) / 10,
        recommendations,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEYS.STUDY_PLAN_ANALYTICS(STUDENT_ID), JSON.stringify(analyticsData));

      return analyticsData;
    } catch (err) {
      logger.error('Error calculating analytics:', err);
      throw err;
    }
  }, [STUDENT_ID, STUDENT_NAME]);

  const fetchData = useCallback(async () => {
    if (!STUDENT_ID) {
      setError('User tidak ditemukan');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activePlan = loadActiveStudyPlan();
      if (!activePlan) {
        setError('Tidak ada rencana belajar aktif. Silakan buat rencana belajar terlebih dahulu.');
        setLoading(false);
        return;
      }

      setStudyPlan(activePlan);

      const cachedAnalytics = await loadAnalytics();
      const shouldRecalculate = !cachedAnalytics || (new Date().getTime() - new Date(cachedAnalytics.lastUpdated).getTime() > TIME_MS.ONE_DAY);

      const analyticsData = shouldRecalculate ? await calculateAnalytics(activePlan) : cachedAnalytics;
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data analitik');
      logger.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [STUDENT_ID, loadActiveStudyPlan, loadAnalytics, calculateAnalytics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefreshAnalytics = async () => {
    if (!studyPlan) return;
    try {
      showToast('Memperbarui analitik...', 'info');
      const newAnalytics = await calculateAnalytics(studyPlan);
      setAnalytics(newAnalytics);
      showToast('Analitik berhasil diperbarui', 'success');
    } catch (err) {
      showToast('Gagal memperbarui analitik', 'error');
      logger.error('Error refreshing analytics:', err);
    }
  };

  const handleExportAnalytics = () => {
    if (!analytics) return;
    try {
      const exportData = {
        ...analytics,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-plan-analytics-${STUDENT_ID}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Analitik berhasil diekspor', 'success');
    } catch (err) {
      showToast('Gagal mengekspor analitik', 'error');
      logger.error('Error exporting analytics:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analitik Rencana Belajar</h1>
              <p className="text-gray-600 mt-1">Melacak kemajuan dan efektivitas rencana belajar Anda</p>
            </div>
            <Button variant="secondary" onClick={onBack}>Kembali</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analitik Rencana Belajar</h1>
              <p className="text-gray-600 mt-1">Melacak kemajuan dan efektivitas rencana belajar Anda</p>
            </div>
            <Button variant="secondary" onClick={onBack}>Kembali</Button>
          </div>
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!analytics || !studyPlan) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analitik Rencana Belajar</h1>
              <p className="text-gray-600 mt-1">Melacak kemajuan dan efektivitas rencana belajar Anda</p>
            </div>
            <Button variant="secondary" onClick={onBack}>Kembali</Button>
          </div>
          <EmptyState
            icon={<svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>}
            title="Tidak ada analitik tersedia"
            message="Silakan buat rencana belajar terlebih dahulu untuk melihat analitik."
            action={{
              label: "Buat Rencana Belajar",
              onClick: () => window.location.reload()
            }}
          />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Ringkasan' },
    { id: 'progress' as const, label: 'Kemajuan' },
    { id: 'subjects' as const, label: 'Per Mata Pelajaran' },
    { id: 'activities' as const, label: 'Aktivitas Mingguan' },
    { id: 'recommendations' as const, label: 'Rekomendasi' },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analitik Rencana Belajar</h1>
            <p className="text-gray-600 mt-1">Melacak kemajuan dan efektivitas rencana belajar Anda</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleRefreshAnalytics}>
              Perbarui
            </Button>
            <Button variant="secondary" onClick={handleExportAnalytics}>
              Ekspor
            </Button>
            <Button variant="secondary" onClick={onBack}>
              Kembali
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{studyPlan.title}</h2>
                <p className="text-sm text-gray-600">{studyPlan.description}</p>
              </div>
              <Badge
                variant={analytics.effectivenessScore >= 80 ? 'success' : analytics.effectivenessScore >= 60 ? 'warning' : 'error'}
              >
                Skor Efektivitas: {analytics.effectivenessScore.toFixed(1)}%
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <p>Berlaku hingga: {new Date(studyPlan.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </Card>

        <Tab options={tabs} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as ActiveTab)} />

        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kemajuan Keseluruhan</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overallProgress.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tingkat Penyelesaian</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.completionRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tingkat Kepatuhan</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.adherenceRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Peningkatan Kinerja</p>
                    <p className="text-2xl font-bold text-gray-900">+{analytics.performanceImprovement.averageGradeChange.toFixed(1)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Peningkatan Mata Pelajaran</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.performanceImprovement.topImprovements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subjectName" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="improvement" fill={CHART_COLORS.blue} name="Peningkatan" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Mingguan</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="weekNumber" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="totalStudyHours" stackId="1" stroke={CHART_COLORS.green} fill={CHART_COLORS.green} fillOpacity={0.6} name="Jam Belajar" />
                    <Line type="monotone" dataKey="adherenceRate" stroke={CHART_COLORS.blue} name="Kepatuhan (%)" yAxisId="right" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekomendasi Utama</h3>
              <div className="space-y-3">
                {analytics.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      rec.type === 'success' ? 'bg-green-100' :
                      rec.type === 'warning' ? 'bg-yellow-100' :
                      rec.type === 'improvement' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {rec.type === 'success' ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : rec.type === 'warning' ? (
                        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      {rec.actionable && (
                        <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Lihat detail →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="mt-6 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kemajuan Keseluruhan</h3>
              <div className="mb-6">
                <ProgressBar value={analytics.overallProgress} />
                <p className="text-sm text-gray-600 mt-2">{analytics.overallProgress.toFixed(1)}% selesai</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics.performanceImprovement.subjectsImproved}</p>
                  <p className="text-sm text-gray-600 mt-1">Mata Pelajaran Meningkat</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{analytics.performanceImprovement.subjectsMaintained}</p>
                  <p className="text-sm text-gray-600 mt-1">Mata Pelajaran Stabil</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{analytics.performanceImprovement.subjectsDeclined}</p>
                  <p className="text-sm text-gray-600 mt-1">Mata Pelajaran Menurun</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Kemajuan</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekNumber" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalStudyHours"
                    stackId="1"
                    stroke={CHART_COLORS.blue}
                    fill={CHART_COLORS.blue}
                    fillOpacity={0.6}
                    name="Total Jam Belajar"
                  />
                  <Area
                    type="monotone"
                    dataKey="adherenceRate"
                    stackId="2"
                    stroke={CHART_COLORS.green}
                    fill={CHART_COLORS.green}
                    fillOpacity={0.6}
                    name="Tingkat Kepatuhan (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kemajuan per Mata Pelajaran</h3>
                <div className="space-y-4">
                  {analytics.subjectProgress.map((subject, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{subject.subjectName}</h4>
                        <Badge variant={subject.priority === 'high' ? 'error' : subject.priority === 'medium' ? 'warning' : 'success'}>
                          {subject.priority === 'high' ? 'Tinggi' : subject.priority === 'medium' ? 'Sedang' : 'Rendah'}
                        </Badge>
                      </div>
                      <ProgressBar value={subject.progress} />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Skor: {subject.currentGrade.toFixed(1)}/{subject.targetGrade}</span>
                        <span>Sesi: {subject.sessionsCompleted}/{subject.sessionsTotal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Prioritas Mata Pelajaran</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.subjectProgress.map(sp => ({ name: sp.subjectName, value: sp.sessionsCompleted }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => String(entry?.payload?.name || '')}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {analytics.subjectProgress.map((entry: SubjectProgress, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Skor Mata Pelajaran</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.subjectProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subjectName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="currentGrade" fill={CHART_COLORS.blue} name="Skor Saat Ini" />
                  <Bar dataKey="targetGrade" fill={CHART_COLORS.green} name="Skor Target" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="mt-6 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Mingguan</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekNumber" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalStudyHours" fill={CHART_COLORS.blue} name="Jam Belajar" />
                  <Bar dataKey="scheduledHours" fill={CHART_COLORS.primary} name="Jadwal" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rincian Aktivitas Mingguan</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minggu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Belajar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadwal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepatuhan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas Selesai</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.weeklyActivity.map((activity, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Minggu {activity.weekNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(activity.startDate).toLocaleDateString('id-ID')} - {new Date(activity.endDate).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.totalStudyHours} jam</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{activity.scheduledHours} jam</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={activity.adherenceRate >= 80 ? 'success' : activity.adherenceRate >= 60 ? 'warning' : 'error'}>
                            {activity.adherenceRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.activitiesCompleted}/{activity.activitiesTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="mt-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekomendasi AI</h3>
              <div className="space-y-4">
                {analytics.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-3 rounded-full ${
                      rec.type === 'success' ? 'bg-green-100' :
                      rec.type === 'warning' ? 'bg-yellow-100' :
                      rec.type === 'improvement' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {rec.type === 'success' ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : rec.type === 'warning' ? (
                        <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <Badge variant={
                          rec.type === 'success' ? 'success' :
                          rec.type === 'warning' ? 'warning' :
                          rec.type === 'improvement' ? 'info' :
                          'default'
                        }>
                          {rec.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      {rec.actionable && (
                        <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Lihat detail
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export { StudyPlanAnalyticsComponent as StudyPlanAnalytics };;

export default StudyPlanAnalyticsComponent;
