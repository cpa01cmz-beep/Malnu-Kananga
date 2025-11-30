
import React, { useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';

interface StudentGrade {
  id: string;
  name: string;
  nis: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

interface GradingManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const INITIAL_DATA: StudentGrade[] = [
    { id: '1', name: 'Budi Santoso', nis: '2024001', assignment: 80, midExam: 75, finalExam: 0 },
    { id: '2', name: 'Siti Aminah', nis: '2024002', assignment: 90, midExam: 85, finalExam: 0 },
    { id: '3', name: 'Dewi Sartika', nis: '2024003', assignment: 85, midExam: 80, finalExam: 0 },
    { id: '4', name: 'Rudi Hartono', nis: '2024004', assignment: 70, midExam: 65, finalExam: 0 },
    { id: '5', name: 'Ahmad Dahlan', nis: '2024005', assignment: 95, midExam: 90, finalExam: 0 },
];

const GradingManagement: React.FC<GradingManagementProps> = ({ onBack, onShowToast }) => {
  // Use custom hook
  const [grades, setGrades] = useLocalStorage<StudentGrade[]>(STORAGE_KEYS.GRADES, INITIAL_DATA);

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null); // Store ID of row being edited

  // Calculate Final Score: 30% Assignment + 30% Mid + 40% Final
  const calculateFinal = (g: StudentGrade) => {
      return (g.assignment * 0.3) + (g.midExam * 0.3) + (g.finalExam * 0.4);
  };

  const getGradeLetter = (score: number) => {
      if (score >= 85) return 'A';
      if (score >= 75) return 'B';
      if (score >= 60) return 'C';
      return 'D';
  };

  const filteredData = grades.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.nis.includes(searchTerm)
  );

  const handleInputChange = (id: string, field: keyof StudentGrade, value: string) => {
      const numValue = Math.min(100, Math.max(0, Number(value) || 0)); // Clamp 0-100
      setGrades(prev => prev.map(g => g.id === id ? { ...g, [field]: numValue } : g));
  };

  const handleSave = () => {
      setIsEditing(null);
      onShowToast('Nilai berhasil disimpan ke database.', 'success');
  };

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Dashboard
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Input Nilai Siswa</h2>
                <p className="text-gray-500 dark:text-gray-400">Mata Pelajaran: <strong>Matematika Wajib (XII IPA 1)</strong></p>
            </div>
            <div>
                <input 
                    type="text" 
                    placeholder="Cari Nama / NIS..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
            </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Info Pembobotan:</strong> Tugas (30%) + UTS (30%) + UAS (40%). Nilai Akhir dan Predikat dihitung otomatis.
            </p>
        </div>

        {/* Grading Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Siswa</th>
                            <th className="px-4 py-4 text-center w-24">Tugas (30%)</th>
                            <th className="px-4 py-4 text-center w-24">UTS (30%)</th>
                            <th className="px-4 py-4 text-center w-24">UAS (40%)</th>
                            <th className="px-6 py-4 text-center">Nilai Akhir</th>
                            <th className="px-6 py-4 text-center">Predikat</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredData.map((student) => {
                            const finalScore = calculateFinal(student);
                            const gradeLetter = getGradeLetter(finalScore);
                            const isRowEditing = isEditing === student.id;

                            return (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                        <div className="text-xs text-gray-500">NIS: {student.nis}</div>
                                    </td>
                                    
                                    {/* Input Columns */}
                                    <td className="px-4 py-4 text-center">
                                        <input 
                                            type="number" 
                                            disabled={!isRowEditing}
                                            value={student.assignment}
                                            onChange={(e) => handleInputChange(student.id, 'assignment', e.target.value)}
                                            className="w-16 text-center p-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 disabled:opacity-60 disabled:border-transparent focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <input 
                                            type="number" 
                                            disabled={!isRowEditing}
                                            value={student.midExam}
                                            onChange={(e) => handleInputChange(student.id, 'midExam', e.target.value)}
                                            className="w-16 text-center p-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 disabled:opacity-60 disabled:border-transparent focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <input 
                                            type="number" 
                                            disabled={!isRowEditing}
                                            value={student.finalExam}
                                            onChange={(e) => handleInputChange(student.id, 'finalExam', e.target.value)}
                                            className="w-16 text-center p-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 disabled:opacity-60 disabled:border-transparent focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>

                                    {/* Calculated Columns */}
                                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                                        {finalScore.toFixed(1)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                            gradeLetter === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                            gradeLetter === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                            gradeLetter === 'C' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                        }`}>
                                            {gradeLetter}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isRowEditing ? (
                                            <button 
                                                onClick={handleSave}
                                                className="text-xs font-medium bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors"
                                            >
                                                Simpan
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setIsEditing(student.id)}
                                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default GradingManagement;
