import React, { useState, useEffect } from 'react';
import {
  calculateGPA,
  getAttendanceStats,
  getUnreadAnnouncements,
<<<<<<< HEAD
  type _Student,
=======
>>>>>>> origin/main
  type Grade,
  type ScheduleItem,
  type AttendanceRecord,
  type _Announcement
} from '../data/studentData';
import { AuthService } from '../services/authService';
<<<<<<< HEAD
import { _NotificationService, NotificationItem } from '../services/notificationService';
import {
=======
import { NotificationItem } from '../services/notificationService';
import {
  useCurrentStudent,
>>>>>>> origin/main
  useStudentGrades,
  useAttendanceRecords,
  useClassSchedule,
  useAcademicStats
} from '../hooks/useApi';
import NotificationBell from './NotificationBell';
import ToastNotification from './ToastNotification';
import LoadingSpinner from './LoadingSpinner';

interface StudentDashboardProps {
  onLogout: () => void;
}

const StudentDashboardApi: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'schedule' | 'attendance' | 'announcements'>('overview');
  const [currentToast, setCurrentToast] = useState<NotificationItem | null>(null);

  // API hooks untuk real data
<<<<<<< HEAD
    const {
      data: studentProfile,
      isLoading: profileLoading,
      error: _profileError,
      isSuccess: _profileSuccess
    } = useAcademicStats();

    // Use mock student data sebagai fallback jika API gagal
    const fallbackStudent = {
      id: 'STU001',
      name: 'Ahmad Fauzi Rahman',
      email: 'siswa@ma-malnukananga.sch.id',
      class: 'XII IPA 1',
      academicYear: '2024/2025',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    };

    const currentStudent = studentProfile || fallbackStudent;
=======
  const {
    data: studentProfile,
    isLoading: profileLoading,
    error: _profileError,
    isSuccess: _profileSuccess
  } = useCurrentStudent();
>>>>>>> origin/main

  const {
    data: grades,
    isLoading: gradesLoading,
    error: _gradesError
  } = useStudentGrades();

  const {
    data: attendance,
    isLoading: attendanceLoading,
    error: _attendanceError
  } = useAttendanceRecords();

  const {
    data: schedule,
    isLoading: scheduleLoading,
    error: _scheduleError
  } = useClassSchedule();

  const {
    data: _stats,
    isLoading: _statsLoading,
    error: _statsError
  } = useAcademicStats();

  

  // Calculate statistics dari API data atau fallback ke mock data
  const studentGrades = grades || [];
  const attendanceData = attendance || [];
  const weeklySchedule = schedule || [];
<<<<<<< HEAD
   const announcements: _Announcement[] = []; // TODO: Add announcements API
=======
  const announcements: Announcement[] = []; // TODO: Add announcements API
>>>>>>> origin/main

  const gpa = grades ? calculateGPA(grades) : 0;
  const attendanceStats = attendance ? getAttendanceStats(attendance) : { total: 0, present: 0, absent: 0, sick: 0, permitted: 0, percentage: 0 };
  const unreadAnnouncements = getUnreadAnnouncements(announcements || []);

  // Get today's schedule
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
  const todaySchedule = weeklySchedule.filter((item: ScheduleItem) => item.day === today);

  // Get recent grades (last 4)
  const recentGrades = studentGrades.slice(0, 4);

  // Listen for new notifications
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail as NotificationItem;
      setCurrentToast(notification);

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setCurrentToast(null);
      }, 5000);
    };

    window.addEventListener('showNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('showNotification', handleNewNotification as EventListener);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    onLogout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'B+': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'B': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'C+': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'C': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'Hadir': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'Izin': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'Sakit': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'Alfa': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

<<<<<<< HEAD
  // Loading state untuk critical data - using mock data so no loading needed
  if (false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="pt-24 pb-12">
          <LoadingSpinner size="lg" message="Memuat data siswa..." fullScreen />
        </div>
      </div>
    );
  }
=======
// Loading state untuk critical data - using mock data so no loading needed
   // Note: This condition is intentionally false for development
   if (profileLoading) {
     return (
       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         <div className="pt-24 pb-12">
           <LoadingSpinner size="lg" message="Memuat data siswa..." fullScreen />
         </div>
       </div>
     );
   }
>>>>>>> origin/main

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
<<<<<<< HEAD
                <img
                  src={(currentStudent as any).profileImage || '/default-avatar.png'}
                  alt={(currentStudent as any).name || 'Student'}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentStudent.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentStudent.class} • {currentStudent.academicYear}
                  </p>
                </div>
