import React, { useState } from 'react';
import {
  currentTeacher,
  teacherClasses,
  classStudents,
  schoolStats,
  monthlyTrends,
  calculateClassAverage,
  getAttendanceStatus,
  getGradeDistribution,
  type Teacher,
  type Class,
  type StudentRecord,
  type GradeInput
} from '../data/teacherData';
import { AuthService } from '../services/authService';
import { NotificationService } from '../services/notificationService';
import NotificationBell from './NotificationBell';

interface TeacherDashboardProps {
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'students' | 'analytics'>('overview');
  const [selectedClass, setSelectedClass] = useState<string>(teacherClasses[0]?.id || '');
  const [gradeInputs, setGradeInputs] = useState<{[key: string]: GradeInput}>({});

  const selectedClassData = teacherClasses.find(c => c.id === selectedClass);
  const classAverage = calculateClassAverage(classStudents);
  const attendanceStatus = getAttendanceStatus(classAverage);
  const gradeDistribution = getGradeDistribution(classStudents);

  const handleLogout = () => {
    AuthService.logout();
    onLogout();
  };

  const handleGradeInput = (studentId: string, field: keyof GradeInput, value: any) => {
    setGradeInputs(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmitGrades = () => {
    // Simulate grade submission
    Object.entries(gradeInputs).forEach(([studentId, gradeData]) => {
      if (gradeData.status === 'submitted') {
        NotificationService.addNotification({
          title: 'Nilai Berhasil Disubmit',
          message: `Nilai untuk ${gradeData.studentName} telah disimpan`,
          type: 'academic',
          priority: 'medium'
        });
      }
    });
    setGradeInputs({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={currentTeacher.profileImage}
                  alt={currentTeacher.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentTeacher.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Guru {currentTeacher.subject} • Wali Kelas {currentTeacher.classTeacher}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Class Selector */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {teacherClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.studentCount} siswa)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Ringkasan', icon: '🏠' },
              { id: 'grades', name: 'Input Nilai', icon: '📝' },
              { id: 'attendance', name: 'Absensi', icon: '📋' },
              { id: 'students', name: 'Data Siswa', icon: '👥' },
              { id: 'analytics', name: 'Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Selamat datang, {currentTeacher.name.split(' ')[0]}! 👋
              </h2>
              <p className="text-blue-100">
                Kelas {selectedClassData?.name} • {selectedClassData?.studentCount} siswa
              </p>
            </div>

            {/* Class Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jumlah Siswa</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedClassData?.studentCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rata-rata Nilai</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{classAverage}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kehadiran</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{classAverage}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Performa Kelas</p>
                    <p className={`text-lg font-bold ${attendanceStatus.color}`}>
                      {attendanceStatus.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('grades')}
                  className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                >
                  <div className="text-center">
                    <span className="text-2xl block mb-2">📝</span>
                    <p className="font-medium text-blue-700 dark:text-blue-300">Input Nilai</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Update nilai siswa</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                >
                  <div className="text-center">
                    <span className="text-2xl block mb-2">📋</span>
                    <p className="font-medium text-green-700 dark:text-green-300">Absensi</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Catat kehadiran</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('students')}
                  className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
                >
                  <div className="text-center">
                    <span className="text-2xl block mb-2">👥</span>
                    <p className="font-medium text-purple-700 dark:text-purple-300">Data Siswa</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Lihat profil siswa</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Input Nilai - {selectedClassData?.name}</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {classStudents.map((student) => (
                    <div key={student.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Rata-rata: {student.averageGrade} • Kehadiran: {student.attendanceRate}%
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                            Simpan
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            UTS
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            UAS
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tugas
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Kehadiran
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSubmitGrades}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Semua Nilai
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Absensi Hari Ini - {selectedClassData?.name}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {classStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kehadiran: {student.attendanceRate}%</p>
                    </div>
                    <div className="flex space-x-2">
                      {['Hadir', 'Izin', 'Sakit', 'Alfa'].map((status) => (
                        <button
                          key={status}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            status === 'Hadir'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : status === 'Izin'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : status === 'Sakit'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Siswa - {selectedClassData?.name}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {classStudents.map((student) => {
                  const attendanceStatus = getAttendanceStatus(student.attendanceRate);
                  return (
                    <div key={student.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Kehadiran</p>
                              <p className={`font-medium ${attendanceStatus.color}`}>
                                {student.attendanceRate}% ({attendanceStatus.label})
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Rata-rata Nilai</p>
                              <p className="font-medium text-gray-900 dark:text-white">{student.averageGrade}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Status</p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                student.status === 'active'
                                  ? 'text-green-600 bg-green-100 dark:bg-green-900'
                                  : 'text-red-600 bg-red-100 dark:bg-red-900'
                              }`}>
                                {student.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800">
                            Lihat Detail
                          </button>
                          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* School Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Siswa</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{schoolStats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Guru</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{schoolStats.totalTeachers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <span className="text-2xl">🏫</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Kelas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{schoolStats.totalClasses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tingkat Kelulusan</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{schoolStats.graduationRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribusi Nilai Kelas</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{gradeDistribution.excellent}</p>
                    <p className="text-sm text-green-600">Sangat Baik (A)</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{gradeDistribution.good}</p>
                    <p className="text-sm text-blue-600">Baik (B)</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{gradeDistribution.average}</p>
                    <p className="text-sm text-yellow-600">Cukup (C)</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{gradeDistribution.poor}</p>
                    <p className="text-sm text-red-600">Perlu Perhatian (D)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tren Bulanan</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {monthlyTrends.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 text-center">
                          <p className="font-medium text-gray-900 dark:text-white">{month.month}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Siswa Baru: {month.newStudents}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Kehadiran: {month.attendance}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">Rata-rata: {month.averageGrade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;