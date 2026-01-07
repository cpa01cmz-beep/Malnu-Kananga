import React, { useState, useEffect, useCallback } from 'react';
import { LineChart } from 'recharts/es6/chart/LineChart';
import { Line } from 'recharts/es6/cartesian/Line';
import { BarChart } from 'recharts/es6/chart/BarChart';
import { Bar } from 'recharts/es6/cartesian/Bar';
import { XAxis } from 'recharts/es6/cartesian/XAxis';
import { YAxis } from 'recharts/es6/cartesian/YAxis';
import { CartesianGrid } from 'recharts/es6/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/es6/component/Tooltip';
import { Legend } from 'recharts/es6/component/Legend';
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { gradesAPI, subjectsAPI, attendanceAPI } from '../services/apiService';
import { Grade, Subject, Attendance } from '../types';
import { authAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import Button from './ui/Button';

interface GradeItem {
  subject: string;
  assignment: number;
  midExam: number;
  finalExam: number;
  finalScore: number;
  grade: string;
}

interface GradeTrend {
  month: string;
  averageScore: number;
  attendanceRate: number;
}

interface SubjectPerformance {
  subject: string;
  score: number;
  grade: string;
}

interface AcademicGoal {
  id: string;
  subject: string;
  targetGrade: string;
  targetScore: number;
  currentScore: number;
  startDate: string;
  endDate: string;
  achieved: boolean;
}

interface AcademicGradesProps {
  onBack: () => void;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const AcademicGrades: React.FC<AcademicGradesProps> = ({ onBack }) => {
  const currentUser = authAPI.getCurrentUser();
  const STUDENT_NIS = currentUser?.id || '';
  const STUDENT_NAME = currentUser?.name || 'Siswa';

  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [gradeTrends, setGradeTrends] = useState<GradeTrend[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [goals, setGoals] = useState<AcademicGoal[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    subject: '',
    targetGrade: 'A',
    targetScore: 85,
    endDate: ''
  });

  const fetchGrades = useCallback(async () => {
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
        const aggregatedGrades = aggregateGradesBySubject(gradesRes.data, subjectsRes.data);
        setGrades(aggregatedGrades);
        
        const trends = generateGradeTrends(gradesRes.data, attendanceRes.data || []);
        setGradeTrends(trends);
        
        const performance = generateSubjectPerformance(aggregatedGrades);
        setSubjectPerformance(performance);
        
        
      } else {
        setError(gradesRes.message || 'Gagal mengambil data nilai');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data nilai');
      logger.error('Error fetching grades:', err);
    } finally {
      setLoading(false);
    }
  }, [STUDENT_NIS]);

  const loadGoals = useCallback(() => {
    const savedGoals = localStorage.getItem(STORAGE_KEYS.STUDENT_GOALS(STUDENT_NIS));
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, [STUDENT_NIS]);

  useEffect(() => {
    fetchGrades();
    loadGoals();
  }, [fetchGrades, loadGoals]);

  const aggregateGradesBySubject = (gradeData: Grade[], subjectData: Subject[]): GradeItem[] => {
    const gradeMap = new Map<string, { assignment: number; midExam: number; finalExam: number; count: number }>();

    gradeData.forEach((grade) => {
      const assignmentType = grade.assignmentType.toLowerCase();
      const key = grade.subjectId;

      if (!gradeMap.has(key)) {
        gradeMap.set(key, { assignment: 0, midExam: 0, finalExam: 0, count: 0 });
      }

      const aggregated = gradeMap.get(key)!;

      if (assignmentType === 'tugas' || assignmentType === 'assignment') {
        aggregated.assignment = (aggregated.assignment * aggregated.count + grade.score) / (aggregated.count + 1);
      } else if (assignmentType === 'uts' || assignmentType === 'mid') {
        aggregated.midExam = (aggregated.midExam * aggregated.count + grade.score) / (aggregated.count + 1);
      } else if (assignmentType === 'uas' || assignmentType === 'final') {
        aggregated.finalExam = (aggregated.finalExam * aggregated.count + grade.score) / (aggregated.count + 1);
      }

      aggregated.count += 1;
    });

    const gradeItems: GradeItem[] = [];

    gradeMap.forEach((values, subjectId) => {
      const subject = subjectData.find((s) => s.id === subjectId);
      if (subject) {
        const finalScore = values.assignment * 0.3 + values.midExam * 0.3 + values.finalExam * 0.4;
        let letter = 'D';
        if (finalScore >= 85) letter = 'A';
        else if (finalScore >= 75) letter = 'B';
        else if (finalScore >= 60) letter = 'C';

        gradeItems.push({
          subject: subject.name,
          assignment: Math.round(values.assignment),
          midExam: Math.round(values.midExam),
          finalExam: Math.round(values.finalExam),
          finalScore: Math.round(finalScore * 10) / 10,
          grade: letter,
        });
      }
    });

    return gradeItems;
  };

  const generateGradeTrends = (gradeData: Grade[], attendanceData: Attendance[]): GradeTrend[] => {
    const monthlyData = new Map<string, { scores: number[]; attendanceCount: number; totalDays: number }>();
    
    gradeData.forEach(grade => {
      const date = new Date(grade.createdAt);
      const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { scores: [], attendanceCount: 0, totalDays: 0 });
      }
      
      monthlyData.get(monthKey)!.scores.push(grade.score);
    });

    attendanceData.forEach(attendance => {
      const date = new Date(attendance.date);
      const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { scores: [], attendanceCount: 0, totalDays: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.totalDays++;
      if (attendance.status === 'hadir') {
        data.attendanceCount++;
      }
    });

    const trends: GradeTrend[] = [];
    monthlyData.forEach((data, month) => {
      const avgScore = data.scores.length > 0 
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length 
        : 0;
      const attendanceRate = data.totalDays > 0 ? (data.attendanceCount / data.totalDays) * 100 : 0;
      
      trends.push({
        month,
        averageScore: Math.round(avgScore * 10) / 10,
        attendanceRate: Math.round(attendanceRate)
      });
    });

    return trends.slice(-6);
  };

  const generateSubjectPerformance = (grades: GradeItem[]): SubjectPerformance[] => {
    return grades.map(grade => ({
      subject: grade.subject,
      score: grade.finalScore,
      grade: grade.grade
    }));
  };

  const saveGoals = useCallback((updatedGoals: AcademicGoal[]) => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_GOALS(STUDENT_NIS), JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  }, [STUDENT_NIS]);

  const addGoal = () => {
    if (!newGoal.subject || !newGoal.endDate) return;
    
    const goal: AcademicGoal = {
      id: Date.now().toString(),
      subject: newGoal.subject,
      targetGrade: newGoal.targetGrade,
      targetScore: newGoal.targetScore,
      currentScore: grades.find(g => g.subject === newGoal.subject)?.finalScore || 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: newGoal.endDate,
      achieved: false
    };

    saveGoals([...goals, goal]);
    setNewGoal({ subject: '', targetGrade: 'A', targetScore: 85, endDate: '' });
    setShowGoalModal(false);
  };

  const updateGoalProgress = useCallback(() => {
    const updatedGoals = goals.map(goal => {
      const currentGrade = grades.find(g => g.subject === goal.subject);
      if (currentGrade) {
        return {
          ...goal,
          currentScore: currentGrade.finalScore,
          achieved: currentGrade.finalScore >= goal.targetScore
        };
      }
      return goal;
    });
    saveGoals(updatedGoals);
  }, [goals, grades, saveGoals]);

  useEffect(() => {
    updateGoalProgress();
  }, [grades, updateGoalProgress]);

  const generatePDFReport = async () => {
    const element = document.getElementById('academic-report');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`laporan-akademik-${STUDENT_NAME}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      logger.error('Error generating PDF:', error);
      window.alert('Gagal menghasilkan PDF. Silakan coba lagi.');
    }
  };

  const getAttendanceGradeCorrelation = () => {
    if (gradeTrends.length === 0) return 0;
    
    const avgAttendance = gradeTrends.reduce((sum, trend) => sum + trend.attendanceRate, 0) / gradeTrends.length;
    const avgGrade = gradeTrends.reduce((sum, trend) => sum + trend.averageScore, 0) / gradeTrends.length;
    
    return Math.round((avgAttendance / 100) * avgGrade);
  };

  

  const averageScore = grades.length > 0 
    ? (grades.reduce((acc, curr) => acc + curr.finalScore, 0) / grades.length).toFixed(1) 
    : '0';

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Akademik Siswa</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
              ← Kembali ke Portal
            </Button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Akademik Siswa</h2>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchGrades}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
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
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Akademik Siswa</h2>
           <p className="text-gray-500 dark:text-gray-400">Semester Ganjil 2024/2025</p>
         </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGoalModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            🎯 Target Belajar
          </button>
          <button
            onClick={generatePDFReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            📊 Export PDF
          </button>
        </div>
      </div>

      <div id="academic-report">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-green-100 text-sm mb-1">Rata-Rata Nilai</p>
            <h3 className="text-3xl font-bold">{averageScore}</h3>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm mb-1">Total Mata Pelajaran</p>
            <h3 className="text-3xl font-bold">{grades.length}</h3>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-yellow-100 text-sm mb-1">Target Tercapai</p>
            <h3 className="text-3xl font-bold">{goals.filter(g => g.achieved).length}/{goals.length}</h3>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-purple-100 text-sm mb-1">Korelasi Kehadiran</p>
            <h3 className="text-3xl font-bold">{getAttendanceGradeCorrelation()}%</h3>
          </div>
        </div>

        {gradeTrends.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tren Nilai Akademik</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gradeTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="averageScore" stroke="#10b981" name="Rata-rata Nilai" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performa per Mata Pelajaran</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {goals.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Target Belajar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map(goal => (
                <div key={goal.id} className={`p-4 rounded-lg border ${goal.achieved ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{goal.subject}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${goal.achieved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {goal.achieved ? '✓ Tercapai' : '🎯 Progres'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Target: {goal.targetGrade} ({goal.targetScore})</p>
                    <p>Current: {goal.currentScore.toFixed(1)}</p>
                    <p className="text-xs mt-1">{goal.endDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Mata Pelajaran</th>
                  <th className="px-4 py-4 text-center">Tugas</th>
                  <th className="px-4 py-4 text-center">UTS</th>
                  <th className="px-4 py-4 text-center">UAS</th>
                  <th className="px-6 py-4 text-center font-bold">Nilai Akhir</th>
                  <th className="px-6 py-4 text-center">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {grades.length > 0 ? (
                  grades.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.subject}</td>
                      <td className="px-4 py-4 text-center">{item.assignment}</td>
                      <td className="px-4 py-4 text-center">{item.midExam}</td>
                      <td className="px-4 py-4 text-center">{item.finalExam}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                        {item.finalScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                            item.grade === 'A'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                              : item.grade === 'B'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : item.grade === 'C'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                          }`}
                        >
                          {item.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      Belum ada data nilai tersedia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Target Belajar Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Pelajaran</label>
                <select
                  value={newGoal.subject}
                  onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {grades.map(grade => (
                    <option key={grade.subject} value={grade.subject}>{grade.subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Grade</label>
                <select
                  value={newGoal.targetGrade}
                  onChange={(e) => setNewGoal({ ...newGoal, targetGrade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Nilai</label>
                <input
                  type="number"
                  value={newGoal.targetScore}
                  onChange={(e) => setNewGoal({ ...newGoal, targetScore: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Tanggal</label>
                <input
                  type="date"
                  value={newGoal.endDate}
                  onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={addGoal}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Simpan Target
              </button>
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicGrades;