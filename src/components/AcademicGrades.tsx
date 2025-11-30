
import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';

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
  // Simulasi Siswa Login: Budi Santoso (2024001)
  const STUDENT_NIS = '2024001';
  const STUDENT_NAME = 'Budi Santoso';

  const [grades, setGrades] = useState<GradeItem[]>([]);

  useEffect(() => {
    // 1. Ambil Data Matematika Wajib dari Input Guru (LocalStorage)
    // Note: We use raw localStorage here for read-only to avoid hook complexity in read-only components 
    // or we could use the hook without the setter.
    const storedGrades = localStorage.getItem(STORAGE_KEYS.GRADES);
    let mathGrade: GradeItem = {
        subject: 'Matematika Wajib',
        assignment: 0,
        midExam: 0,
        finalExam: 0,
        finalScore: 0,
        grade: '-'
    };

    if (storedGrades) {
        try {
            const parsed = JSON.parse(storedGrades);
            // Cari nilai milik Budi
            const budiData = parsed.find((p: any) => p.nis === STUDENT_NIS);
            if (budiData) {
                const final = (budiData.assignment * 0.3) + (budiData.midExam * 0.3) + (budiData.finalExam * 0.4);
                let letter = 'D';
                if (final >= 85) letter = 'A';
                else if (final >= 75) letter = 'B';
                else if (final >= 60) letter = 'C';

                mathGrade = {
                    subject: 'Matematika Wajib',
                    assignment: budiData.assignment,
                    midExam: budiData.midExam,
                    finalExam: budiData.finalExam,
                    finalScore: final,
                    grade: letter
                };
            }
        } catch (e) {
            console.error("Failed to parse grades in student view", e);
        }
    }

    // 2. Data Mockup untuk Mapel Lain (Agar terlihat seperti Rapor Asli)
    const mockGrades: GradeItem[] = [
        { subject: 'Bahasa Indonesia', assignment: 85, midExam: 82, finalExam: 80, finalScore: 82.1, grade: 'B' },
        { subject: 'Bahasa Inggris', assignment: 78, midExam: 75, finalExam: 76, finalScore: 76.3, grade: 'B' },
        { subject: 'Fisika', assignment: 90, midExam: 88, finalExam: 85, finalScore: 87.4, grade: 'A' },
        { subject: 'Biologi', assignment: 80, midExam: 75, finalExam: 78, finalScore: 77.7, grade: 'B' },
        { subject: 'Kimia', assignment: 75, midExam: 70, finalExam: 72, finalScore: 72.3, grade: 'C' },
        { subject: 'Pend. Agama Islam', assignment: 95, midExam: 92, finalExam: 90, finalScore: 92.1, grade: 'A' },
        { subject: 'PKn', assignment: 88, midExam: 85, finalExam: 85, finalScore: 85.9, grade: 'A' },
    ];

    setGrades([mathGrade, ...mockGrades]);
  }, []);

  // Hitung Rata-rata
  const averageScore = grades.length > 0 
    ? (grades.reduce((acc, curr) => acc + curr.finalScore, 0) / grades.length).toFixed(1)
    : 0;

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Portal
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kartu Hasil Studi (KHS)</h2>
                <p className="text-gray-500 dark:text-gray-400">Semester Ganjil 2024/2025</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Nama Siswa</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{STUDENT_NAME}</p>
                <p className="text-xs font-mono text-gray-400">NIS: {STUDENT_NIS}</p>
            </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-green-100 text-sm mb-1">Rata-Rata Nilai</p>
                    <h3 className="text-4xl font-bold">{averageScore}</h3>
                </div>
                <div className="text-right">
                    <p className="text-green-100 text-sm mb-1">Peringkat Kelas (Sementara)</p>
                    <h3 className="text-3xl font-bold">5 <span className="text-base font-normal opacity-75">/ 32</span></h3>
                </div>
            </div>
        </div>

        {/* Grades Table */}
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
                        {grades.map((item, idx) => (
                            <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${item.subject === 'Matematika Wajib' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {item.subject}
                                    {item.subject === 'Matematika Wajib' && (
                                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-normal">
                                            Live Data
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-center">{item.assignment}</td>
                                <td className="px-4 py-4 text-center">{item.midExam}</td>
                                <td className="px-4 py-4 text-center">{item.finalExam}</td>
                                <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                                    {item.finalScore.toFixed(1)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                        item.grade === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                        item.grade === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                        item.grade === 'C' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                    }`}>
                                        {item.grade}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 text-center">
                Nilai yang ditampilkan adalah hasil rekapitulasi sementara dan dapat berubah sewaktu-waktu.
            </div>
        </div>
    </div>
  );
};

export default AcademicGrades;
