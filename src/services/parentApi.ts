import { Student, Grade, AttendanceRecord, Announcement } from '../data/studentData';

// API Service untuk orang tua siswa
// Akan terintegrasi dengan Cloudflare D1 database

const API_BASE_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: 'Ayah' | 'Ibu' | 'Wali';
  students: string[]; // Array of student IDs
  profileImage?: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'academic' | 'behavioral' | 'general' | 'urgent';
}

export interface ProgressReport {
  id: string;
  studentId: string;
  semester: number;
  academicYear: string;
  gpa: number;
  totalCredits: number;
  rank: number;
  totalStudents: number;
  attendanceRate: number;
  subjects: Array<{
    name: string;
    grade: string;
    gradePoint: number;
    teacher: string;
    notes?: string;
  }>;
  teacherComments: string;
  principalComments?: string;
  parentSignature?: string;
  issuedDate: string;
}

// Parent API
export const parentApi = {
  // Get current parent profile
  getCurrentParent: async (): Promise<ApiResponse<Parent>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/current`, {
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
      console.error('Error fetching parent data:', error);
      // Fallback ke mock data untuk development
      const mockParent: Parent = {
        id: 'PAR001',
        name: 'Ahmad Hidayat',
        email: 'orangtua@ma-malnukananga.sch.id',
        phone: '081987654321',
        relationship: 'Ayah',
        students: ['STU001'],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      };
      
      return {
        success: true,
        data: mockParent,
      };
    }
  },

  // Get parent's children
  getChildren: async (): Promise<ApiResponse<Student[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/children`, {
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
      console.error('Error fetching children:', error);
      // Fallback ke mock data
      const { currentStudent } = await import('../data/studentData');
      
      return {
        success: true,
        data: [currentStudent],
      };
    }
  },

  // Update parent profile
  updateProfile: async (data: Partial<Parent>): Promise<ApiResponse<Parent>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/profile`, {
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
      console.error('Error updating parent profile:', error);
      return {
        success: false,
        error: 'Gagal memperbarui profil. Silakan coba lagi.',
      };
    }
  },
};

// Academic Monitoring API
export const academicMonitoringApi = {
  // Get student's grades
  getStudentGrades: async (studentId: string, semester?: number): Promise<ApiResponse<Grade[]>> => {
    try {
      const params = new URLSearchParams({ studentId });
      if (semester) params.append('semester', semester.toString());

      const response = await fetch(`${API_BASE_URL}/api/parent/grades?${params}`, {
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
      console.error('Error fetching student grades:', error);
      // Fallback ke mock data
      const { studentGrades } = await import('../data/studentData');
      let filteredGrades = studentGrades;
      
      if (semester) {
        filteredGrades = filteredGrades.filter(grade => grade.semester === semester);
      }

      return {
        success: true,
        data: filteredGrades,
      };
    }
  },

  // Get student's attendance
  getStudentAttendance: async (
    studentId: string,
    month?: string,
    year?: string
  ): Promise<ApiResponse<AttendanceRecord[]>> => {
    try {
      const params = new URLSearchParams({ studentId });
      if (month) params.append('month', month);
      if (year) params.append('year', year);

      const response = await fetch(`${API_BASE_URL}/api/parent/attendance?${params}`, {
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
      console.error('Error fetching student attendance:', error);
      // Fallback ke mock data
      const { attendanceData } = await import('../data/studentData');
      
      return {
        success: true,
        data: attendanceData,
      };
    }
  },

  // Get attendance statistics
  getAttendanceStats: async (
    studentId: string,
    month?: string,
    year?: string
  ): Promise<ApiResponse<{
    total: number;
    present: number;
    absent: number;
    sick: number;
    permitted: number;
    percentage: number;
  }>> => {
    try {
      const params = new URLSearchParams({ studentId });
      if (month) params.append('month', month);
      if (year) params.append('year', year);

      const response = await fetch(`${API_BASE_URL}/api/parent/attendance/stats?${params}`, {
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
        data: stats,
      };
    }
  },

  // Get progress reports
  getProgressReports: async (studentId: string): Promise<ApiResponse<ProgressReport[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/progress-reports?studentId=${studentId}`, {
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
      console.error('Error fetching progress reports:', error);
      // Fallback ke mock data
      const mockProgressReport: ProgressReport = {
        id: 'RPT001',
        studentId,
        semester: 1,
        academicYear: '2024/2025',
        gpa: 3.75,
        totalCredits: 24,
        rank: 5,
        totalStudents: 30,
        attendanceRate: 95,
        subjects: [
          {
            name: 'Matematika',
            grade: 'A',
            gradePoint: 4.0,
            teacher: 'Dr. Siti Nurhaliza, M.Pd.',
            notes: 'Sangat baik dalam pemecahan masalah',
          },
          {
            name: 'Fisika',
            grade: 'B+',
            gradePoint: 3.5,
            teacher: 'Prof. Budi Santoso, M.T.',
          },
        ],
        teacherComments: 'Siswa menunjukkan perkembangan yang baik. Perlu meningkatkan konsistensi dalam mengerjakan tugas.',
        principalComments: 'Terus tingkatkan prestasi dan jaga disiplin.',
        issuedDate: '2024-10-15',
      };
      
      return {
        success: true,
        data: [mockProgressReport],
      };
    }
  },

  // Get specific progress report
  getProgressReport: async (reportId: string): Promise<ApiResponse<ProgressReport>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/progress-reports/${reportId}`, {
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
      console.error('Error fetching progress report:', error);
      return {
        success: false,
        error: 'Gagal mengambil laporan kemajuan.',
      };
    }
  },

  // Sign progress report
  signProgressReport: async (reportId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/progress-reports/${reportId}/sign`, {
        method: 'POST',
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
      console.error('Error signing progress report:', error);
      return {
        success: false,
        error: 'Gagal menandatangani laporan kemajuan.',
      };
    }
  },
};

