import { Student, Grade, Subject } from '../data/studentData';

// API Service untuk guru
// Akan terintegrasi dengan Cloudflare D1 database

const API_BASE_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  nip: string;
  subjects: string[];
  classAdvisor: string[];
  phone: string;
  profileImage?: string;
}

// Teacher API
export const teacherApi = {
  // Get current teacher profile
  getCurrentTeacher: async (): Promise<ApiResponse<Teacher>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/current`, {
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
      console.error('Error fetching teacher data:', error);
      // Fallback ke mock data untuk development
      const mockTeacher: Teacher = {
        id: 'TCH001',
        name: 'Dr. Siti Nurhaliza, M.Pd.',
        email: 'guru@ma-malnukananga.sch.id',
        nip: '198703152005012001',
        subjects: ['Matematika'],
        classAdvisor: ['XII IPA 1'],
        phone: '081234567891',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      };
      
      return {
        success: true,
        data: mockTeacher,
      };
    }
  },

  // Get teacher's classes
  getClasses: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/classes`, {
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
      console.error('Error fetching classes:', error);
      // Fallback ke mock data
      return {
        success: true,
        data: ['XII IPA 1', 'XII IPA 2', 'XI IPA 1'],
      };
    }
  },

  // Get students in a class
  getStudentsByClass: async (className: string): Promise<ApiResponse<Student[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/classes/${className}/students`, {
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
      console.error('Error fetching students:', error);
      // Fallback ke mock data
      const { currentStudent } = await import('../data/studentData');
      const mockStudents: Student[] = [
        currentStudent,
        {
          ...currentStudent,
          id: 'STU002',
          name: 'Siti Aminah',
          email: 'siti.aminah@ma-malnukananga.sch.id',
        },
        {
          ...currentStudent,
          id: 'STU003',
          name: 'Budi Santoso',
          email: 'budi.santoso@ma-malnukananga.sch.id',
        },
      ];
      
      return {
        success: true,
        data: mockStudents,
      };
    }
  },

  // Get subjects taught by teacher
  getSubjects: async (): Promise<ApiResponse<Subject[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/subjects`, {
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
      console.error('Error fetching subjects:', error);
      // Fallback ke mock data
      const { subjects } = await import('../data/studentData');
      const mathSubject = subjects.find(s => s.code === 'MAT12');
      
      return {
        success: true,
        data: mathSubject ? [mathSubject] : [],
      };
    }
  },
};

// Grades Management API
export const gradesManagementApi = {
  // Get grades for a class and subject
  getClassGrades: async (
    className: string,
    subjectId: string,
    semester: number,
    academicYear: string
  ): Promise<ApiResponse<(Grade & { studentName: string })[]>> => {
    try {
      const params = new URLSearchParams({
        class: className,
        subject: subjectId,
        semester: semester.toString(),
        academicYear,
      });

      const response = await fetch(`${API_BASE_URL}/api/teacher/grades?${params}`, {
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
      console.error('Error fetching class grades:', error);
      // Fallback ke mock data
      const { studentGrades, currentStudent } = await import('../data/studentData');
      const mockGrades = studentGrades.map(grade => ({
        ...grade,
        studentName: currentStudent.name,
      }));
      
      return {
        success: true,
        data: mockGrades,
      };
    }
  },

  // Update student grade
  updateGrade: async (
    gradeId: string,
    data: {
      midtermScore?: number;
      finalScore?: number;
      assignmentScore?: number;
      attendanceScore?: number;
      finalGrade?: string;
      gradePoint?: number;
      status?: 'Lulus' | 'Tidak Lulus' | 'Belum Selesai' | 'draft' | 'submitted' | 'approved';
    }
  ): Promise<ApiResponse<Grade>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/grades/${gradeId}`, {
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
      console.error('Error updating grade:', error);
      return {
        success: false,
        error: 'Gagal memperbarui nilai. Silakan coba lagi.',
      };
    }
  },

  // Submit grades for approval
  submitGrades: async (
    gradeIds: string[]
  ): Promise<ApiResponse<{ submittedCount: number }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/grades/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gradeIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting grades:', error);
      return {
        success: false,
        error: 'Gagal mengirim nilai untuk persetujuan.',
      };
    }
  },

  // Calculate final grade automatically
  calculateFinalGrade: async (gradeId: string): Promise<ApiResponse<{
    finalGrade: string;
    gradePoint: number;
    status: 'Lulus' | 'Tidak Lulus' | 'Belum Selesai';
  }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/grades/${gradeId}/calculate`, {
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
      console.error('Error calculating final grade:', error);
      // Fallback calculation
      const mockResult = {
        finalGrade: 'B+',
        gradePoint: 3.5,
        status: 'Lulus' as const,
      };
      
      return {
        success: true,
        data: mockResult,
      };
    }
  },

  // Get grade statistics for class
  getClassGradeStats: async (
    className: string,
    subjectId: string,
    semester: number,
    academicYear: string
  ): Promise<ApiResponse<{
    totalStudents: number;
    gradedStudents: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    gradeDistribution: {
      A: number;
      'B+': number;
      B: number;
      'C+': number;
      C: number;
      D: number;
      E: number;
    };
  }>> => {
    try {
      const params = new URLSearchParams({
        class: className,
        subject: subjectId,
        semester: semester.toString(),
        academicYear,
      });

      const response = await fetch(`${API_BASE_URL}/api/teacher/grades/stats?${params}`, {
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
      const mockStats = {
        totalStudents: 30,
        gradedStudents: 25,
        averageScore: 82,
        highestScore: 95,
        lowestScore: 65,
        passRate: 87,
        gradeDistribution: {
          A: 5,
          'B+': 8,
          B: 7,
          'C+': 3,
          C: 2,
          D: 0,
          E: 0,
        },
      };
      
      return {
        success: true,
        data: mockStats,
      };
    }
  },
};

// Attendance Management API
export const attendanceManagementApi = {
  // Get attendance records for a class and subject
  getClassAttendance: async (
    className: string,
    subjectId: string,
    date: string
  ): Promise<ApiResponse<(Student & { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa'; notes?: string })[]>> => {
    try {
      const params = new URLSearchParams({
        class: className,
        subject: subjectId,
        date,
      });

      const response = await fetch(`${API_BASE_URL}/api/teacher/attendance?${params}`, {
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
      console.error('Error fetching class attendance:', error);
      // Fallback ke mock data
      const { currentStudent } = await import('../data/studentData');
      const mockAttendance = [
        {
          ...currentStudent,
          status: 'Hadir' as const,
        },
        {
          ...currentStudent,
          id: 'STU002',
          name: 'Siti Aminah',
          email: 'siti.aminah@ma-malnukananga.sch.id',
          status: 'Izin' as const,
          notes: 'Sakit',
        },
      ];
      
      return {
        success: true,
        data: mockAttendance,
      };
    }
  },

  // Submit attendance for multiple students
  submitAttendance: async (
    data: {
      className: string;
      subjectId: string;
      date: string;
      attendance: Array<{
        studentId: string;
        status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
        notes?: string;
      }>;
    }
  ): Promise<ApiResponse<{ submittedCount: number }>> => {
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