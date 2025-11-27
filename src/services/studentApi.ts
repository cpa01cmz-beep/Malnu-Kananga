import { Student, Grade, ScheduleItem, AttendanceRecord, Announcement } from '../data/studentData';

// API Service untuk data akademik siswa
// Akan terintegrasi dengan Cloudflare D1 database

const API_BASE_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Student API
export const studentApi = {
  // Get current student profile
  getCurrentStudent: async (): Promise<ApiResponse<Student>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/current`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Fallback ke mock data untuk development
      const { currentStudent } = await import('../data/studentData');
      return {
        success: true,
        data: currentStudent,
      };
    }
  },

  // Update student profile
  updateProfile: async (data: Partial<Student>): Promise<ApiResponse<Student>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating student profile:', error);
      return {
        success: false,
        error: 'Gagal memperbarui profil. Silakan coba lagi.',
      };
    }
  },
};

// Grades API
export const gradesApi = {
  // Get student grades
  getGrades: async (semester?: number, academicYear?: string): Promise<ApiResponse<Grade[]>> => {
    try {
      const params = new URLSearchParams();
      if (semester) params.append('semester', semester.toString());
      if (academicYear) params.append('academicYear', academicYear);

      const response = await fetch(`${API_BASE_URL}/api/student/grades?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching grades:', error);
      // Fallback ke mock data
      const { studentGrades } = await import('../data/studentData');
      let filteredGrades = studentGrades;
      
      if (semester) {
        filteredGrades = filteredGrades.filter(grade => grade.semester === semester);
      }
      if (academicYear) {
        filteredGrades = filteredGrades.filter(grade => grade.academicYear === academicYear);
      }

      return {
        success: true,
        data: filteredGrades,
      };
    }
  },

  // Get grade statistics
  getGradeStats: async (): Promise<ApiResponse<{
    gpa: number;
    totalCredits: number;
    completedSubjects: number;
    averageScore: number;
  }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/grades/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching grade stats:', error);
      // Fallback ke mock data
      const { studentGrades, calculateGPA } = await import('../data/studentData');
      const gpa = calculateGPA(studentGrades);
      const totalCredits = studentGrades.length * 3; // Mock calculation
      const completedSubjects = studentGrades.filter(g => g.status === 'Lulus').length;
      const averageScore = studentGrades.reduce((sum, grade) => {
        const scores = [grade.midtermScore, grade.finalScore, grade.assignmentScore].filter(Boolean) as number[];
        return sum + (scores.reduce((a, b) => a + b, 0) / scores.length);
      }, 0) / studentGrades.length;

      return {
        success: true,
        data: {
          gpa,
          totalCredits,
          completedSubjects,
          averageScore: Math.round(averageScore),
        },
      };
    }
  },
};

// Schedule API
export const scheduleApi = {
  // Get weekly schedule
  getWeeklySchedule: async (): Promise<ApiResponse<ScheduleItem[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/schedule`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      // Fallback ke mock data
      const { weeklySchedule } = await import('../data/studentData');
      return {
        success: true,
        data: weeklySchedule,
      };
    }
  },

  // Get today's schedule
  getTodaySchedule: async (): Promise<ApiResponse<ScheduleItem[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/schedule/today`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      // Fallback ke mock data
      const { weeklySchedule } = await import('../data/studentData');
      const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
      const todaySchedule = weeklySchedule.filter(item => item.day === today);
      
      return {
        success: true,
        data: todaySchedule,
      };
    }
  },
};

// Attendance API
export const attendanceApi = {
  // Get attendance records
  getAttendance: async (month?: string, year?: string): Promise<ApiResponse<AttendanceRecord[]>> => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);

      const response = await fetch(`${API_BASE_URL}/api/student/attendance?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // Fallback ke mock data
      const { attendanceData } = await import('../data/studentData');
      return {
        success: true,
        data: attendanceData,
      };
    }
  },

  // Get attendance statistics
  getAttendanceStats: async (month?: string, year?: string): Promise<ApiResponse<{
    total: number;
    present: number;
    absent: number;
    sick: number;
    permitted: number;
    percentage: number;
  }>> => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);

      const response = await fetch(`${API_BASE_URL}/api/student/attendance/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      // Fallback ke mock data
      const { attendanceData, getAttendanceStats } = await import('../data/studentData');
      const stats = getAttendanceStats(attendanceData);
      
      return {
        success: true,
        data: {
          total: stats.total || 0,
          present: stats.present || 0,
          absent: stats.absent || 0,
          sick: stats.sick || 0,
          permitted: stats.excused || 0,
          percentage: stats.attendanceRate || 0
        },
      };
    }
  },

  // Submit attendance (for teachers)
  submitAttendance: async (data: {
    studentId: string;
    date: string;
    subject: string;
    status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting attendance:', error);
      return {
        success: false,
        error: 'Gagal mencatat kehadiran. Silakan coba lagi.',
      };
    }
  },
};

// Announcements API
export const announcementsApi = {
  // Get announcements
  getAnnouncements: async (category?: string): Promise<ApiResponse<Announcement[]>> => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const response = await fetch(`${API_BASE_URL}/api/student/announcements?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // Fallback ke mock data
      const { announcements } = await import('../data/studentData');
      let filteredAnnouncements = announcements;
      
      if (category) {
        filteredAnnouncements = announcements.filter(announcement => announcement.category === category);
      }

      return {
        success: true,
        data: filteredAnnouncements,
      };
    }
  },

  // Mark announcement as read
  markAsRead: async (announcementId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/announcements/${announcementId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      return {
        success: false,
        error: 'Gagal menandai pengumuman sebagai dibaca.',
      };
    }
  },

  // Get unread announcements count
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/announcements/unread/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Fallback ke mock data
      const { announcements, getUnreadAnnouncements } = await import('../data/studentData');
      const unreadCount = getUnreadAnnouncements(announcements).length;
      
      return {
        success: true,
        data: unreadCount,
      };
    }
  },
};