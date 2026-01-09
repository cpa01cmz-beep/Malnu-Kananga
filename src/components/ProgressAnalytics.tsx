import React, { useState, useEffect, useCallback } from 'react';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';
import ProgressBar from './ui/ProgressBar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { gradesAPI, attendanceAPI, subjectsAPI, authAPI } from '../services/apiService';
import { Grade, Attendance, Subject, SubjectPerformance, AttendanceGradeCorrelation, Goal } from '../types';
import { logger } from '../utils/logger';
import { validateStudentProgress, getGradeStatus } from '../utils/studentValidation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { STORAGE_KEYS } from '../constants';
import { getGradientClass, DARK_GRADIENT_CLASSES } from '../config/gradients';
import { CHART_COLORS } from '../config/chartColors';
import { CardSkeleton, TableSkeleton } from './ui/Skeleton';

interface ProgressAnalyticsProps {
  onBack: () => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const COLORS = [
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.yellow,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ onBack, onShowToast = () => {} }) => {
  const currentUser = authAPI.getCurrentUser();
  const STUDENT_NIS = currentUser?.id || '';
  const STUDENT_NAME = currentUser?.name || 'Siswa';

  const [_grades, setGrades] = useState<Grade[]>([]);
  const [_attendance, setAttendance] = useState<Attendance[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [correlation, setCorrelation] = useState<AttendanceGradeCorrelation | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'goals' | 'correlation'>('overview');
  const [newGoal, setNewGoal] = useState({ subject: '', targetGrade: 'A', deadline: '' });

  const analyzeSubjectPerformance = useCallback((gradeData: Grade[], subjectData: Subject[]): SubjectPerformance[] => {
    const subjectMap = new Map<string, {
      assignment: number;
      midExam: number;
      finalExam: number;
      count: number;
      scores: number[];
    }>();

    gradeData.forEach((grade) => {
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
    const loadedGoals = loadGoals();

    subjectMap.forEach((values, subjectId) => {
      const subject = subjectData.find((s) => s.id === subjectId);
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

        const subjectGoal = loadedGoals.find(g => g.subject === subject.name);

        performance.push({
          subject: subject.name,
          averageScore: Math.round(finalScore * 10) / 10,
          assignment: Math.round(values.assignment),
          midExam: Math.round(values.midExam),
          finalExam: Math.round(values.finalExam),
          grade: letter,
          trend,
          targetGrade: subjectGoal?.targetGrade
        });
      }
    });

    return performance;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateAttendanceGradeCorrelation = (gradeData: Grade[], attendanceData: Attendance[]): AttendanceGradeCorrelation => {
    const totalAttendance = attendanceData.length;
    const presentDays = attendanceData.filter(a => a.status === 'hadir').length;
    const attendancePercentage = totalAttendance > 0 ? (presentDays / totalAttendance) * 100 : 95;

    const totalGrades = gradeData.reduce((sum, g) => sum + g.score, 0);
    const averageGrade = gradeData.length > 0 ? totalGrades / gradeData.length : 75;

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
  };

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
        setGrades(gradesRes.data);
        const performance = analyzeSubjectPerformance(gradesRes.data, subjectsRes.data);
        setSubjectPerformance(performance);
      }

      if (attendanceRes.success && attendanceRes.data && gradesRes.data) {
        setAttendance(attendanceRes.data);
        const correlationData = calculateAttendanceGradeCorrelation(gradesRes.data, attendanceRes.data);
        setCorrelation(correlationData);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
      logger.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  }, [STUDENT_NIS, analyzeSubjectPerformance]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadGoals = (): Goal[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_GOALS(STUDENT_NIS));
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logger.error('Error loading goals:', error);
      return [];
    }
  };

  const saveGoals = (goalsToSave: Goal[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_GOALS(STUDENT_NIS), JSON.stringify(goalsToSave));
      setGoals(goalsToSave);
    } catch (error) {
      logger.error('Error saving goals:', error);
      throw error;
    }
  };

  const addGoal = () => {
    const tempGoal = {
      subject: newGoal.subject,
      targetGrade: newGoal.targetGrade,
      currentGrade: 0,
      deadline: newGoal.deadline
    };

    const validation = validateStudentProgress(tempGoal);
    if (!validation.isValid) {
      onShowToast(validation.errors.join(', '), 'error');
      return;
    }

    const subjectPerf = subjectPerformance.find(sp => sp.subject === newGoal.subject);
    const goal: Goal = {
      id: Date.now().toString(),
      studentId: STUDENT_NIS,
      subject: newGoal.subject,
      targetGrade: newGoal.targetGrade,
      currentGrade: subjectPerf?.averageScore || 0,
      deadline: newGoal.deadline,
      status: 'in-progress',
      createdAt: new Date().toISOString()
    };

    try {
      const updatedGoals = [...loadGoals(), goal];
      saveGoals(updatedGoals);
      setNewGoal({ subject: '', targetGrade: 'A', deadline: '' });
      onShowToast('Target berhasil ditambahkan', 'success');
    } catch (error) {
      logger.error('Error saving goal:', error);
      onShowToast('Gagal menyimpan target', 'error');
    }
  };

  const deleteGoal = (goalId: string) => {
    try {
      const updatedGoals = goals.filter(g => g.id !== goalId);
      saveGoals(updatedGoals);
      onShowToast('Target berhasil dihapus', 'success');
    } catch (error) {
      logger.error('Error deleting goal:', error);
      onShowToast('Gagal menghapus target', 'error');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Laporan Akademik Siswa', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nama: ${STUDENT_NAME}`, 20, 35);
      doc.text(`NIS: ${STUDENT_NIS}`, 20, 42);
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 20, 42, { align: 'right' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan Prestasi', 20, 55);

    if (correlation) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Rata-rata Nilai: ${correlation.averageGrade}`, 20, 65);
      doc.text(`Persentase Kehadiran: ${correlation.attendancePercentage}%`, 20, 72);
      doc.text(`Skor Korelasi: ${correlation.correlationScore}/100`, 20, 79);
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performa per Mata Pelajaran', 20, 92);

    const tableData = subjectPerformance.map(sp => [
      sp.subject,
      sp.averageScore.toFixed(1),
      sp.grade,
      sp.trend,
      sp.targetGrade || '-'
    ]);

    autoTable(doc, {
      startY: 97,
      head: [['Mata Pelajaran', 'Rata-rata', 'Predikat', 'Trend', 'Target']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [22, 163, 74], textColor: [255,255,255] },
      alternateRowStyles: { fillColor: [240, 253, 244] }
    });

    if (goals.length > 0) {
      const extendedDoc = doc as { lastAutoTable?: { finalY?: number } };
      const finalY = extendedDoc.lastAutoTable?.finalY || 110 + 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Target Prestasi', 20, finalY);

      const goalData = goals.map(g => [
        g.subject,
        g.targetGrade,
        g.currentGrade.toFixed(1),
        g.deadline,
        g.status === 'achieved' ? '✓' : '○'
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Mata Pelajaran', 'Target', 'Nilai Saat Ini', 'Deadline', 'Status']],
        body: goalData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
      });
    }

      doc.save(`laporan-akademik-${STUDENT_NIS}-${Date.now()}.pdf`);
      onShowToast('Laporan berhasil diekspor', 'success');
    } catch (error) {
      logger.error('Error exporting PDF:', error);
      onShowToast('Gagal mengekspor laporan', 'error');
    }
  };

  const gradeDistributionData = [
    { name: 'A', value: subjectPerformance.filter(sp => sp.grade === 'A').length },
    { name: 'B', value: subjectPerformance.filter(sp => sp.grade === 'B').length },
    { name: 'C', value: subjectPerformance.filter(sp => sp.grade === 'C').length },
    { name: 'D', value: subjectPerformance.filter(sp => sp.grade === 'D').length }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Analisis Progres Akademik</h2>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={8} cols={4} />
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
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Analisis Progres Akademik</h2>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <ErrorMessage 
            title="Error Loading Analytics Data" 
            message={error} 
            variant="card" 
          />
          <Button
            onClick={fetchData}
            variant="red-solid"
          >
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
<Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Analisis Progres Akademik</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Semester Ganjil 2024/2025</p>
        </div>
        <Button
          onClick={exportToPDF}
          variant="green-solid"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          iconPosition="left"
        >
          Export PDF
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-green-600 text-white'
              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'trends'
              ? 'bg-green-600 text-white'
              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
          }`}
        >
          Tren Nilai
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'goals'
              ? 'bg-green-600 text-white'
              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
          }`}
        >
          Target Prestasi
        </button>
        <button
          onClick={() => setActiveTab('correlation')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'correlation'
              ? 'bg-green-600 text-white'
              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
          }`}
        >
          Kehadiran vs Nilai
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${getGradientClass('GREEN_MAIN')} rounded-xl p-6 text-white`}>
              <p className="text-green-100 text-sm mb-2">Rata-rata Nilai</p>
              <h3 className="text-3xl font-bold">{correlation?.averageGrade || 0}</h3>
            </div>
            <div className={`${getGradientClass('BLUE_MAIN')} rounded-xl p-6 text-white`}>
              <p className="text-blue-100 text-sm mb-2">Persentase Kehadiran</p>
              <h3 className="text-3xl font-bold">{correlation?.attendancePercentage || 0}%</h3>
            </div>
            <div className={`${getGradientClass('PURPLE_MAIN')} rounded-xl p-6 text-white`}>
              <p className="text-purple-100 text-sm mb-2">Skor Korelasi</p>
              <h3 className="text-3xl font-bold">{correlation?.correlationScore || 0}/100</h3>
            </div>
          </div>

          {correlation && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Insight & Saran</h3>
              <ul className="space-y-2">
                {correlation.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Distribusi Predikat</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill={CHART_COLORS.indigo}
                >
                  {gradeDistributionData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Performa per Mata Pelajaran</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="assignment" fill={CHART_COLORS.green} name="Tugas" />
                <Bar dataKey="midExam" fill={CHART_COLORS.blue} name="UTS" />
                <Bar dataKey="finalExam" fill={CHART_COLORS.yellow} name="UAS" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Rata-rata Nilai Akhir</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="averageScore" fill={CHART_COLORS.green} name="Nilai Akhir">
                  {subjectPerformance.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Tambah Target Prestasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Mata Pelajaran</label>
                <select
                  value={newGoal.subject}
                  onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {subjectPerformance.map((sp) => (
                    <option key={sp.subject} value={sp.subject}>{sp.subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Target Predikat</label>
                <select
                  value={newGoal.targetGrade}
                  onChange={(e) => setNewGoal({ ...newGoal, targetGrade: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="A">A (85-100)</option>
                  <option value="B">B (75-84)</option>
                  <option value="C">C (60-74)</option>
                  <option value="D">D (&lt; 60)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Deadline</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <Button
              onClick={addGoal}
              variant="green-solid"
            >
              Tambah Target
            </Button>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Target Aktif</h3>
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal) => {
                  const subjectPerf = subjectPerformance.find(sp => sp.subject === goal.subject);
                  const progress = subjectPerf ? (subjectPerf.averageScore / getGradeMin(goal.targetGrade)) * 100 : 0;
                  const status = subjectPerf ? getGradeStatus(goal.targetGrade, subjectPerf.grade) : 'in-progress';

                  return (
                    <div key={goal.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-neutral-900 dark:text-white">{goal.subject}</h4>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Target: {goal.targetGrade} | Deadline: {new Date(goal.deadline).toLocaleDateString('id-ID')}</p>
                        </div>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-neutral-600 dark:text-neutral-400">Nilai Saat Ini: {subjectPerf?.averageScore.toFixed(1) || 0}</span>
                            <span className={`font-bold ${status === 'achieved' ? 'text-green-600' : status === 'not-achieved' ? 'text-red-600' : 'text-yellow-600'}`}>
                              {status === 'achieved' ? 'Tercapai!' : status === 'not-achieved' ? 'Belum Terpenuhi' : 'Dalam Proses'}
                            </span>
                          </div>
                          <ProgressBar
                            value={progress}
                            max={100}
                            size="md"
                            color={status === 'achieved' ? 'success' : status === 'not-achieved' ? 'error' : 'warning'}
                            aria-label={`Goal progress: ${Math.min(progress, 100)}% - ${status}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">Belum ada target prestasi yang ditetapkan.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'correlation' && correlation && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Analisis Korelasi Kehadiran vs Nilai</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">{correlation.attendancePercentage}%</span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-medium">Persentase Kehadiran</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{correlation.averageGrade}</span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-medium">Rata-rata Nilai</p>
              </div>
            </div>
          </div>

          <div className={`${getGradientClass('PURPLE_SOFT')} ${DARK_GRADIENT_CLASSES.PURPLE_SOFT} rounded-xl p-6 border border-purple-200 dark:border-purple-800`}>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Skor Korelasi Kesehatan Akademik</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-neutral-200 dark:text-neutral-700" />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - correlation.correlationScore / 100)}`}
                    className="text-purple-600 dark:text-purple-400 transition-all"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">{correlation.correlationScore}</span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">/100</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-neutral-700 dark:text-neutral-300">
              Skor korelasi menggabungkan kehadiran dan performa akademik untuk memberikan gambaran kesehatan akademik Anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const getGradeMin = (grade: string): number => {
  switch (grade) {
    case 'A': return 85;
    case 'B': return 75;
    case 'C': return 60;
    case 'D': return 0;
    default: return 0;
  }
};

export default ProgressAnalytics;