=======
                 <img
                   src={studentProfile?.profileImage || '/default-avatar.png'}
                   alt={studentProfile?.name || 'Student'}
                   className="h-12 w-12 rounded-full object-cover"
                 />
                 <div>
                   <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                     {studentProfile?.name}
                   </h1>
                   <p className="text-sm text-gray-500 dark:text-gray-400">
                     {studentProfile?.class} • {studentProfile?.academicYear}
                   </p>
                 </div>
>>>>>>> origin/main
              </div>
              <NotificationBell />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Ringkasan', icon: '🏠' },
              { id: 'grades', name: 'Nilai', icon: '📊' },
              { id: 'schedule', name: 'Jadwal', icon: '📅' },
              { id: 'attendance', name: 'Absensi', icon: '✅' },
              { id: 'announcements', name: `Pengumuman ${unreadAnnouncements.length > 0 ? `(${unreadAnnouncements.length})` : ''}`, icon: '📢' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'grades' | 'schedule' | 'attendance' | 'announcements')}
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
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                 Selamat datang kembali, {studentProfile?.name?.split(' ')[0]}! 👋
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{studentGrades.length}</p>
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadAnnouncements.length}</p>
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
                    {todaySchedule.map((item: ScheduleItem) => (
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
                {gradesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" message="Memuat nilai..." />
                  </div>
                ) : recentGrades.length > 0 ? (
                  <div className="space-y-3">
                    {recentGrades.map((grade: Grade) => (
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
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">Belum ada data nilai</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nilai Akademik</h3>
            </div>
            <div className="p-6">
              {gradesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" message="Memuat data nilai..." />
                </div>
              ) : studentGrades.length > 0 ? (
                <div className="space-y-4">
                  {studentGrades.map((grade: Grade) => (
                    <div key={grade.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{grade.subjectName}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Semester {grade.semester} - {grade.academicYear}</p>
                        </div>
                        <span className={`px-2 py-1 text-sm font-medium rounded-full ${getGradeColor(grade.finalGrade || '')}`}>
                          {grade.finalGrade} ({grade.gradePoint?.toFixed(1)})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">UTS</p>
                          <p className="font-medium text-gray-900 dark:text-white">{grade.midtermScore || '-'}/100</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">UAS</p>
                          <p className="font-medium text-gray-900 dark:text-white">{grade.finalScore || '-'}/100</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Tugas</p>
                          <p className="font-medium text-gray-900 dark:text-white">{grade.assignmentScore || '-'}/100</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Kehadiran</p>
                          <p className="font-medium text-gray-900 dark:text-white">{grade.attendanceScore || '-'}/100</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Belum ada data nilai</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {scheduleLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" message="Memuat jadwal..." />
              </div>
            ) : (
              ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((day) => {
                const daySchedule = weeklySchedule.filter((item: ScheduleItem) => item.day === day);
                return (
                  <div key={day} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Jadwal {day}</h3>
                    </div>
                    <div className="p-6">
                      {daySchedule.length > 0 ? (
                        <div className="space-y-4">
                          {daySchedule.map((item: ScheduleItem) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="text-center min-w-[100px]">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.time}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{item.subject}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.subjectCode}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.teacher}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.room}</p>
                                <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                                  item.type === 'Teori'
                                    ? 'text-blue-600 bg-blue-100 dark:bg-blue-900'
                                    : 'text-green-600 bg-green-100 dark:bg-green-900'
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Tidak ada jadwal untuk hari {day}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Kehadiran</h3>
            </div>
            <div className="p-6">
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" message="Memuat data kehadiran..." />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                      <p className="text-sm text-green-600">Hadir</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                      <p className="text-sm text-red-600">Alfa</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{attendanceStats.sick}</p>
                      <p className="text-sm text-yellow-600">Sakit</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{attendanceStats.permitted}</p>
                      <p className="text-sm text-blue-600">Izin</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {attendanceData.length > 0 ? (
                      attendanceData.map((record: AttendanceRecord) => (
                        <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{record.subject}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-sm font-medium rounded-full ${getAttendanceColor(record.status)}`}>
                              {record.status}
                            </span>
                            {record.notes && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{record.notes}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">Belum ada data kehadiran</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pengumuman</h3>
              <p className="text-gray-600 dark:text-gray-400">Fitur pengumuman akan segera tersedia dengan integrasi API</p>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {currentToast && (
        <ToastNotification
          notification={currentToast}
          onClose={() => setCurrentToast(null)}
          duration={5000}
        />
      )}
    </div>
  );
};

export default StudentDashboardApi;