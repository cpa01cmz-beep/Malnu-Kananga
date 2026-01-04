
import React, { useState } from 'react';

import { STORAGE_KEYS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';

interface ClassStudent {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  address: string;
  attendanceToday: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
}

interface ClassManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const INITIAL_STUDENTS: ClassStudent[] = [
    { id: '1', nis: '2024001', name: 'Budi Santoso', gender: 'L', address: 'Jl. Raya Menes No. 12', attendanceToday: 'Hadir' },
    { id: '2', nis: '2024002', name: 'Siti Aminah', gender: 'P', address: 'Kp. Kananga RT 02/01', attendanceToday: 'Hadir' },
    { id: '3', nis: '2024003', name: 'Dewi Sartika', gender: 'P', address: 'Jl. Labuan Km. 5', attendanceToday: 'Sakit' },
    { id: '4', nis: '2024004', name: 'Rudi Hartono', gender: 'L', address: 'Kp. Cikedal', attendanceToday: 'Hadir' },
    { id: '5', nis: '2024005', name: 'Ahmad Dahlan', gender: 'L', address: 'Jl. Alun-alun Menes', attendanceToday: 'Izin' },
    { id: '6', nis: '2024006', name: 'Ratna Sari', gender: 'P', address: 'Kp. Pasir Waru', attendanceToday: 'Hadir' },
    { id: '7', nis: '2024007', name: 'Doni Tata', gender: 'L', address: 'Jl. Ciputri', attendanceToday: 'Alpa' },
];

const ClassManagement: React.FC<ClassManagementProps> = ({ onBack, onShowToast }) => {
  // Use custom hook for persistence
  const [students, setStudents] = useLocalStorage<ClassStudent[]>(STORAGE_KEYS.CLASS_DATA, INITIAL_STUDENTS);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis.includes(searchTerm)
  );

  const handleAttendanceChange = (id: string, status: ClassStudent['attendanceToday']) => {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, attendanceToday: status } : s));
      onShowToast('Status kehadiran diperbarui', 'success');
  };

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Dashboard
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Kelas Perwalian</h2>
                <p className="text-gray-500 dark:text-gray-400">Kelas: <strong>XII IPA 1</strong> • Total Siswa: <strong>{students.length}</strong></p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Hadir Hari Ini</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{students.filter(s => s.attendanceToday === 'Hadir').length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sakit</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{students.filter(s => s.attendanceToday === 'Sakit').length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Izin</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{students.filter(s => s.attendanceToday === 'Izin').length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Alpa</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{students.filter(s => s.attendanceToday === 'Alpa').length}</p>
            </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">NIS</th>
                            <th className="px-6 py-4">Nama Lengkap</th>
                            <th className="px-4 py-4 text-center">L/P</th>
                            <th className="px-6 py-4">Alamat</th>
                            <th className="px-6 py-4">Kehadiran (Hari Ini)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{student.nis}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-200">
                                                {student.name.charAt(0)}
                                            </div>
                                            {student.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                            student.gender === 'L' 
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' 
                                            : 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300'
                                        }`}>
                                            {student.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-xs">{student.address}</td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={student.attendanceToday}
                                            onChange={(e) => handleAttendanceChange(student.id, e.target.value as any)}
                                            className={`text-xs font-medium rounded-full px-3 py-1.5 border-none focus:ring-2 focus:ring-green-500 cursor-pointer outline-none ${
                                                student.attendanceToday === 'Hadir' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                student.attendanceToday === 'Sakit' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                student.attendanceToday === 'Izin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            }`}
                                        >
                                            <option value="Hadir">Hadir</option>
                                            <option value="Sakit">Sakit</option>
                                            <option value="Izin">Izin</option>
                                            <option value="Alpa">Alpa</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Tidak ada data siswa ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ClassManagement;