// Communication API
export const communicationApi = {
  // Get messages
  getMessages: async (type?: string): Promise<ApiResponse<Message[]>> => {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);

      const response = await fetch(`${API_BASE_URL}/api/parent/messages?${params}`, {
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
      console.error('Error fetching messages:', error);
      // Fallback ke mock data
      const mockMessages: Message[] = [
        {
          id: 'MSG001',
          from: 'Dr. Siti Nurhaliza, M.Pd.',
          to: 'Ahmad Hidayat',
          subject: 'Perkembangan Akademik Ahmad Fauzi',
          content: 'Assalamualaikum Bapak Ahmad, saya ingin memberitahukan bahwa Ahmad Fauzi menunjukkan peningkatan yang signifikan dalam mata pelajaran Matematika. Namun, perlu lebih banyak latihan soal aplikasi.',
          timestamp: '2024-11-20T10:30:00Z',
          isRead: false,
          type: 'academic',
        },
        {
          id: 'MSG002',
          from: 'Wali Kelas XII IPA 1',
          to: 'Ahmad Hidayat',
          subject: 'Kegiatan Study Tour',
          content: 'Bapak yang terhormat, informasikan bahwa akan ada study tour ke Museum Nasional pada tanggal 25 November 2024. Mohon persetujuan untuk keikutsertaan anak Bapak.',
          timestamp: '2024-11-18T14:15:00Z',
          isRead: true,
          type: 'general',
        },
      ];
      
      let filteredMessages = mockMessages;
      if (type) {
        filteredMessages = mockMessages.filter(msg => msg.type === type);
      }
      
      return {
        success: true,
        data: filteredMessages,
      };
    }
  },

  // Send message to teacher
  sendMessage: async (data: {
    to: string;
    subject: string;
    content: string;
    type: 'academic' | 'behavioral' | 'general' | 'urgent';
  }): Promise<ApiResponse<Message>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/messages`, {
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
      console.error('Error sending message:', error);
      return {
        success: false,
        error: 'Gagal mengirim pesan. Silakan coba lagi.',
      };
    }
  },

  // Mark message as read
  markAsRead: async (messageId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/messages/${messageId}/read`, {
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
      console.error('Error marking message as read:', error);
      return {
        success: false,
        error: 'Gagal menandai pesan sebagai dibaca.',
      };
    }
  },

  // Get unread messages count
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/messages/unread/count`, {
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
      return {
        success: true,
        data: 1,
      };
    }
  },

  // Get available teachers for messaging
  getAvailableTeachers: async (): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    subject: string;
    email: string;
  }>>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/teachers`, {
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
      console.error('Error fetching available teachers:', error);
      // Fallback ke mock data
      const mockTeachers = [
        {
          id: 'TCH001',
          name: 'Dr. Siti Nurhaliza, M.Pd.',
          subject: 'Matematika',
          email: 'siti.nurhaliza@ma-malnukananga.sch.id',
        },
        {
          id: 'TCH002',
          name: 'Prof. Budi Santoso, M.T.',
          subject: 'Fisika',
          email: 'budi.santoso@ma-malnukananga.sch.id',
        },
      ];
      
      return {
        success: true,
        data: mockTeachers,
      };
    }
  },
};