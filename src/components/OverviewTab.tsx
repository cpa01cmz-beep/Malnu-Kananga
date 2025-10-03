import React from 'react';
import { Student, Grade, ScheduleItem, AttendanceStats } from '../data/studentData';

interface OverviewTabProps {
  student: Student;
  gpa: number;
  attendanceStats: AttendanceStats;
  todaySchedule: ScheduleItem[];
  recentGrades: Grade[];
  today: string;
  formatDate: (dateString: string) => string;
  getGradeColor: (grade: string) => string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  student,
  gpa,
  attendanceStats,
  todaySchedule,
  recentGrades,
  today,
  formatDate,
  getGradeColor
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Selamat datang kembali, {student.name.split(' ')[0]}! 👋
        </h2>
        <p className="text-green-100">
          Hari ini adalah {today}, {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">IPK Semester Ini</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{gpa.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kehadiran</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceStats.percentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mata Pelajaran</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <span className="text-2xl">📢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pengumuman Baru</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentGrades.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      {todaySchedule.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Jadwal Hari Ini ({today})
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todaySchedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.time.split(' - ')[0]}</p>
                      <p className="text-xs text-gray-500">{item.time.split(' - ')[1]}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.subject}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.teacher}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'Teori'
                        ? 'text-blue-600 bg-blue-100 dark:bg-blue-900'
                        : 'text-green-600 bg-green-100 dark:bg-green-900'
                    }`}>
                      {item.type}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Grades */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nilai Terbaru</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentGrades.map((grade) => (
              <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{grade.subjectName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Semester {grade.semester}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${getGradeColor(grade.finalGrade || '')}`}>
                    {grade.finalGrade}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {grade.finalScore ? `${grade.finalScore}/100` : 'Belum ada nilai'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;