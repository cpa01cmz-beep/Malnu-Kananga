import React, { useState, useEffect, useCallback } from 'react';
import { gradesAPI, subjectsAPI } from '../services/apiService';
import { Grade, Subject } from '../types';
import { authAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import ProgressAnalytics from './ProgressAnalytics';

interface GradeItem {
  subject: string;
  assignment: number;
  midExam: number;
  finalExam: number;
  finalScore: number;
  grade: string;
}

interface AcademicGradesProps {
  onBack: () => void;
}

const AcademicGrades: React.FC<AcademicGradesProps> = ({ onBack }) => {
  const currentUser = authAPI.getCurrentUser();
  const STUDENT_NIS = currentUser?.id || '';
  const STUDENT_NAME = currentUser?.name || 'Siswa';

  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'analytics'>('table');

  const fetchGrades = useCallback(async () => {
    if (!STUDENT_NIS) {
      setError('User tidak ditemukan');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [gradesRes, subjectsRes] = await Promise.all([
        gradesAPI.getByStudent(STUDENT_NIS),
        subjectsAPI.getAll(),
      ]);

      if (gradesRes.success && gradesRes.data && subjectsRes.success && subjectsRes.data) {
        const aggregatedGrades = aggregateGradesBySubject(gradesRes.data, subjectsRes.data);
        setGrades(aggregatedGrades);
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

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

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

  const averageScore =
    grades.length > 0 ? (grades.reduce((acc, curr) => acc + curr.finalScore, 0) / grades.length).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Portal
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kartu Hasil Studi (KHS)</h2>
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
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              ← Kembali ke Portal
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kartu Hasil Studi (KHS)</h2>
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
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
            ← Kembali ke Portal
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kartu Hasil Studi (KHS)</h2>
          <p className="text-gray-500 dark:text-gray-400">Semester Ganjil 2024/2025</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Nama Siswa</p>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{STUDENT_NAME}</p>
            <p className="text-xs font-mono text-gray-400">NIS: {STUDENT_NIS}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('table')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'table'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Tabel Nilai
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'analytics'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          📊 Analisis Progres
        </button>
      </div>

      {view === 'analytics' ? (
        <ProgressAnalytics onBack={onBack} />
      ) : (
        <>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 text-sm mb-1">Rata-Rata Nilai</p>
              <h3 className="text-4xl font-bold">{averageScore}</h3>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm mb-1">Peringkat Kelas (Sementara)</p>
              <h3 className="text-3xl font-bold">
                5 <span className="text-base font-normal opacity-75">/ 32</span>
              </h3>
            </div>
          </div>
        </div>

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
          <div className="p-4 bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 text-center">
            Nilai yang ditampilkan adalah hasil rekapitulasi sementara dan dapat berubah sewaktu-waktu.
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default AcademicGrades;
