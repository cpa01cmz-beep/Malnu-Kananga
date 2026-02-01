import React, { useState, useEffect, useCallback } from 'react';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';
import Card from './ui/Card';
import { EmptyState } from './ui/LoadingState';
import Badge from './ui/Badge';
import { authAPI, gradesAPI, attendanceAPI, subjectsAPI, eLibraryAPI } from '../services/apiService';
import { generateStudyPlan } from '../services/geminiService';
import { studyPlanMaterialService } from '../services/studyPlanMaterialService';
import type {
  StudyPlan,
  SubjectPerformance,
  Goal,
  AttendanceGradeCorrelation,
  MaterialRecommendation,
} from '../types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ClockIcon } from './icons/ClockIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { CheckCircleIcon } from './icons/StatusIcons';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

 interface StudyPlanGeneratorProps {
   onBack: () => void;
   onShowToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
 }

 type ActiveTab = 'overview' | 'subjects' | 'schedule' | 'recommendations' | 'materials';

 const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({ onBack, onShowToast = () => {} }) => {
   const stableOnBack = useCallback(() => onBack(), [onBack]);
  const currentUser = authAPI.getCurrentUser();
  const STUDENT_NIS = currentUser?.id || '';
  const STUDENT_NAME = currentUser?.name || 'Siswa';

  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [correlation, setCorrelation] = useState<AttendanceGradeCorrelation | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [materialRecommendations, setMaterialRecommendations] = useState<MaterialRecommendation[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const fetchData = useCallback(async () => {
    if (!STUDENT_NIS) {
      setError('User tidak ditemukan');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [gradesRes, subjectsRes, attendanceRes] = await Promise.all([
        gradesAPI.getByStudent(STUDENT_NIS),
        subjectsAPI.getAll(),
        attendanceAPI.getByStudent(STUDENT_NIS)
      ]);

      if (gradesRes.success && gradesRes.data && subjectsRes.success && subjectsRes.data) {
        const performance = analyzeSubjectPerformance(gradesRes.data, subjectsRes.data);
        setSubjectPerformance(performance);
      }

      if (attendanceRes.success && attendanceRes.data && gradesRes.data) {
        const correlationData = calculateAttendanceGradeCorrelation(gradesRes.data, attendanceRes.data);
        setCorrelation(correlationData);
      }

      const savedGoals = loadGoals();
      setGoals(savedGoals);

      const savedPlan = loadActiveStudyPlan();
      if (savedPlan && new Date(savedPlan.validUntil) > new Date()) {
        setStudyPlan(savedPlan);
        await loadMaterialRecommendations(savedPlan);
      } else if (savedPlan) {
        saveActiveStudyPlan(null);
        setMaterialRecommendations([]);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
      logger.error('Error fetching study plan data:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STUDENT_NIS]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const analyzeSubjectPerformance = useCallback((gradeData: unknown[], subjectData: unknown[]): SubjectPerformance[] => {
    const subjectMap = new Map<string, {
      assignment: number;
      midExam: number;
      finalExam: number;
      count: number;
      scores: number[];
    }>();

    (gradeData as Array<{ subjectId: string; score: number; assignmentType: string }>).forEach((grade) => {
      const key = grade.subjectId;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, { assignment: 0, midExam: 0, finalExam: 0, count: 0, scores: [] });
      }

      const aggregated = subjectMap.get(key)!;
      const assignmentType = grade.assignmentType.toLowerCase();

      if (assignmentType === 'tugas' || assignmentType === 'assignment') {
        aggregated.assignment = (aggregated.assignment * aggregated.count + grade.score) / (aggregated.count + 1);
      } else if (assignmentType === 'uts' || assignmentType === 'mid') {
        aggregated.midExam = (aggregated.midExam * aggregated.count + grade.score) / (aggregated.count + 1);
      } else if (assignmentType === 'uas' || assignmentType === 'final') {
        aggregated.finalExam = (aggregated.finalExam * aggregated.count + grade.score) / (aggregated.count + 1);
      }

      aggregated.scores.push(grade.score);
      aggregated.count += 1;
    });

    const performance: SubjectPerformance[] = [];

    subjectMap.forEach((values, subjectId) => {
      const subject = (subjectData as Array<{ id: string; name: string }>).find((s) => s.id === subjectId);
      if (subject) {
        const finalScore = values.assignment * 0.3 + values.midExam * 0.3 + values.finalExam * 0.4;
        let letter = 'D';
        if (finalScore >= 85) letter = 'A';
        else if (finalScore >= 75) letter = 'B';
        else if (finalScore >= 60) letter = 'C';

        const sortedScores = [...values.scores].sort((a, b) => a - b);
        const median = sortedScores[Math.floor(sortedScores.length / 2)];
        const trend = values.scores.length > 1
          ? (values.scores[values.scores.length - 1] > median ? 'up' : values.scores[values.scores.length - 1] < median ? 'down' : 'stable')
          : 'stable';

        performance.push({
          subject: subject.name,
          averageScore: Math.round(finalScore * 10) / 10,
          assignment: Math.round(values.assignment),
          midExam: Math.round(values.midExam),
          finalExam: Math.round(values.finalExam),
          grade: letter,
          trend,
        });
      }
    });

    return performance;
  }, []);

  const calculateAttendanceGradeCorrelation = useCallback((gradeData: unknown[], attendanceData: unknown[]): AttendanceGradeCorrelation => {
    const attendanceArray = attendanceData as Array<{ status: string }>;
    const totalAttendance = attendanceArray.length;
    const presentDays = attendanceArray.filter((a: { status: string }) => a.status === 'hadir').length;
    const attendancePercentage = totalAttendance > 0 ? (presentDays / totalAttendance) * 100 : 95;

    const gradeArray = gradeData as Array<{ score: number }>;
    const totalGrades = gradeArray.reduce((sum, g) => sum + g.score, 0);
    const averageGrade = gradeArray.length > 0 ? totalGrades / gradeArray.length : 75;

    const correlationScore = Math.round((attendancePercentage / 100 * 0.3 + averageGrade / 100 * 0.7) * 100);

    const insights: string[] = [];
    if (attendancePercentage >= 90) {
      insights.push('Kehadiran Anda sangat baik, tetap pertahankan!');
    } else if (attendancePercentage >= 75) {
      insights.push('Kehadiran cukup baik, tingkatkan kehadiran untuk hasil yang lebih optimal.');
    } else {
      insights.push('Kehadiran perlu ditingkatkan untuk mendukung prestasi akademik.');
    }

    if (averageGrade >= 80) {
      insights.push('Prestasi akademik Anda sangat baik, pertahankan kinerja ini.');
    } else if (averageGrade >= 70) {
      insights.push('Prestasi akademik baik, tingkatkan fokus belajar untuk hasil lebih baik.');
    } else {
      insights.push('Fokus lebih pada pembelajaran dan tingkatkan latihan soal.');
    }

    return {
      attendancePercentage: Math.round(attendancePercentage),
      averageGrade: Math.round(averageGrade),
      correlationScore,
      insights
    };
  }, []);

  const loadGoals = (): Goal[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_GOALS(STUDENT_NIS));
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logger.error('Error loading goals:', error);
      return [];
    }
  };

  const loadActiveStudyPlan = (): StudyPlan | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDY_PLAN(STUDENT_NIS));
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      logger.error('Error loading study plan:', error);
      return null;
    }
  };

  const saveActiveStudyPlan = (plan: StudyPlan | null) => {
    try {
      if (plan) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDY_PLAN(STUDENT_NIS), JSON.stringify(plan));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDY_PLAN(STUDENT_NIS));
      }
      setStudyPlan(plan);
    } catch (error) {
      logger.error('Error saving study plan:', error);
      throw error;
    }
  };

  const loadMaterialRecommendations = useCallback(async (plan: StudyPlan) => {
    setMaterialsLoading(true);
    setMaterialsError(null);
    try {
      const recommendations = await studyPlanMaterialService.getRecommendations(plan);
      setMaterialRecommendations(recommendations);
    } catch (error) {
      setMaterialsError('Gagal memuat rekomendasi materi');
      logger.error('Error loading material recommendations:', error);
    } finally {
      setMaterialsLoading(false);
    }
  }, []);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const gradesForAI = subjectPerformance.map(sp => ({
        subject: sp.subject,
        score: sp.averageScore,
        grade: sp.grade,
        trend: sp.trend
      }));

      const goalsForAI = goals.map(g => ({
        subject: g.subject,
        targetGrade: g.targetGrade,
        deadline: g.deadline
      }));

      const subjectsForAI = subjectPerformance.map(sp => ({
        name: sp.subject,
        currentGrade: sp.averageScore
      }));

      const studentData = {
        studentName: STUDENT_NAME,
        grades: gradesForAI,
        attendance: correlation ? {
          percentage: correlation.attendancePercentage,
          totalDays: correlation.averageGrade * 100 / 30,
          present: Math.round((correlation.attendancePercentage / 100) * (correlation.averageGrade * 100 / 30)),
          absent: Math.round((1 - correlation.attendancePercentage / 100) * (correlation.averageGrade * 100 / 30))
        } : { percentage: 95, totalDays: 30, present: 28, absent: 2 },
        goals: goalsForAI,
        subjects: subjectsForAI
      };

      const newPlan = await generateStudyPlan(studentData, durationWeeks);
      saveActiveStudyPlan(newPlan);
      await loadMaterialRecommendations(newPlan);
      onShowToast('Rencana belajar berhasil dibuat', 'success');
      setActiveTab('overview');
    } catch (err) {
      setError('Gagal membuat rencana belajar. Silakan coba lagi.');
      logger.error('Error generating study plan:', err);
      onShowToast('Gagal membuat rencana belajar', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'study': return 'blue';
      case 'practice': return 'green';
      case 'review': return 'purple';
      case 'assignment': return 'orange';
      default: return 'gray';
    }
  };

  const handleMaterialClick = useCallback(async (recommendation: MaterialRecommendation) => {
    if (!studyPlan) return;

    try {
      await eLibraryAPI.incrementDownloadCount(recommendation.materialId);
      studyPlanMaterialService.markAccessed(studyPlan.id, recommendation.materialId);
      setMaterialRecommendations(prev =>
        prev.map(r => r.materialId === recommendation.materialId ? { ...r, accessed: true, accessedAt: new Date().toISOString() } : r)
      );
      const downloadUrl = `/materials/${recommendation.materialId}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      logger.error('Error opening material:', error);
    }
  }, [studyPlan]);

  const getFilteredRecommendations = useCallback(() => {
    let filtered = [...materialRecommendations];

    if (filterSubject !== 'all') {
      filtered = filtered.filter(r => r.subjectName === filterSubject);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(r => r.priority === filterPriority);
    }

    return filtered;
  }, [materialRecommendations, filterSubject, filterPriority]);

  const getAvailableSubjects = useCallback(() => {
    const subjects = new Set(materialRecommendations.map(r => r.subjectName));
    return Array.from(subjects).sort();
  }, [materialRecommendations]);

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={stableOnBack} className="mb-2">
              ← Kembali
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Rencana Belajar AI</h2>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-32 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded-xl" />
            <div className="h-32 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded-xl" />
          </div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && !studyPlan) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={stableOnBack} className="mb-2">
              ← Kembali
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Rencana Belajar AI</h2>
          </div>
        </div>
        <ErrorMessage
          title="Error Loading Data"
          message={error}
          variant="card"
        />
        <div className="text-center mt-4">
          <Button onClick={fetchData} variant="red-solid">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={stableOnBack} className="mb-2">
            ← Kembali
          </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Rencana Belajar AI</h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            {studyPlan ? `Valid sampai: ${new Date(studyPlan.validUntil).toLocaleDateString('id-ID')}` : 'Buat rencana belajar personal dengan AI'}
          </p>
        </div>
        {!studyPlan && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Durasi:</label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              >
                <option value={2}>2 Minggu</option>
                <option value={4}>4 Minggu</option>
                <option value={6}>6 Minggu</option>
                <option value={8}>8 Minggu</option>
              </select>
            </div>
            <Button
              onClick={handleGeneratePlan}
              variant="green-solid"
              disabled={generating}
              icon={<LightBulbIcon />}
            >
              {generating ? 'Membuat Rencana...' : 'Buat Rencana Belajar'}
            </Button>
          </div>
        )}
        {studyPlan && (
          <Button
            onClick={() => saveActiveStudyPlan(null)}
            variant="red-solid"
            icon={<XCircleIcon />}
          >
            Hapus Rencana
          </Button>
        )}
      </div>

      {studyPlan ? (
        <>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{studyPlan.title}</h3>
                <p className="text-neutral-700 dark:text-neutral-300">{studyPlan.description}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
               {[
                 { id: 'overview', label: 'Ringkasan', icon: <ChartBarIcon /> },
                 { id: 'subjects', label: 'Mata Pelajaran', icon: <BookOpenIcon /> },
                 { id: 'schedule', label: 'Jadwal', icon: <CalendarDaysIcon /> },
                 { id: 'recommendations', label: 'Rekomendasi', icon: <LightBulbIcon /> },
                 { id: 'materials', label: 'Materi', icon: <DocumentTextIcon /> },
               ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Ringkasan Rencana Belajar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{studyPlan.subjects.length}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Mata Pelajaran</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{studyPlan.schedule.length}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Jadwal Belajar</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{studyPlan.recommendations.length}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Rekomendasi</p>
                  </div>
                </div>
              </Card>

              {correlation && (
                <Card>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Data Performa Saat Ini</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Rata-rata Nilai</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{correlation.averageGrade}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Persentase Kehadiran</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{correlation.attendancePercentage}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Fokus Mata Pelajaran</h3>
                <div className="space-y-4">
                  {studyPlan.subjects.map((subject, index) => (
                    <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">{subject.subjectName}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getPriorityColor(subject.priority)}>
                              {subject.priority === 'high' ? 'Prioritas Tinggi' : subject.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                            </Badge>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {subject.currentGrade} → {subject.targetGrade}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {subject.weeklyHours} jam/minggu
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Area Fokus:</p>
                          <div className="flex flex-wrap gap-2">
                            {subject.focusAreas.map((area, idx) => (
                              <Badge key={idx} variant="blue">{area}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Sumber Belajar:</p>
                          <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400">
                            {subject.resources.map((resource, idx) => (
                              <li key={idx}>{resource}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'schedule' && (
            <Card>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Jadwal Belajar Mingguan</h3>
              <div className="space-y-4">
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => {
                  const daySchedule = studyPlan.schedule.filter(s => s.dayOfWeek === day);
                  if (daySchedule.length === 0) return null;

                  return (
                    <div key={day} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-3">{day}</h4>
                      <div className="space-y-2">
                        {daySchedule.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <ClockIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.subject}</p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {item.timeSlot} • {item.duration} menit
                              </p>
                            </div>
                            <Badge variant={getActivityColor(item.activity)}>
                              {item.activity === 'study' ? 'Belajar' :
                               item.activity === 'practice' ? 'Latihan' :
                               item.activity === 'review' ? 'Review' : 'Tugas'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {activeTab === 'recommendations' && (
            <Card>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Rekomendasi AI</h3>
              <div className="space-y-4">
                {studyPlan.recommendations.map((rec, index) => (
                  <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <LightBulbIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={rec.category === 'study_tips' ? 'green' :
                                       rec.category === 'time_management' ? 'blue' :
                                       rec.category === 'subject_advice' ? 'purple' : 'gray'}>
                            {rec.category === 'study_tips' ? 'Tips Belajar' :
                             rec.category === 'time_management' ? 'Manajemen Waktu' :
                             rec.category === 'subject_advice' ? 'Saran Mata Pelajaran' : 'Umum'}
                          </Badge>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">Prioritas {rec.priority}</span>
                        </div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">{rec.title}</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6">
              <Card>
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Materi Rekomendasi</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Materi pembelajaran yang relevan dengan rencana belajar Anda
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
                    >
                      <option value="all">Semua Mapel</option>
                      {getAvailableSubjects().map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
                    >
                      <option value="all">Semua Prioritas</option>
                      <option value="high">Prioritas Tinggi</option>
                      <option value="medium">Prioritas Sedang</option>
                      <option value="low">Prioritas Rendah</option>
                    </select>
                  </div>
                </div>

                {materialsLoading && (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded-xl" />
                    ))}
                  </div>
                )}

                {materialsError && (
                  <ErrorMessage
                    title="Gagal Memuat Materi"
                    message={materialsError}
                    variant="card"
                  />
                )}

                {!materialsLoading && !materialsError && getFilteredRecommendations().length === 0 && (
                  <EmptyState
                    message="Tidak ada materi yang sesuai dengan filter"
                    subMessage="Coba ubah filter atau buat rencana belajar baru"
                    size="md"
                  />
                )}

                {!materialsLoading && !materialsError && getFilteredRecommendations().length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {getFilteredRecommendations().slice(0, 6).map((rec) => (
                        <div
                          key={rec.materialId}
                          onClick={() => handleMaterialClick(rec)}
                          className={`cursor-pointer bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                            rec.accessed
                              ? 'border-green-500 dark:border-green-500'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${
                              rec.fileType === 'PDF'
                                ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
                                : rec.fileType === 'DOCX'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                : rec.fileType === 'PPT'
                                ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                                : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
                            }`}>
                              <DocumentTextIcon />
                            </div>
                            {rec.accessed && (
                              <Badge variant="success" size="sm">✓ Diakses</Badge>
                            )}
                          </div>
                          <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-2 line-clamp-2">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
                            {rec.description}
                          </p>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="blue" size="sm">{rec.subjectName}</Badge>
                            <Badge variant={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'} size="sm">
                              {rec.priority === 'high' ? 'Tinggi' : rec.priority === 'medium' ? 'Sedang' : 'Rendah'}
                            </Badge>
                          </div>
                          {rec.focusArea && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Fokus: {rec.focusArea}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              Relevansi: {rec.relevanceScore}%
                            </div>
                            <Button variant="primary" size="sm" className="flex items-center gap-1">
                              <ArrowDownTrayIcon className="w-3 h-3" />
                              Buka
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {getFilteredRecommendations().length > 6 && (
                      <div className="text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                          Menampilkan 6 dari {getFilteredRecommendations().length} materi
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onShowToast('Fitur tampilkan lebih banyak akan segera tersedia', 'info')}
                        >
                          Tampilkan Semua
                        </Button>
                      </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <LightBulbIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">
                            Progress Materi
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {studyPlanMaterialService.getProgress(studyPlan.id).accessed} dari{' '}
                            {studyPlanMaterialService.getProgress(studyPlan.id).total} materi telah diakses (
                            {studyPlanMaterialService.getProgress(studyPlan.id).percentage}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          message="Belum ada rencana belajar yang dibuat"
          subMessage="Klik 'Buat Rencana Belajar' untuk memulai"
          size="lg"
        />
      )}
    </div>
  );
};

export default StudyPlanGenerator;