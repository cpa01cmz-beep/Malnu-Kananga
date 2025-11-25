import React, { useState, useEffect } from 'react';
import {
  currentStudent,
  studentGrades,
  weeklySchedule,
  attendanceData,
  announcements,
  calculateGPA,
  getAttendanceStats,
  getUnreadAnnouncements,
  type _Announcement
} from '../data/studentData';
import { AuthService } from '../services/authService';
import { NotificationService, NotificationItem } from '../services/notificationService';
import { StudentSupportService } from '../services/studentSupportService';
import StudentDashboardHeader from './StudentDashboardHeader';
import NavigationTabs from './NavigationTabs';
import OverviewTab from './OverviewTab';
import GradesTab from './GradesTab';
import ScheduleTab from './ScheduleTab';
import AttendanceTab from './AttendanceTab';
import AnnouncementsTab from './AnnouncementsTab';
import ToastNotification from './ToastNotification';
import StudentSupportDashboard from './StudentSupportDashboard';
import StudentProgressMonitor from './StudentProgressMonitor';

interface StudentDashboardProps {
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentToast, setCurrentToast] = useState<NotificationItem | null>(null);

  // Calculate statistics
  const gpa = calculateGPA(studentGrades);
  const attendanceStats = getAttendanceStats(attendanceData);
  const unreadAnnouncements = getUnreadAnnouncements(announcements);

  // Get today's schedule
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
  const todaySchedule = weeklySchedule.filter(item => item.day === today);

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

  // Initialize student support system
  useEffect(() => {
    // Initialize student progress tracking
    const supportService = StudentSupportService.getInstance();
    supportService.updateStudentProgress(currentStudent.id, {
      academicMetrics: {
        gpa: gpa,
        gradeTrend: 'stable' as const,
        attendanceRate: attendanceStats.percentage,
        assignmentCompletion: 85, // Sample data
        subjectPerformance: studentGrades.reduce((acc, grade) => {
          acc[grade.subjectName] = parseFloat(grade.finalGrade || '0');
          return acc;
        }, {} as Record<string, number>)
      },
      engagementMetrics: {
        loginFrequency: 5, // Sample data
        resourceAccess: 12,
        supportRequests: 0,
        participationScore: 85,
        featureUsage: {
          overview: 10,
          grades: 8,
          schedule: 6,
          attendance: 4,
          announcements: 7
        },
        lastActiveDate: new Date().toISOString()
      }
    });
  }, [gpa, attendanceStats.percentage, studentGrades, currentStudent.id]);

  // Add some sample notifications for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      NotificationService.addNotification({
        title: 'Selamat Datang!',
        message: 'Selamat menggunakan portal siswa MA Malnu Kananga. Sistem notifikasi telah aktif.',
        type: 'system',
        priority: 'medium'
      });
    }, 2000);

    return () => clearTimeout(timer);
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

  const tabs = [
    { id: 'overview', name: 'Ringkasan', icon: '🏠' },
    { id: 'grades', name: 'Nilai', icon: '📊' },
    { id: 'schedule', name: 'Jadwal', icon: '📅' },
    { id: 'attendance', name: 'Absensi', icon: '✅' },
    { id: 'announcements', name: `Pengumuman ${unreadAnnouncements.length > 0 ? `(${unreadAnnouncements.length})` : ''}`, icon: '📢' },
    { id: 'support', name: 'Dukungan', icon: '🎓' },
    { id: 'progress', name: 'Progress', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudentDashboardHeader
        student={currentStudent}
        onLogout={handleLogout}
      />

      <NavigationTabs
        activeTab={activeTab}
        tabs={tabs}
         onTabChange={(tabId: string) => setActiveTab(tabId as any)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            student={currentStudent}
            gpa={gpa}
            attendanceStats={attendanceStats}
            todaySchedule={todaySchedule}
            recentGrades={recentGrades}
            today={today}
            formatDate={formatDate}
            getGradeColor={getGradeColor}
          />
        )}

        {activeTab === 'grades' && (
          <GradesTab
            grades={studentGrades}
            getGradeColor={getGradeColor}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab weeklySchedule={weeklySchedule} />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTab
            attendanceData={attendanceData}
            attendanceStats={attendanceStats}
            formatDate={formatDate}
            getAttendanceColor={getAttendanceColor}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'support' && (
          <StudentSupportDashboard />
        )}

        {activeTab === 'progress' && (
          <StudentProgressMonitor studentId={currentStudent.id} />
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

export default StudentDashboard;